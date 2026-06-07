import { NextResponse } from 'next/server';
import { scrapeGenre, GENRES } from '@/lib/netflixscraper';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') || '10');
    let rows = await Promise.all(
      GENRES.slice(0, 10).map(async (genre) => {
        try {
          const data = await scrapeGenre(genre.code, undefined, limit);
          return {
            title: genre.name,
            variant: 'landscape',
            items: data.items,
          };
        } catch (err) {
          console.error(`Failed to scrape genre ${genre.code}:`, err);
          return null;
        }
      })
    );
    const validRows = rows.filter((r): r is NonNullable<typeof r> => r !== null);

    const hero = validRows
      .flatMap((row) => row.items)
      .find((item: any) => item?.poster && item?.title) || null;

    return NextResponse.json({ hero, rows: validRows });
  } catch (err: any) {
    return NextResponse.json({ error: 'Homepage failed', message: err.message }, { status: 500 });
  }
}
