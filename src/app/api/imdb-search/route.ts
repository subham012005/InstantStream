import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ Response: "False", Error: "Missing search query" }, { status: 400 });
  }

  try {
    const firstLetter = query.charAt(0).toLowerCase();
    // IMDb autocomplete API
    const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/${firstLetter}/${encodeURIComponent(query)}.json`;

    const response = await fetch(imdbUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error('IMDb API request failed');
    }

    const data = await response.json();
    
    // Map IMDb results to match our OMDBSearchResult interface
    const results = (data.d || [])
      .filter((item: any) => item.id && item.id.startsWith('tt')) // Only titles, not actors (nm) or companies (co)
      .map((item: any) => ({
        Title: item.l || "Unknown Title",
        Year: item.y ? item.y.toString() : "N/A",
        imdbID: item.id,
        Type: item.qid || "movie", // Usually 'movie', 'tvSeries', etc.
        Poster: item.i?.imageUrl || "N/A",
      }));

    if (results.length === 0) {
      return NextResponse.json({ Response: "False", Error: "Movie not found!" });
    }

    return NextResponse.json({
      Response: "True",
      Search: results
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ Response: "False", Error: error.message }, { status: 500 });
  }
}
