import { NextRequest, NextResponse } from "next/server";
import { validateSafeUrl } from "@/lib/security";

export const runtime = "nodejs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type",
  "Cross-Origin-Resource-Policy": "cross-origin",
} as const;

function isPlaylist(contentType: string, url: string) {
  return contentType.includes("mpegurl") || contentType.includes("vnd.apple") || new URL(url).pathname.endsWith(".m3u8");
}

function proxiedUrl(url: string, imdbId: string) {
  return `/api/hls-proxy?url=${encodeURIComponent(url)}&imdbId=${encodeURIComponent(imdbId)}`;
}

function rewritePlaylist(body: string, playlistUrl: string, imdbId: string) {
  return body
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
          return `URI="${proxiedUrl(new URL(uri, playlistUrl).href, imdbId)}"`;
        });
      }
      return proxiedUrl(new URL(trimmed, playlistUrl).href, imdbId);
    })
    .join("\n");
}

async function fetchUpstream(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const imdbId = req.nextUrl.searchParams.get("imdbId");

  if (!url || !imdbId) {
    return { error: NextResponse.json({ error: "Missing url or imdbId parameter" }, { status: 400 }) };
  }

  if (!/^https?:\/\//i.test(url) || !/^tt\d{7,8}$/.test(imdbId)) {
    return { error: NextResponse.json({ error: "Invalid proxy request" }, { status: 400 }) };
  }

  const safetyCheck = await validateSafeUrl(url);
  if (!safetyCheck.safe || !safetyCheck.url) {
    return { error: NextResponse.json({ error: safetyCheck.error || "Forbidden destination" }, { status: 403 }) };
  }

  const range = req.headers.get("range");
  const response = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "*/*",
      Referer: `https://brightpathsignals.com/embed/movie/${imdbId}`,
      Origin: "https://brightpathsignals.com",
      ...(range ? { Range: range } : {}),
    },
    redirect: "follow",
  });

  return { response, url, imdbId };
}

export async function GET(req: NextRequest) {
  try {
    const result = await fetchUpstream(req);
    if (result.error) return result.error;

    const { response, url, imdbId } = result;
    if (!response || !url || !imdbId) {
      return NextResponse.json({ error: "Invalid upstream response" }, { status: 502 });
    }

    if (!response.ok && response.status !== 206) {
      return NextResponse.json({ error: `Failed to fetch stream: ${response.status}` }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "";
    if (isPlaylist(contentType, url)) {
      const body = await response.text();
      return new NextResponse(rewritePlaylist(body, url, imdbId), {
        status: response.status,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-store",
        },
      });
    }

    const upstreamPath = new URL(url).pathname.toLowerCase();
    const mediaContentType =
      !contentType || contentType.includes("text/html") || upstreamPath.endsWith(".ts") || upstreamPath.endsWith(".html")
        ? "video/mp2t"
        : contentType;

    const headers = new Headers(CORS_HEADERS);
    headers.set("Content-Type", mediaContentType);
    headers.set("Cache-Control", "public, max-age=3600");

    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges");
    if (contentLength) headers.set("Content-Length", contentLength);
    if (contentRange) headers.set("Content-Range", contentRange);
    if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("[hls-proxy]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to proxy HLS stream" }, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  const result = await fetchUpstream(req);
  if (result.error) return result.error;

  return new NextResponse(null, {
    status: result.response?.status || 502,
    headers: CORS_HEADERS,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Access-Control-Max-Age": "86400",
    },
  });
}
