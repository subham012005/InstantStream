import { NextRequest, NextResponse } from 'next/server';
import { scrapeTitleByUrl } from '@/lib/netflixscraper';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    const data = await scrapeTitleByUrl(url);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: 'Netflix title scrape failed', message: err.message }, { status: 500 });
  }
}
