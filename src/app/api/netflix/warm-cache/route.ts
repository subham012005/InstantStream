import { NextResponse } from 'next/server';
import { warmPopularCache } from '@/lib/netflixscraper';

export const runtime = 'nodejs';

export async function GET() {
  try {
    warmPopularCache();
    return NextResponse.json({ status: 'warming' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Warm cache failed', message: err.message }, { status: 500 });
  }
}
