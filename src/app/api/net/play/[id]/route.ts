import { NextRequest, NextResponse } from 'next/server';
import { getNet52Hls } from '@/lib/netMirror';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const data = await getNet52Hls(id);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
