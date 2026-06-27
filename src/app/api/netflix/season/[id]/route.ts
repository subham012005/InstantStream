import { NextResponse } from 'next/server';
import { getPostData, normalizeEpisodes } from '@/lib/netflix/utils';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const postData = await getPostData(id);
    const episodes = normalizeEpisodes(postData);

    return NextResponse.json({
      title: postData.title || "Season",
      episodes,
      raw: postData
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
