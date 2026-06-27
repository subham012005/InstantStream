import { NextResponse } from 'next/server';
import { headers, normalizeEpisodes } from '@/lib/netflix/utils';

export async function GET(request: Request, props: { params: Promise<{ id: string; seasonId: string }> }) {
  try {
    const params = await props.params;
    const { id: seriesId, seasonId } = params;
    const t = Math.floor(Date.now() / 1000);

    const seasonRes = await fetch(
      `https://net11.cc/episodes.php?s=${seasonId}&series=${seriesId}&t=${t}`,
      {
        headers: headers({
          Referer: "https://net11.cc/home",
          "X-Requested-With": "XMLHttpRequest"
        })
      }
    );

    const seasonData = await seasonRes.json();

    return NextResponse.json({
      title: seasonData.title || "Season",
      episodes: normalizeEpisodes(seasonData),
      raw: seasonData
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
