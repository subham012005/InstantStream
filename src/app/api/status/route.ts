import { NextRequest, NextResponse } from 'next/server';
import { getStatus } from '@/lib/scraper';

export async function GET(request: NextRequest) {
  try {
    const status = getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('[api] Status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
