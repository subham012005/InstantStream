import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import XLSX from "xlsx";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const CACHE_DIR = path.join(process.cwd(), "cache");
const CACHE_FILE = path.join(CACHE_DIR, "netflix-cache.json");

// 7 days cache
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const COUNTRY = "in";

const GENRES = [
  { group: "Netflix", name: "Only on Netflix", code: "839338" },
  { group: "Action", name: "Action & Adventure", code: "1365" },
  { group: "Anime", name: "Anime", code: "7424" },
  { group: "Kids", name: "Children & Family", code: "783" },
  { group: "Comedy", name: "Comedies", code: "6548" },
  { group: "Drama", name: "Dramas", code: "5763" },
  { group: "Horror", name: "Horror Movies", code: "8711" },
  { group: "Indian", name: "Indian Movies", code: "10463" },
  { group: "Romance", name: "Romantic Movies", code: "8883" },
  { group: "Sci-Fi", name: "Sci-Fi & Fantasy", code: "1492" },
  { group: "TV", name: "TV Shows", code: "83" },
  { group: "Thriller", name: "Thrillers", code: "8933" },
  { group: "Sports", name: "Sports Movies", code: "4370" },
  { group: "Documentary", name: "Documentaries", code: "6839" }
];

async function readCache() {
  try {
    const cache = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));

    cache.titles ||= {};
    cache.genres ||= {};
    cache.top10 ||= {};
    cache.searches ||= {};
    cache.searchStats ||= {};
    cache.genreStats ||= {};

    return cache;
  } catch {
    return {
      titles: {},
      genres: {},
      top10: {},
      searches: {},
      searchStats: {},
      genreStats: {}
    };
  }
}

async function writeCache(cache) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function fresh(entry) {
  return entry && Date.now() - entry.cachedAt < CACHE_TTL;
}

function clean(text = "") {
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, `"`)
    .replace(/&#x27;/g, `'`)
    .replace(/\\u0026/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNetflixId(input) {
  const match = String(input || "").match(
    /netflix\.com\/(?:[a-z]{2}\/)?title\/(\d+)/i
  );
  return match ? match[1] : null;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html",
      "Accept-Language": "en-IN,en;q=0.9"
    }
  });

  const html = await res.text();

  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);

  return html;
}

function getMeta(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["']`, "i")
  ];

  for (const re of patterns) {
    const match = html.match(re);
    if (match) return clean(match[1]);
  }

  return "";
}

function getJsonLd(html) {
  const blocks = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  ];

  for (const block of blocks) {
    try {
      const json = JSON.parse(block[1]);
      if (json?.name) return json;
      if (Array.isArray(json)) return json.find((x) => x?.name) || null;
    } catch { }
  }

  return null;
}

function parseTitlePage(id, html, pageUrl) {
  const jsonLd = getJsonLd(html);

  const ogTitle = getMeta(html, "og:title");
  const ogDescription = getMeta(html, "og:description");
  const ogImage = getMeta(html, "og:image");

  const title =
    clean(jsonLd?.name) ||
    clean(ogTitle).replace(/\| Netflix.*$/i, "");

  const description =
    clean(jsonLd?.description) ||
    clean(ogDescription);

  const image =
    typeof jsonLd?.image === "string"
      ? jsonLd.image
      : Array.isArray(jsonLd?.image)
        ? jsonLd.image[0]
        : ogImage;

  const typeText = JSON.stringify(jsonLd || {}).toLowerCase();

  return {
    id,
    netflixUrl: pageUrl,
    title: title || null,
    type:
      typeText.includes("tvseries") || typeText.includes("series")
        ? "series"
        : "movie",
    poster: image || null,
    backdrop: image || null,
    description: description || null
  };
}

async function scrapeTitleById(id, country = COUNTRY) {
  const cache = await readCache();

  if (fresh(cache.titles[id])) return cache.titles[id].data;

  const pageUrl = `https://www.netflix.com/${country}/title/${id}`;
  const html = await fetchHtml(pageUrl);
  const data = parseTitlePage(id, html, pageUrl);

  cache.titles[id] = { cachedAt: Date.now(), data };
  await writeCache(cache);

  return data;
}

async function scrapeTitleByUrl(url) {
  const id = extractNetflixId(url);
  if (!id) throw new Error("Invalid Netflix title URL");

  const countryMatch = String(url).match(/netflix\.com\/([a-z]{2})\/title/i);
  const country = countryMatch ? countryMatch[1] : COUNTRY;

  return scrapeTitleById(id, country);
}

