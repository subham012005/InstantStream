import { NextResponse } from 'next/server';
import { getTrendingSearches, readCache } from '@/lib/netflixscraper';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cache = await readCache();
    const trends = getTrendingSearches(cache, 30);
    return NextResponse.json({ trends });
  } catch (err: any) {
    return NextResponse.json({ error: 'Trending searches failed', message: err.message }, { status: 500 });
  }
}
