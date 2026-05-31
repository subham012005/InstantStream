"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaySquare, Film, RefreshCw, Search, MonitorPlay, Cloud, Send, Type, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import dynamic from 'next/dynamic';

const FeedbackModal = dynamic(
  () => import("@/components/FeedbackModal").then((m) => ({ default: m.FeedbackModal })),
  { ssr: false }
);

const navLinks = [
  { name: 'Explore', href: '/movie-search' },
  { name: 'Community', href: '/community-sites' },
  { name: 'Blog', href: '/blog' },
];

const toolsLeft = [
  { name: 'IMDb Player', href: '/imdb-movie-stream-player', icon: Film, desc: 'Stream using IMDb IDs', starred: true },
  { name: 'IMDb↔TMDB', href: '/tools/imdb-tmdb-converter', icon: RefreshCw, desc: 'Convert media IDs', starred: true },
  { name: 'Movie Search', href: '/movie-search', icon: Search, desc: 'Find movies to watch', starred: true },
  { name: 'Paste & Play', href: '/play-direct-video-links', icon: PlaySquare, desc: 'Play direct video URLs' },
];

const toolsRight = [
  { name: 'HLS Player', href: '/hls-m3u8-stream-player', icon: MonitorPlay, desc: 'Play .m3u8 streams' },
  { name: 'Google Drive', href: '/google-drive-video-player', icon: Cloud, desc: 'Stream Drive links' },
  { name: 'Telegram Player', href: '/telegram-video-player', icon: Send, desc: 'Play Telegram videos' },
  { name: 'Subtitle Player', href: '/subtitle-video-player', icon: Type, desc: 'Play videos with subs' },
];

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setAtTop(currentY < 80);
      if (currentY < 80) {
        // Always show at top
        setHidden(false);
      } else if (currentY > lastScrollY.current) {
        // Scrolling down
        setHidden(true);
      } else {
        // Scrolling up
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        style={{
          transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 300ms ease, background-color 200ms ease, border-color 200ms ease',
          backgroundColor: atTop ? 'transparent' : 'var(--bg-base)',
          backdropFilter: atTop ? 'none' : 'blur(12px)',
          borderBottomColor: atTop ? 'transparent' : 'var(--border)',
        }}
        className="fixed top-0 w-full z-50 border-b flex items-center h-14 md:h-[60px]"
      >
        <div className="w-full max-w-[1200px] mx-auto px-4 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 font-[family-name:var(--font-sora)] font-bold text-lg tracking-tight">
              <span className="text-[var(--accent)] text-[10px] mr-0.5">●</span>
              <span className="text-[var(--text-primary)]">Flux</span>
              <span className="text-[var(--accent)]">Plays</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link 
              href="/movie-search"
              className="relative py-2 text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
            >
              <span>Explore</span>
              <span className={`absolute left-0 bottom-0 h-[2px] bg-[var(--accent)] transition-all duration-300 ${pathname === '/movie-search' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>

            {/* Tools Dropdown Container */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button className="text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group flex items-center gap-1">
                Tools <span className="text-[10px]">▼</span>
                <span className={`absolute left-0 bottom-0 h-[2px] bg-[var(--accent)] transition-all duration-300 w-0 group-hover:w-full`}></span>
              </button>
              
              <AnimatePresence>
                {toolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                  >
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-4 flex gap-4 w-[520px]">
                      <div className="flex-1 flex flex-col gap-1">
                        {toolsLeft.map((tool) => (
                          <Link key={tool.name} href={tool.href} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors">
                            <tool.icon className="w-5 h-5 text-[var(--accent)] mt-0.5" />
                            <div>
                              <div className="flex items-center gap-1.5 text-[14px] font-[family-name:var(--font-sora)] font-bold text-[var(--text-primary)]">
                                {tool.name}
                                {(tool as {starred?: boolean}).starred && (
                                  <span style={{ fontSize: '11px', lineHeight: 1, color: '#f5c518', filter: 'drop-shadow(0 0 3px rgba(245,197,24,0.6))' }} title="Featured tool">★</span>
                                )}
                              </div>
                              <div className="text-[12px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)]">{tool.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="w-px bg-[var(--border)] my-2" />
                      <div className="flex-1 flex flex-col gap-1">
                        {toolsRight.map((tool) => (
                          <Link key={tool.name} href={tool.href} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors">
                            <tool.icon className="w-5 h-5 text-[var(--accent)] mt-0.5" />
                            <div>
                              <div className="flex items-center gap-1.5 text-[14px] font-[family-name:var(--font-sora)] font-bold text-[var(--text-primary)]">
                                {tool.name}
                                {(tool as {starred?: boolean}).starred && (
                                  <span style={{ fontSize: '11px', lineHeight: 1, color: '#f5c518', filter: 'drop-shadow(0 0 3px rgba(245,197,24,0.6))' }} title="Featured tool">★</span>
                                )}
                              </div>
                              <div className="text-[12px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)]">{tool.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              href="/community-sites"
              className="relative py-2 text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
            >
              <span>Community</span>
              <span className={`absolute left-0 bottom-0 h-[2px] bg-[var(--accent)] transition-all duration-300 ${pathname === '/community-sites' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>

            <Link 
              href="/blog"
              className="relative py-2 text-[14px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
            >
              <span>Blog</span>
              <span className={`absolute left-0 bottom-0 h-[2px] bg-[var(--accent)] transition-all duration-300 ${pathname.startsWith('/blog') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/movie-search" 
              className="bg-[var(--accent)] text-white rounded-lg px-4 py-2 text-[13px] font-semibold hover:bg-[var(--accent-hover)] hover:scale-[1.02] transition-all"
            >
              Start Streaming →
            </Link>
          </div>

          {/* Mobile Menu Toggle & Theme */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button 
              className="text-[var(--text-primary)] p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-full left-0 w-full bg-[var(--bg-surface)] border-b border-[var(--border)] overflow-hidden flex flex-col px-4 py-2"
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="flex items-center h-12 text-[16px] font-[family-name:var(--font-dm-sans)] text-[var(--text-primary)] border-b border-[var(--border-subtle)] last:border-0"
                >
                  {link.name}
                </Link>
              ))}
              <div className="py-2">
                <div className="text-[12px] font-[family-name:var(--font-jetbrains-mono)] text-[var(--text-muted)] tracking-wider mb-2">TOOLS</div>
                <div className="flex flex-col gap-1 pl-2">
                  {[...toolsLeft, ...toolsRight].map(tool => (
                    <Link key={tool.name} href={tool.href} className="flex items-center gap-2 h-10 text-[14px] text-[var(--text-secondary)]">
                      <tool.icon className="w-4 h-4" />
                      {tool.name}
                      {(tool as {starred?: boolean}).starred && (
                        <span style={{ fontSize: '11px', color: '#f5c518', filter: 'drop-shadow(0 0 3px rgba(245,197,24,0.6))' }}>★</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pt-4 pb-6">
                <Link 
                  href="/movie-search" 
                  className="flex items-center justify-center w-full bg-[var(--accent)] text-white rounded-lg h-12 text-[15px] font-semibold"
                >
                  Start Streaming →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {isFeedbackOpen && (
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      )}
    </>
  );
}
