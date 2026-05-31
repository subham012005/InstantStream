"use client";

import Link from "next/link";
import { Code2, MessageCircle, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[var(--bg-surface)] border-t border-[var(--border)] pt-[64px] pb-[32px]">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Top Row - Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-[64px]">
          
          {/* Brand Column */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-1 font-[family-name:var(--font-sora)] font-bold text-lg tracking-tight mb-4">
              <span className="text-[var(--accent)] text-[10px] mr-0.5">●</span>
              <span className="text-[var(--text-primary)]">Flux</span>
              <span className="text-[var(--accent)]">Plays</span>
            </Link>
            <p className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)] mb-6 max-w-[240px]">
              The ultimate browser video utility
            </p>
            <div className="flex items-center gap-[16px]">
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="GitHub">
                <Code2 size={24} />
              </a>
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Twitter">
                <MessageCircle size={24} />
              </a>
              <a href="mailto:contact@fluxplays.live" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Email">
                <Mail size={24} />
              </a>
            </div>
          </div>

          {/* Players Column */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-[family-name:var(--font-jetbrains-mono)] text-[var(--text-muted)] tracking-[0.08em] uppercase mb-4">Players</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/watch-mp4-online-player" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">MP4 Player</Link>
              <Link href="/hls-m3u8-stream-player" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">HLS Player</Link>
              <Link href="/google-drive-video-player" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Drive Player</Link>
              <Link href="/telegram-video-player" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Telegram Player</Link>
            </div>
          </div>

          {/* Tools Column */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-[family-name:var(--font-jetbrains-mono)] text-[var(--text-muted)] tracking-[0.08em] uppercase mb-4">Tools</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/play-direct-video-links" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Paste & Play</Link>
              <Link href="/imdb-movie-stream-player" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">IMDb Player</Link>
              <Link href="/tools/imdb-tmdb-converter" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">TMDB Converter</Link>
              <Link href="/hls-m3u8-stream-player" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">HLS Player</Link>
              <Link href="/tools" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">More tools...</Link>
            </div>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-[family-name:var(--font-jetbrains-mono)] text-[var(--text-muted)] tracking-[0.08em] uppercase mb-4">Resources</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/blog" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Blog</Link>
              <Link href="/guides" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Guides</Link>
              <Link href="#" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Developer API</Link>
              <Link href="/community-sites" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Link Directory</Link>
            </div>
          </div>

          {/* Company Column */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-[family-name:var(--font-jetbrains-mono)] text-[var(--text-muted)] tracking-[0.08em] uppercase mb-4">Company</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/about" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">About</Link>
              <Link href="/contact" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Contact</Link>
              <Link href="/newsletter" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Newsletter</Link>
              <Link href="/branding" className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-[2.2]">Press & Assets</Link>
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="pt-[24px] border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[13px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)]">
            © 2026 FluxPlays · All rights reserved
          </div>
          <div className="flex items-center gap-4 text-[13px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/cookie-notice" className="hover:text-[var(--text-primary)] transition-colors">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
