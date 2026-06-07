import { NextRequest, NextResponse } from 'next/server';
import { getPostData, normalizeEpisodes, normalizeSeries } from '@/lib/netMirror';
import { scrapeTitleById } from '@/lib/netflixscraper';

export const runtime = 'nodejs';

const CACHE_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzAYf4rMRhR-IKuHwB4Vu4u8USOAQ3zdjPTqb3AFWE7Os3yqsTDekMcYLo3p0x9hRNtOg/exec';

/**
 * New GAS schema:
 *   POST  flat fields: { netflixId, title, type, description, posterUrl, backdropUrl, seasons, source }
 *   GET   ?netflixId=xxx → { success: true, data: { netflixId, title, ... } }
 *                        → { success: false, data: null } if not found
 */
async function saveToSheet(id: string, result: any) {
  try {
    const payload = {
      netflixId:   id,
      title:       result.title || '',
      type:        result.type  || '',
      description: result.raw?.description || '',
      posterUrl:   result.raw?.poster   || result.raw?.posterUrl   || result.raw?.image || '',
      backdropUrl: result.raw?.backdrop  || result.raw?.backdropUrl || result.raw?.image || '',
      seasons:     JSON.stringify(result.seasons || []),
      source:      'backend'
    };

    await fetch(CACHE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('[sheet-cache] write failed', e);
  }
}

async function readFromSheet(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${CACHE_ENDPOINT}?netflixId=${id}`, { next: { revalidate: 0 } });
    const json = await res.json();
    if (json?.success && json?.data?.title) return json.data;
  } catch (err) {
    console.error('[sheet-cache] read failed', err);
  }
  return null;
}

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  // 1. Google Sheet cache
  const cached = await readFromSheet(id);
  if (cached) {
    let seasons: any[] = [];
    try { seasons = JSON.parse(cached.seasons || '[]'); } catch { }
    console.log(`[sheet-cache] HIT for ${id}`);
    return NextResponse.json({
      title:         cached.title || 'Video',
      seriesId:      id,
      type:          cached.type  || 'movie',
      isSeries:      cached.type === 'series',
      seasons,
      defaultSeason: seasons[0]?.season || null,
      raw:           { ...cached, source: 'google-sheets-cache' }
    });
  }
  console.log(`[sheet-cache] MISS for ${id}`);

  // 2. Primary source
  try {
    const postData = await getPostData(id);
    const type = String(postData.type || postData.content_type || 'm').toLowerCase();
    const isSeries = ['t', 'tv', 'series', 's'].includes(type);
    const seasons = isSeries ? normalizeSeries(postData) : [];
    const currentEpisodes = normalizeEpisodes(postData);
    const currentSeasonNo = currentEpisodes.length ? Number(currentEpisodes[0].season) : null;

    if (currentSeasonNo) {
      const cur = seasons.find((s) => s.season === currentSeasonNo);
      if (cur) { cur.episodes = currentEpisodes; (cur as any).isLoaded = true; }
    }

    const result = { title: postData.title || 'Video', seriesId: id, type, isSeries, seasons, defaultSeason: currentSeasonNo, raw: postData };
    saveToSheet(id, result); // fire-and-forget
    return NextResponse.json(result);
  } catch (_err: any) {
    // 3. Scraper fallback
    try {
      const scraped = await scrapeTitleById(id);
      const result = { title: scraped.title || 'Video', seriesId: id, type: scraped.type || 'movie', isSeries: scraped.type === 'series', seasons: [], defaultSeason: null, raw: scraped };
      saveToSheet(id, result);
      return NextResponse.json(result);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
