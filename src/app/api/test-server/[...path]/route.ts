import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getProxyDispatcher } from "@/lib/settings";

const AES_KEY_HEX =
  "a8f2a1b5e9c470814f6b2c3a5d8e7f9c1a2b3c4d5e3f7a8b8cad1e2d0a4d5c5b";

const PROVIDERS: Record<string, any> = {
  moviebox: { label: "MovieBox", api: "https://uwu.eat-peach.sbs", path: "moviebox" },
  net: { label: "Net", api: "https://uwu.eat-peach.sbs", path: "net" },
  holly: { label: "Holly", api: "https://usa.eat-peach.sbs", path: "holly" },
  air: { label: "Air", api: "https://usa.eat-peach.sbs", path: "air" }
};

const AUTO_PROVIDER_ORDER = [
  "moviebox",
  "holly",
  "air",
  "net",
  "gemma"
];

function b64urlDecode(str: string) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64");
}

function decryptPayload(data: string) {
  const [ivPart, cipherPart, tagPart] = data.split(".");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(AES_KEY_HEX, "hex"),
    b64urlDecode(ivPart)
  );

  decipher.setAuthTag(b64urlDecode(tagPart));

  const out = Buffer.concat([
    decipher.update(b64urlDecode(cipherPart)),
    decipher.final()
  ]);

  return JSON.parse(out.toString("utf8"));
}

function detectType(url: string, type = "") {
  const text = `${url} ${type}`.toLowerCase();
  return text.includes("m3u8") ? "hls" : "mp4";
}

function normalizeSource(source: any, provider: string) {
  const originalUrl =
    source.url ||
    source.src ||
    source.file ||
    source.stream ||
    source.streamUrl ||
    source.playbackUrl;

  if (!originalUrl) return null;
  let finalUrl = originalUrl;

  if (finalUrl.includes("workers.dev/mp4-proxy?url=")) {
    try {
      const parsed = new URL(finalUrl);
      finalUrl = parsed.searchParams.get("url");
    } catch (e) {}
  }

  return {
    provider,
    type: detectType(finalUrl, source.type),
    quality: source.quality || source.resolution || source.height || "Auto",
    language: source.language || source.lang || source.audio || source.dub || source.label || "Unknown",
    url: finalUrl,
    file: source.file || null,
    headers: source.headers || source.header || source.requestHeaders || {},
    sizeBytes: source.sizeBytes || source.size || null
  };
}

const GEMMA_ORIGIN = "https://gemma416okl.com";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeGemmaLanguages(payload: any) {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    for (const key of ["data", "languages", "sources", "tracks", "result"]) {
      if (Array.isArray(payload[key])) return payload[key];
    }

    const values = Object.values(payload);
    const nestedArray = values.find(Array.isArray);
    if (Array.isArray(nestedArray)) return nestedArray;

    const objectValues = values.filter((value) => value && typeof value === "object");
    if (objectValues.length) return objectValues;
  }

  return [];
}

function extractGemmaSeriesLanguages(payload: any, season: any, episode: any) {
  if (!Array.isArray(payload)) return [];
  if (payload.length > 0 && payload[0].folder) {
    const seasonFolder = payload.find((s: any) => String(s.id) === String(season) || (s.title && s.title.includes(`Season ${season}`)));
    if (!seasonFolder || !seasonFolder.folder) return [];
    
    const episodeFolder = seasonFolder.folder.find((e: any) => String(e.episode) === String(episode) || String(e.id) === `${season}-${episode}`);
    if (!episodeFolder || !episodeFolder.folder) return [];
    
    return normalizeGemmaLanguages(episodeFolder.folder);
  }
  return [];
}

