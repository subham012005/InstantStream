import { NextRequest, NextResponse } from 'next/server';
import { getPostData, normalizeEpisodes, normalizeSeries } from '@/lib/netMirror';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const postData = await getPostData(id);
    const type = String(postData.type || postData.content_type || 'm').toLowerCase();
    const isSeries = ['t', 'tv', 'series', 's'].includes(type);
    const seasons = isSeries ? normalizeSeries(postData) : [];
    const currentEpisodes = normalizeEpisodes(postData);
    const currentSeasonNo = currentEpisodes.length ? Number(currentEpisodes[0].season) : null;

    if (currentSeasonNo) {
      const currentSeason = seasons.find((s) => s.season === currentSeasonNo);
      if (currentSeason) {
        currentSeason.episodes = currentEpisodes;
        (currentSeason as any).isLoaded = true;
      }
    }

    return NextResponse.json({
      title: postData.title || 'Video',
      seriesId: id,
      type,
      isSeries,
      seasons,
      defaultSeason: currentSeasonNo,
      raw: postData
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
