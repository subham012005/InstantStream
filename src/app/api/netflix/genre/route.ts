import { NextRequest, NextResponse } from "next/server";
import { scrapeGenre, COUNTRY } from "@/lib/catalog/netflix-scraper";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const limit = Number(searchParams.get("limit") || 12);

  if (!code) {
    return NextResponse.json({ error: "Missing ?code=..." }, { status: 400 });
  }

  try {
    const data = await scrapeGenre(code, COUNTRY, limit);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Genre scrape failed", message: err.message },
      { status: 500 }
    );
  }
}
