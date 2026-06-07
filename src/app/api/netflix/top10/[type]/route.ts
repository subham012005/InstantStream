import { NextRequest, NextResponse } from "next/server";
import { scrapeTop10 } from "@/lib/catalog/netflix-scraper";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  const allowed = ["movies", "tv", "nonEnglishMovies", "nonEnglishTv"] as const;
  if (!allowed.includes(type as any)) {
    return NextResponse.json(
      { error: `Invalid type. Use one of: ${allowed.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const data = await scrapeTop10(type as typeof allowed[number]);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Top 10 fetch failed", message: err.message },
      { status: 500 }
    );
  }
}
