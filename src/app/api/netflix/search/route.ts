import { NextRequest, NextResponse } from 'next/server';
import { searchCache } from '@/lib/netflixscraper';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    const results = await searchCache(q);
    return NextResponse.json({ query: q, results });
  } catch (err: any) {
    return NextResponse.json({ error: 'Netflix search failed', message: err.message }, { status: 500 });
  }
}
