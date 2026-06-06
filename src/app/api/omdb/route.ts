import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const search = searchParams.get('search'); // Used for ?s= querying

  if (!id && !search) {
    return NextResponse.json({ Response: "False", Error: "Missing IMDb ID or Search parameter" }, { status: 400 });
  }

  // Secure API key on the server-side to prevent exposing it in browser dev tools.
  // Preferably, this should be moved to your .env file as OMDB_API_KEY.
  const API_KEY = process.env.OMDB_API_KEY || "fb8a128f";
  
  try {
    let omdbUrl = "";
    if (id) {
       omdbUrl = `https://www.omdbapi.com/?i=${encodeURIComponent(id)}&apikey=${API_KEY}`;
    } else if (search) {
       omdbUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(search)}&apikey=${API_KEY}`;
    }

    const response = await fetch(omdbUrl);
    
    if (!response.ok) {
        throw new Error('OMDb API request failed');
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ Response: "False", Error: error.message }, { status: 500 });
  }
}
