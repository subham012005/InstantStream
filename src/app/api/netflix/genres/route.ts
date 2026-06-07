import { NextResponse } from "next/server";
import { GENRES } from "@/lib/catalog/netflix-scraper";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ total: GENRES.length, genres: GENRES });
}
