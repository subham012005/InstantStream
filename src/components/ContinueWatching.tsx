"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, X, Clock, Film } from "lucide-react";
import { getWatchHistory, removeWatchHistory, WatchHistoryItem } from "@/lib/player/history";

export default function ContinueWatching() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadHistory = () => {
    setHistory(getWatchHistory());
  };

  useEffect(() => {
    setMounted(true);
    loadHistory();

    const handleUpdate = () => loadHistory();
    window.addEventListener("instantstream_history_updated", handleUpdate);
    return () => window.removeEventListener("instantstream_history_updated", handleUpdate);
  }, []);

  if (!mounted || history.length === 0) return null;

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="font-[family-name:var(--font-sora)] font-bold text-lg md:text-xl text-[var(--text-primary)]">
            Continue Watching
          </h2>
        </div>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {history.length} title{history.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.slice(0, 5).map((item) => {
          const isUrl = item.id.startsWith("http");
          const playHref = isUrl
            ? `/play-direct-video-links`
            : `/imdb-movie-stream-player?id=${encodeURIComponent(item.id)}`;

          return (
            <div
              key={`${item.id}-${item.season || 0}-${item.episode || 0}`}
              className="group relative flex flex-col rounded-xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Poster Container */}
              <div className="relative aspect-[16/10] bg-[var(--bg-elevated)] overflow-hidden">
                {item.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Film className="w-8 h-8 text-white/20" />
                  </div>
                )}

                {/* Progress bar at bottom of thumbnail */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${Math.max(5, item.percent || 10)}%` }}
                  />
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeWatchHistory(item.id, item.season, item.episode);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Remove from history"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Center Play Overlay */}
                <Link
                  href={playHref}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)]/90 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                  </div>
                </Link>
              </div>

              {/* Title & Info */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <Link href={playHref}>
                  <h3 className="font-[family-name:var(--font-sora)] font-bold text-xs md:text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {item.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-1.5 font-mono">
                  {item.season && item.episode ? (
                    <span>
                      S{item.season} · E{item.episode}
                    </span>
                  ) : (
                    <span>{item.percent > 0 ? `${item.percent}% watched` : "Recently started"}</span>
                  )}
                  <Link
                    href={playHref}
                    className="text-[var(--accent)] hover:underline font-bold"
                  >
                    Resume
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
