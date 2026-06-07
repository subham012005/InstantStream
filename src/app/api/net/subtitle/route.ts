import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Missing subtitle url" }, { status: 400 });
    }

    const subRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
        Referer: "https://net52.cc/"
      }
    });

    if (!subRes.ok) {
      return NextResponse.json({ error: "Subtitle fetch failed" }, { status: subRes.status });
    }

    let srt = await subRes.text();

    srt = srt
      .replace(/^\uFEFF/, "")
      .replace(/\r/g, "")
      .trim();

    const vtt =
      "WEBVTT\n\n" +
      srt
        .replace(/^\d+\n/gm, "") // remove numeric lines (SRT sequence numbers)
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2"); // modify timestamp delimiter

    return new NextResponse(vtt, {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
