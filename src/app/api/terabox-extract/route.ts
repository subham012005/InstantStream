import dns from "node:dns";
import { NextRequest, NextResponse } from "next/server";
import { isTeraBoxUrl, parseTeraBoxUrl } from "@/lib/streaming/terabox";

export const runtime = "nodejs";

// Force IPv4 first to prevent IPv6 TLS handshake timeouts
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore if not supported in environment
}

// Disallow private/internal IPs to prevent SSRF
function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "::1" ||
    lower === "0.0.0.0"
  ) {
    return true;
  }
  // Check private IPv4 ranges (10.x.x.x, 192.168.x.x, 172.16.x.x-172.31.x.x, 169.254.x.x)
  if (
    /^10\./.test(lower) ||
    /^192\.168\./.test(lower) ||
    /^169\.254\./.test(lower) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(lower)
  ) {
    return true;
  }
  return false;
}

// Global cached session for direct extractor
interface FlowSession {
  csrfToken: string;
  cookieHeader: string;
  userAgent: string;
  timestamp: number;
}

let cachedSession: FlowSession | null = null;

async function getFlowSession(): Promise<FlowSession> {
  const ONE_HOUR = 60 * 60 * 1000;
  if (cachedSession && Date.now() - cachedSession.timestamp < ONE_HOUR) {
    return cachedSession;
  }

  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

  // Step 1: GET homepage for CSRF token & cookies
  const getRes = await fetch("https://flowvideoplayer.com/", {
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(8000),
  });

  const getSetCookies = (getRes.headers as any).getSetCookie
    ? (getRes.headers as any).getSetCookie()
    : [getRes.headers.get("set-cookie")];
  const html = await getRes.text();
  const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/);
  const csrfToken = csrfMatch ? csrfMatch[1] : "";

  const cookieMap: Record<string, string> = {};
  getSetCookies.forEach((c: string) => {
    if (!c) return;
    const parts = c.split(";")[0].split("=");
    if (parts[0] && parts[1]) cookieMap[parts[0].trim()] = parts.slice(1).join("=");
  });

  let cookieHeader = Object.entries(cookieMap)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  // Step 2: POST /device/init to register device token
  const initRes = await fetch("https://flowvideoplayer.com/device/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRF-TOKEN": csrfToken,
      cookie: cookieHeader,
      Origin: "https://flowvideoplayer.com",
      Referer: "https://flowvideoplayer.com/",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "User-Agent": userAgent,
    },
    body: JSON.stringify({
      cpu: 8,
      memory: 8,
      touch: 0,
      platform: "Win32",
      lang: "en-US",
      vendor: "Google Inc.",
      webgl_vendor: "Google Inc. (NVIDIA)",
      webgl_renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
      ua: userAgent,
      backup_token: null,
    }),
    signal: AbortSignal.timeout(8000),
  });

  const initSetCookies = (initRes.headers as any).getSetCookie
    ? (initRes.headers as any).getSetCookie()
    : [];
  initSetCookies.forEach((c: string) => {
    if (!c) return;
    const parts = c.split(";")[0].split("=");
    if (parts[0] && parts[1]) cookieMap[parts[0].trim()] = parts.slice(1).join("=");
  });

  cookieHeader = Object.entries(cookieMap)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  cachedSession = {
    csrfToken,
    cookieHeader,
    userAgent,
    timestamp: Date.now(),
  };

  return cachedSession;
}