function extractTitleIds(html) {
  const ids = new Set();

  const patterns = [
    /\/title\/(\d+)/g,
    /"videoId"\s*:\s*(\d+)/g,
    /"id"\s*:\s*"(\d{5,})"/g,
    /"id"\s*:\s*(\d{5,})/g
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      ids.add(match[1]);
    }
  }

  return [...ids];
}

async function trackSearch(query) {
  const q = String(query || "").toLowerCase().trim();
  if (!q) return;

  const cache = await readCache();
  cache.searchStats[q] = (cache.searchStats[q] || 0) + 1;
  await writeCache(cache);
}

async function trackGenre(code) {
  const key = String(code || "").trim();
  if (!key) return;

  const cache = await readCache();
  cache.genreStats[key] = (cache.genreStats[key] || 0) + 1;
  await writeCache(cache);
}

async function scrapeGenre(code, country = COUNTRY, limit = 10) {
  const cache = await readCache();
  const cacheKey = `${country}:${code}:${limit}`;

  await trackGenre(code);

  if (fresh(cache.genres[cacheKey])) {
    return cache.genres[cacheKey].data;
  }

  const genreInfo = GENRES.find((g) => g.code === String(code));
  const genreUrl = `https://www.netflix.com/${country}/browse/genre/${code}`;

  const html = await fetchHtml(genreUrl);
  const ids = extractTitleIds(html).slice(0, limit);

  const items = [];

  for (const id of ids) {
    try {
      const item = await scrapeTitleById(id, country);
      if (item?.title) items.push(item);
    } catch { }
  }

  const data = {
    code: String(code),
    name: genreInfo?.name || `Genre ${code}`,
    group: genreInfo?.group || null,
    url: genreUrl,
    totalFound: ids.length,
    items,
    note:
      ids.length === 0
        ? "Netflix did not expose public title IDs for this genre page."
        : null
  };

  const latestCache = await readCache();
  latestCache.genres[cacheKey] = { cachedAt: Date.now(), data };
  await writeCache(latestCache);

  return data;
}

