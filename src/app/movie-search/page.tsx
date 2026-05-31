"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, Play, ArrowLeft, Star, Clock, Calendar, Globe, Film } from "lucide-react";

interface OMDBSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OMDBMovieDetail {
  Title: string;
  Year: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer?: string;
  Actors: string;
  Plot: string;
  Country?: string;
  imdbRating: string;
  imdbVotes: string;
  Poster: string;
  imdbID: string;
  Type?: string;
  Response: string;
  Error?: string;
}

const GENRES = ["Trending", "Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance", "Thriller"];

const DEFAULT_IMDB_IDS = [
  'tt0111161', 'tt0468569', 'tt1375666', 'tt0110912',
  'tt0137523', 'tt0816692', 'tt0245429', 'tt4154796'
];

function MovieCard({ item, onClick }: { item: OMDBSearchResult; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col text-left group">
      <div className="w-full aspect-[2/3] bg-[var(--bg-elevated)] rounded-[10px] overflow-hidden relative border border-[var(--border)] transition-transform duration-300">
        {item.Poster && item.Poster !== 'N/A' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.Poster}
            alt={item.Title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-8 h-8 text-[var(--border)]" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-col">
        <h3 className="font-[family-name:var(--font-dm-sans)] font-bold text-[14px] text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
          {item.Title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
          <span>{item.Year}</span>
          <span>·</span>
          <span className="uppercase">{item.Type}</span>
        </div>
      </div>
    </button>
  );
}

export default function MovieSearchPage() {
  return (
    <React.Suspense fallback={
      <main className="min-h-screen relative pt-[100px] pb-16 px-4 md:px-8 max-w-[1200px] mx-auto flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" />
      </main>
    }>
      <MovieSearchContent />
    </React.Suspense>
  );
}

function MovieSearchContent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OMDBSearchResult[]>([]);
  const [defaultMovies, setDefaultMovies] = useState<OMDBSearchResult[]>([]);
  const [loadingDefault, setLoadingDefault] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [correctedQuery, setCorrectedQuery] = useState<string | null>(null);

  const [selectedMovie, setSelectedMovie] = useState<OMDBMovieDetail | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [activeGenre, setActiveGenre] = useState("Trending");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Auto-search whenever the URL 'q' or 'genre' parameter changes
  useEffect(() => {
    const q = searchParams?.get('q');
    const genre = searchParams?.get('genre');

    if (q) {
      setQuery(q);
      setActiveGenre("Trending");
      const doSearch = async () => {
        setLoadingSearch(true);
        setErrorSearch(null);
        setResults([]);
        setCorrectedQuery(null);
        setSelectedMovie(null);
        setErrorDetails(null);

        try {
          let res = await fetch(`/api/imdb-search?q=${encodeURIComponent(q)}`);
          let data = await res.json();

          if (res.ok && data.Response === 'True' && data.Search?.length > 0) {
            setResults(data.Search);
            if (data.CorrectedQuery) setCorrectedQuery(data.CorrectedQuery);
          } else {
            res = await fetch(`/api/omdb?search=${encodeURIComponent(q)}`);
            data = await res.json();
            if (data.Response === 'True' && data.Search) {
              setResults(data.Search);
            } else {
              setErrorSearch('No movies found');
            }
          }
        } catch {
          setErrorSearch('An error occurred during search.');
        } finally {
          setLoadingSearch(false);
        }
      };

      doSearch();
    } else if (genre) {
      setQuery('');
      setActiveGenre(genre);
      const doGenreFetch = async () => {
        setLoadingSearch(true);
        setErrorSearch(null);
        setResults([]);
        setCorrectedQuery(null);
        setSelectedMovie(null);
        setErrorDetails(null);

        try {
          let genreIds = [...DEFAULT_IMDB_IDS];
          try {
            const scrapeRes = await fetch(`/api/imdb-scrape?genre=${encodeURIComponent(genre)}`);
            if (scrapeRes.ok) {
              const data = await scrapeRes.json();
              if (data.Response === 'True' && data.ids?.length > 0) {
                genreIds = data.ids;
              }
            }
          } catch { }

          const fetched = await Promise.all(
            genreIds.map(async (id) => {
              const res = await fetch(`/api/omdb?id=${encodeURIComponent(id)}`);
              if (!res.ok) return null;
              const data = await res.json();
              if (data.Response === 'False') return null;
              return {
                Title: data.Title,
                Year: data.Year,
                imdbID: data.imdbID,
                Type: data.Type || 'movie',
                Poster: data.Poster,
              } as OMDBSearchResult;
            })
          );
          setResults(fetched.filter(Boolean) as OMDBSearchResult[]);
        } catch {
          setErrorSearch('An error occurred loading genre movies.');
        } finally {
          setLoadingSearch(false);
        }
      };
      doGenreFetch();
    } else {
      setQuery('');
      setActiveGenre("Trending");
      setResults([]);
    }
  }, [searchParams]);

  // Fetch default popular movies on mount
  useEffect(() => {
    const fetchDefaults = async () => {
      setLoadingDefault(true);
      try {
        let defaultIds = [...DEFAULT_IMDB_IDS];
        try {
          const scrapeRes = await fetch(`/api/imdb-scrape?genre=Trending`);
          if (scrapeRes.ok) {
            const data = await scrapeRes.json();
            if (data.Response === 'True' && data.ids?.length > 0) {
              defaultIds = data.ids;
            }
          }
        } catch { }

        const fetched = await Promise.all(
          defaultIds.map(async (id) => {
            const res = await fetch(`/api/omdb?id=${encodeURIComponent(id)}`);
            if (!res.ok) return null;
            const data = await res.json();
            if (data.Response === 'False') return null;
            return {
              Title: data.Title,
              Year: data.Year,
              imdbID: data.imdbID,
              Type: data.Type || 'movie',
              Poster: data.Poster,
            } as OMDBSearchResult;
          })
        );
        setDefaultMovies(fetched.filter(Boolean) as OMDBSearchResult[]);
      } catch {
        // silently fail — page still usable
      } finally {
        setLoadingDefault(false);
      }
    };
    fetchDefaults();
  }, []);

  // Auto-scroll to top when cinematic view opens
  useEffect(() => {
    if (selectedMovie || loadingDetails) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedMovie, loadingDetails]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // Push the new query to the URL, triggering the useEffect
    router.push(`/movie-search?q=${encodeURIComponent(query.trim())}`);
  };

  const fetchDetails = async (imdbID: string) => {
    setLoadingDetails(true);
    setErrorDetails(null);
    setSelectedMovie(null);

    try {
      const res = await fetch(`/api/omdb?id=${encodeURIComponent(imdbID)}`);
      if (!res.ok) throw new Error('Failed to fetch movie details');
      const data = await res.json();

      if (data.Response === "False") {
        setErrorDetails(data.Error || "Movie not found");
      } else {
        setSelectedMovie(data);
      }
    } catch (err: any) {
      setErrorDetails(err.message || 'An error occurred fetching details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleGenreClick = (genre: string) => {
    setActiveGenre(genre);
    if (genre !== "Trending") {
      router.push(`/movie-search?genre=${encodeURIComponent(genre)}`);
    } else {
      router.push(`/movie-search`);
    }
  };

  // 1. Render Loading State for detail view
  if (loadingDetails) {
    return (
      <main className="min-h-screen pt-[100px] pb-16 px-4 max-w-[1200px] mx-auto flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--accent)] mb-4" />
        <h2 className="text-xl font-[family-name:var(--font-sora)] text-[var(--text-primary)] animate-pulse">Loading Cinematic Experience...</h2>
      </main>
    );
  }

  // 2. Render Detail View (Cinematic Screen)
  if (selectedMovie) {
    const hasPoster = selectedMovie.Poster && selectedMovie.Poster !== "N/A";

    return (
      <main className="min-h-screen relative pt-[80px] pb-16">
        {/* Massive Blurred Backdrop */}
        <div className="absolute inset-0 z-0 h-[80vh] overflow-hidden pointer-events-none">
          {hasPoster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedMovie.Poster}
              alt="Backdrop"
              className="w-full h-full object-cover opacity-[0.08] blur-3xl scale-125 saturate-150"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)] lg:via-[var(--bg-base)]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 px-4 md:px-8 max-w-[1200px] mx-auto flex flex-col">
          <button
            onClick={() => setSelectedMovie(null)}
            className="w-fit mb-8 flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] rounded-full border border-[var(--border)] transition-all text-sm font-semibold group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to search results</span>
          </button>

          {errorDetails && (
            <div className="mb-8 p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-center font-medium max-w-2xl mx-auto shadow-sm">
              {errorDetails}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start lg:items-stretch">

            {/* Poster Panel */}
            <div className="w-full max-w-[320px] lg:w-1/3 shrink-0 mx-auto lg:mx-0">
              <div className="w-full aspect-[2/3] rounded-[12px] overflow-hidden shadow-2xl relative border border-[var(--border)] group">
                {hasPoster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedMovie.Poster} alt={selectedMovie.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-[var(--bg-surface)] flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
                    <Film className="w-12 h-12 opacity-20" />
                    <span className="text-sm font-medium">No Poster Found</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {selectedMovie.Type && selectedMovie.Type !== "N/A" && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/20 uppercase tracking-widest shadow-xl">
                    {selectedMovie.Type}
                  </span>
                )}
              </div>

              <div className="mt-6 w-full flex item-center justify-center">
                <Link href={`/imdb-movie-stream-player?id=${selectedMovie.imdbID}`} className="w-full flex justify-center items-center gap-3 bg-[var(--accent)] text-white font-[family-name:var(--font-sora)] font-bold px-6 py-4 rounded-[10px] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Stream Now On FluxPlays</span>
                </Link>
              </div>
            </div>

            {/* Details Panel */}
            <div className="flex-1 flex flex-col w-full">
              <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-sora)] font-bold tracking-tight text-[var(--text-primary)] mb-4 leading-[1.1] text-center lg:text-left">
                {selectedMovie.Title}
                {selectedMovie.Year && selectedMovie.Year !== "N/A" && (
                  <span className="opacity-50 text-2xl md:text-4xl font-normal ml-3 whitespace-nowrap">({selectedMovie.Year})</span>
                )}
              </h1>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-8">
                {selectedMovie.imdbRating && selectedMovie.imdbRating !== "N/A" && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] shadow-inner">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{selectedMovie.imdbRating}</span>
                  </div>
                )}
                {selectedMovie.Runtime && selectedMovie.Runtime !== "N/A" && (
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {selectedMovie.Runtime}</span>
                )}
                {selectedMovie.Released && selectedMovie.Released !== "N/A" && (
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {selectedMovie.Released}</span>
                )}
                {selectedMovie.Country && selectedMovie.Country !== "N/A" && (
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {selectedMovie.Country}</span>
                )}
                <span className="px-2 py-1 bg-[var(--bg-elevated)] rounded-md border border-[var(--border)] opacity-70">
                  IMDb: {selectedMovie.imdbID}
                </span>
              </div>

              {selectedMovie.Plot && selectedMovie.Plot !== "N/A" && (
                <div className="mb-10 text-center lg:text-left">
                  <p className="text-[var(--text-primary)] md:text-lg leading-relaxed md:leading-loose font-[family-name:var(--font-dm-sans)]">
                    {selectedMovie.Plot}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full font-[family-name:var(--font-dm-sans)]">
                <div className="bg-[var(--bg-elevated)] p-6 rounded-[14px] border border-[var(--border)]">
                  <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 border-b border-[var(--border-subtle)] pb-2">The Cast</h4>
                  <p className="text-[14px] font-medium text-[var(--text-secondary)] leading-loose">
                    {selectedMovie.Actors && selectedMovie.Actors !== "N/A" ? selectedMovie.Actors : "Not available"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[var(--bg-elevated)] p-5 rounded-[14px] border border-[var(--border)]">
                    <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Director</h4>
                    <p className="text-[14px] font-medium text-[var(--text-secondary)]">
                      {selectedMovie.Director && selectedMovie.Director !== "N/A" ? selectedMovie.Director : "Not available"}
                    </p>
                  </div>

                  <div className="bg-[var(--bg-elevated)] p-5 rounded-[14px] border border-[var(--border)]">
                    <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Writer</h4>
                    <p className="text-[14px] font-medium text-[var(--text-secondary)]">
                      {selectedMovie.Writer && selectedMovie.Writer !== "N/A" ? selectedMovie.Writer : "Not available"}
                    </p>
                  </div>

                  <div className="bg-[var(--bg-elevated)] p-5 rounded-[14px] border border-[var(--border)]">
                    <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Genres</h4>
                    <p className="text-[14px] font-medium text-[var(--text-secondary)]">
                      {selectedMovie.Genre && selectedMovie.Genre !== "N/A" ? selectedMovie.Genre : "Not available"}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3. Render Search Matrix Layout
  return (
    <main className="min-h-screen bg-[var(--bg-base)]">

      {/* Sticky Search Bar area */}
      <div className="sticky top-[56px] md:top-[60px] z-40 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] py-4">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a movie..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] h-[52px] pl-[44px] pr-[120px] font-[family-name:var(--font-jetbrains-mono)] text-[14px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent)]/15 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loadingSearch || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--accent)] text-white px-4 h-[36px] rounded-[8px] text-[13px] font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {loadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </form>

          {/* Genre filter pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-[family-name:var(--font-dm-sans)] transition-colors border ${activeGenre === genre
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white font-semibold'
                    : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                  }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">

        {/* Skeleton Loaders — searching */}
        {loadingSearch && (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Finding movies...</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div style={{
                    aspectRatio: '2/3',
                    borderRadius: '10px',
                    background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-surface) 50%, var(--bg-elevated) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.4s infinite'
                  }} />
                  <div style={{ height: '14px', width: '80%', borderRadius: '6px', marginTop: '10px', background: 'var(--bg-elevated)' }} />
                  <div style={{ height: '12px', width: '40%', borderRadius: '6px', marginTop: '6px', background: 'var(--bg-elevated)' }} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Default popular movies skeleton while loading */}
        {loadingDefault && !loadingSearch && results.length === 0 && (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Finding movies...</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div style={{
                    aspectRatio: '2/3',
                    borderRadius: '10px',
                    background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-surface) 50%, var(--bg-elevated) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.4s infinite'
                  }} />
                  <div style={{ height: '14px', width: '80%', borderRadius: '6px', marginTop: '10px', background: 'var(--bg-elevated)' }} />
                  <div style={{ height: '12px', width: '40%', borderRadius: '6px', marginTop: '6px', background: 'var(--bg-elevated)' }} />
                </div>
              ))}
            </div>
          </>
        )}

        {errorSearch && (
          <div className="p-4 bg-red-500/10 text-red-500 rounded-[14px] border border-red-500/20 text-center font-medium max-w-2xl mx-auto">
            {errorSearch}
          </div>
        )}


        {/* Results Grid — after a search */}
        {results.length > 0 && !loadingSearch && (
          <div>
            {correctedQuery ? (
              <div className="p-4 bg-[var(--accent)]/10 text-[var(--text-primary)] rounded-[10px] border border-[var(--accent)]/20 text-center font-medium max-w-2xl mx-auto mb-8">
                Showing results for <span className="font-bold text-[var(--accent)]">{correctedQuery}</span>
              </div>
            ) : query.trim() ? (
              <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[var(--text-muted)] mb-6">
                Results for &ldquo;<span className="text-[var(--text-secondary)]">{query}</span>&rdquo;
              </p>
            ) : activeGenre !== "All" ? (
              <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[var(--text-muted)] mb-6">
                Popular <span className="text-[var(--text-secondary)] font-bold">{activeGenre}</span> Movies
              </p>
            ) : null}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
              {results.map((item) => (
                <MovieCard key={item.imdbID} item={item} onClick={() => fetchDetails(item.imdbID)} />
              ))}
            </div>
          </div>
        )}

        {/* Default popular movies — shown when no search active */}
        {results.length === 0 && !loadingSearch && !loadingDefault && (
          <div>
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[var(--text-muted)] mb-6">
              {(query.trim() || activeGenre !== "All") && errorSearch ? '' : 'Popular Movies'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
              {defaultMovies.map((item) => (
                <MovieCard key={item.imdbID} item={item} onClick={() => fetchDetails(item.imdbID)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
