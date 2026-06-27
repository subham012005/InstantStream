import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id: genreId } = params;

    const response = await fetch(
      `https://www.netflix.com/in/browse/genre/${genreId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
      }
    );

    const html = await response.text();

    const graphqlMatch = html.match(
      /netflix\.reactContext\.models\.graphql\s*=\s*JSON\.parse\('([\s\S]*?)'\);/
    );

    if (!graphqlMatch) {
      return NextResponse.json({ error: "GraphQL data not found" }, { status: 404 });
    }

    const graphqlText = graphqlMatch[1];

    // ====================================================
    // STEP 1: Build Movie Map
    // ====================================================
    const movies: Record<string, { id: string; title: string }> = {};

    const movieRegex =
      /Movie:\{\\\\?"videoId\\\\?":(\d+)\}":\{"__typename":"Movie".*?"title":"([^"]+)"/g;

    let movieMatch;

    while ((movieMatch = movieRegex.exec(graphqlText)) !== null) {
      const id = movieMatch[1];

      if (!movies[id]) {
        movies[id] = {
          id,
          title: movieMatch[2],
        };
      }
    }

    // ====================================================
    // STEP 2: Extract Posters
    // ====================================================
    const resultsMap = new Map();

    const edgeRegex =
      /__ref":"Movie:\{\\\\"videoId\\\\":(\d+)\}"[\s\S]{0,1200}?"url":"(https:[^"]+)"/g;

    let edgeMatch;

    while ((edgeMatch = edgeRegex.exec(graphqlText)) !== null) {
      const id = edgeMatch[1];
      const poster = edgeMatch[2];

      if (movies[id] && !resultsMap.has(id)) {
        resultsMap.set(id, {
          id,
          title: movies[id].title,
          poster,
          netflixUrl: `https://www.netflix.com/title/${id}`,
        });
      }
    }

    const results = [...resultsMap.values()];

    return NextResponse.json({
      genreId,
      count: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
