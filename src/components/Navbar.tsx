"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

const FeedbackModal = dynamic(
  () => import("@/components/FeedbackModal").then((m) => ({ default: m.FeedbackModal })),
  { ssr: false }
);

export function Navbar() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-[32px] border-b border-black/5 dark:border-white/5">
        <div className="flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop max-w-[1200px] mx-auto h-16">
          <Link href="/" className="flex items-center gap-2 font-display-lg text-headline-md tracking-tighter text-on-surface hover:text-primary transition-colors">
            <Logo className="w-8 h-8" />
            <span>FluxPlays</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="/community-sites">Community</Link>
            <Link className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="/guides">Guides</Link>
            <Link className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="/blog">Blog</Link>
            <Link className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="/tools/imdb-tmdb-converter">Tools</Link>
            <Link className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors" href="/search">Search</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsFeedbackOpen(true)} className="hidden sm:block text-on-surface-variant font-medium text-sm hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 outline-none">Feedback</button>
            <ThemeToggle />
            <Link href="/#stream" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-sm">Start Streaming</Link>
          </div>
        </div>
      </header>

      {isFeedbackOpen && (
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      )}
    </>
  );
}