async function fetchGemmaLanguages(p3: any, playUrl: string, type: string, season: any, episode: any) {
  const attempts = [];
  const targetFileUrl = p3.file.startsWith("/") ? `${GEMMA_ORIGIN}${p3.file}` : p3.file;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const langRes = await fetch(targetFileUrl, {
      method: "POST",
      // @ts-ignore
      dispatcher: getProxyDispatcher(),
      headers: {
        Accept: "application/json, text/plain, */*",
        Origin: GEMMA_ORIGIN,
        Referer: playUrl,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRF-TOKEN": p3.key,
        "User-Agent": "Mozilla/5.0"
      },
      body: "",
      cache: "no-store"
    });

    const text = await langRes.text();
    let payload: any = null;
    let languages: any[] = [];

    try {
      payload = JSON.parse(text);
      if (type === "tv") {
        languages = extractGemmaSeriesLanguages(payload, season, episode);
      } else {
        languages = normalizeGemmaLanguages(payload);
      }
    } catch (err: any) {
      attempts.push({
        attempt,
        error: `language JSON parse failed: ${err.message}`,
        status: langRes.status,
        preview: text.slice(0, 300)
      });
    }

    if (languages.length) {
      return { languages, payload, attempts };
    }

    attempts.push({
      attempt,
      error: "no language tracks found",
      status: langRes.status,
      payloadType: Array.isArray(payload) ? "array" : typeof payload,
      keys: payload && typeof payload === "object" ? Object.keys(payload).slice(0, 12) : [],
      preview: text.slice(0, 300)
    });

    if (attempt < 3) await delay(450 * attempt);
  }

  return { languages: [], payload: null, attempts };
}

async function fetchGemmaProvider({ type, tmdbId, imdbId, season, episode }: any) {
  if (!imdbId) {
    throw new Error("Gemma requires imdb query");
  }

  const playUrl = `${GEMMA_ORIGIN}/play/${imdbId}`;

  const html = await fetch(playUrl, {
    // @ts-ignore
    dispatcher: getProxyDispatcher(),
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: `${GEMMA_ORIGIN}/`
    }
  }).then(r => r.text());

  let configStr;
  const p3Match = html.match(/let\s+p3\s*=\s*({[\s\S]*?});/);
  
  if (p3Match) {
    configStr = p3Match[1];
  } else {
    const hdvbMatch = html.match(/new\s+HDVBPlayer\s*\(\s*({[\s\S]*?})\s*\)/);
    if (hdvbMatch) {
      configStr = hdvbMatch[1];
    }
  }

  if (!configStr) {
    throw new Error("Gemma config not found");
  }

  const p3 = JSON.parse(configStr);

  const sources: any[] = [];
  const debugGemma: any[] = [];
  const { languages, payload: langPayload, attempts } = await fetchGemmaLanguages(p3, playUrl, type, season, episode);
  debugGemma.push(...attempts);

  if (!languages.length) {
    return {
      provider: "gemma",
      providerLabel: "Gemma",
      type,
      tmdbId,
      imdbId,
      sources,
      languages: [],
      allGemmaLanguages: [],
      transient: true,
      debugGemma,
      subtitles: []
    };
  }

  await Promise.all(languages.map(async (lang: any) => {
    try {
      const cleanFile = String(lang.file || "").startsWith("~")
        ? String(lang.file).slice(1)
        : String(lang.file || "");

      if (!cleanFile) {
        debugGemma.push({ lang, error: "missing file" });
        return;
      }

      const finalRes = await fetch(
        `https://keymi417exx.com/playlist/${cleanFile}.txt`,
        {
          method: "POST",
          // @ts-ignore
          dispatcher: getProxyDispatcher(),
          headers: {
            Accept: "*/*",
            Origin: GEMMA_ORIGIN,
            Referer: playUrl,
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRF-TOKEN": p3.key,
            "User-Agent": "Mozilla/5.0"
          },
          body: "",
          redirect: "follow"
        }
      );

      const finalUrl = (await finalRes.text()).trim();

      debugGemma.push({
        language: lang.title || lang.label || "Unknown",
        file: cleanFile,
        status: finalRes.status,
        finalUrl
      });

      if (!finalRes.ok || !finalUrl) return;

      sources.push({
        provider: "gemma",
        type: detectType(finalUrl),
        quality: "Auto",
        language: lang.title || lang.label || "Unknown",
        url: finalUrl,
        headers: {
          Referer: playUrl,
          Origin: GEMMA_ORIGIN
        }
      });
    } catch (err: any) {
      debugGemma.push({
        language: lang.title || "Unknown",
        error: err.message
      });
    }
  }));

  return {
    provider: "gemma",
    providerLabel: "Gemma",
    type,
    tmdbId,
    imdbId,
    sources,
    languages: [...new Set(sources.map(s => s.language))],
    allGemmaLanguages: languages,
    debugGemma,
    subtitles: []
  };
}

