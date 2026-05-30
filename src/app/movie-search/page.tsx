"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function MovieSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OMDBSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);

  const [selectedMovie, setSelectedMovie] = useState<OMDBMovieDetail | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Auto-scroll to top when cinematic view opens
  useEffect(() => {
    if (selectedMovie || loadingDetails) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedMovie, loadingDetails]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoadingSearch(true);
    setErrorSearch(null);
    setResults([]);
    setSelectedMovie(null);
    setErrorDetails(null);

    try {
      const res = await fetch(`/api/omdb?search=${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error('Search request failed');
      const data = await res.json();
      
      if (data.Response === "False") {
         setErrorSearch(data.Error === "Movie not found!" ? "Movie not found" : data.Error);
      } else {
         setResults(data.Search || []);
      }
    } catch (err: any) {
      setErrorSearch(err.message || 'An error occurred during search.');
    } finally {
      setLoadingSearch(false);
    }
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

  // 1. Render Loading State for detail view
  if (loadingDetails) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-headline-md text-on-surface animate-pulse">Loading Cinematic Experience...</h2>
      </main>
    );
  }

  // 2. Render Detail View (Cinematic Screen)
  if (selectedMovie) {
    const hasPoster = selectedMovie.Poster && selectedMovie.Poster !== "N/A";
    
    return (
      <main className="min-h-screen relative pt-20 pb-16">
        {/* Massive Blurred Backdrop */}
        <div className="absolute inset-0 z-0 h-[80vh] overflow-hidden pointer-events-none">
          {hasPoster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={selectedMovie.Poster} 
              alt="Backdrop" 
              className="w-full h-full object-cover opacity-20 dark:opacity-[0.15] blur-3xl scale-125 saturate-150" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-surface lg:via-surface/80 to-transparent"></div>
        </div>

        <div className="relative z-10 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto flex flex-col">
          <button 
             onClick={() => setSelectedMovie(null)}
             className="w-fit mb-8 flex items-center gap-2 px-4 py-2 bg-surface-container-high/50 hover:bg-primary/20 hover:text-primary backdrop-blur-md rounded-full border border-black/5 dark:border-white/5 transition-all text-sm font-semibold group cursor-pointer"
          >
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             <span>Back to search results</span>
          </button>

          {errorDetails && (
             <div className="mb-8 p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-500/20 text-center font-medium max-w-2xl mx-auto shadow-sm">
                {errorDetails}
             </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start lg:items-stretch">
            
            {/* Poster Panel */}
            <div className="w-full max-w-[320px] lg:w-1/3 shrink-0 mx-auto lg:mx-0">
               <div className="w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 group">
                 {hasPoster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedMovie.Poster} alt={selectedMovie.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 ) : (
                    <div className="w-full h-full bg-surface-container-highest flex flex-col items-center justify-center text-on-surface-variant gap-3">
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
                  <Link href={`/imdb-movie-stream-player?id=${selectedMovie.imdbID}`} className="w-full flex justify-center items-center gap-3 bg-gradient-to-br from-[#f5c518] to-[#e4b713] text-black font-extrabold px-6 py-4 rounded-2xl shadow-[0_4px_25px_rgba(245,197,24,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider text-sm">
                     <Play className="w-5 h-5 fill-current" />
                     <span>Stream Now On FluxPlays</span>
                  </Link>
               </div>
            </div>

            {/* Details Panel */}
            <div className="flex-1 flex flex-col w-full">
              <h1 className="text-4xl md:text-6xl font-display-lg tracking-tight text-on-surface mb-4 leading-[1.1] text-center lg:text-left shadow-black/10 text-shadow-sm">
                 {selectedMovie.Title} 
                 {selectedMovie.Year && selectedMovie.Year !== "N/A" && (
                    <span className="opacity-50 text-2xl md:text-4xl font-normal ml-3 whitespace-nowrap">({selectedMovie.Year})</span>
                 )}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-8">
                 {selectedMovie.imdbRating && selectedMovie.imdbRating !== "N/A" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 shadow-inner">
                      <Star className="w-4 h-4 fill-current" />
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
                 <span className="px-2 py-1 bg-surface-container rounded-md border border-black/5 dark:border-white/5 opacity-70">
                    IMDb: {selectedMovie.imdbID}
                 </span>
              </div>

              {selectedMovie.Plot && selectedMovie.Plot !== "N/A" && (
                 <div className="mb-10 text-center lg:text-left">
                    <p className="text-on-surface md:text-lg leading-relaxed md:leading-loose">
                       {selectedMovie.Plot}
                    </p>
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                 <div className="glass-panel p-6 rounded-2xl bg-surface-container-lowest/50 border border-black/5 dark:border-white/5 shadow-sm">
                   <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 border-b border-black/5 dark:border-white/5 pb-2">The Cast</h4>
                   <p className="text-base font-semibold text-on-surface leading-loose">
                     {selectedMovie.Actors && selectedMovie.Actors !== "N/A" ? selectedMovie.Actors : "Not available"}
                   </p>
                 </div>
                 
                 <div className="space-y-4">
                   <div className="glass-panel p-5 rounded-2xl bg-surface-container-lowest/50 border border-black/5 dark:border-white/5 shadow-sm">
                     <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Director</h4>
                     <p className="text-sm font-semibold text-on-surface">
                       {selectedMovie.Director && selectedMovie.Director !== "N/A" ? selectedMovie.Director : "Not available"}
                     </p>
                   </div>
                   
                   <div className="glass-panel p-5 rounded-2xl bg-surface-container-lowest/50 border border-black/5 dark:border-white/5 shadow-sm">
                     <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Writer</h4>
                     <p className="text-sm font-semibold text-on-surface">
                       {selectedMovie.Writer && selectedMovie.Writer !== "N/A" ? selectedMovie.Writer : "Not available"}
                     </p>
                   </div>
                   
                   <div className="glass-panel p-5 rounded-2xl bg-surface-container-lowest/50 border border-black/5 dark:border-white/5 shadow-sm">
                     <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Genres</h4>
                     <p className="text-sm font-semibold text-on-surface">
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
     <main className="min-h-screen pt-24 pb-16 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
            <span className="font-label-sm text-xs text-primary uppercase tracking-widest font-bold">Discover Movies</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display-lg tracking-tight text-on-surface leading-tight">Instant Movie Search Engine</h1>
          <p className="text-on-surface-variant text-lg md:text-xl">Search any blockbuster movie or binge-worthy tv series to completely unlock their deep stats, lore, and streaming links.</p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto group">
          <div className="absolute inset-0 bg-primary/20 dark:bg-primary/10 blur-xl rounded-full scale-90 group-hover:scale-105 transition-transform duration-500 pointer-events-none"></div>
          <div className="relative flex items-center bg-surface-container-lowest shadow-2xl border border-black/10 dark:border-white/10 rounded-full p-2 hover:border-primary/40 focus-within:border-primary/50 transition-colors">
             <div className="pl-4 pr-2 text-on-surface-variant">
               <Search className="w-6 h-6" />
             </div>
             <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a movie..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-4 text-on-surface font-medium text-lg placeholder:text-on-surface-variant/50"
             />
             <button
                type="submit"
                disabled={loadingSearch || !query.trim()}
                className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center shrink-0 ml-2"
             >
                {loadingSearch ? <Loader2 className="w-5 h-5 animate-spin mx-3" /> : 'Search Now'}
             </button>
          </div>
        </form>

        {errorSearch && (
          <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-500/20 text-center font-bold max-w-2xl mx-auto shadow-sm">
            {errorSearch}
          </div>
        )}

        {results.length > 0 && (
          <div className="w-full mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl md:text-2xl font-headline-md mb-8 text-on-surface border-b border-black/5 dark:border-white/5 pb-4">Top Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {results.map((item) => (
                <button
                  key={item.imdbID}
                  onClick={() => fetchDetails(item.imdbID)}
                  className="flex flex-col relative group text-left outline-none"
                >
                  <div className="w-full aspect-[2/3] bg-surface-container-higher rounded-2xl overflow-hidden relative border border-black/5 dark:border-white/5 shadow-md shadow-black/5 group-hover:shadow-2xl group-hover:shadow-primary/20 group-focus:ring-4 group-focus:ring-primary/40 transition-all duration-300">
                    {item.Poster && item.Poster !== "N/A" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.Poster} alt={item.Title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                         <Film className="w-8 h-8 opacity-20 mb-2" />
                         <span className="text-[10px] font-medium text-center uppercase tracking-widest px-2 opacity-50">No Poster</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest">
                       {item.Year}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 opacity-90">{item.Type}</span>
                    <h3 className="font-bold text-on-surface text-sm md:text-base leading-tight group-hover:text-primary transition-colors">{item.Title}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
