import { NextResponse } from 'next/server';
import { getTrendingGenres, readCache } from '@/lib/netflixscraper';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cache = await readCache();
    const trends = getTrendingGenres(cache, 30);
    return NextResponse.json({ trends });
  } catch (err: any) {
    return NextResponse.json({ error: 'Trending genres failed', message: err.message }, { status: 500 });
  }
}
