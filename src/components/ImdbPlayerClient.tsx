"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
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
} from "lucide-react";
import FAQSection from "@/components/FAQSection";
import Logo from "@/components/Logo";
import type { LandingPageData } from "@/app/landingPagesData";

const CustomPlayer = dynamic(() => import("@/components/CustomPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[40vh] flex items-center justify-center text-white/60 gap-3">
      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <span className="text-sm font-medium">Initializing player…</span>
    </div>
  ),
});

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
  error?: string;
}

const EXAMPLES = ["tt0111161", "tt0468569", "tt1375666", "tt0110912"];

export default function ImdbPlayerClient({ data }: { data: LandingPageData }) {
  const [imdbId, setImdbId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamData, setStreamData] = useState<StreamResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidId = /^tt\d{7,8}$/.test(imdbId.trim());

  const handleSearch = async (id = imdbId.trim()) => {
    if (!id) { setError("Please enter an IMDb ID."); triggerShake(); return; }
    if (!/^tt\d{7,8}$/.test(id)) {
      setError("Invalid format. Use 'tt' followed by 7–8 digits, e.g. tt0111161");
      triggerShake(); return;
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
      } else {
        setStreamData(json);
      }
    } catch {
      setError("Failed to connect to the server. Please try again.");
      triggerShake();
    } finally { setLoading(false); }
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const ACCENT = data.accentColor || "#f5c518";
  const SECONDARY = data.secondaryColor || "#e67e22";
  const gradientStyle = { background: `linear-gradient(135deg, ${ACCENT}, ${SECONDARY})` };
  const gradientText = {
    background: `linear-gradient(135deg, ${ACCENT} 0%, ${SECONDARY} 100%)`,
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  };

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
                className="text-base md:text-lg text-white/45 max-w-lg mx-auto mb-10 leading-relaxed"
              >
                Paste any IMDb ID and instantly stream the movie in high quality — no sign-up, no downloads.
              </motion.p>

              {/* Search box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
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
                {streamData?.url && (
                  <motion.div
                    key="result-card"
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-8 w-full rounded-3xl overflow-hidden border border-white/8 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)" }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Poster */}
                      {streamData.movie?.poster ? (
                        <div className="relative w-full sm:w-[160px] shrink-0 aspect-[2/3] sm:aspect-auto overflow-hidden">
                          <Image
                            src={streamData.movie.poster}
                            alt={streamData.movie.title ?? "poster"}
                            fill
                            className="object-cover"
                            sizes="160px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 sm:block hidden" />
                        </div>
                      ) : (
                        <div className="w-full sm:w-[160px] shrink-0 aspect-[2/3] sm:aspect-auto flex items-center justify-center bg-white/5">
                          <Clapperboard className="w-10 h-10 text-white/20" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 p-7 flex flex-col justify-between gap-6 text-left">
                        <div>
                          {/* Ready badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Stream Ready
                            </span>
                            <span className="text-xs text-white/30 font-mono flex items-center gap-1">
                              <Tv2 className="w-3 h-3" />
                              {streamData.type.toUpperCase()} · {streamData.provider}
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-2xl font-black text-white leading-tight mb-2">
                            {streamData.movie?.title ?? streamData.imdbId}
                          </h2>

                          {/* Meta row */}
                          <div className="flex flex-wrap gap-4 text-sm text-white/40 mb-4">
                            {streamData.movie?.year && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />{streamData.movie.year}
                              </span>
                            )}
                            {streamData.movie?.rating && parseFloat(streamData.movie.rating) > 0 && (
                              <span className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-white/70 font-semibold">{streamData.movie.rating}</span>
                                <span className="text-white/30">/10</span>
                              </span>
                            )}
                          </div>

                          {/* Overview */}
                          {streamData.movie?.overview && (
                            <p className="text-sm text-white/40 leading-relaxed line-clamp-3">
                              {streamData.movie.overview}
                            </p>
                          )}
                        </div>

                        {/* CTA */}
                        <button
                          onClick={() => setIsPlaying(true)}
                          className="relative flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-base text-black overflow-hidden group transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                          style={gradientStyle}
                        >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                          <Play className="w-5 h-5 fill-black relative z-10" />
                          <span className="relative z-10">Watch Now</span>
                          <ChevronRight className="w-4 h-4 relative z-10" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        )}

        {/* ═══════════════ PLAYER STATE ═══════════════ */}
        {isPlaying && streamData?.url && (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#04040a] flex flex-col pt-16"
          >
            {/* Cinematic top bar */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
              <button
                onClick={() => setIsPlaying(false)}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Search</span>
              </button>

              {streamData.movie && (
                <div className="flex items-center gap-3">
                  {streamData.movie.poster && (
                    <div className="relative w-8 h-11 rounded overflow-hidden shrink-0">
                      <Image src={streamData.movie.poster} alt="" fill className="object-cover" sizes="32px" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{streamData.movie.title}</p>
                    <p className="text-xs text-white/35">{streamData.movie.year}</p>
                  </div>
                </div>
              )}

              <div className="w-24"></div>
            </div>

            {/* Player */}
            <div className="flex-1 flex items-center justify-center px-4 py-6">
              <div className="w-full max-w-[1400px]">
                {/* Glow halo behind player */}
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-20 pointer-events-none"
                    style={gradientStyle} />
                  <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)] border border-white/8">
                    <CustomPlayer src={streamData.url} />
                  </div>
                </div>

                {/* Now playing info below player */}
                {streamData.movie && (
                  <div className="mt-6 flex items-start gap-4">
                    {streamData.movie.poster && (
                      <div className="relative w-14 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/10">
                        <Image src={streamData.movie.poster} alt="" fill className="object-cover" sizes="56px" />
                      </div>
                    )}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Film className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: ACCENT }}>Now Playing</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">
                        {streamData.movie.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
                        {streamData.movie.year && <span>{streamData.movie.year}</span>}
                        {streamData.movie.rating && parseFloat(streamData.movie.rating) > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {streamData.movie.rating}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified stream · {streamData.provider}
                        </span>
                      </div>
                      {streamData.movie.overview && (
                        <p className="mt-3 text-sm text-white/30 leading-relaxed line-clamp-2 max-w-2xl">
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
              <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            </div>
            <p className="text-xs text-white/20">© 2026 FluxPlays.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