async function fetchFromProvider({ providerKey, type, tmdbId, season, episode, imdbId }: any) {
  if (providerKey === "gemma") {
    return fetchGemmaProvider({ type, tmdbId, imdbId, season, episode });
  }
  const provider = PROVIDERS[providerKey];
  if (!provider) throw new Error(`Unknown provider: ${providerKey}`);

  const apiUrl =
    type === "movie"
      ? `${provider.api}/${provider.path}/movie/${tmdbId}`
      : `${provider.api}/${provider.path}/tv/${tmdbId}/${season}/${episode}`;

  console.log("Provider API:", apiUrl);

  const response = await fetch(apiUrl, {
    // @ts-ignore
    dispatcher: getProxyDispatcher(),
    signal: AbortSignal.timeout(8000),
    headers: {
      Accept: "*/*",
      Origin: "https://peachify.top",
      Referer: "https://peachify.top/",
      "User-Agent": "Mozilla/5.0"
    }
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`${provider.label} failed: ${response.status}`);
  }

  let data = JSON.parse(raw);

  if (data.isEncrypted && data.data) {
    data = decryptPayload(data.data);
  }

  const sources = (data.sources || [])
    .map((s: any) => normalizeSource(s, providerKey))
    .filter(Boolean);

  return {
    provider: providerKey,
    providerLabel: provider.label,
    type,
    tmdbId,
    sources,
    languages: [...new Set(sources.map((s: any) => s.language))],
    subtitles: data.subtitles || []
  };
}

async function fetchWithFallback(params: any) {
  if (params.providerKey !== "auto") return fetchFromProvider(params);

  const candidates = AUTO_PROVIDER_ORDER.filter((providerKey) => {
    if (providerKey === "gemma") return Boolean(params.imdbId);
    return Boolean(params.tmdbId);
  });

  const results = await Promise.all(candidates.map(async (providerKey, order) => {
    const startedAt = performance.now();
    try {
      const result: any = await fetchFromProvider({ ...params, providerKey });
      const elapsed = performance.now() - startedAt;
      const sources = result.sources || [];
      const languages = new Set(sources.map((source: any) => source.language || "Unknown"));
      const qualities = new Set(sources.map((source: any) => String(source.quality || source.resolution || source.height || "Auto")));
      const subtitles = result.subtitles || result.captions || result.tracks || [];

      return {
        providerKey,
        result,
        elapsed,
        order,
        ok: sources.length > 0,
        score: sources.length
          ? sources.length * 12 + qualities.size * 18 + languages.size * 10 + subtitles.length * 4 - elapsed / 120 - order * 0.01
          : -Infinity,
        error: sources.length ? "" : "no sources"
      };
    } catch (err: any) {
      return {
        providerKey,
        result: null,
        elapsed: Infinity,
        order,
        ok: false,
        score: -Infinity,
        error: err.message || "failed"
      };
    }
  }));

  const best = results
    .filter((candidate) => candidate.ok)
    .sort((a, b) => b.score - a.score)[0];

  if (best?.result) {
    return {
      ...best.result,
      autoSelection: {
        selectedProvider: best.providerKey,
        elapsedMs: Math.round(best.elapsed),
        checkedProviders: results.map((candidate) => ({
          provider: candidate.providerKey,
          ok: candidate.ok,
          elapsedMs: Number.isFinite(candidate.elapsed) ? Math.round(candidate.elapsed) : null,
          score: Number.isFinite(candidate.score) ? Math.round(candidate.score * 100) / 100 : null,
          error: candidate.error || undefined
        }))
      }
    };
  }

  const errors = results.map((result) => `${result.providerKey}: ${result.error}`).join(" | ");
  throw new Error(`All providers failed: ${errors || "No providers available"}`);
}

