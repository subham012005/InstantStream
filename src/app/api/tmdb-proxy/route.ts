import { NextResponse } from 'next/server';

const TMDB_API_KEY = '524c16f6e2a0a13c49ff7b99d27b5efb';
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  
  if (!path) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  // Pass along other query params
  const tmdbParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'path') {
      tmdbParams.append(key, value);
    }
  });
  tmdbParams.set('api_key', TMDB_API_KEY);

  const url = `${TMDB_BASE}${path.startsWith('/') ? path : `/${path}`}?${tmdbParams.toString()}`;

  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
        return NextResponse.json({ error: `TMDB Error: ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
