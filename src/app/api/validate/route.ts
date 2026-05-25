import { NextRequest, NextResponse } from "next/server";
import type { ValidationResponse, ValidationStepState } from "@/types/validation";

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

function isDirectPlayUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host.endsWith('.googleusercontent.com') ||
      host.endsWith('.googlevideo.com') ||
      host.endsWith('.fbcdn.net') ||
      host.endsWith('.cdninstagram.com') ||
      host.endsWith('.twimg.com') ||
      host.endsWith('.dropboxusercontent.com') ||
      host.endsWith('.1drv.ms')
    );
  } catch {
    return false;
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
  const steps: ValidationStepState[] = [];

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided", valid: false } as ValidationResponse, {
        status: 400,
      });
    }

    // Step 1: Check URL format
    steps.push({ step: "format", status: "checking", label: "Checking URL format" });

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      steps[0].status = "error";
      steps[0].message = "Invalid URL format";
      return NextResponse.json(
        {
          error: "Invalid URL format",
          valid: false,
          steps,
        } as ValidationResponse,
        { status: 400 }
      );
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      steps[0].status = "error";
      steps[0].message = "Only HTTP/HTTPS supported";
      return NextResponse.json(
        {
          error: "Only HTTP/HTTPS URLs are supported",
          valid: false,
          steps,
        } as ValidationResponse,
        { status: 400 }
      );
    }

    steps[0].status = "success";

    const type = detectLinkType(url);
    const title = getFileName(url);

    // Reject Google Drive ephemeral download links
    if (parsedUrl.hostname === "video-downloads.googleusercontent.com") {
      steps[0].status = "error";
      steps[0].message = "Temporary download link unsupported";
      return NextResponse.json(
        {
          error: "These temporary Google Drive download links cannot be streamed. Please use the Google Drive 'Share' link instead.",
          valid: false,
          steps,
        } as ValidationResponse,
        { status: 400 }
      );
    }

    // Handle Google Drive
    if (parsedUrl.hostname.includes("drive.google.com")) {
      const streamUrl = getGoogleDriveStreamUrl(url);
      if (!streamUrl) {
        steps.push({
          step: "connection",
          status: "error",
          label: "Connecting to server",
          message: "Could not extract file ID",
        });
        return NextResponse.json(
          {
            error: "Could not extract Google Drive file ID. Use the 'Share' link.",
            valid: false,
            steps,
          } as ValidationResponse,
          { status: 400 }
        );
      }
      steps.push({
        step: "connection",
        status: "success",
        label: "Connecting to server",
      });
      steps.push({
        step: "filetype",
        status: "success",
        label: "Checking file type",
      });
      steps.push({
        step: "streaming",
        status: "success",
        label: "Checking streaming support",
      });
      steps.push({
        step: "preparing",
        status: "success",
        label: "Preparing player",
      });

      return NextResponse.json({
        streamUrl,
        title,
        type,
        valid: true,
        steps,
        supportsStreaming: true,
        acceptRanges: true,
      } as ValidationResponse);
    }

    // Handle signed CDN URLs that should bypass server-side validation
    if (isDirectPlayUrl(url)) {
      steps.push({
        step: "connection",
        status: "success",
        label: "Connecting to server",
      });
      steps.push({
        step: "filetype",
        status: "success",
        label: "Checking file type",
      });
      steps.push({
        step: "streaming",
        status: "success",
        label: "Checking streaming support",
        message: "Signed CDN URL",
      });
      steps.push({
        step: "preparing",
        status: "success",
        label: "Preparing player",
      });

      return NextResponse.json({
        streamUrl: url,
        title,
        type,
        valid: true,
        steps,
        supportsStreaming: true,
      } as ValidationResponse);
    }

    // For direct video URLs, verify it's reachable and check streaming support
    steps.push({
      step: "connection",
      status: "checking",
      label: "Connecting to server",
    });

    let supportsStreaming = false;
    let acceptRanges = false;
    let contentLength: number | undefined;
    let isVideo = false;
    let contentType = "";
    let headRes: Response | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      headRes = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; fluxplays.live/1.0)",
        },
        redirect: "follow",
      });
      clearTimeout(timeout);

      contentType = headRes.headers.get("content-type") || "";
      acceptRanges = headRes.headers.get("accept-ranges") === "bytes";
      const contentLengthStr = headRes.headers.get("content-length");
      if (contentLengthStr) {
        contentLength = parseInt(contentLengthStr, 10);
      }

      isVideo =
        contentType.startsWith("video/") ||
        contentType.includes("octet-stream") ||
        contentType.includes("mp4") ||
        contentType.includes("webm") ||
        contentType.includes("mkv") ||
        contentType.includes("mpeg") ||
        contentType.includes("mpegurl") ||
        contentType.includes("apple.mpegurl") ||
        ["MP4", "MKV", "WEBM", "AVI", "MOV", "M3U8", "OGG", "TS", "FLV"].includes(
          parsedUrl.pathname.split(".").pop()?.toUpperCase() || ""
        );

      if (!headRes.ok && headRes.status !== 206 && headRes.status !== 416) {
        steps[1].status = "error";
        steps[1].message = `HTTP ${headRes.status}`;

        // Check if expired
        if (headRes.status === 403 || headRes.status === 401) {
          return NextResponse.json(
            {
              error: "This link may be expired or blocked.",
              valid: false,
              steps,
            } as ValidationResponse,
            { status: 403 }
          );
        }

        return NextResponse.json(
          {
            error: `Link returned HTTP ${headRes.status}. It may be private or expired.`,
            valid: false,
            steps,
          } as ValidationResponse,
          { status: 400 }
        );
      }

      steps[1].status = "success";

      // Step 3: Check file type
      steps.push({
        step: "filetype",
        status: "checking",
        label: "Checking file type",
      });

      if (!isVideo) {
        steps[2].status = "error";
        steps[2].message = "Not a video file";
        return NextResponse.json(
          {
            error: "This link doesn't look like a playable video. Please check the link or try another direct video URL.",
            valid: false,
            steps,
          } as ValidationResponse,
          { status: 400 }
        );
      }

      steps[2].status = "success";

      // Step 4: Check streaming support
      steps.push({
        step: "streaming",
        status: "checking",
        label: "Checking streaming support",
      });

      supportsStreaming = acceptRanges || contentLength !== undefined;

      if (!supportsStreaming) {
        steps[3].status = "success";
        steps[3].message = "Limited streaming support";
      } else {
        steps[3].status = "success";
      }

      // Step 5: Preparing player
      steps.push({
        step: "preparing",
        status: "checking",
        label: "Preparing player",
      });

      steps[4].status = "success";

      return NextResponse.json({
        streamUrl: url,
        title,
        type,
        contentType,
        valid: true,
        steps,
        supportsStreaming,
        acceptRanges,
        contentLength,
      } as ValidationResponse);
    } catch (fetchErr: any) {
      if (fetchErr?.name === "AbortError") {
        steps[1].status = "error";
        steps[1].message = "Request timeout";
        return NextResponse.json(
          {
            error: "Request timed out. The server may be slow or blocking requests.",
            valid: false,
            steps,
          } as ValidationResponse,
          { status: 408 }
        );
      }

      // If HEAD fails due to CORS or network, try GET with Range
      steps[1].status = "checking";
      steps[1].message = "Retrying with GET request";

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const getRes = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; fluxplays.live/1.0)",
            "Range": "bytes=0-1023",
          },
          redirect: "follow",
        });
        clearTimeout(timeout);

        contentType = getRes.headers.get("content-type") || "";
        acceptRanges = getRes.headers.get("accept-ranges") === "bytes";
        const contentLengthStr = getRes.headers.get("content-length");
        if (contentLengthStr) {
          contentLength = parseInt(contentLengthStr, 10);
        }

        isVideo =
          contentType.startsWith("video/") ||
          contentType.includes("octet-stream") ||
          contentType.includes("mp4") ||
          contentType.includes("webm") ||
          contentType.includes("mkv") ||
          contentType.includes("mpeg") ||
          contentType.includes("mpegurl") ||
          contentType.includes("apple.mpegurl") ||
          ["MP4", "MKV", "WEBM", "AVI", "MOV", "M3U8", "OGG", "TS", "FLV"].includes(
            parsedUrl.pathname.split(".").pop()?.toUpperCase() || ""
          );

        if ((getRes.ok || getRes.status === 206) && isVideo) {
          steps[1].status = "success";
          steps.push({
            step: "filetype",
            status: "success",
            label: "Checking file type",
          });

          supportsStreaming = acceptRanges || contentLength !== undefined;
          steps.push({
            step: "streaming",
            status: "success",
            label: "Checking streaming support",
            message: supportsStreaming ? undefined : "Limited support",
          });

          steps.push({
            step: "preparing",
            status: "success",
            label: "Preparing player",
          });

          return NextResponse.json({
            streamUrl: url,
            title,
            type,
            contentType,
            valid: true,
            steps,
            supportsStreaming,
            acceptRanges,
            contentLength,
          } as ValidationResponse);
        }
      } catch {
        // Fall through to warning case
      }

      // If both HEAD and GET fail, allow with warning
      steps[1].status = "success";
      steps[1].message = "Could not fully validate";
      steps.push({
        step: "filetype",
        status: "success",
        label: "Checking file type",
      });
      steps.push({
        step: "streaming",
        status: "success",
        label: "Checking streaming support",
        message: "Could not determine",
      });
      steps.push({
        step: "preparing",
        status: "success",
        label: "Preparing player",
      });

      return NextResponse.json({
        streamUrl: url,
        title,
        type,
        valid: true,
        steps,
        supportsStreaming: false,
        warning: "Could not pre-validate link, but will attempt to play",
      } as ValidationResponse);
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error", valid: false, steps } as ValidationResponse,
      { status: 500 }
    );
  }
}
