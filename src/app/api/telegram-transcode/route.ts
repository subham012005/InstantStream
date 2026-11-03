import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { validateSafeUrl } from "@/lib/security";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type",
  "Cross-Origin-Resource-Policy": "cross-origin",
} as const;

interface VideoProbeResult {
  isCompatible: boolean;
  codec: string;
  hasAudio: boolean;
  audioCodec?: string;
  width?: number;
  height?: number;
}

/**
 * Checks video compatibility using ffprobe.
 * Browser standard HTML5 video requires H.264 (avc1) or VP8/VP9/AV1, with AAC/MP3/Opus audio.
 * High-profile HEVC/H.265 or non-faststart MP4s often fail in Chrome.
 */
function probeVideo(url: string): Promise<VideoProbeResult> {
  return new Promise((resolve) => {
    const ffprobe = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=codec_name,profile,width,height",
      "-of",
      "json",
      url,
    ]);

    let data = "";
    const timeout = setTimeout(() => {
      try {
        ffprobe.kill();
      } catch {}
      // Timeout fallback: assume compatible to avoid blocking playback
      resolve({ isCompatible: true, codec: "unknown", hasAudio: true });
    }, 6000);

    ffprobe.stdout.on("data", (chunk) => {
      data += chunk;
    });

    ffprobe.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0 && data) {
        try {
          const parsed = JSON.parse(data);
          const vStream = parsed.streams?.[0];
          const codec = (vStream?.codec_name || "").toLowerCase();
          const profile = (vStream?.profile || "").toLowerCase();

          // Standard browser video support check
          const isH264 = codec === "h264";
          const isVP89 = codec === "vp8" || codec === "vp9" || codec === "av1";
          // High 4:4:4 or 10-bit h264 profiles often fail in browser hardware decoders
          const isHigh444 = profile.includes("4:4:4") || profile.includes("hi10p");

          const isCompatible = (isH264 && !isHigh444) || isVP89;

          resolve({
            isCompatible,
            codec,
            hasAudio: true,
            width: vStream?.width,
            height: vStream?.height,
          });
          return;
        } catch {}
      }
      resolve({ isCompatible: true, codec: "unknown", hasAudio: true });
    });

    ffprobe.on("error", () => {
      clearTimeout(timeout);
      resolve({ isCompatible: true, codec: "unknown", hasAudio: true });
    });
  });
}

export async function GET(req: NextRequest) {
  try {
    const videoUrl = req.nextUrl.searchParams.get("url");
    if (!videoUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const safetyCheck = await validateSafeUrl(videoUrl);
    if (!safetyCheck.safe || !safetyCheck.url) {
      return NextResponse.json(
        { error: safetyCheck.error || "Forbidden destination URL" },
        { status: 403 }
      );
    }

    const checkOnly = req.nextUrl.searchParams.get("check") === "1";
    if (checkOnly) {
      const probe = await probeVideo(videoUrl);
      return NextResponse.json(probe, { headers: CORS_HEADERS });
    }

    const startParam = parseFloat(req.nextUrl.searchParams.get("start") || "0");
    const startTime = isNaN(startParam) || startParam < 0 ? 0 : startParam;

    // Transcode on-the-fly to fragmented MP4 (H.264 baseline + AAC audio)
    const ffmpegArgs: string[] = [];
    if (startTime > 0) {
      ffmpegArgs.push("-ss", startTime.toString());
    }

    ffmpegArgs.push(
      "-i",
      videoUrl,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "ultrafast",
      "-tune",
      "zerolatency",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "frag_keyframe+empty_moov+default_base_moof",
      "-f",
      "mp4",
      "pipe:1"
    );

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    req.signal.addEventListener("abort", () => {
      try {
        ffmpeg.kill("SIGKILL");
      } catch {}
    });

    const webStream = new ReadableStream({
      start(controller) {
        ffmpeg.stdout.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        ffmpeg.stdout.on("end", () => {
          try {
            controller.close();
          } catch {}
        });

        ffmpeg.on("error", (err) => {
          try {
            controller.error(err);
          } catch {}
        });

        ffmpeg.stderr.on("data", () => {
          // Drain stderr to prevent pipe blocking
        });
      },
      cancel() {
        try {
          ffmpeg.kill("SIGKILL");
        } catch {}
      },
    });

    return new Response(webStream, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "video/mp4",
        "Cache-Control": "no-cache, no-store",
      },
    });
  } catch (err: any) {
    console.error("Transcode stream error:", err?.message || err);
    return NextResponse.json({ error: "Failed to transcode stream" }, { status: 500 });
  }
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
