import { NextResponse } from 'next/server';

const TMDB_API_KEY = '524c16f6e2a0a13c49ff7b99d27b5efb';
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get('id');
  const imdbId = searchParams.get('imdbId');
  const season = searchParams.get('season');

  if ((!tmdbId && !imdbId) || !season) {
    return NextResponse.json({ error: "Missing id or season" }, { status: 400 });
  }

  let finalTmdbId = tmdbId;

  try {
    if (!finalTmdbId && imdbId) {
      const findRes = await fetch(`${TMDB_BASE}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
      const findData = await findRes.json();
      const seriesResults = findData.tv_results || [];
      if (seriesResults.length > 0) {
        finalTmdbId = seriesResults[0].id;
      } else {
        throw new Error("Could not find TMDB ID for the given IMDb ID");
      }
    }

    const res = await fetch(`${TMDB_BASE}/tv/${finalTmdbId}/season/${season}?api_key=${TMDB_API_KEY}`);
    if (!res.ok) throw new Error('TMDB request failed');
    const data = await res.json();
    
    return NextResponse.json({
      episodes: data.episodes?.length || 0,
      episodesData: data.episodes || []
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
