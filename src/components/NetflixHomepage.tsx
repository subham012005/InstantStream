"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Info, Search, Bell, ChevronDown,
  Loader2, AlertCircle, X, ChevronRight, Plus,
  ThumbsUp, ThumbsDown
} from "lucide-react";
import {
  getCatalogProvider,
  type CatalogHomepage,
  type CatalogItem,
  type CatalogRow,
  type RowVariant,
} from "@/lib/catalog";

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
interface NetflixHomepageProps {
  onSelectMovie: (id: string) => void;
  metaLoading: boolean;
  metaError: string;
}

/* ─────────────────────────────────────────────
   Continue-Watching (localStorage)
───────────────────────────────────────────── */
const CW_KEY = "netmirror:continueWatching";

function getContinueWatching(): CatalogItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CW_KEY) || "[]");
  } catch {
    return [];
  }
}

export function recordContinueWatching(item: CatalogItem): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getContinueWatching().filter((i) => i.id !== item.id);
    localStorage.setItem(CW_KEY, JSON.stringify([item, ...existing].slice(0, 12)));
  } catch {/* silent */}
}

/* ─────────────────────────────────────────────
   Skeleton card
───────────────────────────────────────────── */
function SkeletonCard({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`flex-none ${wide ? "w-[260px] md:w-[320px] aspect-video" : "w-[130px] sm:w-[180px] md:w-[220px] aspect-[2/3]"} rounded-md bg-[#2a2a2a] animate-pulse snap-start`} />
  );
}

