import { NextResponse } from 'next/server';
import { getNet52Hls } from '@/lib/netflix/utils';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const data = await getNet52Hls(id);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