async function extractViaFlowVideo(url: string) {
  try {
    let session = await getFlowSession();

    const doSearch = async (sess: FlowSession) => {
      return fetch("https://flowvideoplayer.com/search/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": sess.csrfToken,
          cookie: sess.cookieHeader,
          Origin: "https://flowvideoplayer.com",
          Referer: "https://flowvideoplayer.com/",
          "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24", "Google Chrome";v="131"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "User-Agent": sess.userAgent,
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(10000),
      });
    };

    let searchRes = await doSearch(session);

    if (searchRes.status === 419 || searchRes.status === 401) {
      cachedSession = null;
      session = await getFlowSession();
      searchRes = await doSearch(session);
    }

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data && data.status === true && Array.isArray(data.response) && data.response.length > 0) {
        return data.response[0];
      }
    }
  } catch (err: any) {
    console.warn("Direct stream extraction attempt note:", err?.message || err);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "No TeraBox URL provided. Please paste a valid TeraBox share link." },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim();

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please paste a full TeraBox link (e.g. https://terabox.com/s/1...)." },
        { status: 400 }
      );
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS links are supported." },
        { status: 400 }
      );
    }

    // SSRF & Domain Validation
    if (isPrivateHost(parsedUrl.hostname) || !isTeraBoxUrl(cleanUrl)) {
      return NextResponse.json(
        {
          error:
            "Not a recognized TeraBox share domain. Please provide a link from terabox.com, 1024tera.com, teraboxapp.com, or supported mirrors.",
        },
        { status: 400 }
      );
    }

    const parsedInfo = parseTeraBoxUrl(cleanUrl);
    if (!parsedInfo.isValid || !parsedInfo.surl) {
      return NextResponse.json(
        { error: parsedInfo.error || "Could not parse TeraBox share identifier from link." },
        { status: 400 }
      );
    }

    const surl = parsedInfo.surl;
    const embedUrl = parsedInfo.embedUrl || `https://www.1024tera.com/sharing/embed?surl=${encodeURIComponent(surl)}`;

    // 1. PRIMARY ATTEMPT: Extract direct playable HLS stream (NO IFRAMES)
    const directResult = await extractViaFlowVideo(cleanUrl);
    if (directResult && directResult.fast_stream_url) {
      return NextResponse.json({
        mode: "direct",
        videoUrl: directResult.fast_stream_url,
        title: directResult.file_name || `TeraBox Video — ${surl}`,
        thumbnail: directResult.thumbnail || null,
        fileSize: directResult.file_size_bytes || null,
        fileSizeFormatted: directResult.file_size || null,
        downloadUrl: directResult.download_url || null,
        embedUrl,
        rawUrl: cleanUrl,
        surl,
      });
    }

    // 2. SECONDARY ATTEMPT: Query public file metadata from 1024tera
    const apiUrl = `https://www.1024tera.com/share/list?app_id=250528&shorturl=${encodeURIComponent(surl)}&root=1`;

    let directVideoUrl: string | null = null;
    let fileName = `TeraBox Video — ${surl}`;
    let thumbnail: string | null = null;
    let fileSize: number | null = null;
    let isExpiredOrDeleted = false;
    let isPasswordProtected = false;

    try {
      const res = await fetch(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: `https://www.1024tera.com/sharing/embed?surl=${encodeURIComponent(surl)}`,
          Accept: "application/json, text/plain, */*",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);

        if (data) {
          if (data.errno === 140 || data.errno === -1) {
            isExpiredOrDeleted = true;
          } else if (data.errno === -9 || data.need_pwd) {
            isPasswordProtected = true;
          } else if (data.errno === 0 && Array.isArray(data.list) && data.list.length > 0) {
            const firstFile = data.list.find((f: any) => f.category === "1" || f.category === 1) || data.list[0];

            if (firstFile) {
              if (firstFile.server_filename) {
                fileName = firstFile.server_filename;
              }
              if (firstFile.size) {
                fileSize = parseInt(firstFile.size, 10);
              }
              if (firstFile.thumbs) {
                thumbnail = firstFile.thumbs.url3 || firstFile.thumbs.url2 || firstFile.thumbs.url1 || null;
              }
              if (firstFile.dlink && typeof firstFile.dlink === "string" && firstFile.dlink.startsWith("http")) {
                directVideoUrl = firstFile.dlink;
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn("TeraBox public API probe note:", err?.message || err);
    }

    if (isExpiredOrDeleted) {
      return NextResponse.json(
        {
          error: "This TeraBox file does not exist, has expired, or the share link was deleted by its owner.",
          expired: true,
          rawUrl: cleanUrl,
        },
        { status: 404 }
      );
    }

    if (isPasswordProtected) {
      return NextResponse.json(
        {
          error: "This TeraBox link is password-protected. Please open the link directly on TeraBox to enter the extraction code.",
          passwordProtected: true,
          embedUrl,
          rawUrl: cleanUrl,
        },
        { status: 403 }
      );
    }

    // Direct stream if retrieved from 1024tera
    if (directVideoUrl) {
      return NextResponse.json({
        mode: "direct",
        videoUrl: directVideoUrl,
        title: fileName,
        thumbnail,
        fileSize,
        embedUrl,
        rawUrl: cleanUrl,
        surl,
      });
    }

    // Fallback embed only if direct stream resolution was not possible
    return NextResponse.json({
      mode: "embed",
      embedUrl,
      title: fileName,
      thumbnail,
      fileSize,
      rawUrl: cleanUrl,
      surl,
      notice: "Public TeraBox video stream ready. Loaded with seek and fullscreen controls.",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "Failed to resolve TeraBox video link.",
      },
      { status: 500 }
    );
  }
}
