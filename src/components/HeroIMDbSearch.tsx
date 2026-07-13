"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles, X, Film } from "lucide-react";

export default function HeroIMDbSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
      return;
    }
    router.push(`/movie-search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Label */}
      <p className="text-[14px] text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--accent)] animate-pulse" />
        Search and stream — no account needed
      </p>

      {/* Search bar */}
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[700px]"
      >
        <div
          className={`relative flex items-center rounded-[18px] border transition-all duration-300 overflow-hidden bg-[var(--bg-surface)] ${
            focused
              ? "border-[var(--accent)]/60 shadow-[0_0_0_4px_rgba(230,59,46,0.1),0_12px_40px_rgba(230,59,46,0.12)]"
              : "border-[var(--border)] shadow-[0_6px_30px_rgba(0,0,0,0.4)]"
          }`}
        >
          {/* Left icon */}
          <div className="pl-5 pr-3 flex items-center shrink-0">
            <Search
              className={`w-5.5 h-5.5 transition-colors duration-200 ${
                focused ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              }`}
            />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search movies, TV shows by title or keyword..."
            className="flex-1 bg-transparent border-none outline-none shadow-none ring-0 py-[18px] font-[family-name:var(--font-dm-sans)] text-[17px] text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 min-w-0"
            style={{ border: "none", background: "transparent", boxShadow: "none" }}
            aria-label="Search movies"
            id="hero-movie-search"
            autoComplete="off"
            spellCheck={false}
          />

          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="p-2 mr-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--bg-elevated)]"
                tabIndex={-1}
                aria-label="Clear"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            className="shrink-0 m-2 px-7 py-3.5 rounded-[12px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 text-white font-[family-name:var(--font-sora)] font-bold text-[15px] transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer"
            aria-label="Search movies"
          >
            Search
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

    </div>
  );
}