async function fetchNetflixTop10Workbook() {
  const url = "https://www.netflix.com/tudum/top10/data/all-weeks-global.xlsx";

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  });

  if (!res.ok) throw new Error(`Top 10 XLSX fetch failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(sheet);
}

async function scrapeNetflixTop10(type = "movies") {
  const cache = await readCache();
  const cacheKey = `top10:${type}`;

  if (fresh(cache.top10[cacheKey])) return cache.top10[cacheKey].data;

  const rows = await fetchNetflixTop10Workbook();

  const categoryMap = {
    movies: "Films (English)",
    tv: "TV (English)",
    nonEnglishMovies: "Films (Non-English)",
    nonEnglishTv: "TV (Non-English)"
  };

  const category = categoryMap[type];
  if (!category) throw new Error("Invalid Top 10 type");

  const latestWeek = rows
    .filter((r) => (r.category || r.Category) === category)
    .map((r) => r.week || r.Week)
    .sort()
    .pop();

  const filtered = rows
    .filter(
      (r) =>
        (r.category || r.Category) === category &&
        (r.week || r.Week) === latestWeek
    )
    .sort(
      (a, b) =>
        Number(a.weekly_rank || a["Weekly Rank"] || 0) -
        Number(b.weekly_rank || b["Weekly Rank"] || 0)
    )
    .slice(0, 10);

  const items = filtered.map((row, index) => ({
    rank: Number(row.weekly_rank || row["Weekly Rank"] || index + 1),
    title:
      row.show_title ||
      row["Show Title"] ||
      row.title ||
      row.Title ||
      null,
    type: category.includes("TV") ? "series" : "movie",
    week: latestWeek,
    category,
    hoursViewed:
      row.weekly_hours_viewed || row["Weekly Hours Viewed"] || null,
    runtime: row.runtime || row.Runtime || null,
    netflixUrl: null,
    id: null,
    poster: null,
    backdrop: null,
    description: null
  }));

  const result = {
    source: "Netflix Tudum Top 10 public XLSX",
    type,
    category,
    week: latestWeek,
    totalFound: items.length,
    items,
    note: "Top 10 public XLSX gives titles/stats but not Netflix IDs."
  };

  const latestCache = await readCache();
  latestCache.top10[cacheKey] = { cachedAt: Date.now(), data: result };
  await writeCache(latestCache);

  return result;
}

async function searchCache(query) {
  const q = String(query || "").toLowerCase().trim();
  const cache = await readCache();

  if (!q) return [];

  await trackSearch(q);

  if (fresh(cache.searches[q])) {
    return cache.searches[q].data;
  }

  const all = [];

  for (const item of Object.values(cache.titles || {})) {
    if (item?.data?.title) all.push(item.data);
  }

  for (const genre of Object.values(cache.genres || {})) {
    for (const item of genre?.data?.items || []) {
      if (item?.title) all.push(item);
    }
  }

  const seen = new Set();

  const results = all
    .filter((item) =>
      String(item.title || "").toLowerCase().includes(q)
    )
    .filter((item) => {
      const key = item.id || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 30);

  const latestCache = await readCache();
  latestCache.searches[q] = {
    cachedAt: Date.now(),
    data: results
  };
  await writeCache(latestCache);

  return results;
}

function getTrendingSearches(cache, limit = 20) {
  return Object.entries(cache.searchStats || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}

function getTrendingGenres(cache, limit = 20) {
  return Object.entries(cache.genreStats || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([code, count]) => {
      const genre = GENRES.find((g) => g.code === code);
      return {
        code,
        name: genre?.name || `Genre ${code}`,
        group: genre?.group || null,
        count
      };
    });
}

async function warmPopularCache() {
  const popularCodes = [
    "7424",
    "839338",
    "10463",
    "83",
    "1365",
    "6548",
    "5763"
  ];

  for (const code of popularCodes) {
    scrapeGenre(code, COUNTRY, 20).catch(() => { });
  }

  scrapeNetflixTop10("movies").catch(() => { });
  scrapeNetflixTop10("tv").catch(() => { });
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Netflix Catalog Scraper</title>
  <style>
    body { font-family: Arial; background:#111; color:white; padding:20px; }
    input, button { padding:12px; margin:5px; border-radius:6px; border:0; }
    input { width:420px; max-width:90%; }
    button { background:#e50914; color:white; cursor:pointer; font-weight:bold; }
    button:hover { background:#ff1b26; }
    .row { margin:20px 0; }
    .card { display:inline-block; width:180px; vertical-align:top; margin:10px; background:#222; padding:10px; border-radius:8px; }
    .card img { width:100%; border-radius:6px; }
    .title { font-weight:bold; margin-top:8px; }
    .desc { font-size:12px; color:#bbb; }
    pre { background:#222; padding:15px; overflow:auto; }
    a { color:#e50914; }
  </style>
</head>
<body>
  <h1>Netflix Public Catalog</h1>

  <div class="row">
    <input id="search" placeholder="Search cached Netflix titles e.g. stranger, dhu..." />
    <button onclick="doSearch()">Search</button>
  </div>

  <div class="row">
    <input id="url" placeholder="Paste Netflix title URL" />
    <button onclick="fetchTitle()">Fetch Title</button>
  </div>

  <h3>Popular Genres</h3>
  <div>
    ${GENRES.map(
    (g) => `<button onclick="loadGenre('${g.code}')">${g.name}</button>`
  ).join("")}
  </div>

  <h3>Top 10</h3>
  <button onclick="loadTop10('movies')">Top 10 Movies</button>
  <button onclick="loadTop10('tv')">Top 10 TV Shows</button>

  <h3>Smart Cache</h3>
  <button onclick="loadTrendingSearches()">Trending Searches</button>
  <button onclick="loadTrendingGenres()">Trending Genres</button>
  <button onclick="warmCache()">Warm Cache</button>

  <h3>Results</h3>
  <div id="results"></div>

<script>
function card(item) {
  return \`
    <div class="card">
      \${item.poster ? \`<img src="\${item.poster}" />\` : ""}
      <div class="title">\${item.rank ? "#" + item.rank + " " : ""}\${item.title || "No title"}</div>
      <div class="desc">\${item.type || ""}</div>
      <div class="desc">\${item.description || ""}</div>
      \${item.netflixUrl ? \`<a target="_blank" href="\${item.netflixUrl}">Open Netflix</a>\` : ""}
    </div>
  \`;
}

function render(items) {
  document.getElementById("results").innerHTML = items.length
    ? items.map(card).join("")
    : "<pre>No results. Try crawling a genre first.</pre>";
}

async function doSearch() {
  const q = document.getElementById("search").value.trim();

  if (!q) {
    document.getElementById("results").innerHTML = "<pre>Type something to search.</pre>";
    return;
  }

  const res = await fetch("/api/netflix/search?q=" + encodeURIComponent(q));
  const data = await res.json();
  render(data.results || []);
}

async function fetchTitle() {
  const url = document.getElementById("url").value.trim();
  const res = await fetch("/api/netflix?url=" + encodeURIComponent(url));
  const data = await res.json();
  render(data.id ? [data] : []);
}

async function loadGenre(code) {
  document.getElementById("results").innerHTML = "<pre>Loading genre...</pre>";
  const res = await fetch("/api/netflix/genre?code=" + code + "&limit=20");
  const data = await res.json();
  render(data.items || []);
}

async function loadTop10(type) {
  const res = await fetch("/api/netflix/top10/" + type);
  const data = await res.json();
  render(data.items || []);
}

async function loadTrendingSearches() {
  const res = await fetch("/api/netflix/trending-searches");
  const data = await res.json();

  document.getElementById("results").innerHTML =
    "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
}

async function loadTrendingGenres() {
  const res = await fetch("/api/netflix/trending-genres");
  const data = await res.json();

  document.getElementById("results").innerHTML =
    "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
}

async function warmCache() {
  document.getElementById("results").innerHTML = "<pre>Warming cache...</pre>";
  const res = await fetch("/api/netflix/warm-cache");
  const data = await res.json();

  document.getElementById("results").innerHTML =
    "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
}

let timer;
document.getElementById("search").addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(doSearch, 300);
});
</script>
</body>
</html>
  `);
});

