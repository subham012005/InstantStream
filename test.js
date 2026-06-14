import express from "express";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import crypto from "node:crypto";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

const AES_KEY_HEX =
  "a8f2a1b5e9c470814f6b2c3a5d8e7f9c1a2b3c4d5e3f7a8b8cad1e2d0a4d5c5b";

const PROVIDERS = {
  moviebox: { label: "MovieBox", api: "https://uwu.eat-peach.sbs", path: "moviebox" },
  net: { label: "Net", api: "https://uwu.eat-peach.sbs", path: "net" },
  holly: { label: "Holly", api: "https://usa.eat-peach.sbs", path: "holly" },
  air: { label: "Air", api: "https://usa.eat-peach.sbs", path: "air" },
  multi: { label: "Multi", api: "https://usa.eat-peach.sbs", path: "multi" }
};

const FALLBACK_ORDER = [
  "moviebox",
  "holly",
  "air",
  "multi",
  "gemma",
  "net"
];

function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64");
}

function decryptPayload(data) {
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

app.get("/multi-page", async (req, res) => {
  const imdbId = req.query.imdb || "tt4154796";

  const html = await fetch(`https://piexe411qok.com/play/${imdbId}`).then(r => r.text());

  const match = html.match(/let p3 = (\{.*?\});/s);

  if (!match) {
    return res.status(500).json({ error: "p3 config not found" });
  }

  const p3 = JSON.parse(match[1]);

  res.json({
    file: p3.file,
    key: p3.key,
    referer: `https://piexe411qok.com/play/${imdbId}`
  });
});
app.get("/multi-languages", async (req, res) => {
  try {
    const imdbId = req.query.imdb || "tt4154796";

    const page = await fetch(`http://localhost:${PORT}/multi-page?imdb=${imdbId}`).then(r => r.json());

    const r = await fetch(page.file, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Origin: "https://piexe411qok.com",
        Referer: page.referer,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRF-TOKEN": page.key,
        "User-Agent": "Mozilla/5.0"
      },
      body: ""
    });

    const text = await r.text();

    const languages = JSON.parse(text);

    res.status(r.status).json({
      key: page.key,
      referer: page.referer,
      languages
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/multi-url", async (req, res) => {
  try {
    const file = req.query.file || "";
    const key = req.query.key || "";
    const referer = req.query.referer || "";

    if (!file) return res.status(400).json({ error: "Missing file" });
    if (!key) return res.status(400).json({ error: "Missing key" });
    if (!referer) return res.status(400).json({ error: "Missing referer" });

    const cleanFile = file.startsWith("~") ? file.slice(1) : file;

    const r = await fetch(`https://piexe411qok.com/playlist/${cleanFile}.txt`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Origin: "https://piexe411qok.com",
        Referer: referer,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRF-TOKEN": key,
        "User-Agent": "Mozilla/5.0"
      },
      body: ""
    });

    const text = await r.text();

    res.status(r.status).json({
      status: r.status,
      url: text.trim()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function detectType(url, type = "") {
  const text = `${url} ${type}`.toLowerCase();
  return text.includes("m3u8") ? "hls" : "mp4";
}

function normalizeSource(source, provider) {
  const originalUrl =
    source.url ||
    source.src ||
    source.file ||
    source.stream ||
    source.streamUrl ||
    source.playbackUrl;

  if (!originalUrl) return null;
  const file = source.file || null;
  let finalUrl = originalUrl;

  if (finalUrl.includes("workers.dev/mp4-proxy?url=")) {
    const parsed = new URL(finalUrl);
    finalUrl = parsed.searchParams.get("url");
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
async function fetchGemmaProvider({ type, tmdbId, imdbId }) {
  if (type !== "movie") {
    throw new Error("Gemma currently supports movie only");
  }

  if (!imdbId) {
    throw new Error("Gemma requires imdb query");
  }

  const page = await fetch(
    `http://localhost:${PORT}/gemma-page?imdb=${imdbId}`
  ).then(r => r.json());

  const langRes = await fetch(page.file, {
    method: "POST",
    headers: {
      Accept: "*/*",
      Origin: GEMMA_ORIGIN,
      Referer: page.referer,
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-TOKEN": page.key,
      "User-Agent": "Mozilla/5.0"
    },
    body: ""
  });

  const langText = await langRes.text();
  const languages = JSON.parse(langText);

  const sources = [];
  const debugGemma = [];

  for (const lang of languages) {
    try {
      const cleanFile = String(lang.file || "").startsWith("~")
        ? String(lang.file).slice(1)
        : String(lang.file || "");

      if (!cleanFile) {
        debugGemma.push({ lang, error: "missing file" });
        continue;
      }

      const finalRes = await fetch(
        `https://keymi417exx.com/playlist/${cleanFile}.txt`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            Origin: GEMMA_ORIGIN,
            Referer: page.referer,
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRF-TOKEN": page.key,
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

      if (!finalRes.ok || !finalUrl) continue;

      sources.push({
        provider: "gemma",
        type: detectType(finalUrl),
        quality: "Auto",
        language: lang.title || lang.label || "Unknown",
        url: finalUrl,
        headers: {
          Referer: page.referer,
          Origin: GEMMA_ORIGIN
        }
      });
    } catch (err) {
      debugGemma.push({
        language: lang.title || "Unknown",
        error: err.message
      });
    }
  }

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
async function fetchFromProvider({ providerKey, type, tmdbId, season, episode }) {
  if (providerKey === "gemma") {
    return fetchGemmaProvider({
      type,
      tmdbId,
      imdbId: arguments[0].imdbId
    });
  }
  const provider = PROVIDERS[providerKey];
  if (!provider) throw new Error(`Unknown provider: ${providerKey}`);

  const apiUrl =
    type === "movie"
      ? `${provider.api}/${provider.path}/movie/${tmdbId}`
      : `${provider.api}/${provider.path}/tv/${tmdbId}/${season}/${episode}`;

  console.log("Provider API:", apiUrl);

  const response = await fetch(apiUrl, {
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
    .map((s) => normalizeSource(s, providerKey))
    .filter(Boolean);

  return {
    provider: providerKey,
    providerLabel: provider.label,
    type,
    tmdbId,
    sources,
    languages: [...new Set(sources.map((s) => s.language))],
    subtitles: data.subtitles || []
  };
}

async function fetchWithFallback(params) {
  if (params.providerKey !== "auto") return fetchFromProvider(params);

  const errors = [];

  for (const providerKey of FALLBACK_ORDER) {
    try {
      const result = await fetchFromProvider({ ...params, providerKey });
      if (result.sources.length) return result;
      errors.push(`${providerKey}: no sources`);
    } catch (err) {
      errors.push(`${providerKey}: ${err.message}`);
    }
  }

  throw new Error(`All providers failed: ${errors.join(" | ")}`);
}

function parseHeaders(req) {
  let custom = {};

  if (req.query.headers) {
    try {
      custom = JSON.parse(req.query.headers);
    } catch { }
  }

  if (req.query.origin) custom.origin = req.query.origin;
  if (req.query.referer) custom.referer = req.query.referer;
  if (req.query.ua) custom["user-agent"] = req.query.ua;

  return custom;
}

function headerCandidates(provider, customHeaders, url) {
  const sourceHeaders = {
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

  const netfilmHeaders = {
    Accept: "*/*",
    Origin: "https://netfilm.world",
    Referer: "https://netfilm.world/",
    "User-Agent": "Mozilla/5.0"
  };

  const list = [];

  if (url.includes("eat-peach.sbs")) list.push(peachifyHeaders);
  list.push(sourceHeaders);

  if (provider === "air") list.push(sourceHeaders, peachifyHeaders);

  return list;
}

async function fetchWithHeaderFallback(url, provider, customHeaders, extra = {}) {
  const candidates = headerCandidates(provider, customHeaders, url);

  let lastResponse;

  for (const baseHeaders of candidates) {
    const headers = {
      ...baseHeaders,
      ...extra
    };

    const response = await fetch(url, {
      headers,
      redirect: "follow"
    });

    if (response.ok) return response;
    lastResponse = response;
  }

  return lastResponse;
}

app.get("/api/movie/:tmdbId", async (req, res) => {
  try {
    res.json(
      await fetchWithFallback({
        providerKey: req.query.server || "auto",
        type: "movie",
        tmdbId: req.params.tmdbId,
        imdbId: req.query.imdb
      })
    );
  } catch (err) {
    res.status(500).json({
      error: "Movie source failed",
      message: err.message
    });
  }
});

app.get("/api/tv/:tmdbId/:season/:episode", async (req, res) => {
  try {
    res.json(
      await fetchWithFallback({
        providerKey: req.query.server || "auto",
        type: "tv",
        tmdbId: req.params.tmdbId,
        season: req.params.season,
        episode: req.params.episode
      })
    );
  } catch (err) {
    res.status(500).json({
      error: "TV source failed",
      message: err.message
    });
  }
});

app.get("/mp4-proxy", async (req, res) => {
  try {
    const fileUrl = req.query.url;
    const provider = req.query.provider || "";

    if (!fileUrl) return res.status(400).send("Missing url");

    const customHeaders = parseHeaders(req);

    const extra = {
      "Accept-Encoding": "identity"
    };

    if (req.headers.range) {
      extra.Range = req.headers.range;
    }

    const response = await fetchWithHeaderFallback(
      fileUrl,
      provider,
      customHeaders,
      extra
    );

    if (!response.ok || !response.body) {
      const body = await response.text().catch(() => "");
      return res
        .status(response.status)
        .send(`Remote error: ${response.status}\n${body.slice(0, 300)}`);
    }

    res.status(response.status);

    for (const h of [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges"
    ]) {
      const value = response.headers.get(h);
      if (value) res.setHeader(h, value);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    await pipeline(Readable.fromWeb(response.body), res);
  } catch (err) {
    console.error(err);
    res.status(500).send("MP4 proxy failed: " + err.message);
  }
});
function toB64Url(str) {
  return Buffer.from(str, "utf8").toString("base64url");
}

function fromB64Url(str) {
  return Buffer.from(str, "base64url").toString("utf8");
}
const GEMMA_ORIGIN = "https://gemma416okl.com";
app.get("/gemma-page", async (req, res) => {
  try {
    const imdbId = req.query.imdb || "tt29468874";
    const playUrl = `${GEMMA_ORIGIN}/play/${imdbId}`;

    const html = await fetch(playUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: `${GEMMA_ORIGIN}/`
      }
    }).then(r => r.text());

    const match = html.match(/let\s+p3\s*=\s*({[\s\S]*?});/);

    if (!match) {
      return res.status(500).json({ error: "p3 config not found" });
    }

    const p3 = JSON.parse(match[1]);

    res.json({
      file: p3.file,
      key: p3.key,
      referer: playUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/gemma-languages", async (req, res) => {
  try {
    const imdbId = req.query.imdb || "tt29468874";

    const page = await fetch(
      `http://localhost:${PORT}/gemma-page?imdb=${imdbId}`
    ).then(r => r.json());

    const r = await fetch(page.file, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Origin: "https://gemma416okl.com",
        Referer: page.referer,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRF-TOKEN": page.key,
        "User-Agent": "Mozilla/5.0"
      },
      body: ""
    });

    const text = await r.text();
    const languages = JSON.parse(text);

    res.status(r.status).json({
      key: page.key,
      referer: page.referer,
      languages
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/gemma-url", async (req, res) => {
  try {
    const file = req.query.file || "";
    const key = req.query.key || "";
    const referer = req.query.referer || "";

    if (!file) return res.status(400).json({ error: "Missing file" });
    if (!key) return res.status(400).json({ error: "Missing key" });
    if (!referer) return res.status(400).json({ error: "Missing referer" });

    const cleanFile = file.startsWith("~") ? file.slice(1) : file;

    const r = await fetch(`https://keymi417exx.com/playlist/${cleanFile}.txt`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Origin: "https://gemma416okl.com",
        Referer: "https://gemma416okl.com/",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRF-TOKEN": key,
        "User-Agent": "Mozilla/5.0"
      },
      body: ""
    });

    const text = await r.text();

    res.status(r.status).json({
      status: r.status,
      url: text.trim()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/hls-proxy", async (req, res) => {
  try {
    const fileUrl = req.query.u ? fromB64Url(req.query.u) : req.query.url;
    const provider = req.query.provider || "";

    if (!fileUrl) return res.status(400).send("Missing url");

    const customHeaders = parseHeaders(req);

    let response;

    if (provider === "multi" || provider === "gemma") {
      const streamHeaders = {
        Accept: "*/*",
        Origin: "null",
        Referer:
          provider === "gemma"
            ? "https://gemma416okl.com/"
            : "https://piexe411qok.com/",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36"
      };

      console.log(`${provider.toUpperCase()} FETCH:`, fileUrl);

      response = await fetch(fileUrl, {
        headers: streamHeaders,
        redirect: "manual"
      });

      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.get("location")
      ) {
        const redirectUrl = response.headers.get("location");

        return res.redirect(
          302,
          `/hls-proxy?provider=${provider}&u=${toB64Url(redirectUrl)}&headers=${encodeURIComponent(
            JSON.stringify(customHeaders)
          )}`
        );
      }
    } else {
      response = await fetchWithHeaderFallback(
        fileUrl,
        provider,
        customHeaders
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return res
        .status(response.status)
        .send(`HLS remote error: ${response.status}\n${body.slice(0, 300)}`);
    }

    let playlist = await response.text();
    const baseUrl = new URL(fileUrl);

    const encodeHeaders = encodeURIComponent(JSON.stringify(customHeaders));

    function proxify(uri) {
      const absoluteUrl = new URL(uri, baseUrl).href;

      if (absoluteUrl.includes(".m3u8")) {
        return `/hls-proxy?provider=${provider}&u=${toB64Url(absoluteUrl)}`;
      }

      // Direct segment access
      return absoluteUrl;
    }

    playlist = playlist.replace(/URI="([^"]+)"/g, (_, uri) => {
      return `URI="${proxify(uri)}"`;
    });

    playlist = playlist.replace(/^(?!#)(.+)$/gm, (line) => {
      line = line.trim();
      if (!line) return line;
      return proxify(line);
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.send(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).send("HLS proxy failed: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});