"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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

function MovieCard({ item, onClick, index = 0 }: { item: OMDBSearchResult; onClick: () => void; index?: number }) {
  return (
    <motion.button 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      className="flex flex-col text-left group relative"
    >
      <div className="w-full aspect-[2/3] bg-[var(--bg-elevated)] rounded-[14px] overflow-hidden relative shadow-lg shadow-black/20 border border-white/5 transition-all duration-500 group-hover:shadow-[var(--accent)]/20 group-hover:shadow-2xl group-hover:border-white/10">
        {item.Poster && item.Poster !== 'N/A' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.Poster}
            alt={item.Title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)]">
            <Film className="w-8 h-8 text-white/20" />
          </div>
        )}
        
        {/* Glassmorphic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex justify-between items-end">
            <div className="flex flex-col gap-1">
               <span className="text-white font-bold text-xs bg-white/20 backdrop-blur-md px-2 py-0.5 rounded w-fit">{item.Year}</span>
               <span className="text-white/80 font-bold text-[10px] uppercase tracking-wider">{item.Type}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.5)]">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col px-1">
        <h3 className="font-[family-name:var(--font-sora)] font-semibold text-[15px] leading-tight text-[var(--text-primary)] truncate w-full group-hover:text-[var(--accent)] transition-colors">
          {item.Title}
        </h3>
      </div>
    </motion.button>
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
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);
  const [tmdbDetails, setTmdbDetails] = useState<any>(null);

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
          const fetchTMDB = fetch(`/api/tmdb-search?q=${encodeURIComponent(q)}`)
            .then(res => res.json())
            .then(data => {
              if (data.Response === 'True' && data.Search?.length > 0) return data;
              throw new Error('TMDB no results');
            });

          const fetchOMDB = fetch(`/api/omdb?search=${encodeURIComponent(q)}`)
            .then(res => res.json())
            .then(data => {
              if (data.Response === 'True' && data.Search?.length > 0) return data;
              throw new Error('OMDB no results');
            });

          const data = await Promise.any([fetchTMDB, fetchOMDB]);
          setResults(data.Search);
          if (data.CorrectedQuery) setCorrectedQuery(data.CorrectedQuery);
        } catch {
          setErrorSearch('No movies found');
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
    setBackdropUrl(null);
    setTmdbDetails(null);

    try {
      const res = await fetch(`/api/omdb?id=${encodeURIComponent(imdbID)}`);
      if (!res.ok) throw new Error('Failed to fetch movie details');
      const data = await res.json();

      if (data.Response === "False") {
        setErrorDetails(data.Error || "Movie not found");
      } else {
        setSelectedMovie(data);
        // Also fetch backdrop from TMDB
        try {
          const tmdbRes = await fetch(`https://api.themoviedb.org/3/find/${imdbID}?api_key=524c16f6e2a0a13c49ff7b99d27b5efb&external_source=imdb_id`);
          if (tmdbRes.ok) {
            const tmdbData = await tmdbRes.json();
            const result = tmdbData.movie_results?.[0] || tmdbData.tv_results?.[0];
            const type = tmdbData.movie_results?.length > 0 ? "movie" : "tv";
            if (result) {
              if (result.backdrop_path) {
                setBackdropUrl(`https://image.tmdb.org/t/p/original${result.backdrop_path}`);
              }
              // Fetch extended details
              const detailsRes = await fetch(`https://api.themoviedb.org/3/${type}/${result.id}?api_key=524c16f6e2a0a13c49ff7b99d27b5efb&append_to_response=credits,reviews`);
              if (detailsRes.ok) {
                const details = await detailsRes.json();
                setTmdbDetails(details);
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch backdrop", e);
        }
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
    const hasPoster = backdropUrl || (selectedMovie.Poster && selectedMovie.Poster !== "N/A");
    const displayImage = backdropUrl || selectedMovie.Poster;

    return (
      <motion.main
        key="preview"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 bg-[#000000] text-white overflow-hidden"
      >
        {/* Full-Screen Hero Section */}
        <div className="relative w-full h-screen flex flex-col justify-end">
        {/* Background Image with Gradients */}
        {hasPoster && (
          <div className="absolute inset-0 w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt={selectedMovie.Title || "Poster"}
              className={`w-full h-full object-cover saturate-150 contrast-110 ${backdropUrl ? 'object-center' : 'object-top'}`}
            />
            {/* Subtle overlay to ensure text is readable without killing the image brightness */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/60 via-[#000000]/10 to-transparent" />
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => setSelectedMovie(null)}
          className="absolute top-8 left-8 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        {/* Content Container */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 z-10 flex flex-col justify-end">
          <div className="max-w-4xl">
            {/* Title */}
            <h1
              className="font-black text-6xl md:text-8xl lg:text-[100px] text-white mb-6 leading-none tracking-tight drop-shadow-2xl"
              style={{ fontFamily: "var(--font-sora)" }}
            >
              {selectedMovie.Title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-bold text-[#a8a8a8] mb-6">
              {selectedMovie.imdbRating && selectedMovie.imdbRating !== "N/A" && (
                <span className="flex items-center gap-1.5 text-[#F5C518]">
                  <Star className="w-5 h-5 fill-[#F5C518]" />
                  {Math.round(Number(selectedMovie.imdbRating) * 10) || selectedMovie.imdbRating}% Match
                </span>
              )}
              {selectedMovie.Year && selectedMovie.Year !== "N/A" && (
                <span className="text-white drop-shadow-md">{selectedMovie.Year}</span>
              )}
              <span className="px-2 py-0.5 border border-[#404040] text-xs text-[#a8a8a8] rounded uppercase">
                {selectedMovie.Type === "series" ? "Series" : "Movie"}
              </span>
              <span className="px-2 py-0.5 border border-[#404040] text-xs text-[#a8a8a8] rounded uppercase">
                HD
              </span>
            </div>

            {/* Overview */}
            {selectedMovie.Plot && selectedMovie.Plot !== "N/A" && (
              <p 
                className="text-base md:text-lg text-white/90 line-clamp-3 leading-relaxed mb-10 max-w-2xl drop-shadow-md font-medium" 
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {selectedMovie.Plot}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/imdb-movie-stream-player?id=${selectedMovie.imdbID}`}
                className="group relative flex items-center justify-center gap-3 bg-white text-black px-10 md:px-14 py-3 md:py-4 rounded-[4px] font-extrabold text-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)]"
              >
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 bg-white/50 rounded-[4px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Play className="relative z-10 w-7 h-7 fill-black" />
                <span className="relative z-10">Play</span>
              </Link>
            </div>

            {/* Mini Cast Row */}
            {tmdbDetails?.credits?.cast?.length > 0 && (
              <div className="mt-10 flex flex-col gap-3">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Starring</p>
                <div className="flex flex-wrap items-center gap-3">
                  {tmdbDetails.credits.cast.slice(0, 4).map((actor: any) => (
                    <div key={actor.id} className="flex items-center gap-3 bg-white/5 pr-4 rounded-full border border-white/10 backdrop-blur-md shadow-lg transition-transform hover:bg-white/10 cursor-default">
                      {actor.profile_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} alt={actor.name} className="w-10 h-10 rounded-full object-cover shadow-inner" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{actor.name.charAt(0)}</div>
                      )}
                      <div className="flex flex-col py-1">
                        <span className="text-white/90 text-sm font-bold leading-tight">{actor.name}</span>
                        <span className="text-white/40 text-[10px] leading-tight truncate max-w-[100px]">{actor.character}</span>
                      </div>
                    </div>
                  ))}
                  {tmdbDetails.credits.cast.length > 4 && (
                    <span className="text-white/40 text-xs font-medium ml-2">+{tmdbDetails.credits.cast.length - 4} more</span>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
        </div>
      </motion.main>
    );
  }

  // 3. Render Search Matrix Layout
  return (
    <main className="min-h-screen bg-[var(--bg-base)]">

      {/* Premium Hero Section */}
      <div className="relative pt-[120px] pb-8 px-4 md:px-8 max-w-[1200px] mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-sora)] font-extrabold tracking-tight text-[var(--text-primary)] mb-4">
          Discover Cinematic <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[#ff7e67]">Masterpieces</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto font-[family-name:var(--font-dm-sans)] mb-10">
          Explore thousands of premium movies and TV shows. Search by title, IMDb ID, or browse our curated trending collections.
        </p>
        
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative flex items-center group">
            <div className="absolute inset-0 bg-[var(--accent)]/20 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <Search className="absolute left-6 w-6 h-6 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors z-10" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows, or paste IMDb ID..."
              className="w-full bg-[var(--bg-elevated)]/50 backdrop-blur-2xl border border-white/10 rounded-full h-[64px] pl-[60px] pr-[130px] font-[family-name:var(--font-dm-sans)] text-[16px] text-[var(--text-primary)] focus:border-[var(--accent)]/50 focus:bg-white/10 outline-none transition-all shadow-2xl z-0"
            />
            <button
              type="submit"
              disabled={loadingSearch || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--accent)] text-white px-6 h-[48px] rounded-full text-[14px] font-bold hover:bg-[var(--accent-hover)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[100px] z-10 shadow-[0_0_20px_rgba(229,9,20,0.4)]"
            >
              {loadingSearch ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </form>

          {/* Genre filter pills */}
          <div className="flex items-center justify-center flex-wrap gap-3 mt-8">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`px-5 py-2 rounded-full text-[14px] font-[family-name:var(--font-dm-sans)] transition-all duration-300 border backdrop-blur-sm ${activeGenre === genre
                    ? 'bg-[var(--accent)]/20 border-[var(--accent)]/50 text-[var(--accent)] font-bold shadow-[0_0_15px_rgba(229,9,20,0.15)]'
                    : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10 hover:border-white/20'
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
          <div className="animate-pulse">
            <p className="text-[var(--text-muted)] text-[14px] mb-[16px] font-[family-name:var(--font-dm-sans)]">Finding cinematic gems...</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="w-full aspect-[2/3] rounded-[14px] bg-white/5 border border-white/5 shadow-inner" />
                  <div className="h-[14px] w-[80%] rounded-[6px] mt-[12px] bg-white/5" />
                  <div className="h-[12px] w-[40%] rounded-[6px] mt-[8px] bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default popular movies skeleton while loading */}
        {loadingDefault && !loadingSearch && results.length === 0 && (
          <div className="animate-pulse">
            <p className="text-[var(--text-muted)] text-[14px] mb-[16px] font-[family-name:var(--font-dm-sans)]">Curating masterpieces...</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="w-full aspect-[2/3] rounded-[14px] bg-white/5 border border-white/5 shadow-inner" />
                  <div className="h-[14px] w-[80%] rounded-[6px] mt-[12px] bg-white/5" />
                  <div className="h-[12px] w-[40%] rounded-[6px] mt-[8px] bg-white/5" />
                </div>
              ))}
            </div>
          </div>
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
            ) : activeGenre !== "Trending" ? (
              <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[var(--text-muted)] mb-6">
                Popular <span className="text-[var(--text-secondary)] font-bold">{activeGenre}</span> Movies
              </p>
            ) : null}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
              <AnimatePresence>
                {results.map((item, index) => (
                  <MovieCard key={item.imdbID} item={item} index={index} onClick={() => fetchDetails(item.imdbID)} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Default popular movies — shown when no search active */}
        {results.length === 0 && !loadingSearch && !loadingDefault && (
          <div>
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[var(--text-muted)] mb-6">
              {errorSearch ? '' : '🔥 Trending Now'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
              <AnimatePresence>
                {defaultMovies.map((item, index) => (
                  <MovieCard key={item.imdbID} item={item} index={index} onClick={() => fetchDetails(item.imdbID)} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
