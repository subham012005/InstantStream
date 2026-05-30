import { NextResponse } from 'next/server';

async function fetchImdb(query: string) {
  const firstLetter = query.charAt(0).toLowerCase();
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
  const results = (data.d || [])
    .filter((item: any) => item.id && item.id.startsWith('tt'))
    .map((item: any) => ({
      Title: item.l || "Unknown Title",
      Year: item.y ? item.y.toString() : "N/A",
      imdbID: item.id,
      Type: item.qid || "movie",
      Poster: item.i?.imageUrl || "N/A",
    }));
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ Response: "False", Error: "Missing search query" }, { status: 400 });
  }

  try {
    let results = await fetchImdb(query);
    let correctedQuery = null;

    if (results.length === 0) {
      // Fuzzy / Typo matching via Datamuse
      // Also fetch closely matching words or phrases
      const spellRes = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(query)}*&max=5`);
      if (spellRes.ok) {
        const spellData = await spellRes.json();
        if (spellData && spellData.length > 0) {
          // Iterate through suggestions to find one that yields IMDb results
          for (let i = 0; i < spellData.length; i++) {
            const suggestion = spellData[i].word;
            if (suggestion && suggestion.toLowerCase() !== query.toLowerCase()) {
              const secondaryResults = await fetchImdb(suggestion);
              if (secondaryResults.length > 0) {
                 results = secondaryResults;
                 // Capitalize correctly based on the best matched title from IMDb
                 correctedQuery = secondaryResults[0].Title.toLowerCase().includes(suggestion.toLowerCase()) 
                    ? secondaryResults[0].Title 
                    : suggestion;
                 break;
              }
            }
          }
        }
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ Response: "False", Error: "Movie not found!" });
    }

    const payload: any = {
      Response: "True",
      Search: results
    };

    if (correctedQuery) {
       payload.CorrectedQuery = correctedQuery;
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ Response: "False", Error: error.message }, { status: 500 });
  }
}
