/**
 * src/lib/catalog/netflix-scraper.ts
 *
 * Core scraping utilities ported from netflix-server.js into Next.js-compatible
 * server-side code (no Express, no filesystem — uses Next.js route handlers).
 *
 * These functions are ONLY called from API route handlers (server-side).
 * They are never imported into client components.
 */

import { unstable_cache } from "next/cache";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
export const COUNTRY = "in";
export const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const GENRES = [
  { group: "Netflix",     name: "Only on Netflix",       code: "839338" },
  { group: "Action",      name: "Action & Adventure",    code: "1365"   },
  { group: "Anime",       name: "Anime",                 code: "7424"   },
  { group: "Kids",        name: "Children & Family",     code: "783"    },
  { group: "Comedy",      name: "Comedies",              code: "6548"   },
  { group: "Drama",       name: "Dramas",                code: "5763"   },
  { group: "Horror",      name: "Horror Movies",         code: "8711"   },
  { group: "Indian",      name: "Indian Movies",         code: "10463"  },
  { group: "Romance",     name: "Romantic Movies",       code: "8883"   },
  { group: "Sci-Fi",      name: "Sci-Fi & Fantasy",      code: "1492"   },
  { group: "TV",          name: "TV Shows",              code: "83"     },
  { group: "Thriller",    name: "Thrillers",             code: "8933"   },
  { group: "Sports",      name: "Sports Movies",         code: "4370"   },
  { group: "Documentary", name: "Documentaries",         code: "6839"   },
] as const;

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export interface ScrapedTitle {
  id: string | null;
  netflixUrl: string | null;
  title: string | null;
  type: "movie" | "series";
  poster: string | null;
  backdrop: string | null;
  description: string | null;
}

export interface ScrapedGenre {
  code: string;
  name: string;
  group: string | null;
  url: string;
  totalFound: number;
  items: ScrapedTitle[];
  note: string | null;
}


/* ─────────────────────────────────────────────
   HTML helpers
───────────────────────────────────────────── */
function clean(text = ""): string {
  let str = String(text)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, `"`)
    .replace(/&#x27;/g, `'`)
    .replace(/\\u0026/g, "&");
    
  // Decode unicode and hex escapes
  str = str.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  str = str.replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return str.replace(/\s+/g, " ").trim();
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    // Next.js fetch cache
    next: { revalidate: CACHE_TTL_SECONDS },
  });

  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.text();
}

function getMeta(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return clean(m[1]);
  }
  return "";
}

function getJsonLd(html: string): any {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const json = JSON.parse(block[1]);
      if (json?.name) return json;
      if (Array.isArray(json)) return json.find((x: any) => x?.name) || null;
    } catch { /* ignore */ }
  }
  return null;
}

function parseTitlePage(id: string, html: string, pageUrl: string): ScrapedTitle {
  const jsonLd = getJsonLd(html);
  const ogTitle = getMeta(html, "og:title");
  const ogDescription = getMeta(html, "og:description");
  const ogImage = getMeta(html, "og:image");

  const title = clean(jsonLd?.name) || clean(ogTitle).replace(/\| Netflix.*$/i, "");
  const description = clean(jsonLd?.description) || clean(ogDescription);
  const image =
    typeof jsonLd?.image === "string" ? jsonLd.image :
    Array.isArray(jsonLd?.image) ? jsonLd.image[0] :
    ogImage;
  const typeText = JSON.stringify(jsonLd || {}).toLowerCase();

  return {
    id,
    netflixUrl: pageUrl,
    title: title || null,
    type: typeText.includes("tvseries") || typeText.includes("series") ? "series" : "movie",
    poster: image || null,
    backdrop: image || null,
    description: description || null,
  };
}

function extractTitleIds(html: string): string[] {
  const ids = new Set<string>();
  const patterns = [
    /\/title\/(\d+)/g,
    /"videoId"\s*:\s*(\d+)/g,
    /"id"\s*:\s*"(\d{5,})"/g,
    /"id"\s*:\s*(\d{5,})/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      ids.add(match[1]);
    }
  }
  return [...ids];
}

/* ─────────────────────────────────────────────
   Scrapers — wrapped in Next.js unstable_cache
───────────────────────────────────────────── */

/** Scrape a single Netflix title page by ID */
export const scrapeTitleById = unstable_cache(
  async (id: string, country = COUNTRY): Promise<ScrapedTitle> => {
    const pageUrl = `https://www.netflix.com/${country}/title/${id}`;
    const html = await fetchHtml(pageUrl);
    return parseTitlePage(id, html, pageUrl);
  },
  ["netflix-title"],
  { revalidate: CACHE_TTL_SECONDS }
);

/** Scrape a Netflix genre/browse page and enrich each title */
export const scrapeGenre = unstable_cache(
  async (code: string, country = COUNTRY, limit = 10): Promise<ScrapedGenre> => {
    const genreInfo = GENRES.find((g) => g.code === code);
    const genreUrl = `https://www.netflix.com/${country}/browse/genre/${code}`;

    const html = await fetchHtml(genreUrl);
    const ids = extractTitleIds(html).slice(0, limit);

    const items: ScrapedTitle[] = [];
    for (const id of ids) {
      try {
        const item = await scrapeTitleById(id, country);
        if (item?.title) items.push(item);
      } catch { /* skip */ }
    }

    return {
      code,
      name: genreInfo?.name || `Genre ${code}`,
      group: genreInfo?.group || null,
      url: genreUrl,
      totalFound: ids.length,
      items,
      note: ids.length === 0
        ? "Netflix did not expose public title IDs for this genre page."
        : null,
    };
  },
  ["netflix-genre"],
  { revalidate: CACHE_TTL_SECONDS }
);


/** Search across all scraped titles (genres cache) */
export async function searchScrapedTitles(query: string): Promise<ScrapedTitle[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Scrape a few key genres to build the search corpus
  const genres = ["839338", "7424", "10463", "83", "1365", "6548", "5763", "8933", "1492"];
  const results: ScrapedTitle[] = [];
  const seen = new Set<string>();

  await Promise.allSettled(
    genres.map(async (code) => {
      try {
        const g = await scrapeGenre(code, COUNTRY, 15);
        for (const item of g.items) {
          const key = item.id || item.title || "";
          if (!seen.has(key) && item.title?.toLowerCase().includes(q)) {
            seen.add(key);
            results.push(item);
          }
        }
      } catch { /* skip */ }
    })
  );

  return results.slice(0, 30);
}
