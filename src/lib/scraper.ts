import axios from 'axios';
import { fetchFromProviders, type StreamResult } from './providers';

const VAPLAYER_API_URL = process.env.VAPLAYER_API_URL || 'https://streamdata.vaplayer.ru/api.php';
const BRIGHTPATH_BASE = 'https://brightpathsignals.com/embed';

const CACHE_TTL = parseInt(process.env.CACHE_TTL_MS || '') || 5 * 60 * 1000; // 5min
const MAX_QUEUE = parseInt(process.env.MAX_QUEUE || '') || 8;

const cache = new Map<string, { streams: StreamResult[]; timestamp: number }>();
const pending = new Map<string, Promise<StreamResult[] | null>>();
let activeScrapes = 0;

const mfCache = new Map<string, { body: string; ts: number }>();
const MF_TTL = 3 * 60 * 1000; // 3 min

function setMfCache(url: string, body: string) {
  mfCache.set(url, { body, ts: Date.now() });
  for (const [k, v] of mfCache) if (Date.now() - v.ts > MF_TTL) mfCache.delete(k);
}

export function getMfCache(url: string) {
  const e = mfCache.get(url);
  if (!e || Date.now() - e.ts > MF_TTL) {
    mfCache.delete(url);
    return null;
  }
  return e.body;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function cacheKey(imdbId: string, type: string, season?: number, episode?: number): string {
  return `${imdbId}:${type}:${season || ''}:${episode || ''}`;
}

function getCached(key: string): StreamResult[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.streams;
}

function setCached(key: string, streams: StreamResult[]) {
  cache.set(key, { streams, timestamp: Date.now() });
  console.log(`[cache] Saved: ${key} (cache size: ${cache.size})`);
}

export function getStreamReferer(imdbId: string, type = 'movie', season?: number, episode?: number): string {
  return type === 'series'
    ? `${BRIGHTPATH_BASE}/tv/${imdbId}/${season}/${episode}`
    : `${BRIGHTPATH_BASE}/movie/${imdbId}`;
}

function resolutionToQuality(resolution: string | null, bandwidth: number): string {
  if (resolution) {
    const h = parseInt(resolution.split('x')[1]) || 0;
    if (h >= 2160) return '4K';
    if (h >= 1440) return '2K';
    if (h >= 1080) return '1080p';
    if (h >= 720) return '720p';
    if (h >= 480) return '480p';
    if (h >= 360) return '360p';
  }
  if (bandwidth > 8000000) return '4K';
  if (bandwidth > 4000000) return '1080p';
  if (bandwidth > 2000000) return '720p';
  if (bandwidth > 800000) return '480p';
  return 'Auto';
}

function parseMasterPlaylist(body: string, masterUrl: string): Array<{ url: string; quality: string; bandwidth: number }> {
  const base = masterUrl.substring(0, masterUrl.lastIndexOf('/') + 1);
  const lines = body.split('\n');
  const seen = new Set<string>();
  const variants: Array<{ url: string; quality: string; bandwidth: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('#EXT-X-STREAM-INF:')) continue;

    const bwMatch = line.match(/BANDWIDTH=(\d+)/);
    const resMatch = line.match(/RESOLUTION=([\dx]+)/);
    const bandwidth = bwMatch ? parseInt(bwMatch[1]) : 0;
    const resolution = resMatch ? resMatch[1] : null;

    const urlLine = lines[i + 1]?.trim();
    if (!urlLine || urlLine.startsWith('#')) continue;

    let url;
    try {
      url = new URL(urlLine, masterUrl).href;
    } catch {
      url = urlLine;
    }
    const quality = resolutionToQuality(resolution, bandwidth);

    if (!seen.has(quality)) {
      seen.add(quality);
      variants.push({ url, quality, bandwidth });
    }
  }

  return variants.sort((a, b) => b.bandwidth - a.bandwidth);
}

interface ResolveStreamResult {
  url: string;
  verified: boolean;
  body?: string;
}

async function resolveStream(m3u8Url: string, referer: string): Promise<ResolveStreamResult | null> {
  for (const headers of [
    { 'User-Agent': UA, Referer: referer, Origin: 'https://brightpathsignals.com' },
    { 'User-Agent': UA, Referer: referer },
    { 'User-Agent': UA },
  ]) {
    try {
      const res = await axios.get(m3u8Url, {
        headers,
        timeout: 6000,
        maxRedirects: 5,
        responseType: 'text',
        validateStatus: (s) => s < 500,
      });
      if (res.status === 200) {
        const bodyText = typeof res.data === 'string' ? res.data : '';
        if (bodyText.trimStart().startsWith('#EXTM3U')) return { url: m3u8Url, verified: true, body: bodyText };
      }
      return { url: m3u8Url, verified: false };
    } catch {
      // timeout or network error — try without Referer
    }
  }
  return null;
}

