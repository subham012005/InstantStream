import { NextRequest, NextResponse } from "next/server";
import { scrapeTop10, scrapeGenre, GENRES, COUNTRY } from "@/lib/catalog/netflix-scraper";

export const runtime = "nodejs";

/**
 * GET /api/netflix/homepage
 *
 * Returns all rows needed to populate the Netflix-mirror homepage.
 * Rows are built in parallel where possible and cached by Next.js
 * fetch-level caching (7 days TTL per scraper function).
 *
 * Response shape:
 * {
 *   hero: ScrapedTitle | null,
 *   rows: Array<{ title: string, variant: string, items: ScrapedTitle[] }>
 * }
 */
export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") || 12);

  try {
    // Fetch Top-10 + priority genres concurrently
    const priorityGenreCodes = ["839338", "1365", "7424", "10463", "83", "6548", "5763", "8933", "1492", "6839"];

    const [top10Movies, top10TV, ...genreResults] = await Promise.allSettled([
      scrapeTop10("movies"),
      scrapeTop10("tv"),
      ...priorityGenreCodes.map((code) => scrapeGenre(code, COUNTRY, limit)),
    ]);

    const rows: any[] = [];

    // Top-10 Movies
    if (top10Movies.status === "fulfilled" && top10Movies.value.items.length) {
      rows.push({
        title: "Netflix Top 10 Movies This Week",
        variant: "top10",
        items: top10Movies.value.items,
        meta: { week: top10Movies.value.week, source: top10Movies.value.source },
      });
    }

    // Top-10 TV
    if (top10TV.status === "fulfilled" && top10TV.value.items.length) {
      rows.push({
        title: "Netflix Top 10 TV Shows This Week",
        variant: "top10",
        items: top10TV.value.items,
        meta: { week: top10TV.value.week },
      });
    }

    // Genre rows
    for (const result of genreResults) {
      if (result.status === "fulfilled" && result.value.items.length > 0) {
        const g = result.value;
        rows.push({
          title: g.name,
          variant: "default",
          items: g.items,
        });
      }
    }

    // Pick hero: first scraped item that has a poster
    const allItems = rows.flatMap((r) => r.items);
    const hero = allItems.find((i: any) => i.poster && i.title && i.id) || null;

    return NextResponse.json({ hero, rows });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Homepage build failed", message: err.message },
      { status: 500 }
    );
  }
}
