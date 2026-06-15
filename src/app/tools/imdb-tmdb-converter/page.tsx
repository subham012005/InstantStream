"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRightLeft, Settings } from 'lucide-react';

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
      className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-[8px] cursor-pointer transition-opacity hover:opacity-80 active:scale-95 ${className}`}
    >
      <span className="font-[family-name:var(--font-jetbrains-mono)]">{label}: {id}</span>
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
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

      const TMDB_API_KEY = '524c16f6e2a0a13c49ff7b99d27b5efb';

      const fetchFromTmdb = async () => {
        if (mode === 'imdb-to-tmdb') {
          const res = await fetch(`https://api.themoviedb.org/3/find/${resolvedImdbId}?external_source=imdb_id&api_key=${TMDB_API_KEY}`);
          if (!res.ok) throw new Error('TMDB failed');
          const data = await res.json();
          const tmdb = data?.movie_results?.[0]?.id || data?.tv_results?.[0]?.id;
          if (tmdb) return { tmdbId: String(tmdb), imdbId: resolvedImdbId };
          throw new Error('Not found in TMDB');
        } else {
          let res = await fetch(`https://api.themoviedb.org/3/movie/${resolvedTmdbId}/external_ids?api_key=${TMDB_API_KEY}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.imdb_id) return { tmdbId: resolvedTmdbId, imdbId: data.imdb_id };
          }
          const resTv = await fetch(`https://api.themoviedb.org/3/tv/${resolvedTmdbId}/external_ids?api_key=${TMDB_API_KEY}`);
          if (resTv.ok) {
            const dataTv = await resTv.json();
            if (dataTv?.imdb_id) return { tmdbId: resolvedTmdbId, imdbId: dataTv.imdb_id };
          }
          throw new Error('Not found in TMDB');
        }
      };

      const fetchFromWikidata = async () => {
        const sparqlQuery = mode === 'imdb-to-tmdb' 
          ? `SELECT ?tmdbId WHERE { ?movie wdt:P345 "${resolvedImdbId}". ?movie wdt:P4947 ?tmdbId. } LIMIT 1`
          : `SELECT ?imdbId WHERE { ?movie wdt:P4947 "${resolvedTmdbId}". ?movie wdt:P345 ?imdbId. } LIMIT 1`;

        const wdUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparqlQuery)}`;
        const wdResponse = await fetch(wdUrl, { headers: { 'Accept': 'application/sparql-results+json' } });
        if (!wdResponse.ok) throw new Error('Wikidata failed');
        const wdData = await wdResponse.json();
        const bindings = wdData.results.bindings;

        if (mode === 'imdb-to-tmdb') {
           if (bindings.length > 0 && bindings[0].tmdbId) {
               return { tmdbId: bindings[0].tmdbId.value, imdbId: resolvedImdbId };
           }
        } else {
           if (bindings.length > 0 && bindings[0].imdbId) {
               return { tmdbId: resolvedTmdbId, imdbId: bindings[0].imdbId.value };
           }
        }
        throw new Error('Not found in Wikidata');
      };

      try {
        const result = await Promise.any([fetchFromTmdb(), fetchFromWikidata()]);
        resolvedTmdbId = result.tmdbId;
        resolvedImdbId = result.imdbId;
      } catch (err) {
        throw new Error('Failed to resolve IDs from all sources (TMDB & Wikidata).');
      }

      if (!resolvedImdbId) {
         throw new Error('Missing IMDb ID required to fetch movie details.');
      }

      // 2. Fetch Rich Movie Metadata securely via internal API route
      const internalApiUrl = `/api/omdb?id=${resolvedImdbId}`;
      const omdbResponse = await fetch(internalApiUrl);
      
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
    <main className="min-h-screen bg-[var(--bg-base)] pt-[100px] pb-[60px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--text-primary)] font-medium truncate">ID Converter</span>
        </nav>

        {/* Heading */}
        <div className="mb-10 max-w-3xl">
          <h1 className="font-[family-name:var(--font-sora)] font-bold text-[36px] md:text-[48px] text-[var(--text-primary)] mb-4 leading-tight">
            IMDb ↔ TMDB <span className="text-[var(--accent)]">ID Converter</span>
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-[16px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
            Quickly convert ID registries using Wikidata, and view comprehensive movie details powered by OMDb.
          </p>
        </div>

        {/* Input Card Wrapper */}
        <div className="mb-16">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 md:p-10 shadow-sm relative overflow-hidden">
             
             {/* Background glow for input area */}
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
             
             <div className="relative z-10 w-full max-w-2xl mx-auto space-y-6">
                
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--text-secondary)] font-[family-name:var(--font-dm-sans)] uppercase tracking-wider">Conversion Mode</label>
                  <div className="relative">
                    <select 
                      value={mode} 
                      onChange={(e) => {
                        setMode(e.target.value as Mode);
                        setResult(null);
                        setError(null);
                        setInputValue('');
                      }}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[10px] px-4 py-3.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none font-[family-name:var(--font-dm-sans)] text-[15px]"
                    >
                      <option value="imdb-to-tmdb">IMDb ID to TMDB Movie ID</option>
                      <option value="tmdb-to-imdb">TMDB Movie ID to IMDb ID</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--text-muted)]">
                      <Settings className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--text-secondary)] font-[family-name:var(--font-dm-sans)] uppercase tracking-wider">
                    {mode === 'imdb-to-tmdb' ? 'Enter IMDb ID (e.g., tt0111161)' : 'Enter TMDB ID (e.g., 278)'}
                  </label>
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={mode === 'imdb-to-tmdb' ? 'tt0111161' : '278'}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[10px] px-4 py-3.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors font-[family-name:var(--font-jetbrains-mono)] text-[15px]"
                    onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
                  />
                </div>

                <button 
                  onClick={handleConvert}
                  disabled={loading}
                  className="w-full bg-[var(--accent)] text-white py-3.5 rounded-[10px] font-bold font-[family-name:var(--font-sora)] text-[15px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[52px]"
                >
                  {loading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                     <span className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> Convert & Fetch Details</span>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-500/10 text-red-500 rounded-[10px] border border-red-500/20 text-sm font-[family-name:var(--font-dm-sans)]">
                    {error}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Results Container */}
        {result && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] overflow-hidden shadow-sm animate-fade-in">
            <div className="flex flex-col md:flex-row">
              
              <div className="md:w-[280px] shrink-0 bg-[var(--bg-elevated)] relative aspect-[2/3] md:aspect-auto border-r border-[var(--border-subtle)]">
                {result.details.Poster && result.details.Poster !== "N/A" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.details.Poster} alt={result.details.Title || "Movie poster"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center text-[var(--text-muted)] flex-col gap-2 p-6 text-center">
                    <Settings className="w-10 h-10 opacity-50" />
                    <span className="text-sm font-[family-name:var(--font-dm-sans)]">Poster Not Available</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 md:p-8 flex-1 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {result.details.Type && result.details.Type !== "N/A" && (
                      <span className="px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[6px] text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{result.details.Type}</span>
                    )}
                    {result.details.imdbRating && result.details.imdbRating !== "N/A" && (
                      <span className="text-[13px] font-bold text-yellow-500 flex items-center gap-1.5 font-[family-name:var(--font-dm-sans)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {result.details.imdbRating} 
                        {result.details.imdbVotes && result.details.imdbVotes !== "N/A" && (
                          <span className="text-[var(--text-muted)] font-medium text-[11px] ml-1">({result.details.imdbVotes} votes)</span>
                        )}
                      </span>
                    )}
                  </div>
                  <h2 className="text-[28px] md:text-[36px] font-[family-name:var(--font-sora)] font-bold text-[var(--text-primary)] leading-tight">
                    {result.details.Title !== "N/A" ? result.details.Title : "Unknown Title"} 
                    {result.details.Year && result.details.Year !== "N/A" && (
                      <span className="text-[var(--text-secondary)] font-normal text-[24px] ml-2">({result.details.Year})</span>
                    )}
                  </h2>
                  <p className="text-[var(--text-secondary)] font-[family-name:var(--font-dm-sans)] text-[14px] mt-3 flex flex-wrap gap-x-3 gap-y-2 items-center">
                    {result.details.Released !== "N/A" && <span>{result.details.Released}</span>}
                    {result.details.Released !== "N/A" && result.details.Runtime !== "N/A" && <span className="hidden sm:inline text-[var(--text-muted)]">•</span>}
                    {result.details.Runtime !== "N/A" && <span>{result.details.Runtime}</span>}
                    {result.details.Runtime !== "N/A" && result.details.Language !== "N/A" && <span className="hidden sm:inline text-[var(--text-muted)]">•</span>}
                    {result.details.Language !== "N/A" && <span>{result.details.Language}</span>}
                    {result.details.Language !== "N/A" && result.details.Country !== "N/A" && <span className="hidden sm:inline text-[var(--text-muted)]">•</span>}
                    {result.details.Country !== "N/A" && <span>{result.details.Country}</span>}
                  </p>
                </div>
                
                {result.details.Plot && result.details.Plot !== "N/A" && (
                  <p className="text-[var(--text-primary)] font-[family-name:var(--font-dm-sans)] leading-relaxed text-[15px] border-l-[3px] border-[var(--accent)] pl-4 py-1 italic bg-[var(--accent)]/5 rounded-r-[8px]">
                    "{result.details.Plot}"
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4 font-[family-name:var(--font-dm-sans)]">
                  {result.details.Genre && result.details.Genre !== "N/A" && (
                    <div>
                      <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Genres</h3>
                      <p className="text-[14px] text-[var(--text-primary)]">{result.details.Genre}</p>
                    </div>
                  )}
                  {result.details.Director && result.details.Director !== "N/A" && (
                    <div>
                      <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Director</h3>
                      <p className="text-[14px] text-[var(--text-primary)]">{result.details.Director}</p>
                    </div>
                  )}
                  {result.details.Writer && result.details.Writer !== "N/A" && (
                    <div>
                      <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Writer</h3>
                      <p className="text-[14px] text-[var(--text-primary)]">{result.details.Writer}</p>
                    </div>
                  )}
                  {result.details.Actors && result.details.Actors !== "N/A" && (
                    <div>
                      <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Actors</h3>
                      <p className="text-[14px] text-[var(--text-primary)] leading-relaxed">{result.details.Actors}</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] mt-auto block">
                  <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Registry IDs</h3>
                  <div className="flex flex-wrap gap-2 block">
                    {result.imdbId && <CopyBadge id={result.imdbId} label="IMDb" className="bg-[#f5c518]/10 text-[#d3a60a] dark:text-[#f5c518] border border-[#f5c518]/20 hover:bg-[#f5c518]/20" />}
                    {result.tmdbId && <CopyBadge id={result.tmdbId} label="TMDB" className="bg-[#01b4e4]/10 text-[#0190b6] dark:text-[#01b4e4] border border-[#01b4e4]/20 hover:bg-[#01b4e4]/20" />}
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
