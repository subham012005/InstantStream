import { NextResponse } from 'next/server';

const TMDB_API_KEY = '524c16f6e2a0a13c49ff7b99d27b5efb';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// TMDB genre IDs
const TMDB_GENRE_IDS: Record<string, number> = {
  action: 28,
  comedy: 35,
  drama: 18,
  'sci-fi': 878,
  horror: 27,
  romance: 10749,
  thriller: 53,
};

// Wikidata genre fallback mappings
const WIKIDATA_GENRE: Record<string, string> = {
  action: 'wd:Q188473',
  comedy: 'wd:Q157443',
  drama: 'wd:Q130232',
  'sci-fi': 'wd:Q40180',
  horror: 'wd:Q200092',
  romance: 'wd:Q85888',
  thriller: 'wd:Q2431196',
};

async function fetchFromTMDB(genre: string): Promise<string[]> {
  const genreKey = genre.toLowerCase();

  let url: string;

  if (genreKey === 'trending') {
    url = `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}`;
  } else {
    const genreId = TMDB_GENRE_IDS[genreKey];
    if (!genreId) throw new Error(`Unknown genre: ${genre}`);
    url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1`;
  }

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 }
  });

  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data = await res.json();

  if (!data.results?.length) throw new Error('No TMDB results');

  // Fetch IMDb IDs for the top 12 movies in parallel
  const movies = data.results.slice(0, 12);
  const imdbIds = await Promise.all(
    movies.map(async (m: any) => {
      try {
        const extRes = await fetch(
          `${TMDB_BASE}/movie/${m.id}/external_ids?api_key=${TMDB_API_KEY}`,
          { next: { revalidate: 86400 } }
        );
        if (!extRes.ok) return null;
        const ext = await extRes.json();
        return ext.imdb_id || null;
      } catch {
        return null;
      }
    })
  );

  return imdbIds.filter(Boolean) as string[];
}

async function fetchFromWikidata(genre: string): Promise<string[]> {
  const genreKey = genre.toLowerCase();
  let sparqlQuery: string;

  if (genreKey === 'trending') {
    sparqlQuery = `
      SELECT DISTINCT ?imdbId WHERE {
        ?movie wdt:P31 wd:Q11424;
               wdt:P577 ?date;
               wdt:P345 ?imdbId;
               wikibase:sitelinks ?sitelinks.
        FILTER(YEAR(?date) >= 2022)
      } ORDER BY DESC(?sitelinks) LIMIT 12
    `;
  } else {
    const wdGenre = WIKIDATA_GENRE[genreKey];
    if (!wdGenre) throw new Error(`Unknown genre for wikidata: ${genre}`);
    sparqlQuery = `
      SELECT DISTINCT ?imdbId WHERE {
        ?movie wdt:P31 wd:Q11424;
               wdt:P136 ${wdGenre};
               wdt:P345 ?imdbId;
               wikibase:sitelinks ?sitelinks.
      } ORDER BY DESC(?sitelinks) LIMIT 12
    `;
  }

  const wdUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparqlQuery)}`;
  const res = await fetch(wdUrl, {
    headers: {
      'Accept': 'application/sparql-results+json',
      'User-Agent': 'FluxPlays/1.0',
    },
    next: { revalidate: 3600 }
  });

  if (!res.ok) throw new Error(`Wikidata error: ${res.status}`);
  const data = await res.json();
  const ids = data.results.bindings.map((b: any) => b.imdbId.value);
  if (!ids.length) throw new Error('No Wikidata results');
  return ids;
}

async function fetchFromIMDbScrape(genre: string): Promise<string[]> {
  const genreKey = genre.toLowerCase();
  let targetUrl: string;

  if (genreKey === 'trending') {
    targetUrl = 'https://www.imdb.com/chart/moviemeter/';
  } else {
    targetUrl = `https://www.imdb.com/search/title/?genres=${encodeURIComponent(genreKey)}&title_type=feature&sort=num_votes,desc`;
  }

  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    next: { revalidate: 3600 }
  });

  if (!res.ok) throw new Error(`IMDb scrape error: ${res.status}`);
  const html = await res.text();

  // Extract tt IDs
  const matches = Array.from(html.matchAll(/href="\/title\/(tt\d+)\//g));
  const ids = Array.from(new Set(matches.map((m) => m[1]))).slice(0, 12);

  if (!ids.length) throw new Error('No IDs scraped from IMDb');
  return ids;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre') || 'trending';

  let ids: string[] = [];
  const errors: string[] = [];

  // 1. Primary: TMDB API
  try {
    ids = await fetchFromTMDB(genre);
  } catch (e: any) {
    errors.push(`TMDB: ${e.message}`);
  }

  // 2. Fallback: Wikidata SPARQL
  if (!ids.length) {
    try {
      ids = await fetchFromWikidata(genre);
    } catch (e: any) {
      errors.push(`Wikidata: ${e.message}`);
    }
  }

  // 3. Last resort: IMDb scraping
  if (!ids.length) {
    try {
      ids = await fetchFromIMDbScrape(genre);
    } catch (e: any) {
      errors.push(`IMDb scrape: ${e.message}`);
    }
  }

  if (!ids.length) {
    return NextResponse.json(
      { Response: 'False', Error: `All sources failed: ${errors.join(' | ')}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    Response: 'True',
    genre: genre,
    ids: ids,
  });
}
