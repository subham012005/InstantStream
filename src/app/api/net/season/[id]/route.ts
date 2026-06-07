import { NextRequest, NextResponse } from 'next/server';
import { getPostData, normalizeEpisodes } from '@/lib/netMirror';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const postData = await getPostData(id);
    const episodes = normalizeEpisodes(postData);
    return NextResponse.json({ title: postData.title || 'Season', episodes, raw: postData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
