import { NextRequest, NextResponse } from "next/server";

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

function parseIpFromHeaders(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  return forwarded || request.headers.get("x-real-ip") || request.headers.get("x-client-ip") || null;
}

function isPrivateIp(ip: string): boolean {
  return (
    /^127\./.test(ip) ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^169\.254\./.test(ip) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    /^::1$/.test(ip) ||
    /^fc00:/i.test(ip) ||
    /^fe80:/i.test(ip)
  );
}

async function lookupCountryFromIp(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return (await res.text()).trim().toUpperCase() || null;
  } catch {
    return null;
  }
}

async function getCountryFromRequest(request: NextRequest): Promise<string | null> {
  const geoCountry = (request as any).geo?.country;
  const headerCountry =
    geoCountry ||
    request.headers.get("x-vercel-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country") ||
    request.headers.get("x-nf-country") ||
    request.headers.get("x-appengine-country");

  if (headerCountry) return headerCountry.toString().toUpperCase();

  const ip = parseIpFromHeaders(request);
  if (!ip || isPrivateIp(ip)) return null;

  return await lookupCountryFromIp(ip);
}

async function resolveStream(imdbId: string): Promise<StreamResult | null> {
  const cc = await tryVidsrcCC(imdbId);
  if (cc) return { url: cc, type: cc.includes(".m3u8") ? "hls" : "mp4", provider: "VidSrc.cc" };

  const me = await tryVidsrcMe(imdbId);
  if (me) return { url: me, type: me.includes(".m3u8") ? "hls" : "mp4", provider: "VidSrc.me" };

  const xyz = await tryVidsrcXYZ(imdbId);
  if (xyz) return { url: xyz, type: xyz.includes(".m3u8") ? "hls" : "mp4", provider: "VidSrc.xyz" };

  return null;
}

async function fetchOmdbMeta(imdbId: string) {
  try {
    const API_KEY = process.env.OMDB_API_KEY || "fb8a128f";
    const res = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${API_KEY}`, {
      signal: AbortSignal.timeout(6000)
    });
    const data = await res.json();
    
    if (data.Response === "False") return null;

    return {
      title: data.Title,
      year: data.Year,
      poster: data.Poster !== "N/A" ? data.Poster : null,
      rating: data.imdbRating !== "N/A" ? data.imdbRating : "",
      overview: data.Plot !== "N/A" ? data.Plot : "",
    };
  } catch {
    return null;
  }
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

  // Use OMDb to fetch precise movie metadata independent of stream availability
  const movieMeta = await fetchOmdbMeta(imdbId);
  
  // Resolve streaming providers
  const stream = await resolveStream(imdbId);
  
  const countryCode = await getCountryFromRequest(_req);
  const playerSource = "Server1";
  const playerUrl = `https://slast430did.com/play/${imdbId}`;

  if (!stream) {
    return NextResponse.json(
      {
        imdbId,
        url: "",
        type: "hls",
        provider: "Player Embed",
        movie: movieMeta, // return rich OMDB meta even if no native stream found
        playerUrl,
        playerSource,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    imdbId,
    url: stream.url,
    type: stream.type,
    provider: stream.provider,
    movie: movieMeta,
    playerUrl,
    playerSource,
  });
}
