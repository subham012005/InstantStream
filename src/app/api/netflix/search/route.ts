import { NextRequest, NextResponse } from "next/server";
import { searchScrapedTitles } from "@/lib/catalog/netflix-scraper";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";

  try {
    const results = await searchScrapedTitles(q);
    return NextResponse.json({ query: q, results });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Search failed", message: err.message },
      { status: 500 }
    );
  }
}
