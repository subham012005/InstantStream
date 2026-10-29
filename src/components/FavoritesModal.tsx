"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, X, Play, Trash2, Film, Star } from "lucide-react";
import { getFavorites, removeFavorite, FavoriteItem } from "@/lib/player/favorites";

export default function FavoritesModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const load = () => {
    setFavorites(getFavorites());
  };

  useEffect(() => {
    load();
    const handleUpdate = () => load();
    window.addEventListener("instantstream_favorites_updated", handleUpdate);
    return () => window.removeEventListener("instantstream_favorites_updated", handleUpdate);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#f5c518]" />
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-lg text-[var(--text-primary)]">
              My Saved Favorites
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[var(--text-muted)] font-mono">
              {favorites.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {favorites.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-2">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="font-bold text-white text-base">No favorites saved yet</p>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                Bookmark movies and TV series while exploring to access them anytime here without an account.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((fav) => {
                const playHref = `/imdb-movie-stream-player?id=${encodeURIComponent(fav.id)}`;

                return (
                  <div
                    key={fav.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all group"
                  >
                    <div className="relative w-14 h-20 rounded-lg overflow-hidden shrink-0 bg-black/40">
                      {fav.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fav.poster}
                          alt={fav.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Film className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <Link
                        href={playHref}
                        onClick={onClose}
                        className="font-[family-name:var(--font-sora)] font-bold text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors truncate block"
                      >
                        {fav.title}
                      </Link>

                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                        {fav.year && <span>{fav.year}</span>}
                        {fav.rating && (
                          <span className="flex items-center gap-1 text-[#f5c518]">
                            <Star className="w-3 h-3 fill-current" />
                            {fav.rating}
                          </span>
                        )}
                        <span className="capitalize">{fav.type || "Movie"}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Link
                          href={playHref}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1 rounded-md transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Stream</span>
                        </Link>
                        <button
                          onClick={() => removeFavorite(fav.id)}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
