import { NextRequest, NextResponse } from 'next/server';
import { headers, normalizeEpisodes } from '@/lib/netMirror';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string; seasonId: string }> }
) {
  const params = await props.params;
  const { id: seriesId, seasonId } = params;
  const t = Math.floor(Date.now() / 1000);
  try {
    const res = await fetch(
      `https://net11.cc/episodes.php?s=${seasonId}&series=${seriesId}&t=${t}`,
      { headers: headers({ Referer: 'https://net11.cc/home', 'X-Requested-With': 'XMLHttpRequest' }) }
    );
    const data = await res.json();
    return NextResponse.json({ title: data.title || 'Season', episodes: normalizeEpisodes(data), raw: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
