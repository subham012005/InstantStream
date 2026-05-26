import { NextRequest, NextResponse } from "next/server";
import { fetchVideoSource } from "@/lib/scraper";

interface StreamMeta {
  title?: string;
  backdrop?: string;
  file_name?: string;
}

interface StreamResult {
  url: string;
  type: "hls" | "mp4";
  provider: string;
  meta?: StreamMeta;
}

async function tryStreamEngine(imdbId: string): Promise<StreamResult | null> {
  try {
    const result = await fetchVideoSource(imdbId, "movie");
    if (!result?.streams?.length) return null;

    const stream = result.streams[0];
    const isHls = stream.url.includes(".m3u8") || !stream.url.includes(".mp4");
    const url =
      isHls && stream.proxyable
        ? `/api/hls-proxy?url=${encodeURIComponent(stream.url)}&imdbId=${encodeURIComponent(imdbId)}`
        : stream.url;

    return {
      url,
      type: isHls ? "hls" : "mp4",
      provider: "StreamIMDb",
      meta: stream.meta,
    };
  } catch {
    return null;
  }
}

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

async function resolveStream(imdbId: string): Promise<StreamResult | null> {
  const engine = await tryStreamEngine(imdbId);
  if (engine) return engine;

  const cc = await tryVidsrcCC(imdbId);
  if (cc) return { url: cc, type: cc.includes(".m3u8") ? "hls" : "mp4", provider: "VidSrc.cc" };

  const me = await tryVidsrcMe(imdbId);
  if (me) return { url: me, type: me.includes(".m3u8") ? "hls" : "mp4", provider: "VidSrc.me" };

  const xyz = await tryVidsrcXYZ(imdbId);
  if (xyz) return { url: xyz, type: xyz.includes(".m3u8") ? "hls" : "mp4", provider: "VidSrc.xyz" };

  return null;
}

function buildMovieMeta(rawMeta: StreamMeta | undefined, imdbId: string) {
  if (!rawMeta?.title) return null;

  const yearMatch = rawMeta.title.match(/(\d{4})/);
  const cleanTitle = rawMeta.title.replace(/\s*\(?\d{4}\)?.*$/, "").trim() || imdbId;

  return {
    title: cleanTitle,
    year: yearMatch ? yearMatch[1] : "",
    poster: rawMeta.backdrop || null,
    rating: "",
    overview: rawMeta.file_name || "",
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ imdbId: string }> | { imdbId: string } }
) {
  const imdbId =
    params instanceof Promise ? (await params).imdbId : (params as { imdbId: string }).imdbId;

  if (!imdbId || !/^tt\d{7,8}$/.test(imdbId)) {
    return NextResponse.json(
      { error: "Invalid IMDb ID. Format: 'tt' followed by 7-8 digits (e.g. tt0111161)." },
      { status: 400 }
    );
  }

  const stream = await resolveStream(imdbId);

  if (!stream) {
    return NextResponse.json(
      { error: "No stream source could be found for this title right now. Try again later." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    imdbId,
    url: stream.url,
    type: stream.type,
    provider: stream.provider,
    movie: buildMovieMeta(stream.meta, imdbId),
  });
}
