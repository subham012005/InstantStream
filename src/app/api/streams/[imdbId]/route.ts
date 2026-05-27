import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoSource } from '@/lib/scraper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imdbId: string }> }
) {
  const { imdbId } = await params;

  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'movie'; // 'movie' or 'series'
    const season = searchParams.get('season') ? parseInt(searchParams.get('season')!) : undefined;
    const episode = searchParams.get('episode') ? parseInt(searchParams.get('episode')!) : undefined;

    // Validate IMDb ID format
    if (!imdbId || !imdbId.startsWith('tt')) {
      return NextResponse.json({ error: 'Invalid IMDb ID format' }, { status: 400 });
    }

    console.log(`[api] Fetching streams for ${imdbId} (${type}${type === 'series' ? ` S${season}E${episode}` : ''})`);

    // Fetch video source
    const result = await fetchVideoSource(imdbId, type, season, episode);

    if (!result) {
      return NextResponse.json({ streams: [], error: 'No streams available' }, { status: 404 });
    }

    // Return streams
    return NextResponse.json({
      streams: result.streams,
      type: result.type,
      imdbId,
      contentType: type,
    });
  } catch (error) {
    console.error('[api] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Optional: Cache revalidation endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ imdbId: string }> }
) {
  const { imdbId } = await params;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'invalidate') {
      const type = body.type || 'movie';
      const season = body.season;
      const episode = body.episode;

      // In production, you'd import invalidateCache here
      console.log(`[api] Invalidating cache for ${imdbId}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[api] POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
