import fs from 'node:fs/promises';
import path from 'node:path';

const CACHE_DIR = path.join(process.cwd(), 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'netflix-cache.json');
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const COUNTRY_DEFAULT = 'in';

export const GENRES = [
  { group: 'Netflix', name: 'Only on Netflix', code: '839338' },
  { group: 'Action', name: 'Action & Adventure', code: '1365' },
  { group: 'Anime', name: 'Anime', code: '7424' },
  { group: 'Kids', name: 'Children & Family', code: '783' },
  { group: 'Comedy', name: 'Comedies', code: '6548' },
  { group: 'Drama', name: 'Dramas', code: '5763' },
  { group: 'Horror', name: 'Horror Movies', code: '8711' },
  { group: 'Indian', name: 'Indian Movies', code: '10463' },
  { group: 'Romance', name: 'Romantic Movies', code: '8883' },
  { group: 'Sci-Fi', name: 'Sci-Fi & Fantasy', code: '1492' },
  { group: 'TV', name: 'TV Shows', code: '83' },
  { group: 'Thriller', name: 'Thrillers', code: '8933' },
  { group: 'Sports', name: 'Sports Movies', code: '4370' },
  { group: 'Documentary', name: 'Documentaries', code: '6839' }
];

export async function readCache(): Promise<any> {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    const cache = JSON.parse(raw);
    cache.titles ||= {};
    cache.genres ||= {};
    cache.searches ||= {};
    cache.searchStats ||= {};
    cache.genreStats ||= {};
    return cache;
  } catch (err) {
    return {
      titles: {},
      genres: {},
      searches: {},
      searchStats: {},
      genreStats: {}
    };
  }
}

async function writeCache(cache: any) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function fresh(entry: any) {
  return entry && Date.now() - entry.cachedAt < CACHE_TTL;
}

function clean(text = '') {
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\\u0026/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractNetflixId(input: string | null) {
  const match = String(input || '').match(/netflix\.com\/(?:[a-z]{2}\/)?title\/(\d+)/i);
  return match ? match[1] : null;
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'text/html',
      'Accept-Language': 'en-IN,en;q=0.9'
    }
  });

  const html = await res.text();
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return html;
}

function getMeta(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${key}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["']`, 'i')
  ];

  for (const re of patterns) {
    const match = html.match(re);
    if (match) return clean(match[1]);
  }
  return '';
}

function getJsonLd(html: string) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const json = JSON.parse(block[1]);
      if (json?.name) return json;
      if (Array.isArray(json)) return json.find((x: any) => x?.name) || null;
    } catch { }
  }
  return null;
}

function parseTitlePage(id: string, html: string, pageUrl: string) {
  const jsonLd = getJsonLd(html);
  const ogTitle = getMeta(html, 'og:title');
  const ogDescription = getMeta(html, 'og:description');
  const ogImage = getMeta(html, 'og:image');

  const title = clean(jsonLd?.name) || clean(ogTitle).replace(/\| Netflix.*$/i, '');
  const description = clean(jsonLd?.description) || clean(ogDescription);
  const image = typeof jsonLd?.image === 'string' ? jsonLd.image : (Array.isArray(jsonLd?.image) ? jsonLd.image[0] : ogImage);
  const typeText = JSON.stringify(jsonLd || {}).toLowerCase();

  return {
    id,
    netflixUrl: pageUrl,
    title: title || null,
    type: typeText.includes('tvseries') || typeText.includes('series') ? 'series' : 'movie',
    poster: image || null,
    backdrop: image || null,
    description: description || null
  };
}

const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzAYf4rMRhR-IKuHwB4Vu4u8USOAQ3zdjPTqb3AFWE7Os3yqsTDekMcYLo3p0x9hRNtOg/exec';

/**
 * Script schema:
 *   POST: { query: netflixId, data: { title, type, ... } }
 *   GET:  returns [[query, dataJson, timestamp], ...] for all rows
 */
async function checkSheetCache(id: string) {
  try {
    const res = await fetch(`${SHEET_ENDPOINT}?netflixId=${id}`, { next: { revalidate: 0 } });
    const json = await res.json();
    if (json?.success && json?.data?.title) return json.data;
  } catch {}
  return null;
}

