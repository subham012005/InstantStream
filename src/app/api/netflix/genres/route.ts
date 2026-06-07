import { NextResponse } from 'next/server';
import { GENRES } from '@/lib/netflixscraper';

export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({ total: GENRES.length, genres: GENRES });
}