app.get("/api/netflix", async (req, res) => {
  try {
    if (!req.query.url) return res.status(400).json({ error: "Missing url" });
    res.json(await scrapeTitleByUrl(req.query.url));
  } catch (err) {
    res.status(500).json({
      error: "Netflix title scrape failed",
      message: err.message
    });
  }
});

app.get("/api/netflix/genre", async (req, res) => {
  try {
    res.json(
      await scrapeGenre(
        req.query.code,
        COUNTRY,
        Number(req.query.limit || 10)
      )
    );
  } catch (err) {
    res.status(500).json({
      error: "Netflix genre scrape failed",
      message: err.message
    });
  }
});

app.get("/api/netflix/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    res.json({
      query: q,
      results: await searchCache(q)
    });
  } catch (err) {
    res.status(500).json({
      error: "Netflix search failed",
      message: err.message
    });
  }
});

app.get("/api/netflix/genres", (req, res) => {
  res.json({ total: GENRES.length, genres: GENRES });
});

app.get("/api/netflix/top10/movies", async (req, res) => {
  try {
    res.json(await scrapeNetflixTop10("movies"));
  } catch (err) {
    res.status(500).json({
      error: "Top 10 movies failed",
      message: err.message
    });
  }
});

app.get("/api/netflix/top10/tv", async (req, res) => {
  try {
    res.json(await scrapeNetflixTop10("tv"));
  } catch (err) {
    res.status(500).json({
      error: "Top 10 TV failed",
      message: err.message
    });
  }
});

app.get("/api/netflix/homepage", async (req, res) => {
  try {
    const rows = [];

    rows.push({
      name: "Top 10 Movies",
      ...(await scrapeNetflixTop10("movies"))
    });

    rows.push({
      name: "Top 10 TV Shows",
      ...(await scrapeNetflixTop10("tv"))
    });

    for (const g of GENRES.slice(0, 10)) {
      rows.push(
        await scrapeGenre(g.code, COUNTRY, Number(req.query.limit || 10))
      );
    }

    res.json({ rows });
  } catch (err) {
    res.status(500).json({
      error: "Homepage failed",
      message: err.message
    });
  }
});

app.get("/api/netflix/trending-searches", async (req, res) => {
  try {
    const cache = await readCache();
    res.json({
      total: Object.keys(cache.searchStats || {}).length,
      items: getTrendingSearches(cache, Number(req.query.limit || 20))
    });
  } catch (err) {
    res.status(500).json({
      error: "Trending searches failed",
      message: err.message
    });
  }
});

app.get("/api/netflix/trending-genres", async (req, res) => {
  try {
    const cache = await readCache();
    res.json({
      total: Object.keys(cache.genreStats || {}).length,
      items: getTrendingGenres(cache, Number(req.query.limit || 20))
    });
  } catch (err) {
    res.status(500).json({
      error: "Trending genres failed",
      message: err.message
    });
  }
});

app.get("/api/netflix/warm-cache", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);

    const codes = [
      "7424",
      "839338",
      "10463",
      "83",
      "1365",
      "6548",
      "5763"
    ];

    for (const code of codes) {
      await scrapeGenre(code, COUNTRY, limit);
    }

    await scrapeNetflixTop10("movies");
    await scrapeNetflixTop10("tv");

    res.json({
      success: true,
      message: "Cache warmed successfully",
      genresCached: codes.length,
      limit
    });
  } catch (err) {
    res.status(500).json({
      error: "Warm cache failed",
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running: http://localhost:" + PORT);

  // Auto pre-cache popular rows after server starts
  warmPopularCache();
});