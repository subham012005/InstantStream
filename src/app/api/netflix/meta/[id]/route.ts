import { NextResponse } from 'next/server';
import { getPostData, normalizeSeries, normalizeEpisodes } from '@/lib/netflix/utils';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const postData = await getPostData(id);

    const type = String(postData.type || postData.content_type || "m").toLowerCase();
    const isSeries = ["t", "tv", "series", "s"].includes(type);

    const seasons = isSeries ? normalizeSeries(postData) : [];
    const currentEpisodes = normalizeEpisodes(postData);

    const currentSeasonNo = currentEpisodes.length
      ? Number(currentEpisodes[0].season)
      : null;

    if (currentSeasonNo) {
      const currentSeason = seasons.find((s: any) => s.season === currentSeasonNo);
      if (currentSeason) {
        currentSeason.episodes = currentEpisodes;
        currentSeason.isLoaded = true;
      }
    }

    return NextResponse.json({
      title: postData.title || "Video",
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
