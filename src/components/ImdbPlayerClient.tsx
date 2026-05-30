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
  Calendar,
  Tv2,
  Sparkles,
  CheckCircle2,
  Clapperboard,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";
import FAQSection from "@/components/FAQSection";
import Logo from "@/components/Logo";
import type { LandingPageData } from "@/app/landingPagesData";

import { useSearchParams } from "next/navigation";

interface MovieMeta {
  title: string;
  year: string;
  poster: string | null;
  rating: string;
  overview: string;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPlayerUrl, setSelectedPlayerUrl] = useState<string>("");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    if (isPlaying && streamData?.url) { // changed condition slightly to avoid early triggers
      showTimer = setTimeout(() => setShowHint(true), 2000);
      hideTimer = setTimeout(() => setShowHint(false), 22000);
    } else {
      setShowHint(false);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isPlaying, streamData?.url]);

  const isValidId = /^tt\d{7,8}$/.test(imdbId.trim());

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleSearch = async (id = imdbId.trim()) => {
    if (!id) { setError("Please enter an IMDb ID."); triggerShake(); return false; }
    if (!/^tt\d{7,8}$/.test(id)) {
      setError("Invalid format. Use 'tt' followed by 7–8 digits, e.g. tt0111161");
      triggerShake(); return false;
    }
    setImdbId(id);
    setLoading(true); setError(""); setStreamData(null); setIsPlaying(false);
    try {
      const res = await fetch(`/api/stream/${id}`);
      const json: StreamResponse = await res.json();
      if (!res.ok) {
        setError(json.error || "No stream found for this title.");
        if (json.movie) setStreamData({ ...json, url: "", type: "hls", provider: "" });
        triggerShake();
        return false;
      } else {
        setStreamData(json);
        return true;
      }
    } catch {
      setError("Failed to connect to the server. Please try again.");
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

  const ACCENT = data.accentColor || "#f5c518";
  const SECONDARY = data.secondaryColor || "#e67e22";
  const gradientStyle = { background: `linear-gradient(135deg, ${ACCENT}, ${SECONDARY})` };
  const gradientText = {
    background: `linear-gradient(135deg, ${ACCENT} 0%, ${SECONDARY} 100%)`,
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  };

  const externalPlayerUrl = selectedPlayerUrl || (streamData ? streamData.playerUrl : "");

  useEffect(() => {
    // Reset manual selection when a new stream is loaded
    if (streamData?.playerUrl) {
      setSelectedPlayerUrl("");
    }
  }, [streamData?.playerUrl]);

  const alternatePlayerUrl = streamData
    ? streamData.playerSource === "Gemma"
      ? `https://vixsrc.to/movie/${streamData.imdbId}`
      : `https://gemma416okl.com/play/${encodeURIComponent(streamData.imdbId)}`
    : "";

  return (
    <div className="min-h-screen bg-[#080810] text-white">

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white hover:opacity-80 transition-opacity">
            <Logo className="w-7 h-7" />
            <span className="text-lg tracking-tight">FluxPlays</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/50">
            <Link href="/" className="hover:text-white transition-colors">URL Player</Link>
            <Link href="/community-sites" className="hover:text-white transition-colors">Community</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <a
              href="https://imdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 hover:border-white/30 transition-colors"
              style={{ color: ACCENT }}
            >
              <Film className="w-3.5 h-3.5" /> IMDb
            </a>
          </nav>
        </div>
      </header>

      <AnimatePresence mode="wait">

        {/* ═══════════════ SEARCH / RESULT STATE ═══════════════ */}
        {!isPlaying && (
          <motion.main
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden"
          >
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] left-[-15%] w-[70vw] h-[70vw] rounded-full opacity-[0.07]"
                style={{ background: ACCENT, filter: "blur(160px)" }} />
              <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.06]"
                style={{ background: SECONDARY, filter: "blur(140px)" }} />
              <div className="absolute inset-0"
                style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            </div>

            <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-7 border"
                style={{ background: `${ACCENT}12`, borderColor: `${ACCENT}35`, color: ACCENT }}
              >
                <Sparkles className="w-3 h-3" />
                IMDb Stream Engine
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-[4.5rem] font-black leading-[1.05] tracking-tighter mb-5"
              >
                Stream Any Movie<br />
                <span style={gradientText}>by IMDb ID</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-base md:text-lg text-white/45 max-w-lg mx-auto mb-5 leading-relaxed"
              >
                Paste any IMDb ID and instantly stream the movie in high quality — no sign-up, no downloads.
              </motion.p>

              {/* IMDb ID format explainer */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="inline-flex flex-wrap items-center justify-center gap-2 mb-8 text-xs"
              >
                <span className="text-white/25 shrink-0">IMDb ID lives in the URL:</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-white/[0.04] text-white/35 font-mono">
                  imdb.com/title/<strong style={{ color: ACCENT }}>tt0111161</strong>
                </span>
              </motion.div>

              {/* Search box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="w-full"
              >
                <motion.div
                  animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="relative group"
                >
                  {/* Glow */}
                  <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm"
                    style={gradientStyle} />
                  <div className="relative flex items-center bg-white/[0.05] border border-white/10 rounded-2xl overflow-hidden group-focus-within:border-transparent shadow-2xl">
                    <div className="pl-5 text-white/30 shrink-0">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-1 bg-transparent outline-none border-none px-4 py-4 text-lg font-mono placeholder:font-sans placeholder:text-white/20 text-white"
                      placeholder="tt0111161"
                      value={imdbId}
                      onChange={(e) => { setImdbId(e.target.value); setError(""); if (!e.target.value) setStreamData(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading || !imdbId}
                      className="m-2 px-6 py-3.5 rounded-xl font-bold text-sm text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 flex items-center gap-2 shrink-0"
                      style={gradientStyle}
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <><Zap className="w-4 h-4" /><span>Find Stream</span></>
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Example chips */}
                <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                  <span className="text-white/25 text-xs">Try:</span>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => handleSearch(ex)}
                      className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 font-mono transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3 w-full text-left"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Result Card ── */}
              <AnimatePresence>
                {(streamData?.url || streamData?.playerUrl) && (
                  <motion.div
                    key="result-card"
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-8 w-full"
                  >
                    {/* "Stream found" divider */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] px-3.5 py-1.5 rounded-full border border-emerald-400/25 text-emerald-400" style={{ background: "rgba(52,211,153,0.06)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        Stream Located
                      </span>
                      <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                    </div>

                    <div className="rounded-3xl overflow-hidden border border-white/8 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
                      style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)" }}>

                      {/* ── IMDb info bar ── */}
                      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-white/6" style={{ background: `${ACCENT}12` }}>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black tracking-tight text-black" style={{ background: ACCENT }}>
                          IMDb
                        </div>
                        <span className="text-xs text-white/40 font-mono">{streamData.imdbId}</span>
                        <span className="text-white/15 text-xs hidden sm:inline">·</span>
                        <span className="text-xs text-white/30 hidden sm:inline">Internet Movie Database ID — the unique code for every film</span>
                        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/30 font-mono shrink-0">
                          <Tv2 className="w-3 h-3" />
                          {streamData.type.toUpperCase()} · {streamData.provider}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row">
                        {/* Poster */}
                        {streamData.movie?.poster ? (
                          <div className="relative w-full sm:w-[190px] shrink-0 aspect-[2/3] sm:aspect-auto overflow-hidden">
                            <Image
                              src={streamData.movie.poster}
                              alt={streamData.movie.title ?? "poster"}
                              fill
                              className="object-cover"
                              sizes="190px"
                            />
                            {/* Mobile: gradient from bottom */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent sm:hidden" />
                            {/* Desktop: gradient from right edge */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 hidden sm:block" />
                            {/* Rating overlay on poster — mobile only */}
                            {streamData.movie?.rating && parseFloat(streamData.movie.rating) > 0 && (
                              <div className="absolute bottom-3 left-3 sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-black font-black text-sm shadow-xl" style={gradientStyle}>
                                <Star className="w-3.5 h-3.5 fill-black" />
                                {streamData.movie.rating}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full sm:w-[190px] shrink-0 aspect-[2/3] sm:aspect-auto flex flex-col items-center justify-center gap-3 border-r border-white/6" style={{ background: `${ACCENT}08` }}>
                            <Clapperboard className="w-10 h-10 text-white/15" />
                            <span className="text-xs text-white/20 font-medium">No Poster</span>
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between gap-5 text-left">
                          <div>
                            {/* Badge row */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Stream Ready
                              </span>
                              <span className="text-[11px] font-mono font-semibold text-white/35 bg-white/5 border border-white/8 px-3 py-1.5 rounded-full">
                                {streamData.type.toUpperCase()}
                              </span>
                            </div>

                            {/* Movie title */}
                            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3 tracking-tight">
                              {streamData.movie?.title ?? streamData.imdbId}
                            </h2>

                            {/* Meta chips */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {streamData.movie?.year && (
                                <span className="flex items-center gap-1.5 text-sm text-white/50 bg-white/5 px-3 py-1 rounded-lg border border-white/8">
                                  <Calendar className="w-3 h-3" />{streamData.movie.year}
                                </span>
                              )}
                              {streamData.movie?.rating && parseFloat(streamData.movie.rating) > 0 && (
                                <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-lg border" style={{ color: ACCENT, background: `${ACCENT}15`, borderColor: `${ACCENT}35` }}>
                                  <Star className="w-3 h-3 fill-current" />
                                  {streamData.movie.rating}
                                  <span className="text-white/30 font-normal text-xs">/ 10 IMDb</span>
                                </span>
                              )}
                            </div>

                            {/* Overview */}
                            {streamData.movie?.overview && (
                              <p className="text-sm text-white/40 leading-relaxed line-clamp-4">
                                {streamData.movie.overview}
                              </p>
                            )}
                          </div>

                          {/* CTA */}
                          <button
                            onClick={() => setIsPlaying(true)}
                            className="relative flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-base text-black overflow-hidden group transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                            style={gradientStyle}
                          >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <Play className="w-5 h-5 fill-black relative z-10" />
                            <span className="relative z-10">Watch Now in Cinema Mode</span>
                            <ChevronRight className="w-4 h-4 relative z-10" />
                          </button>
                          {/* Removed auto-selected player text and play buttons per request */}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        )}

        {/* ═══════════════ PLAYER STATE ═══════════════ */}
        {isPlaying && streamData?.imdbId && (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#04040a] flex flex-col pt-16 overflow-x-hidden"
          >
            {/* Cinematic top bar */}
            <div className="px-4 sm:px-6 py-3 sm:py-5 flex items-center gap-3 sm:justify-between border-b border-white/5 min-w-0">
              <button
                onClick={() => setIsPlaying(false)}
                className="flex items-center gap-1.5 sm:gap-2 text-white/50 hover:text-white transition-colors group shrink-0 max-w-[96px] sm:max-w-none"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs sm:text-sm font-medium leading-tight">Back to Search</span>
              </button>

              {streamData.movie && (
                <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none">
                  {streamData.movie.poster && (
                    <div className="relative w-8 h-11 rounded overflow-hidden shrink-0">
                      <Image src={streamData.movie.poster} alt="" fill className="object-cover" sizes="32px" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white leading-tight line-clamp-2 sm:truncate">{streamData.movie.title}</p>
                    <p className="text-xs text-white/35">{streamData.movie.year}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {streamData && (
                  <>
                    <span className="text-xs text-white/40 hidden sm:inline">Player:</span>
                    <button
                      onClick={() => { if (streamData.playerUrl) setSelectedPlayerUrl(streamData.playerUrl); }}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${(!selectedPlayerUrl || selectedPlayerUrl === streamData.playerUrl) ? 'bg-white text-black shadow-lg shadow-white/20 scale-105' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                    >
                      {streamData.playerSource}
                    </button>
                    {alternatePlayerUrl && (
                      <div className="relative">
                        <button
                          onClick={() => { setSelectedPlayerUrl(alternatePlayerUrl); }}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${selectedPlayerUrl === alternatePlayerUrl ? 'bg-white text-black shadow-lg shadow-white/20 scale-105' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'}`}
                        >
                          {streamData.playerSource === "Gemma" ? 'VixSrc' : 'Gemma'}
                        </button>

                        {/* Elegant floating block below */}
                        <AnimatePresence>
                          {showHint && (!selectedPlayerUrl || selectedPlayerUrl === streamData.playerUrl) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -5, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                              className="absolute top-full right-0 mt-3 w-48 bg-[#0D0D15] border border-white/10 rounded-xl shadow-2xl z-50 p-3"
                            >
                              {/* Upward pointing triangle / caret */}
                              <div className="absolute -top-1.5 right-6 w-3 h-3 bg-[#0D0D15] border-l border-t border-white/10 rotate-45 transform" />

                              <div className="relative z-10 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider opacity-90">Having trouble?</span>
                                  </div>
                                  <button onClick={() => setShowHint(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-xs text-white/60 leading-tight">If the stream isn't loading smoothly, try switching to this server.</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Player */}
            <div className="flex-1 flex items-start lg:items-center justify-center px-3 sm:px-4 py-4 sm:py-6">
              <div className="w-full max-w-[1400px]">
                {/* Glow halo behind player */}
                <div className="relative">
                  <div className="absolute -inset-2 sm:-inset-4 rounded-2xl sm:rounded-3xl blur-3xl opacity-20 pointer-events-none"
                    style={gradientStyle} />
                  <div className="relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/8">
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

                {/* Now playing info below player */}
                {streamData.movie && (
                  <div className="mt-5 sm:mt-6 flex items-start gap-3 sm:gap-4 min-w-0">
                    {streamData.movie.poster && (
                      <div className="relative w-16 h-24 sm:w-14 sm:h-20 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/10">
                        <Image src={streamData.movie.poster} alt="" fill className="object-cover" sizes="56px" />
                      </div>
                    )}
                    <div className="flex-1 pt-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Film className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: ACCENT }}>Now Playing</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2 line-clamp-2 break-words">
                        {streamData.movie.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/40 min-w-0">
                        {streamData.movie.year && <span>{streamData.movie.year}</span>}
                        {streamData.movie.rating && parseFloat(streamData.movie.rating) > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {streamData.movie.rating}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-emerald-400 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="truncate">Verified stream · {streamData.provider}</span>
                        </span>
                      </div>
                      {streamData.movie.overview && (
                        <p className="mt-3 text-sm text-white/30 leading-relaxed line-clamp-3 sm:line-clamp-2 max-w-2xl break-words">
                          {streamData.movie.overview}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FEATURES & FAQ (hidden while playing) ── */}
      {!isPlaying && (
        <>
          <section className="py-24 border-t border-white/5" style={{ background: "rgba(255,255,255,0.015)" }}>
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-14">
                <span className="text-xs font-bold uppercase tracking-[0.18em] mb-3 block" style={{ color: ACCENT }}>
                  Why FluxPlays
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Premium Streaming Features</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.features.map((feature, i) => (
                  <div
                    key={i}
                    className="p-7 rounded-2xl border border-white/6 hover:border-white/12 hover:-translate-y-1 transition-all duration-300 cursor-default group"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div className="text-3xl mb-4 p-3.5 rounded-2xl inline-block group-hover:scale-110 transition-transform"
                      style={{ background: `${ACCENT}14` }}>
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-sm text-white mb-2">{feature.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.18em] mb-3 block" style={{ color: ACCENT }}>
                  Simple Process
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How It Works</h2>
              </div>
              <div className="space-y-3">
                {data.steps.map((step, i) => (
                  <div key={i} className="flex gap-5 p-6 rounded-2xl border border-white/6 items-start hover:border-white/12 transition-colors"
                    style={{ background: "rgba(255,255,255,0.025)" }}>
                    <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-black shadow-lg" style={gradientStyle}>
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{step.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="border-t border-white/5">
            <FAQSection
              title="Frequently Asked Questions"
              subtitle="Help Guide"
              description="Learn more about finding and playing streams directly from your browser."
              faqs={data.faqs}
            />
          </div>
        </>
      )}

      {/* ── FOOTER ── */}
      {!isPlaying && (
        <footer className="py-10 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-white/60 hover:text-white transition-colors">
              <Logo className="w-5 h-5" />
              <span className="text-sm">FluxPlays</span>
            </Link>
            <div className="flex gap-5 text-xs text-white/30">
              <Link href="/" className="hover:text-white/70 transition-colors">Main Player</Link>
              <Link href="/community-sites" className="hover:text-white/70 transition-colors">Community</Link>
              <Link href="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
              <Link href="/cookie-notice" className="hover:text-white/70 transition-colors">Cookie Notice</Link>
            </div>
            <p className="text-xs text-white/20">© 2026 FluxPlays.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
