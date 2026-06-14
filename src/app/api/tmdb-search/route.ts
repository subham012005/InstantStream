import { NextResponse } from 'next/server';

const TMDB_API_KEY = '524c16f6e2a0a13c49ff7b99d27b5efb';
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ Response: "False", Error: "Missing search query" }, { status: 400 });
  }

  try {
    const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('TMDB request failed');
    const data = await res.json();
    
    const results = data.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 10) || [];
    
    if (results.length === 0) {
      return NextResponse.json({ Response: "False", Error: "Movie not found!" });
    }

    // Resolve IMDb IDs
    const searchResults = await Promise.all(results.map(async (item: any) => {
      try {
        const type = item.media_type === 'tv' ? 'tv' : 'movie';
        const extRes = await fetch(`${TMDB_BASE}/${type}/${item.id}/external_ids?api_key=${TMDB_API_KEY}`);
        if (!extRes.ok) return null;
        const ext = await extRes.json();
        
        if (!ext.imdb_id) return null;

        const title = item.title || item.name || "Unknown Title";
        const year = (item.release_date || item.first_air_date || "").split('-')[0] || "N/A";
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "N/A";
        
        return {
          Title: title,
          Year: year,
          imdbID: ext.imdb_id,
          Type: item.media_type === 'tv' ? 'series' : 'movie',
          Poster: poster,
        };
      } catch {
        return null;
      }
    }));

    const validResults = searchResults.filter(Boolean);

    if (validResults.length === 0) {
      return NextResponse.json({ Response: "False", Error: "Movie not found!" });
    }

    return NextResponse.json({
      Response: "True",
      Search: validResults
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200' },
    });
  } catch (error: any) {
    return NextResponse.json({ Response: "False", Error: error.message }, { status: 500 });
  }
}
