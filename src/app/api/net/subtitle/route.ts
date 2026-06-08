import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Missing subtitle url" }, { status: 400 });
    }

    const headerCandidates: HeadersInit[] = [
      {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
        Origin: "https://peachify.top",
        Referer: "https://peachify.top/"
      },
      {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
        Referer: "https://net52.cc/"
      },
      {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*"
      }
    ];

    let subRes: Response | null = null;
    for (const headers of headerCandidates) {
      subRes = await fetch(url, { headers });
      if (subRes.ok) break;
    }

    if (!subRes?.ok) {
      return NextResponse.json({ error: "Subtitle fetch failed" }, { status: subRes?.status || 502 });
    }

    let subtitleText = await subRes.text();

    subtitleText = subtitleText
      .replace(/^\uFEFF/, "")
      .replace(/\r/g, "")
      .trim();

    const isVtt = /^WEBVTT/i.test(subtitleText);
    const vtt = isVtt
      ? subtitleText
      : "WEBVTT\n\n" +
        subtitleText
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
