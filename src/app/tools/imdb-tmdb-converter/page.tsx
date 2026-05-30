"use client";

import React, { useState } from 'react';
import Link from 'next/link';

type Mode = 'imdb-to-tmdb' | 'tmdb-to-imdb';

interface OMDBMovieResult {
  Title: string;
  Year: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Poster: string;
  imdbRating: string;
  imdbVotes: string;
  Type: string;
  imdbID: string;
  Response: string;
  Error?: string;
}

interface MovieResult {
  tmdbId?: string;
  imdbId?: string;
  details: OMDBMovieResult;
}

const CopyBadge = ({ id, label, className }: { id: string; label: string; className: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      title="Click to copy"
      className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full cursor-pointer transition-opacity hover:opacity-80 active:scale-95 ${className}`}
    >
      <span>{label}: {id}</span>
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
};

export default function ConverterPage() {
  const [mode, setMode] = useState<Mode>('imdb-to-tmdb');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<MovieResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    setResult(null);
    setError(null);
    
    if (!inputValue.trim()) {
      setError('Please enter an ID.');
      return;
    }

    if (mode === 'imdb-to-tmdb' && !inputValue.trim().startsWith('tt')) {
      setError('IMDb ID should start with "tt"');
      return;
    }

    if (mode === 'tmdb-to-imdb' && !/^\d+$/.test(inputValue.trim())) {
      setError('TMDB ID should be numeric');
      return;
    }

    setLoading(true);

    try {
      let resolvedTmdbId = mode === 'tmdb-to-imdb' ? inputValue.trim() : null;
      let resolvedImdbId = mode === 'imdb-to-tmdb' ? inputValue.trim() : null;

      // 1. Convert IDs exclusively through Wikidata
      const sparqlQuery = mode === 'imdb-to-tmdb' 
        ? `SELECT ?tmdbId WHERE { ?movie wdt:P345 "${resolvedImdbId}". ?movie wdt:P4947 ?tmdbId. } LIMIT 1`
        : `SELECT ?imdbId WHERE { ?movie wdt:P4947 "${resolvedTmdbId}". ?movie wdt:P345 ?imdbId. } LIMIT 1`;

      const wdUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparqlQuery)}`;
      
      const wdResponse = await fetch(wdUrl, {
        headers: {
          'Accept': 'application/sparql-results+json'
        }
      });
      
      if (!wdResponse.ok) {
        throw new Error('Failed to reach Wikidata for ID conversion');
      }

      const wdData = await wdResponse.json();
      const bindings = wdData.results.bindings;

      if (mode === 'imdb-to-tmdb') {
         if (bindings.length > 0 && bindings[0].tmdbId) {
             resolvedTmdbId = bindings[0].tmdbId.value;
         }
         // Even if TMDB ID is not found, we still have the IMDb ID to fetch details
      } else {
         if (bindings.length > 0 && bindings[0].imdbId) {
             resolvedImdbId = bindings[0].imdbId.value;
         } else {
             throw new Error('No corresponding IMDb ID found in Wikidata for this TMDB ID.');
         }
      }

      if (!resolvedImdbId) {
         throw new Error('Missing IMDb ID required to fetch movie details.');
      }

      // 2. Fetch Rich Movie Metadata exclusively from OMDb using IMDb ID
      const omdbUrl = `https://www.omdbapi.com/?i=${resolvedImdbId}&apikey=fb8a128f`;
      const omdbResponse = await fetch(omdbUrl);
      
      if (!omdbResponse.ok) {
        throw new Error('Failed to fetch movie details from OMDb API');
      }
      
      const omdbData: OMDBMovieResult = await omdbResponse.json();
      
      if (omdbData.Response === "False") {
         throw new Error(omdbData.Error || 'OMDb API returned an error.');
      }

      setResult({
          tmdbId: resolvedTmdbId || undefined,
          imdbId: resolvedImdbId,
          details: omdbData
      });

    } catch (err: any) {
      setError(err.message || 'An error occurred during conversion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display-lg tracking-tight text-on-surface">IMDb ↔ TMDB ID Converter</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">Quickly convert ID registries using Wikidata, and view comprehensive movie details powered by OMDb.</p>
        </div>

        <div className="bg-surface border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm max-w-3xl mx-auto">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">Conversion Mode</label>
            <div className="relative">
              <select 
                value={mode} 
                onChange={(e) => {
                  setMode(e.target.value as Mode);
                  setResult(null);
                  setError(null);
                  setInputValue('');
                }}
                className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none pr-10"
              >
                <option value="imdb-to-tmdb">IMDb ID to TMDB Movie ID</option>
                <option value="tmdb-to-imdb">TMDB Movie ID to IMDb ID</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-on-surface/50">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">
              {mode === 'imdb-to-tmdb' ? 'Enter IMDb ID (e.g., tt0111161)' : 'Enter TMDB ID (e.g., 278)'}
            </label>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={mode === 'imdb-to-tmdb' ? 'tt0111161' : '278'}
              className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow placeholder:text-on-surface/30"
              onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
            />
          </div>

          <button 
            onClick={handleConvert}
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px] shadow-sm"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
               'Convert ID & Fetch Details'
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-500/20 text-sm">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="bg-surface border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 shrink-0 bg-black/5 dark:bg-white/5 relative aspect-[2/3] md:aspect-auto md:min-h-[400px]">
                {result.details.Poster && result.details.Poster !== "N/A" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.details.Poster} alt={result.details.Title || "Movie poster"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center text-on-surface-variant flex-col gap-2 p-6 text-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                       <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                       <circle cx="8.5" cy="8.5" r="1.5"/>
                       <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="text-sm">Poster Not Available</span>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 flex-1 space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {result.details.Type && result.details.Type !== "N/A" && (
                      <span className="px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-md text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{result.details.Type}</span>
                    )}
                    {result.details.imdbRating && result.details.imdbRating !== "N/A" && (
                      <span className="text-sm font-semibold text-yellow-500 dark:text-yellow-400 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {result.details.imdbRating} 
                        {result.details.imdbVotes && result.details.imdbVotes !== "N/A" && (
                          <span className="text-on-surface-variant font-medium text-xs ml-0.5">({result.details.imdbVotes} votes)</span>
                        )}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display-lg tracking-tight text-on-surface leading-tight">
                    {result.details.Title !== "N/A" ? result.details.Title : "Unknown Title"} 
                    {result.details.Year && result.details.Year !== "N/A" && (
                      <span className="text-on-surface-variant font-normal text-2xl ml-2">({result.details.Year})</span>
                    )}
                  </h2>
                  <p className="text-on-surface-variant text-sm mt-3 flex flex-wrap gap-x-4 gap-y-2 items-center">
                    {result.details.Released !== "N/A" && <span>{result.details.Released}</span>}
                    {result.details.Released !== "N/A" && result.details.Runtime !== "N/A" && <span className="hidden sm:inline text-on-surface/30">•</span>}
                    {result.details.Runtime !== "N/A" && <span>{result.details.Runtime}</span>}
                    {result.details.Runtime !== "N/A" && result.details.Language !== "N/A" && <span className="hidden sm:inline text-on-surface/30">•</span>}
                    {result.details.Language !== "N/A" && <span>{result.details.Language}</span>}
                    {result.details.Language !== "N/A" && result.details.Country !== "N/A" && <span className="hidden sm:inline text-on-surface/30">•</span>}
                    {result.details.Country !== "N/A" && <span>{result.details.Country}</span>}
                  </p>
                </div>
                
                {result.details.Plot && result.details.Plot !== "N/A" && (
                  <p className="text-on-surface leading-relaxed text-sm md:text-base border-l-2 border-primary/40 pl-4 py-1 italic">
                    "{result.details.Plot}"
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                  {result.details.Genre && result.details.Genre !== "N/A" && (
                    <div>
                      <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Genres</h3>
                      <p className="text-sm text-on-surface">{result.details.Genre}</p>
                    </div>
                  )}
                  {result.details.Director && result.details.Director !== "N/A" && (
                    <div>
                      <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Director</h3>
                      <p className="text-sm text-on-surface">{result.details.Director}</p>
                    </div>
                  )}
                  {result.details.Writer && result.details.Writer !== "N/A" && (
                    <div>
                      <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Writer</h3>
                      <p className="text-sm text-on-surface">{result.details.Writer}</p>
                    </div>
                  )}
                  {result.details.Actors && result.details.Actors !== "N/A" && (
                    <div>
                      <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Actors</h3>
                      <p className="text-sm text-on-surface leading-relaxed">{result.details.Actors}</p>
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-black/10 dark:border-white/10 mt-6 block">
                  <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Registry IDs</h3>
                  <div className="flex flex-wrap gap-2 block">
                    {result.imdbId && <CopyBadge id={result.imdbId} label="IMDb" className="bg-[#f5c518]/10 text-[#d3a60a] dark:text-[#f5c518] border border-[#f5c518]/20" />}
                    {result.tmdbId && <CopyBadge id={result.tmdbId} label="TMDB" className="bg-[#01b4e4]/10 text-[#0190b6] dark:text-[#01b4e4] border border-[#01b4e4]/20" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
