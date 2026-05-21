"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Search, ArrowRight, TrendingUp, BookOpen, GitCompare } from "lucide-react";
import { allArticles } from "@/app/blog/articles";
import { trendingData } from "@/app/trending/trendingData";
import { comparisonData } from "@/app/compare/comparisonData";

// noindex is set in the metadata export below — but since this is "use client",
// we handle it via a server wrapper. We put the Head meta noindex via next/head.
// In App Router, a separate metadata.ts in the same folder handles this.

interface SearchResult {
  title: string;
  description: string;
  href: string;
  badge: string;
}

const ALL_CONTENT: SearchResult[] = [
  ...allArticles.map((a) => ({
    title: a.title,
    description: a.intro.slice(0, 120) + "…",
    href: `/blog/${a.slug}`,
    badge: a.tag,
  })),
  ...trendingData.map((t) => ({
    title: t.title,
    description: t.intro.slice(0, 120) + "…",
    href: `/trending/${t.slug}`,
    badge: "Trending",
  })),
  ...comparisonData.map((c) => ({
    title: c.title,
    description: c.intro.slice(0, 120) + "…",
    href: `/compare/${c.slug}`,
    badge: "Comparison",
  })),
];

const POPULAR_SEARCHES = [
  { label: "HLS Streaming", href: "/blog/best-hls-streaming-tools" },
  { label: "Netflix Alternatives", href: "/trending/netflix-alternatives" },
  { label: "React Video Player", href: "/blog/best-react-streaming-apps" },
  { label: "FluxPlays vs Plex", href: "/compare/fluxplays-vs-plex" },
  { label: "Free Streaming Platforms", href: "/trending/free-streaming-platforms" },
  { label: "Open Source Streaming", href: "/blog/best-open-source-streaming-platforms" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_CONTENT.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query]);

  return (
    <>
      <header className="border-b border-black/5 dark:border-white/5 py-5 px-6 md:px-16">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-display-lg text-headline-md tracking-tighter text-on-surface hover:text-primary transition-colors">
            <Logo className="w-8 h-8" />
            <span>FluxPlays</span>
          </Link>
          <Link href="/" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
            Start Streaming
          </Link>
        </div>
      </header>

      <main className="px-6 py-16 max-w-[800px] mx-auto">
        <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-3">
          Search FluxPlays Content
        </h1>
        <p className="text-on-surface-variant mb-8">
          Find guides, comparisons, trending pages, and streaming articles.
        </p>

        {/* Search Input */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, comparisons, trending topics…"
            className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,112,243,0.1)] transition-all"
          />
        </div>

        {/* Results */}
        {query.trim() && (
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </h2>
            {results.length === 0 ? (
              <p className="text-on-surface-variant glass-panel p-6 rounded-xl border border-black/5">
                No results found. Try a different search term or browse the categories below.
              </p>
            ) : (
              <div className="space-y-3">
                {results.map((r, i) => (
                  <Link
                    key={i}
                    href={r.href}
                    className="flex items-start justify-between gap-4 glass-panel p-5 rounded-xl border border-black/5 hover:border-primary/20 transition-all group"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">{r.badge}</span>
                      <p className="font-semibold text-on-surface text-sm group-hover:text-primary transition-colors mb-1">{r.title}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{r.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 text-on-surface-variant group-hover:text-primary transition-colors mt-1" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Popular Searches */}
        {!query.trim() && (
          <>
            <section className="mb-12">
              <h2 className="font-headline-md text-on-surface mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Popular Searches
              </h2>
              <div className="flex flex-wrap gap-3">
                {POPULAR_SEARCHES.map((s, i) => (
                  <Link
                    key={i}
                    href={s.href}
                    className="px-4 py-2 glass-panel rounded-full border border-black/5 hover:border-primary/30 text-sm text-on-surface hover:text-primary transition-all"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Link href="/blog" className="glass-panel p-6 rounded-xl border border-black/5 hover:border-primary/20 transition-all group">
                <BookOpen className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors mb-1">Blog & Articles</h3>
                <p className="text-xs text-on-surface-variant">Browse all streaming guides and tutorials.</p>
              </Link>
              <Link href="/trending/netflix-alternatives" className="glass-panel p-6 rounded-xl border border-black/5 hover:border-primary/20 transition-all group">
                <TrendingUp className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors mb-1">Trending Topics</h3>
                <p className="text-xs text-on-surface-variant">Discover what the streaming community is reading.</p>
              </Link>
              <Link href="/compare/fluxplays-vs-netflix" className="glass-panel p-6 rounded-xl border border-black/5 hover:border-primary/20 transition-all group">
                <GitCompare className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors mb-1">Comparisons</h3>
                <p className="text-xs text-on-surface-variant">FluxPlays vs Netflix, Plex, Jellyfin, and more.</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
