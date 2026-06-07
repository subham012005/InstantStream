import { NextRequest, NextResponse } from 'next/server';
import { scrapeGenre } from '@/lib/netflixscraper';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams;
    const code = q.get('code');
    const limit = Number(q.get('limit') || '10');
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    const data = await scrapeGenre(code, undefined, limit);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: 'Netflix genre scrape failed', message: err.message }, { status: 500 });
  }
}
