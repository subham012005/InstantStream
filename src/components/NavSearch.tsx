"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowRight } from "lucide-react";
import Papa from "papaparse";
import { ALL_CONTENT } from "@/app/search/searchData";
import type { SearchResult } from "@/app/search/searchData";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqA_1gGSS0BIZyVNHMGWjr8KfKV82-KA9SzlB0P3IiRCcpAF6Ccmkfldk7uDfUldYpJDVYbHwPY0Hc/pub?gid=1151837083&single=true&output=csv";

interface SiteResult {
  title: string;
  description: string;
  href: string;
  badge: "Community Site";
}

export function NavSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [staticIndex, setStaticIndex] = useState<SearchResult[] | null>(null);
  const [sitesIndex, setSitesIndex] = useState<SiteResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search indexes lazily when the search bar is interacted with
  const loadIndexes = async () => {
    if (staticIndex || loading) return;
    setLoading(true);
    try {
      // 1. Set static index immediately
      setStaticIndex(ALL_CONTENT);

      // 2. Load Community Sites CSV
      const res = await fetch(CSV_URL);
      if (res.ok) {
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const sites: SiteResult[] = parsed.data
          .filter((row: any) => {
            const approved = row.Approved?.toLowerCase().trim();
            return approved === "yes" || approved === "true" || approved === "1";
          })
          .map((row: any) => {
            let url = row["Site URL"] || "";
            if (url && !url.startsWith("http")) url = "https://" + url;
            return {
              title: row["Site Name"] || "Unknown Site",
              description: row["Description"] || "No description provided.",
              href: url,
              badge: "Community Site",
            };
          });
        setSitesIndex(sites);
      }
    } catch (e) {
      console.error("Failed to load search indexes", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    loadIndexes();
  };

  // Compute merged & filtered results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    // Fallback empty arrays if not loaded yet
    const baseContent = staticIndex || [];
    const baseSites = sitesIndex || [];
    
    // Combine everything into one giant searchable array
    const allSearchable = [...baseContent, ...baseSites];
    
    const q = query.toLowerCase();
    
    return allSearchable
      .filter((item) =>
        (item.title || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.badge || "").toLowerCase().includes(q)
      )
      .slice(0, 8); // Top 8 results to keep dropdown clean
  }, [query, staticIndex, sitesIndex]);

  return (
    <div className="relative z-[100]" ref={containerRef}>
      {/* Search Input Button */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors pointer-events-none" />
        <input
          type="text"
          placeholder="Search blogs, guides, sites..."
          onFocus={handleFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-surface-container/50 border border-black/10 dark:border-white/10 text-on-surface placeholder:text-on-surface-variant/60 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:bg-surface-container transition-all w-64 md:w-80"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant animate-spin pointer-events-none" />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 w-screen max-w-[400px] bg-surface-container border border-black/10 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[400px] overflow-y-auto overscroll-contain">
            {results.length > 0 ? (
              <div className="p-2 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Top Results
                </div>
                {results.map((r, i) => {
                  const isExternal = r.badge === "Community Site";
                  return (
                    <Link
                      key={i}
                      href={r.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-surface border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-all group"
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${
                            r.badge === 'Community Site' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                          }`}>
                            {r.badge}
                          </span>
                        </div>
                        <p className="font-medium text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                          {r.title}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {r.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 shrink-0 text-on-surface-variant opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all mt-1" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-on-surface-variant">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>
          
          <div className="bg-surface p-3 border-t border-black/5 dark:border-white/5 text-center flex items-center justify-center gap-2">
            <span className="text-xs text-on-surface-variant">Searching across Guides, Blogs, and {sitesIndex ? sitesIndex.length : '...'} Community Sites</span>
          </div>
        </div>
      )}
    </div>
  );
}
