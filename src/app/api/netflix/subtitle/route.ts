import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return new NextResponse("Missing subtitle url", { status: 400 });
    }

    const subRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
        Referer: "https://net52.cc/"
      }
    });

    if (!subRes.ok) {
      return new NextResponse("Subtitle fetch failed", { status: subRes.status });
    }

    let srt = await subRes.text();

    srt = srt
      .replace(/^\uFEFF/, "")
      .replace(/\r/g, "")
      .trim();

    const vtt =
      "WEBVTT\n\n" +
      srt
        .replace(/^\d+\n/gm, "")
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");

    return new NextResponse(vtt, {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err: any) {
    return new NextResponse(err.message, { status: 500 });
  }
}
