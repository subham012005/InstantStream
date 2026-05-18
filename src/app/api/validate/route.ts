import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function getGoogleDriveStreamUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("drive.google.com")) return null;

    // Format: /file/d/{fileId}/view  or  /file/d/{fileId}/preview
    const pathMatch = u.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (pathMatch) {
      return `https://drive.google.com/uc?export=download&confirm=t&id=${pathMatch[1]}`;
    }
    // Format: ?id=...
    const id = u.searchParams.get("id");
    if (id) {
      return `https://drive.google.com/uc?export=download&confirm=t&id=${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

function detectLinkType(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("drive.google.com")) return "Google Drive";
    if (u.hostname.includes("t.me") || u.hostname.includes("telegram.org")) return "Telegram";
    const ext = u.pathname.split(".").pop()?.toUpperCase();
    const videoExts = ["MP4", "MKV", "WEBM", "AVI", "MOV", "M3U8", "OGG", "TS", "FLV"];
    if (ext && videoExts.includes(ext)) return ext;
    return "Direct URL";
  } catch {
    return "Unknown";
  }
}

function getFileName(url: string): string {
  try {
    const u = new URL(url);
    const name = u.pathname.split("/").pop()?.split("?")[0];
    if (name && name.includes(".")) return decodeURIComponent(name);
    const hostname = u.hostname.replace("www.", "");
    return `Video from ${hostname}`;
  } catch {
    return "Video Stream";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
    }

    const type = detectLinkType(url);
    const title = getFileName(url);

    // Handle Google Drive
    if (parsedUrl.hostname.includes("drive.google.com")) {
      const streamUrl = getGoogleDriveStreamUrl(url);
      if (!streamUrl) {
        return NextResponse.json(
          { error: "Could not extract Google Drive file ID. Use the 'Share' link." },
          { status: 400 }
        );
      }
      return NextResponse.json({ streamUrl, title, type, valid: true });
    }

    // For direct video URLs, verify it's reachable via HEAD request
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const headRes = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; fluxplays.live/1.0)",
          "Range": "bytes=0-0",
        },
      });
      clearTimeout(timeout);

      const contentType = headRes.headers.get("content-type") || "";
      const isVideo =
        contentType.startsWith("video/") ||
        contentType.includes("octet-stream") ||
        contentType.includes("mp4") ||
        contentType.includes("webm") ||
        contentType.includes("mkv") ||
        contentType.includes("mpeg") ||
        contentType.includes("mpegurl") ||
        contentType.includes("apple.mpegurl") ||
        // Also allow if extension is a known video type even if content-type is wrong
        ["MP4", "MKV", "WEBM", "AVI", "MOV", "M3U8", "OGG", "TS", "FLV"].includes(
          parsedUrl.pathname.split(".").pop()?.toUpperCase() || ""
        );

      if (!headRes.ok && headRes.status !== 206 && headRes.status !== 416) {
        return NextResponse.json(
          { error: `Link returned HTTP ${headRes.status}. It may be private or expired.` },
          { status: 400 }
        );
      }

      if (!isVideo) {
        return NextResponse.json(
          { error: "The provided link is not a direct video stream or supported video file." },
          { status: 400 }
        );
      }

      return NextResponse.json({ streamUrl: url, title, type, valid: true, contentType });
    } catch (fetchErr: any) {
      if (fetchErr?.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out. The server may be slow or blocking requests." },
          { status: 408 }
        );
      }
      // If HEAD fails due to CORS or network, still allow it — browser will try
      return NextResponse.json({ streamUrl: url, title, type, valid: true, warning: "Could not pre-validate link" });
    }
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