function parseHeaders(req: NextRequest) {
  let custom: any = {};
  const searchParams = req.nextUrl.searchParams;

  if (searchParams.get("headers")) {
    try {
      custom = JSON.parse(searchParams.get("headers")!);
    } catch { }
  }

  if (searchParams.get("origin")) custom.origin = searchParams.get("origin");
  if (searchParams.get("referer")) custom.referer = searchParams.get("referer");
  if (searchParams.get("ua")) custom["user-agent"] = searchParams.get("ua");

  return custom;
}

function headerCandidates(provider: string, customHeaders: any, url: string) {
  const sourceHeaders: any = {
    Accept: "*/*",
    "User-Agent":
      customHeaders["user-agent"] ||
      customHeaders["User-Agent"] ||
      "Mozilla/5.0"
  };

  if (customHeaders.origin || customHeaders.Origin) {
    sourceHeaders.Origin = customHeaders.origin || customHeaders.Origin;
  }

  if (customHeaders.referer || customHeaders.Referer) {
    sourceHeaders.Referer = customHeaders.referer || customHeaders.Referer;
  }

  const peachifyHeaders = {
    Accept: "*/*",
    Origin: "https://peachify.top",
    Referer: "https://peachify.top/",
    "User-Agent": "Mozilla/5.0"
  };

  const list = [];

  if (url.includes("eat-peach.sbs")) list.push(peachifyHeaders);
  list.push(sourceHeaders);

  if (provider === "air") list.push(sourceHeaders, peachifyHeaders);

  return list;
}

async function fetchWithHeaderFallback(url: string, provider: string, customHeaders: any, extra: any = {}) {
  const candidates = headerCandidates(provider, customHeaders, url);
  let lastResponse;

  for (const baseHeaders of candidates) {
    const headers = {
      ...baseHeaders,
      ...extra
    };

    const response = await fetch(url, {
      headers,
      // @ts-ignore
      dispatcher: getProxyDispatcher(),
      redirect: "follow"
    });

    if (response.ok) return response;
    lastResponse = response;
  }

  return lastResponse;
}

function toB64Url(str: string) {
  return Buffer.from(str, "utf8").toString("base64url");
}