async function saveToSheetCache(id: string, item: any) {
  try {
    const payload = {
      netflixId:   id,
      title:       item.title || '',
      type:        item.type  || '',
      description: item.description || '',
      posterUrl:   item.poster  || item.posterUrl  || item.image || '',
      backdropUrl: item.backdrop || item.backdropUrl || item.image || '',
      source:      'genre-scraper'
    };
    await fetch(SHEET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
  } catch {}
}

export async function scrapeTitleById(id: string, country = COUNTRY_DEFAULT) {
  // 1. Check Google Sheet cache first
  const sheetData = await checkSheetCache(id);
  if (sheetData?.title) {
    return {
      id,
      netflixUrl: `https://www.netflix.com/${country}/title/${id}`,
      title: sheetData.title,
      type: sheetData.type || 'movie',
      poster: sheetData.posterUrl || sheetData.poster || null,
      backdrop: sheetData.backdropUrl || sheetData.backdrop || null,
      description: sheetData.description || null
    };
  }

  // 2. Local file cache
  const cache = await readCache();
  if (fresh(cache.titles[id])) return cache.titles[id].data;

  // 3. Complete scrape
  const pageUrl = `https://www.netflix.com/${country}/title/${id}`;
  const html = await fetchHtml(pageUrl);
  const data = parseTitlePage(id, html, pageUrl);
  
  // 4. Save to Google Sheet cache concurrently
  saveToSheetCache(id, data).catch(console.error);

  // Update local cache
  cache.titles[id] = { cachedAt: Date.now(), data };
  await writeCache(cache);
  
  return data;
}

export async function scrapeTitleByUrl(url: string) {
  const id = extractNetflixId(url);
  if (!id) throw new Error('Invalid Netflix title URL');
  const countryMatch = String(url).match(/netflix\.com\/([a-z]{2})\/title/i);
  const country = countryMatch ? countryMatch[1] : COUNTRY_DEFAULT;
  return scrapeTitleById(id, country);
}

function extractTitleIds(html: string) {
  const ids = new Set<string>();
  const patterns = [/\/title\/(\d+)/g, /"videoId"\s*:\s*(\d+)/g, /"id"\s*:\s*"(\d{5,})"/g, /"id"\s*:\s*(\d{5,})/g];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) ids.add(match[1]);
  }
  return [...ids];
}

export async function scrapeGenre(code: string, country = COUNTRY_DEFAULT, limit = 10) {
  const cache = await readCache();
  const cacheKey = `${country}:${code}:${limit}`;
  if (fresh(cache.genres[cacheKey])) return cache.genres[cacheKey].data;
  const genreInfo = GENRES.find((g) => g.code === String(code));
  const genreUrl = `https://www.netflix.com/${country}/browse/genre/${code}`;
  const html = await fetchHtml(genreUrl);
  const ids = extractTitleIds(html).slice(0, limit);
  const items: any[] = [];
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
    note: ids.length === 0 ? 'Netflix did not expose public title IDs for this genre page.' : null
  };
  const latestCache = await readCache();
  latestCache.genres[cacheKey] = { cachedAt: Date.now(), data };
  await writeCache(latestCache);
  return data;
}

export async function searchCache(query: string) {
  const q = String(query || '').toLowerCase().trim();
  const cache = await readCache();
  if (!q) return [];
  if (fresh(cache.searches[q])) return cache.searches[q].data;
  const all: any[] = [];
  for (const item of Object.values(cache.titles || {}) as any[]) if ((item as any)?.data?.title) all.push((item as any).data);
  for (const genre of Object.values(cache.genres || {}) as any[]) for (const item of (genre as any)?.data?.items || []) if ((item as any)?.title) all.push(item);
  const seen = new Set();
  const results = all.filter((item:any) => String(item.title||'').toLowerCase().includes(q)).filter((item:any)=>{ const key = item.id||item.title; if (seen.has(key)) return false; seen.add(key); return true; }).slice(0,30);
  const latestCache = await readCache();
  latestCache.searches[q] = { cachedAt: Date.now(), data: results };
  await writeCache(latestCache);
  return results;
}

export function getTrendingSearches(cache: any, limit = 20) {
  return Object.entries(cache.searchStats || {}).sort((a:any,b:any)=>b[1]-a[1]).slice(0,limit).map(([query,count])=>({query,count}));
}

export function getTrendingGenres(cache: any, limit = 20) {
  return Object.entries(cache.genreStats || {}).sort((a:any,b:any)=>b[1]-a[1]).slice(0,limit).map(([code,count])=>{ const genre = GENRES.find(g=>g.code===code); return { code, name: genre?.name||`Genre ${code}`, group: genre?.group||null, count }; });
}

export async function warmPopularCache() {
  const popularCodes = ['7424','839338','10463','83','1365','6548','5763'];
  for (const code of popularCodes) {
    scrapeGenre(code, COUNTRY_DEFAULT, 20).catch(() => {});
  }
}

export async function trackSearch(query: string) {
  const q = String(query||'').toLowerCase().trim(); if (!q) return; const cache = await readCache(); cache.searchStats[q] = (cache.searchStats[q]||0) + 1; await writeCache(cache);
}

export async function trackGenre(code: string) {
  const key = String(code||'').trim(); if (!key) return; const cache = await readCache(); cache.genreStats[key] = (cache.genreStats[key]||0) + 1; await writeCache(cache);
}