async function doFetch(imdbId: string, type: string, season?: number, episode?: number): Promise<StreamResult[] | null> {
  const referer = getStreamReferer(imdbId, type, season, episode);

  const params: any = { imdb: imdbId, type: type === 'series' ? 'tv' : 'movie' };
  if (type === 'series') {
    params.season = season;
    params.episode = episode;
  }

  let apiRes;
  try {
    apiRes = await axios.get(VAPLAYER_API_URL, {
      params,
      headers: {
        'User-Agent': UA,
        Referer: referer,
        Origin: 'https://brightpathsignals.com',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 10000,
      maxRedirects: 5,
    });
  } catch (e) {
    console.error('[scraper] API error:', e instanceof Error ? e.message : String(e));
    return null;
  }

  const body = apiRes.data;
  console.log(`[scraper] API ${apiRes.status} — ${JSON.stringify(body).substring(0, 200)}`);

  if (apiRes.status !== 200 || !body || !body.data) {
    console.log('[scraper] Invalid response or API error');
    return null;
  }

  const streamUrls = body.data.stream_urls;
  if (!Array.isArray(streamUrls) || !streamUrls.length) {
    console.log('[scraper] No stream_url in response');
    return null;
  }

  const meta = {
    title: body.data.title || '',
    backdrop: body.data.backdrop || '',
    file_name: body.data.file_name || '',
  };

  const results = await Promise.all(streamUrls.map((u: string) => resolveStream(u, referer)));
  const best = results.find((r) => r?.verified) || results.find((r) => r && !r.verified);

  if (!best) {
    console.log('[scraper] All sources inaccessible — using first as fallback');
    return [{ url: streamUrls[0], quality: 'Auto', proxyable: true, meta }];
  }

  if (!best.verified || !best.body) {
    console.log('[scraper] Source accessible (CDN blocked pre-fetch) — proxy to add headers');
    return [{ url: best.url, quality: 'Auto', proxyable: true, meta }];
  }

  setMfCache(best.url, best.body);
  const variants = parseMasterPlaylist(best.body, best.url);
  if (variants.length > 0) {
    const top = variants[0]; // sorted by bandwidth desc — best quality
    try {
      const vr = await resolveStream(top.url, referer);
      if (vr?.body) setMfCache(top.url, vr.body);
    } catch (_) {
      // ignore
    }
    console.log(`[scraper] best quality: ${top.quality}`);
    return [{ url: top.url, quality: top.quality, proxyable: true, meta }];
  }

  console.log('[scraper] Verified source (no variants)');
  return [{ url: best.url, quality: 'Auto', proxyable: true, meta }];
}

export async function fetchVideoSource(
  imdbId: string,
  type = 'movie',
  season?: number,
  episode?: number
): Promise<{ streams: StreamResult[]; type: string } | null> {
  if (!imdbId || !imdbId.startsWith('tt')) throw new Error(`Invalid IMDb ID: ${imdbId}`);

  const key = cacheKey(imdbId, type, season, episode);

  const cached = getCached(key);
  if (cached) {
    console.log(`[cache] Hit: ${key}`);
    return { streams: cached, type: 'direct' };
  }

  if (pending.has(key)) {
    console.log(`[cache] Dedup: waiting for ongoing fetch for ${key}`);
    const streams = await pending.get(key);
    return streams ? { streams, type: 'direct' } : null;
  }

  if (activeScrapes >= MAX_QUEUE) {
    console.log(`[scraper] Overload (${activeScrapes} active requests) — rejecting`);
    return null;
  }

  activeScrapes++;
  const fetchPromise = doFetch(imdbId, type, season, episode)
    .then((streams) => {
      if (streams) setCached(key, streams);
      pending.delete(key);
      activeScrapes = Math.max(0, activeScrapes - 1);
      return streams;
    })
    .catch((err) => {
      console.error('[scraper] Error:', err instanceof Error ? err.message : String(err));
      pending.delete(key);
      activeScrapes = Math.max(0, activeScrapes - 1);
      return null;
    });

  pending.set(key, fetchPromise);
  let streams = await fetchPromise;

  if (!streams) {
    console.log('[scraper] Primary provider failed — trying movie-web providers...');
    try {
      streams = await fetchFromProviders(imdbId, type, season, episode);
      if (streams) {
        console.log('[scraper] Providers fallback OK');
        setCached(key, streams);
      }
    } catch (e) {
      console.log('[scraper] Providers fallback failed:', e instanceof Error ? e.message : String(e));
    }
  }

  return streams ? { streams, type: 'direct' } : null;
}

export function invalidateCache(imdbId: string, type: string, season?: number, episode?: number): boolean {
  const key = cacheKey(imdbId, type, season, episode);
  const had = cache.delete(key);
  if (had) console.log(`[cache] Invalidated: ${key}`);
  return had;
}

export function getStatus() {
  const now = Date.now();
  const entries = [];
  for (const [key, entry] of cache.entries()) {
    entries.push({ key, ageSeconds: Math.floor((now - entry.timestamp) / 1000) });
  }
  return {
    activeScrapes,
    maxQueue: MAX_QUEUE,
    cache: { size: cache.size, ttlSeconds: Math.floor(CACHE_TTL / 1000), entries },
  };
}