function fromB64Url(str: string) {
  return Buffer.from(str, "base64url").toString("utf8");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const searchParams = req.nextUrl.searchParams;
  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const routePath = "/" + pathParts.join("/");

  if (routePath.startsWith("/api/movie/")) {
    const tmdbId = pathParts[2];
    try {
      const result = await fetchWithFallback({
        providerKey: searchParams.get("server") || "auto",
        type: "movie",
        tmdbId,
        imdbId: searchParams.get("imdb")
      });
      return NextResponse.json(result);
    } catch (err: any) {
      return NextResponse.json({ error: "Movie source failed", message: err.message }, { status: 500 });
    }
  }

  if (routePath.startsWith("/api/tv/")) {
    const tmdbId = pathParts[2];
    const season = pathParts[3];
    const episode = pathParts[4];
    try {
      const result = await fetchWithFallback({
        providerKey: searchParams.get("server") || "auto",
        type: "tv",
        tmdbId,
        season,
        episode,
        imdbId: searchParams.get("imdb")
      });
      return NextResponse.json(result);
    } catch (err: any) {
      return NextResponse.json({ error: "TV source failed", message: err.message }, { status: 500 });
    }
  }
  
  if (routePath === "/mp4-proxy") {
    try {
      const fileUrl = searchParams.get("url") || "";
      const provider = searchParams.get("provider") || "";

      if (!fileUrl) return new NextResponse("Missing url", { status: 400 });

      const customHeaders = parseHeaders(req);
      const extra: any = { "Accept-Encoding": "identity" };

      if (req.headers.get("range")) {
        extra.Range = req.headers.get("range");
      }

      const response = await fetchWithHeaderFallback(fileUrl, provider, customHeaders, extra);

      if (!response || !response.ok || !response.body) {
        const body = response ? await response.text().catch(() => "") : "";
        return new NextResponse(`Remote error: ${response?.status}\n${body.slice(0, 300)}`, { status: response?.status || 500 });
      }

      const headers = new Headers();
      for (const h of ["content-type", "content-length", "content-range", "accept-ranges"]) {
        const value = response.headers.get(h);
        if (value) headers.set(h, value);
      }

      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Cache-Control", "public, max-age=31536000, immutable");

      return new NextResponse(response.body as any, {
        status: response.status,
        headers
      });
    } catch (err: any) {
      return new NextResponse("MP4 proxy failed: " + err.message, { status: 500 });
    }
  }

  if (routePath === "/hls-proxy") {
    try {
      const urlParam = searchParams.get("url");
      const uParam = searchParams.get("u");
      const fileUrl = uParam ? fromB64Url(uParam) : urlParam;
      const provider = searchParams.get("provider") || "";

      if (!fileUrl) return new NextResponse("Missing url", { status: 400 });

      const customHeaders = parseHeaders(req);
      let response: any;

      if (provider === "multi" || provider === "gemma") {
        const streamHeaders = {
          Accept: "*/*",
          Origin: "null",
          Referer: provider === "gemma" ? "https://gemma416okl.com/" : "https://piexe411qok.com/",
          "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36"
        };

        response = await fetch(fileUrl, {
          headers: streamHeaders,
          // @ts-ignore
          dispatcher: getProxyDispatcher(),
          redirect: "manual"
        });

        if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
          const redirectUrl = response.headers.get("location");
          const redirectUrlEncoded = encodeURIComponent(JSON.stringify(customHeaders));
          return NextResponse.redirect(new URL(`/api/test-server/hls-proxy?provider=${provider}&u=${toB64Url(redirectUrl!)}&headers=${redirectUrlEncoded}`, req.url), { status: 302 });
        }
      } else {
        response = await fetchWithHeaderFallback(fileUrl, provider, customHeaders);
      }

      if (!response || !response.ok) {
        const body = response ? await response.text().catch(() => "") : "";
        return new NextResponse(`HLS remote error: ${response?.status}\n${body.slice(0, 300)}`, { status: response?.status || 500 });
      }

      const contentType = response.headers.get("content-type") || "";
      const looksLikePlaylist =
        contentType.includes("mpegurl") ||
        contentType.includes("application/vnd.apple") ||
        /\.m3u8(?:[?#]|$)/i.test(fileUrl);

      if (!looksLikePlaylist && response.body) {
        const headers = new Headers();
        for (const h of ["content-type", "content-length", "content-range", "accept-ranges"]) {
          const value = response.headers.get(h);
          if (value) headers.set(h, value);
        }
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        return new NextResponse(response.body as any, {
          status: response.status,
          headers
        });
      }

      let playlist = await response.text();
      const baseUrl = new URL(fileUrl);

      function proxify(uri: string) {
        const absoluteUrl = new URL(uri, baseUrl).href;
        return `/api/test-server/hls-proxy?provider=${provider}&u=${toB64Url(absoluteUrl)}`;
      }

      playlist = playlist.replace(/URI="([^"]+)"/g, (_: string, uri: string) => `URI="${proxify(uri)}"`);
      playlist = playlist.replace(/^(?!#)(.+)$/gm, (line: string) => {
        line = line.trim();
        if (!line) return line;
        return proxify(line);
      });

      return new NextResponse(playlist, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=15"
        }
      });
    } catch (err: any) {
      return new NextResponse("HLS proxy failed: " + err.message, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}


