import { NextResponse } from 'next/server';

const GENRE_WD_MAPPING: Record<string, string> = {
  action: 'wd:Q188473 wd:Q1060124',
  comedy: 'wd:Q157443 wd:Q730245',
  drama: 'wd:Q130232 wd:Q83303',
  'sci-fi': 'wd:Q40180 wd:Q40218',
  horror: 'wd:Q200092',
  romance: 'wd:Q85888 wd:Q1054591',
  thriller: 'wd:Q2431196 wd:Q10695027'
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre');

  try {
    let sparqlQuery = '';

    if (!genre || genre.toLowerCase() === 'trending') {
      // Trending: highly popular movies released in recent years
      sparqlQuery = `
        SELECT DISTINCT ?imdbId WHERE {
          ?movie wdt:P31 wd:Q11424; 
                 wdt:P577 ?date;
                 wdt:P345 ?imdbId;
                 wikibase:sitelinks ?sitelinks.
          FILTER(YEAR(?date) >= 2023)
        } ORDER BY DESC(?sitelinks) LIMIT 12
      `;
    } else {
      // Genre-specific: highly popular movies of that genre
      const mappedQ = GENRE_WD_MAPPING[genre.toLowerCase()] || 'wd:Q11424'; // fallback
      sparqlQuery = `
        SELECT DISTINCT ?imdbId WHERE {
          ?movie wdt:P31 wd:Q11424;
                 wdt:P136 ?genreNode;
                 wdt:P345 ?imdbId;
                 wikibase:sitelinks ?sitelinks.
          VALUES ?genreNode { ${mappedQ} }
        } ORDER BY DESC(?sitelinks) LIMIT 12
      `;
    }

    const wdUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparqlQuery)}`;

    const response = await fetch(wdUrl, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'FluxPlays/1.0 (RealTimeMovieSearch/1.0)',
      },
      next: { revalidate: 3600 } // cache for 1 hour to avoid limits
    });

    if (!response.ok) {
      throw new Error(`Wikidata responded with status: ${response.status}`);
    }

    const data = await response.json();
    const ids = data.results.bindings.map((b: any) => b.imdbId.value);

    // If query somehow returns nothing, provide a tiny fallback array to avoid blowing up the UI
    if (!ids || ids.length === 0) {
        throw new Error("No IDs found for this genre");
    }

    return NextResponse.json({
      Response: "True",
      genre: genre || "Trending",
      ids: ids
    });
  } catch (error: any) {
    return NextResponse.json({ Response: "False", Error: error.message }, { status: 500 });
  }
}