/* ─────────────────────────────────────────────
   Hover card overlay
───────────────────────────────────────────── */
function HoverCard({ item, onSelect }: { item: CatalogItem; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute z-40 left-1/2 -translate-x-1/2 bottom-[calc(100%+6px)] w-[260px] bg-[#181818] rounded-md shadow-2xl overflow-hidden border border-white/10"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Preview thumbnail */}
      <div className="relative w-full aspect-video bg-[#222]">
        <img src={item.backdropUrl || item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#181818] to-transparent" />
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onSelect}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-white/90 transition"
          >
            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full border border-white/40 hover:border-white transition">
            <Plus className="w-4 h-4 text-white" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full border border-white/40 hover:border-white transition">
            <ThumbsUp className="w-4 h-4 text-white" />
          </button>
          <button className="ml-auto w-9 h-9 flex items-center justify-center rounded-full border border-white/40 hover:border-white transition">
            <ChevronDown className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
          {item.matchScore && <span className="text-[#46d369]">{item.matchScore}</span>}
          {item.rating && (
            <span className="border border-white/40 px-1 rounded-sm text-white/60">
              {item.rating}
            </span>
          )}
          {item.duration && <span className="text-white/70">{item.duration}</span>}
        </div>

        {item.categories && item.categories.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {item.categories.slice(0, 3).map((c, i) => (
              <span key={c} className="text-white/50 text-[10px]">
                {c}{i < Math.min(item.categories!.length, 3) - 1 ? " •" : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Poster Card
───────────────────────────────────────────── */
function PosterCard({ item, variant = "default", onSelectMovie }: {
  item: CatalogItem;
  variant?: RowVariant;
  onSelectMovie: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setHovered(true), 500);
  };
  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(false);
  };

  const isTop10 = variant === "top10" && item.rank != null;
  const isLandscape = variant === "landscape" || variant === "continue";

  const handleCardClick = async () => {
    if (item.id) {
      onSelectMovie(item.id);
      return;
    }
    
    // Attempt to resolve missing ID
    setIsResolving(true);
    try {
      const res = await fetch(`/api/netflix/resolve?title=${encodeURIComponent(item.title)}&type=${item.isSeries ? 'series' : 'movie'}`);
      const data = await res.json();
      if (data.netflixId) {
        onSelectMovie(data.netflixId);
      } else {
        alert(data.reason || "Could not find Netflix ID for this title.");
      }
    } catch (err) {
      alert("Error resolving Netflix ID.");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div
      className="relative flex-none snap-start"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: hovered ? 30 : "auto" }}
    >
      <motion.div
        whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
        onClick={isResolving ? undefined : handleCardClick}
        className={`relative cursor-pointer rounded-md overflow-hidden bg-[#222] shadow-lg
          ${isLandscape
            ? "w-[220px] sm:w-[280px] md:w-[320px] aspect-video"
            : "w-[130px] sm:w-[160px] md:w-[200px] aspect-[2/3]"
          }
          ${isTop10 ? "w-[110px] sm:w-[150px] md:w-[190px]" : ""}
        `}
      >
        {item.posterUrl && !item.posterUrl.includes("placeholder") ? (
          <img
            src={isLandscape ? (item.backdropUrl || item.posterUrl) : item.posterUrl}
            alt={item.title}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#111] flex items-end p-3">
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">No Poster</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Top-10 rank number */}
        {isTop10 && (
          <div
            className="absolute -left-3 bottom-1 font-black leading-none select-none"
            style={{
              fontSize: "clamp(4rem, 10vw, 7rem)",
              WebkitTextStroke: "2px #555",
              color: "#141414",
            }}
          >
            {item.rank}
          </div>
        )}

        {/* Play icon / Loading icon on hover */}
        <AnimatePresence>
          {hovered && !isResolving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                <Play className="w-5 h-5 fill-black text-black ml-0.5" />
              </div>
            </motion.div>
          )}
          {isResolving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[#E50914] animate-spin" />
                <span className="text-[10px] font-bold text-white/80">Finding source...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-xs font-bold leading-snug drop-shadow truncate">{item.title}</p>
        </div>
      </motion.div>

      {/* Expanded hover card */}
      <AnimatePresence>
        {hovered && !isResolving && (
          <HoverCard item={item} onSelect={handleCardClick} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Catalog Row
───────────────────────────────────────────── */
function CatalogRowView({
  row,
  onSelectMovie,
}: {
  row: CatalogRow;
  onSelectMovie: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir * scrollRef.current.clientWidth * 0.75,
        behavior: "smooth",
      });
    }
  };

  if (row.isLoading) {
    return (
      <div className="group relative">
        <div className="h-5 w-40 bg-[#2a2a2a] animate-pulse rounded mb-4" />
        <div className="flex gap-2 overflow-hidden py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} wide={row.variant === "landscape"} />
          ))}
        </div>
      </div>
    );
  }

  if (!row.items.length) return null;

  return (
    <div className="group relative">
      <h2 className="text-white text-base md:text-lg font-bold mb-2 px-2 flex items-center gap-1.5 cursor-pointer hover:text-[#46d369] transition-colors select-none">
        {row.title}
        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-[#46d369] transition" />
      </h2>

      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-0 z-20 w-10 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 rounded-l-md"
        >
          <ChevronRight className="w-5 h-5 text-white rotate-180" />
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-1.5 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth py-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        >
          {row.items.map((item, index) => (
            <PosterCard
              key={item.id || `item-${index}-${item.title}`}
              item={item}
              variant={row.variant}
              onSelectMovie={onSelectMovie}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 z-20 w-10 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 rounded-r-md"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Search overlay
───────────────────────────────────────────── */
function SearchOverlay({
  onSelectMovie,
  onClose,
}: {
  onSelectMovie: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const provider = getCatalogProvider();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await provider.search(query);
      setResults(res.items);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    // If the user types a raw numeric ID, treat Enter as direct loadMeta
    if (e.key === "Enter" && /^\d{6,10}$/.test(query.trim())) {
      onSelectMovie(query.trim());
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col pt-20 px-4 md:px-12"
    >
      {/* Search bar */}
      <div className="flex items-center gap-3 border-b border-white/20 pb-3 mb-8 max-w-3xl mx-auto w-full">
        <Search className="w-5 h-5 text-white/50 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Titles, people, genres, or Netflix ID…"
          className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/30"
        />
        {loading && <Loader2 className="w-4 h-4 text-white/40 animate-spin" />}
        <button onClick={onClose} className="text-white/50 hover:text-white transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Results grid */}
      <div className="max-w-3xl mx-auto w-full overflow-y-auto flex-1">
        {results.length === 0 && query.trim() && !loading && (
          <p className="text-white/40 text-sm text-center mt-16">
            No results found for <span className="text-white">"{query}"</span>.
            {/^\d{6,10}$/.test(query.trim()) && (
              <span className="block mt-2 text-white/60">
                Looks like a Netflix ID — press <kbd className="border border-white/30 px-1 rounded text-xs">Enter</kbd> to load it directly.
              </span>
            )}
          </p>
        )}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {results.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                onSelectMovie={(id) => { onSelectMovie(id); onClose(); }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function NetflixHomepage({
  onSelectMovie,
  metaLoading,
  metaError,
}: NetflixHomepageProps) {
  const [catalog, setCatalog] = useState<CatalogHomepage | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [continueWatching, setContinueWatching] = useState<CatalogItem[]>([]);

  /* scroll listener */
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* load catalog via provider */
  useEffect(() => {
    let alive = true;
    getCatalogProvider()
      .getHomepage()
      .then((data) => { if (alive) setCatalog(data); });
    return () => { alive = false; };
  }, []);

  /* continue watching */
  useEffect(() => {
    setContinueWatching(getContinueWatching());
  }, []);

  /* keyboard shortcut to open search */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "/" && !searchOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [searchOpen]);

  const handleSelectMovie = useCallback(
    (id: string) => {
      // Record to continue watching
      const item =
        catalog?.hero.id === id
          ? catalog.hero
          : catalog?.rows.flatMap((r) => r.items).find((i) => i.id === id);
      if (item) recordContinueWatching(item);
      onSelectMovie(id);
    },
    [catalog, onSelectMovie]
  );

  /* Loading state */
  if (!catalog) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[#E50914] font-black text-3xl tracking-tight" style={{ fontFamily: "var(--font-sora, sans-serif)" }}>
            NETMIRROR
          </span>
          <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
        </div>
      </div>
    );
  }

  /* build rows — prepend Continue Watching if available */
  const allRows: CatalogRow[] = [
    ...(continueWatching.length > 0
      ? [{ title: "Continue Watching", items: continueWatching, variant: "landscape" as RowVariant }]
      : []),
    ...catalog.rows,
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden pb-24 select-none">
      {/* ── Search overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            onSelectMovie={handleSelectMovie}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 flex items-center justify-between px-4 md:px-14 py-3 md:py-4 ${
          isScrolled ? "bg-[#141414] shadow-lg" : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        <div className="flex items-center gap-6 md:gap-10">
          {/* Logo */}
          <span
            className="text-[#E50914] font-black text-xl md:text-2xl tracking-tight cursor-pointer"
            style={{ fontFamily: "var(--font-sora, sans-serif)" }}
          >
            NETMIRROR
          </span>
          {/* Nav links */}
          <div className="hidden md:flex items-center gap-5 text-sm">
            {["Home", "TV Shows", "Movies", "New & Popular", "My List"].map((label) => (
              <span
                key={label}
                className={`cursor-pointer transition-colors ${
                  label === "Home" ? "font-bold text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-5">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="text-white/80 hover:text-white transition"
            title="Search (press /)"
          >
            <Search className="w-5 h-5" />
          </button>
          <span className="hidden sm:block text-white/60 hover:text-white text-sm cursor-pointer transition">Kids</span>
          <Bell className="w-5 h-5 text-white/70 hover:text-white cursor-pointer transition hidden sm:block" />
          {/* Avatar */}
          <div className="flex items-center gap-1.5 cursor-pointer group">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#E50914] to-amber-500 flex items-center justify-center text-white text-xs font-black">
              N
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-transform duration-300 group-hover:rotate-180" />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative w-full h-[80vh] lg:h-[90vh] bg-black overflow-hidden flex items-end md:items-center">
        {/* Backdrop */}
        <div className="absolute inset-0">
          <img
            src={catalog.hero.backdropUrl || catalog.hero.posterUrl}
            alt={catalog.hero.title}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/10 to-transparent" />
        </div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 px-4 md:px-14 w-full max-w-2xl mb-16 md:mb-0 mt-16"
        >
          {/* N Series badge */}
          {catalog.hero.isSeries && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-[#E50914] rounded-sm flex items-center justify-center font-black text-[11px] text-white">N</div>
              <span className="text-white/60 tracking-[0.2em] text-xs font-semibold uppercase">Series</span>
            </div>
          )}

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 drop-shadow-2xl leading-tight"
            style={{ fontFamily: "var(--font-sora, sans-serif)" }}
          >
            {catalog.hero.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-5 text-sm font-semibold">
            {catalog.hero.matchScore && (
              <span className="text-[#46d369]">{catalog.hero.matchScore}</span>
            )}
            {catalog.hero.year && <span className="text-white/80">{catalog.hero.year}</span>}
            {catalog.hero.rating && (
              <span className="border border-white/30 px-1.5 py-0.5 rounded-sm text-xs text-white/70">
                {catalog.hero.rating}
              </span>
            )}
            {catalog.hero.duration && (
              <span className="text-white/60">{catalog.hero.duration}</span>
            )}
          </div>

          {catalog.hero.description && (
            <p className="text-white/80 text-sm md:text-base max-w-xl leading-relaxed mb-7 drop-shadow line-clamp-3">
              {catalog.hero.description}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSelectMovie(catalog.hero.id)}
              disabled={metaLoading}
              className="flex items-center justify-center gap-2 bg-white hover:bg-white/85 text-black font-bold px-7 py-2.5 rounded-md text-sm md:text-base transition disabled:opacity-50"
            >
              {metaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-black" />}
              Play
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/25 hover:bg-white/15 text-white font-bold px-7 py-2.5 rounded-md text-sm md:text-base backdrop-blur-sm transition border border-white/10">
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </motion.div>

        {/* Age rating stamp */}
        {catalog.hero.rating && (
          <div className="absolute right-0 bottom-24 md:bottom-16 border-l-2 border-white/40 bg-black/50 px-4 py-1.5 text-xs font-bold text-white/70 tracking-widest hidden md:block">
            {catalog.hero.rating}
          </div>
        )}
      </div>

      {/* ── Error toast ── */}
      <AnimatePresence>
        {metaError && (
          <motion.div
            initial={{ opacity: 0, y: 60, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 60, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 bg-[#E50914] text-white px-6 py-3 rounded-xl shadow-2xl font-medium text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {metaError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rows ── */}
      <div className="relative z-10 -mt-24 md:-mt-32 px-4 md:px-14 flex flex-col gap-10">
        {allRows.map((row, i) => (
          <CatalogRowView key={`${row.title}-${i}`} row={row} onSelectMovie={handleSelectMovie} />
        ))}
      </div>

      {/* ── Footer hint ── */}
      <p className="text-center text-white/20 text-xs mt-16 px-4">
        Press <kbd className="border border-white/20 rounded px-1">/</kbd> to search · All content loads via existing playback API · No backend changes
      </p>
    </div>
  );
}
