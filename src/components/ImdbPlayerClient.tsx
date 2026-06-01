"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Film,
  Play,
  Search,
  AlertTriangle,
  ArrowLeft,
  Star,
  CheckCircle2,
  CalendarDays,
  Info,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { LandingPageData } from "@/app/landingPagesData";
import { useSearchParams } from "next/navigation";

interface MovieMeta {
  title: string;
  year: string;
  poster: string | null;
  rating: string;
  overview: string;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  runtime?: string;
  released?: string;
  language?: string;
}

interface StreamResponse {
  imdbId: string;
  url: string;
  type: "hls" | "mp4";
  provider: string;
  movie: MovieMeta | null;
  playerUrl: string;
  playerSource: "Gemma" | "VixSrc";
  error?: string;
}

const EXAMPLES = ["tt0111161", "tt0468569", "tt1375666", "tt0110912"];

const IMDbYellow = "#F5C518";

export default function ImdbPlayerClient({ data }: { data: LandingPageData }) {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const autoPlayFired = useRef(false);

  const [imdbId, setImdbId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamData, setStreamData] = useState<StreamResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shake, setShake] = useState(false);
  const [tmdbId, setTmdbId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [selectedPlayerUrl, setSelectedPlayerUrl] = useState<string>("");

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleSearch = async (id = imdbId.trim()) => {
    if (!id) { setError("Please enter an IMDb ID."); triggerShake(); return false; }
    if (!/^tt\d{7,8}$/.test(id)) {
      setError("Invalid format. Use 'tt' followed by 7–8 digits, e.g. tt0111161");
      triggerShake(); return false;
    }
    setImdbId(id);
    setLoading(true); setError(""); setStreamData(null); setIsPlaying(false); setTmdbId(null);
    try {
      let resolvedTmdbId = null;

      // 1. Fetch TMDB ID from Wikidata
      try {
        const sparqlQuery = `SELECT ?tmdbId WHERE { ?movie wdt:P345 "${id}". ?movie wdt:P4947 ?tmdbId. } LIMIT 1`;
        const wdUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparqlQuery)}`;
        const wdRes = await fetch(wdUrl, { headers: { 'Accept': 'application/sparql-results+json' } });
        const wdData = await wdRes.json();
        const bindings = wdData.results.bindings;
        if (bindings.length > 0 && bindings[0].tmdbId) {
          resolvedTmdbId = bindings[0].tmdbId.value;
          setTmdbId(resolvedTmdbId);
        }
      } catch (e) {
        console.error("Failed to fetch TMDB ID", e);
      }

      // 2. Fetch OMDb data
      let omdbData: any = null;
      try {
        const omdbRes = await fetch(`/api/omdb?id=${id}`);
        if (omdbRes.ok) {
          const data = await omdbRes.json();
          if (data.Response !== "False") {
            omdbData = data;
          } else {
            console.warn("OMDb API returned False:", data.Error);
          }
        } else {
          console.warn("OMDb API failed with status:", omdbRes.status);
        }
      } catch (err) {
        console.error("OMDb fetch exception:", err);
      }

      const streamJson: StreamResponse = {
        imdbId: id,
        url: "",
        type: "hls",
        provider: "Frontend",
        movie: {
          title: omdbData?.Title && omdbData.Title !== "N/A" ? omdbData.Title : `IMDb: ${id}`,
          year: omdbData?.Year && omdbData.Year !== "N/A" ? omdbData.Year : "",
          poster: omdbData?.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : null,
          rating: omdbData?.imdbRating && omdbData.imdbRating !== "N/A" ? omdbData.imdbRating : "",
          overview: omdbData?.Plot && omdbData.Plot !== "N/A" ? omdbData.Plot : "",
          genre: omdbData?.Genre && omdbData.Genre !== "N/A" ? omdbData.Genre : undefined,
          director: omdbData?.Director && omdbData.Director !== "N/A" ? omdbData.Director : undefined,
          writer: omdbData?.Writer && omdbData.Writer !== "N/A" ? omdbData.Writer : undefined,
          actors: omdbData?.Actors && omdbData.Actors !== "N/A" ? omdbData.Actors : undefined,
          runtime: omdbData?.Runtime && omdbData.Runtime !== "N/A" ? omdbData.Runtime : undefined,
          released: omdbData?.Released && omdbData.Released !== "N/A" ? omdbData.Released : undefined,
          language: omdbData?.Language && omdbData.Language !== "N/A" ? omdbData.Language : undefined
        },
        playerUrl: `https://gemma416okl.com/play/${id}`,
        playerSource: "Gemma"
      };

      setStreamData(streamJson);
      return true;
    } catch {
      setError("Failed to fetch movie details. Please try again.");
      triggerShake();
      return false;
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (initialId && !autoPlayFired.current) {
      autoPlayFired.current = true;
      setImdbId(initialId);
      handleSearch(initialId).then((success) => {
        if (success) {
          setIsPlaying(true);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  useEffect(() => {
    if (isPlaying && playerRef.current && window.innerWidth < 768) {
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [isPlaying]);

  const externalPlayerUrl = selectedPlayerUrl || (streamData ? streamData.playerUrl : "");

  useEffect(() => {
    if (streamData?.playerUrl) setSelectedPlayerUrl("");
  }, [streamData?.playerUrl]);

  const alternatePlayerUrl = streamData
    ? streamData.playerSource === "Gemma"
      ? `https://vixsrc.to/movie/${streamData.imdbId}`
      : `https://gemma416okl.com/play/${encodeURIComponent(streamData.imdbId)}`
    : "";

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[#F5C518] selection:text-black font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#F5C518] rounded-[100%] blur-[120px] mix-blend-screen" />
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════════════ SEARCH / RESULT STATE ═══════════════ */}
        {!isPlaying && (
          <motion.main
            key="search"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 md:px-8 max-w-[800px] mx-auto z-10"
          >
            <div className="text-center mb-10 w-full">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center justify-center bg-[#F5C518] text-black font-black text-xs px-3 py-1 mb-6 rounded uppercase tracking-wider shadow-[0_0_20px_rgba(245,197,24,0.3)]"
              >
                Pro Stream
              </motion.div>
              <h1 className="font-bold text-[56px] md:text-[72px] leading-[1.1] tracking-tight text-[var(--text-primary)] mb-6 transition-colors duration-300" style={{ fontFamily: "var(--font-sora)" }}>
                Watch from <span className="text-[#F5C518]">IMDb</span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto font-medium transition-colors duration-300" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Drop the IMDb ID below to bypass ads and instantly stream in cinematic HD. The ultimate cinema experience, right in your browser.
              </p>
            </div>

            <motion.div animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}} className="w-full max-w-2xl relative z-20">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F5C518]/50 to-[#F5C518]/10 rounded-[16px] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative flex flex-col sm:flex-row gap-3 w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] overflow-hidden p-2 shadow-2xl transition-colors duration-300">
                  <div className="relative flex items-center flex-1 ml-2">
                    <Search className="w-6 h-6 text-[var(--text-muted)] shrink-0" />
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none focus:ring-0 shadow-none px-4 py-4 md:py-5 font-mono text-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] w-full transition-colors duration-300"
                      placeholder="e.g. tt0111161"
                      value={imdbId}
                      onChange={(e) => { setImdbId(e.target.value); setError(''); if (!e.target.value) setStreamData(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading || !imdbId}
                    className="w-full sm:w-auto px-8 py-4 sm:py-0 sm:h-auto rounded-[12px] bg-[#F5C518] hover:bg-[#E3B514] text-black font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Search'}
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <span className="text-[var(--text-muted)] text-sm font-medium transition-colors duration-300">Try it out:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSearch(ex)}
                  className="px-4 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#F5C518] hover:bg-[#F5C518]/10 font-mono text-xs transition-all duration-300"
                >
                  {ex}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-8 p-4 px-6 w-full max-w-md bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center justify-center gap-3 backdrop-blur-md font-medium"
                >
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {(streamData?.url || streamData?.playerUrl) && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="mt-16 w-full max-w-3xl bg-[var(--bg-surface)] border border-[var(--border)] rounded-[24px] overflow-hidden flex flex-col sm:flex-row relative group shadow-2xl transition-colors duration-300"
                >
                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#F5C518]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {streamData.movie?.poster ? (
                    <div className="relative w-full sm:w-[240px] aspect-[2/3] sm:aspect-auto shrink-0 border-r border-[var(--border)] overflow-hidden transition-colors duration-300">
                      <Image 
                        src={streamData.movie.poster} 
                        alt={streamData.movie.title || "Poster"} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        sizes="(max-width: 640px) 100vw, 240px"
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-[240px] aspect-[2/3] sm:aspect-auto flex items-center justify-center bg-[var(--bg-elevated)] border-r border-[var(--border)] transition-colors duration-300">
                      <Film className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                  )}

                  <div className="p-8 flex-1 flex flex-col justify-center text-left relative z-10">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className="px-3 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs font-bold font-mono border border-[var(--border)] shadow-inner transition-colors duration-300">
                          {streamData.imdbId}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Stream Ready
                        </span>
                      </div>
                      
                      <h2 className="font-bold text-[32px] md:text-[40px] text-[var(--text-primary)] mb-3 leading-tight font-serif transition-colors duration-300" style={{ fontFamily: "var(--font-sora)" }}>
                        {streamData.movie?.title ?? streamData.imdbId}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-5 text-sm text-[var(--text-muted)] font-medium mb-6 transition-colors duration-300">
                        {streamData.movie?.year && (
                          <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-[var(--text-muted)]" /> {streamData.movie.year}</span>
                        )}
                        {streamData.movie?.runtime && (
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[var(--text-muted)]" /> {streamData.movie.runtime}</span>
                        )}
                        {streamData.movie?.genre && (
                          <span className="px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">{streamData.movie.genre.split(', ')[0]}</span>
                        )}
                        {streamData.movie?.rating && (
                          <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold text-lg"><Star className="w-5 h-5 fill-[#F5C518] text-[#F5C518]" /> {streamData.movie.rating} <span className="text-[var(--text-muted)] text-sm font-normal">/10</span></span>
                        )}
                      </div>

                      {streamData.movie?.overview && (
                        <p className="text-[13px] md:text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-5 border-l-2 border-[#F5C518] pl-3">
                          {streamData.movie.overview}
                        </p>
                      )}

                      <div className="flex flex-col gap-1.5 mb-8 text-[13px] md:text-sm">
                        {streamData.movie?.director && (
                          <div className="flex items-start gap-2">
                             <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider text-[11px] w-20 shrink-0 mt-0.5">Director</span>
                             <span className="text-[var(--text-primary)] font-medium">{streamData.movie.director}</span>
                          </div>
                        )}
                        {streamData.movie?.actors && (
                          <div className="flex items-start gap-2">
                             <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider text-[11px] w-20 shrink-0 mt-0.5">Starring</span>
                             <span className="text-[var(--text-primary)] font-medium line-clamp-1">{streamData.movie.actors}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsPlaying(true)}
                      className="group/btn w-full sm:w-auto relative inline-flex items-center justify-center gap-3 bg-[#F5C518] text-black px-8 py-4 rounded-[12px] font-bold text-lg overflow-hidden transition-transform active:scale-95"
                    >
                      <div className="absolute inset-0 w-full h-full bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                      <Play className="w-5 h-5 fill-current relative z-10" /> 
                      <span className="relative z-10">Play Movie</span>
                      <ChevronRight className="w-5 h-5 opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300 relative z-10" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        )}

        {/* ═══════════════ WATCH PAGE (PLAYING) ═══════════════ */}
        {isPlaying && streamData?.imdbId && (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300"
          >
            {/* Cinematic Backdrop */}
            <div className="absolute top-0 inset-x-0 h-[70vh] bg-gradient-to-b from-[var(--bg-base)] via-[var(--bg-base)] to-transparent opacity-80 pointer-events-none z-0 transition-colors duration-300" />
            
            {streamData.movie?.poster && (
               <div 
                 className="absolute top-0 inset-x-0 h-[60vh] opacity-20 blur-3xl pointer-events-none z-0"
                 style={{ backgroundImage: `url(${streamData.movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }}
               />
            )}

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-[100px] pb-[100px] relative z-10">

              <Link
                href="#"
                onClick={(e) => { e.preventDefault(); setIsPlaying(false); }}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Return to Search
              </Link>

              <div className="flex flex-col gap-10">
                {/* Main Player Section */}
                <div className="w-full">
                    
                  {/* Player Title & Rating */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div>
                      <h1 className="font-bold text-[32px] md:text-[48px] text-[var(--text-primary)] leading-tight font-serif transition-colors duration-300" style={{ fontFamily: "var(--font-sora)" }}>
                        {streamData.movie?.title ?? streamData.imdbId}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-300">
                        {streamData.movie?.year && <span>{streamData.movie.year}</span>}
                        {streamData.movie?.runtime && <span className="hidden sm:inline text-[var(--text-muted)]">•</span>}
                        {streamData.movie?.runtime && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[var(--text-muted)]" />{streamData.movie.runtime}</span>}
                        {streamData.movie?.genre && <span className="hidden sm:inline text-[var(--text-muted)]">•</span>}
                        {streamData.movie?.genre && <span>{streamData.movie.genre.split(', ')[0]}</span>}
                        {streamData.movie?.genre?.includes(', ') && <span className="px-2 py-0.5 rounded border border-[var(--border)] text-xs text-[var(--text-secondary)]">{streamData.movie.genre.split(', ')[1]}</span>}
                        <span className="px-2 py-0.5 rounded border border-[#F5C518]/20 bg-[#F5C518]/10 text-xs text-[#F5C518]">HD</span>
                        <span className="flex items-center gap-1.5 text-[var(--text-primary)]"><Star className="w-4 h-4 fill-[#F5C518] text-[#F5C518]" /> <span className="text-lg font-bold">{streamData.movie?.rating || '?'}</span> <span className="text-[var(--text-muted)] font-normal">/10</span></span>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={playerRef}
                    className="w-full aspect-video bg-black rounded-[12px] md:rounded-[20px] overflow-hidden border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group/player transition-colors duration-300"
                  >
                    {/* Server Selection overlay */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => { if (streamData.playerUrl) setSelectedPlayerUrl(streamData.playerUrl); }}
                        className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all backdrop-blur-md shadow-lg ${(!selectedPlayerUrl || selectedPlayerUrl === streamData.playerUrl) ? 'bg-[#F5C518] text-black ring-2 ring-[var(--bg-base)]' : 'bg-[var(--bg-elevated)]/80 text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'}`}
                      >
                         Server 1 {(!selectedPlayerUrl || selectedPlayerUrl === streamData.playerUrl) && '• Active'}
                      </button>
                      {alternatePlayerUrl && (
                        <button
                          onClick={() => setSelectedPlayerUrl(alternatePlayerUrl)}
                          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all backdrop-blur-md shadow-lg ${selectedPlayerUrl === alternatePlayerUrl ? 'bg-[#F5C518] text-black ring-2 ring-[var(--bg-base)]' : 'bg-[var(--bg-elevated)]/80 text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'}`}
                        >
                          Server 2 {selectedPlayerUrl === alternatePlayerUrl && '• Active'}
                        </button>
                      )}
                      {tmdbId && (
                        <button
                          onClick={() => setSelectedPlayerUrl(`https://player.videasy.net/movie/${tmdbId}`)}
                          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all backdrop-blur-md shadow-lg ${selectedPlayerUrl === `https://player.videasy.net/movie/${tmdbId}` ? 'bg-[#F5C518] text-black ring-2 ring-[var(--bg-base)]' : 'bg-[var(--bg-elevated)]/80 text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'}`}
                        >
                          Server 3 {selectedPlayerUrl === `https://player.videasy.net/movie/${tmdbId}` && '• Active'}
                        </button>
                      )}
                    </div>

                    <iframe
                      className="w-full h-full"
                      src={externalPlayerUrl}
                      title="IMDb Movie Player"
                      allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-read; clipboard-write"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Below Player Info */}
                <div className="w-full">
                   <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 md:p-8 transition-colors duration-300">
                     <h3 className="font-bold text-xl text-[var(--text-primary)] mb-6 flex items-center gap-2">
                       <Info className="w-5 h-5 text-[#F5C518]" /> About Title
                     </h3>
                     
                     <div className="flex flex-col md:flex-row gap-8">
                        {streamData.movie?.poster && (
                           <div className="hidden md:block w-[200px] shrink-0 aspect-[2/3] relative rounded-xl overflow-hidden border border-[var(--border-subtle)] shadow-xl transition-colors duration-300">
                              <Image src={streamData.movie.poster} alt="Poster" fill className="object-cover" />
                           </div>
                        )}

                        <div className="flex-1 space-y-6">
                           <div>
                             <div className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300">Plot Summary</div>
                             <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] font-medium transition-colors duration-300">
                               {streamData.movie?.overview || 'No plot description available for this title.'}
                             </p>
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2 transition-colors duration-300">
                             {streamData.movie?.director && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Director</h4>
                                 <p className="text-[13px] text-[var(--text-primary)] font-medium break-words">{streamData.movie.director}</p>
                               </div>
                             )}
                             {streamData.movie?.writer && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Writer</h4>
                                 <p className="text-[13px] text-[var(--text-primary)] font-medium break-words">{streamData.movie.writer}</p>
                               </div>
                             )}
                             {streamData.movie?.actors && (
                               <div className="col-span-2 md:col-span-1">
                                 <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Actors</h4>
                                 <p className="text-[13px] text-[var(--text-primary)] font-medium leading-tight">{streamData.movie.actors}</p>
                               </div>
                             )}
                             {streamData.movie?.released && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Released</h4>
                                 <p className="text-[13px] text-[var(--text-primary)] font-medium">{streamData.movie.released}</p>
                               </div>
                             )}
                             {streamData.movie?.language && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Language</h4>
                                 <p className="text-[13px] text-[var(--text-primary)] font-medium">{streamData.movie.language}</p>
                               </div>
                             )}
                             {streamData.movie?.runtime && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Runtime</h4>
                                 <p className="text-[13px] text-[var(--text-primary)] font-medium">{streamData.movie.runtime}</p>
                               </div>
                             )}
                           </div>

                           <div className="pt-4 border-t border-[var(--border)] transition-colors duration-300">
                             <div className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider mb-3 transition-colors duration-300">Registry IDs</div>
                             <div className="flex gap-3">
                               <div className="inline-flex px-3 py-1.5 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-md font-mono text-xs text-[#F5C518] font-bold shadow-[0_0_10px_rgba(245,197,24,0.1)]">
                                  IMDb: {streamData.imdbId}
                               </div>
                               {tmdbId && (
                                 <div className="inline-flex px-3 py-1.5 bg-[#01b4e4]/10 border border-[#01b4e4]/30 rounded-md font-mono text-xs text-[#01b4e4] font-bold shadow-[0_0_10px_rgba(1,180,228,0.1)]">
                                    TMDB: {tmdbId}
                                 </div>
                               )}
                             </div>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

