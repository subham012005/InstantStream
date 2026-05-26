import { NextRequest, NextResponse } from "next/server";

// ── Config ────────────────────────────────────────────────────────────────────
const TMDB_API_KEY  = process.env.TMDB_API_KEY;
const TMDB_BASE     = "https://api.themoviedb.org/3";

// The stremio-addon-streamimdb backend — runs on port 7000 alongside Next.js.
// Override with STREAM_ENGINE_URL env var in production (e.g. your Render URL).
const STREAM_ENGINE = (
  process.env.STREAM_ENGINE_URL || "http://localhost:7000"
).replace(/\/$/, "");

// ── Types ─────────────────────────────────────────────────────────────────────
interface StreamResult {
  url: string;
  type: "hls" | "mp4";
  provider: string;
  meta?: any;
}

// ── Primary: StreamIMDb engine (vaplayer.ru + HLS proxy) ─────────────────────
async function tryStreamEngine(imdbId: string): Promise<StreamResult | null> {
  try {
    const res = await fetch(`${STREAM_ENGINE}/resolve/${imdbId}?type=movie`, {
      signal: AbortSignal.timeout(20000), // addon may take up to ~15s on cold start
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.url) return null;
    return {
      url:      data.url,
      type:     data.type === "mp4" ? "mp4" : "hls",
      provider: data.provider ?? "StreamIMDb",
      meta:     data.meta ?? null,
    };
  } catch {
    return null;
  }
}

// ── Fallback A: VidSrc.cc ─────────────────────────────────────────────────────
async function tryVidsrcCC(imdbId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://vidsrc.cc/v2/api/stream/movie/${imdbId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FluxPlays/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const sources: Array<{ source: string }> = data?.result?.sources ?? [];
    return (
      sources.find((s) => s.source?.includes(".m3u8"))?.source ??
      sources.find((s) => s.source?.includes(".mp4"))?.source ??
      null
    );
  } catch {
    return null;
  }
}

// ── Fallback B: VidSrc.me ─────────────────────────────────────────────────────
async function tryVidsrcMe(imdbId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://vidsrc.me/embed/movie?imdb=${imdbId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FluxPlays/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return (
      text.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/)?.[0] ??
      text.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/)?.[0] ??
      null
    );
  } catch {
    return null;
  }
}

// ── Fallback C: VidSrc.xyz ────────────────────────────────────────────────────
async function tryVidsrcXYZ(imdbId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://vidsrc.xyz/embed/movie/${imdbId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FluxPlays/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return (
      text.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/)?.[0] ??
      text.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/)?.[0] ??
      null
    );
  } catch {
    return null;
  }
}

// ── Master resolver ───────────────────────────────────────────────────────────
async function resolveStream(imdbId: string): Promise<StreamResult | null> {
  // 1. Try the StreamIMDb engine first (best quality, HLS proxy, caching)
  const engine = await tryStreamEngine(imdbId);
  if (engine) return engine;

  // 2. Fallback to direct VidSrc providers
  const cc = await tryVidsrcCC(imdbId);
  if (cc) return { url: cc, type: cc.includes(".m3u8") ? "hls" : "mp4", provider: "VidSrc.cc" };

  const me = await tryVidsrcMe(imdbId);
  if (me) return { url: me, type: me.includes(".m3u8") ? "hls" : "mp4", provider: "VidSrc.me" };

  const xyz = await tryVidsrcXYZ(imdbId);
  if (xyz) return { url: xyz, type: xyz.includes(".m3u8") ? "hls" : "mp4", provider: "VidSrc.xyz" };

  return null;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ imdbId: string }> | { imdbId: string } }
) {
  const imdbId =
    params instanceof Promise ? (await params).imdbId : (params as { imdbId: string }).imdbId;

  if (!imdbId || !/^tt\d{7,8}$/.test(imdbId)) {
    return NextResponse.json(
      { error: "Invalid IMDb ID. Format: 'tt' followed by 7–8 digits (e.g. tt0111161)." },
      { status: 400 }
    );
  }

  // Fetch stream (metadata is now bundled from vaplayer.ru)
  const stream = await resolveStream(imdbId);

  if (!stream) {
    return NextResponse.json(
      { error: "No stream source could be found for this title right now. Try again later." },
      { status: 404 }
    );
  }

  const rawMeta = stream.meta || {};
  const yearMatch = typeof rawMeta.title === "string" ? rawMeta.title.match(/(\d{4})/) : null;
  const cleanTitle = typeof rawMeta.title === "string" 
    ? rawMeta.title.replace(/\s*\(?\d{4}\)?.*$/, "").trim() 
    : imdbId;

  const movieMeta = rawMeta.title 
    ? {
        title:    cleanTitle,
        year:     yearMatch ? yearMatch[1] : "",
        poster:   rawMeta.backdrop || null,
        rating:   "",
        overview: rawMeta.file_name || "",
      }
    : null;

  return NextResponse.json({
    imdbId,
    url:      stream.url,
    type:     stream.type,
    provider: stream.provider,
    movie:    movieMeta,
  });
}
