import { NextResponse } from 'next/server';
import { headers } from '@/lib/netflix/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    const t = Math.floor(Date.now() / 1000);

    const response = await fetch(
      `https://net11.cc/search.php?s=${encodeURIComponent(q)}&t=${t}`,
      {
        headers: headers({
          Referer: "https://net11.cc/home",
          "X-Requested-With": "XMLHttpRequest"
        })
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
