import Script from "next/script";
import Image from "next/image";
import {
  Film, Code, Search, ArrowRight, PlaySquare, Clapperboard, MonitorPlay, Link2, Sparkles, Star, Zap, RefreshCw, Smartphone, Download
} from "lucide-react";
import HeroIMDbSearch from "@/components/HeroIMDbSearch";
import Link from "next/link";
import { LandingPageStats } from "@/components/LandingPageStats";
import QuickAccessButtons from "@/components/QuickAccessButtons";
import AndroidAppBanner from "@/components/AndroidAppBanner";

export default function Home() {
  return (
    <>
      <main className="relative bg-[var(--bg-base)] min-h-screen">

        {/* SECTION 1: HERO */}
        <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-20 pb-12 px-4 md:px-8">
          {/* Subtle Radial Gradient */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[600px] h-[600px] rounded-full bg-[rgba(230,59,46,0.06)] blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-[800px] w-full mx-auto flex flex-col items-center text-center">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] mb-6 animate-fade-in">
              <span className="text-[12px] font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)]">
                ✦ Free · No Signup · Works Instantly
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-sora)] text-[clamp(48px,8vw,96px)] font-bold leading-[1.05] text-[var(--text-primary)] mb-6 tracking-tight flex flex-col items-center">
              <span className="block">Watch Anything,</span>
              <span className="text-[var(--accent)] block">Instantly.</span>
            </h1>

            <p className="font-[family-name:var(--font-dm-sans)] text-[18px] text-[var(--text-secondary)] max-w-[520px] mx-auto mb-10 leading-relaxed">
              Search millions of movies and stream instantly — no downloads, no account.
            </p>

            {/* Movie search bar */}
            <div className="w-full max-w-[540px] mb-12">
              <HeroIMDbSearch />
            </div>

            {/* IMDb Player CTA & Android App CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center w-full max-w-[640px] mx-auto mt-2">
              <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                <span className="text-[12px] text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
                  Already have an IMDb ID?
                </span>
                <Link
                  href="/imdb-movie-stream-player"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#f5c518] hover:bg-[#e6b800] text-black rounded-[12px] px-[28px] py-[14px] text-[15px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_24px_rgba(245,197,24,0.15)]"
                >
                  <span>Stream by IMDb ID</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                <span className="text-[12px] text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
                  Prefer a mobile app?
                </span>
                <a
                  href="https://expo.dev/artifacts/eas/daxowQ0Bl8asvwZOyQ70OjLU5y0giS9A0n3Z-V_lTq8.apk"
                  download="FluxPlays.apk"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[12px] px-[28px] py-[14px] text-[15px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_24px_rgba(230,59,46,0.15)] border border-[rgba(230,59,46,0.2)]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Download Android App</span>
                </a>
              </div>
            </div>

            {/* Premium Mirrors Quick Access */}
            <QuickAccessButtons />

          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-50">
            <span className="text-[var(--text-muted)]">▼</span>
          </div>
        </section>

        {/* MOBILE APP RELEASE BANNER */}
        <AndroidAppBanner />

        {/* SECTION 2: PICK YOUR INTENT */}
        <section className="py-24 px-4 md:px-8 max-w-[1200px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] mb-5">
              <Sparkles className="w-3 h-3 text-[var(--accent)]" />
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] text-[var(--text-muted)] tracking-widest uppercase">Pick Your Intent</span>
            </div>
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-[clamp(28px,4vw,42px)] text-[var(--text-primary)] leading-tight">
              Every way to stream,{" "}
              <span className="text-[var(--accent)]">covered.</span>
            </h2>
            <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-[16px] mt-3 max-w-md mx-auto">
              Three powerful modes — one seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ───── Card 1 — Find a Movie ───── */}
            <Link
              href="/movie-search"
              className="group relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-[20px] flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_28px_70px_rgba(168,85,247,0.2)] hover:border-purple-500/50 cursor-pointer"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Background texture image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/card-movie-bg.png"
                  alt=""
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700 scale-105 group-hover:scale-100"
                  priority={false}
                />
                {/* Dark gradient overlay so text stays legible */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-purple-950/20" />
              </div>

              {/* Glow orb (hover-only) */}
              <div className="absolute -bottom-10 -right-10 z-0 w-44 h-44 rounded-full bg-purple-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Content */}
              <div className="relative z-10 p-8 flex flex-col flex-1">
                {/* Badge */}
                <div className="self-start mb-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Star className="w-2.5 h-2.5 text-purple-400" />
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-purple-400 tracking-wider uppercase">500K+ Titles</span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-purple-500/25 to-purple-700/10 border border-purple-500/25 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                  <Clapperboard className="w-6 h-6 text-purple-400" />
                </div>

                <h3 className="font-[family-name:var(--font-sora)] font-bold text-[20px] text-[var(--text-primary)] mb-3 group-hover:text-white transition-colors">
                  Find a Movie
                </h3>
                <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-[14px] leading-relaxed flex-1">
                  Browse half a million titles. Search by name, genre or year — then stream instantly in your browser.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mt-5 mb-6">
                  {['Search', 'Filter', 'Instant Play'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)]/80 border border-purple-500/15 text-[11px] text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">{tag}</span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-[14px] font-[family-name:var(--font-sora)] group-hover:gap-3 transition-all duration-300">
                  Browse Movies
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* ───── Card 2 — IMDb Player (featured / center) ───── */}
            <Link
              href="/imdb-movie-stream-player"
              className="group relative bg-[var(--bg-surface)] border border-[rgba(245,197,24,0.25)] rounded-[20px] flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_28px_70px_rgba(245,197,24,0.18)] hover:border-[rgba(245,197,24,0.6)] cursor-pointer md:scale-[1.04]"
            >
              {/* Top accent bar — always visible for featured card */}
              <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-transparent via-[#f5c518] to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Background texture image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/card-imdb-bg.png"
                  alt=""
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover opacity-25 group-hover:opacity-35 transition-opacity duration-700 scale-105 group-hover:scale-100"
                  priority={false}
                />
                {/* Warm dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)]/88 to-amber-950/25" />
              </div>

              {/* Ambient glow orbs */}
              <div className="absolute -bottom-8 -right-8 z-0 w-52 h-52 rounded-full bg-[#f5c518]/10 blur-[60px] pointer-events-none" />
              <div className="absolute -top-10 -left-10 z-0 w-36 h-36 rounded-full bg-[#f5c518]/6 blur-[45px] pointer-events-none" />

              {/* Content */}
              <div className="relative z-10 p-8 flex flex-col flex-1">
                {/* "Most Popular" badge */}
                <div className="self-start mb-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5c518]/15 border border-[#f5c518]/30">
                  <Zap className="w-2.5 h-2.5 text-[#f5c518]" />
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[#f5c518] tracking-wider uppercase">Most Popular</span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-[14px] bg-[#f5c518] border border-[#f5c518]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_24px_rgba(245,197,24,0.4)]">
                  <span className="font-black text-[18px] text-black leading-none tracking-tight">IMDb</span>
                </div>

                <h3 className="font-[family-name:var(--font-sora)] font-bold text-[20px] text-[var(--text-primary)] mb-3 group-hover:text-white transition-colors">
                  IMDb Player
                </h3>
                <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-[14px] leading-relaxed flex-1">
                  Paste any IMDb ID like <code className="text-[#f5c518] bg-[#f5c518]/10 px-1.5 py-0.5 rounded text-[12px] font-mono">tt0111161</code> and watch in full Cinema Mode.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mt-5 mb-6">
                  {['IMDb ID', 'Cinema Mode', '4K Ready'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-[#f5c518]/8 border border-[#f5c518]/20 text-[11px] text-[#f5c518]/80 font-[family-name:var(--font-dm-sans)]">{tag}</span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-[#f5c518] font-semibold text-[14px] font-[family-name:var(--font-sora)] group-hover:gap-3 transition-all duration-300">
                  Try IMDb Player
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* ───── Card 3 — IMDb → TMDB Converter ───── */}
            <Link
              href="/tools/imdb-tmdb-converter"
              className="group relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-[20px] flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_28px_70px_rgba(34,211,238,0.15)] hover:border-cyan-500/40 cursor-pointer"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Background texture image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/card-tmdb-bg.png"
                  alt=""
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover opacity-18 group-hover:opacity-28 transition-opacity duration-700 scale-105 group-hover:scale-100"
                  priority={false}
                />
                {/* Cool teal dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-cyan-950/20" />
              </div>

              {/* Glow orb */}
              <div className="absolute -bottom-10 -right-10 z-0 w-44 h-44 rounded-full bg-cyan-500/8 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute -top-6 -left-6 z-0 w-28 h-28 rounded-full bg-teal-500/5 blur-[35px] pointer-events-none" />

              {/* Content */}
              <div className="relative z-10 p-8 flex flex-col flex-1">
                {/* Badge */}
                <div className="self-start mb-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <RefreshCw className="w-2.5 h-2.5 text-cyan-400" />
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-cyan-400 tracking-wider uppercase">Free Tool</span>
                </div>

                {/* Icon — shows a conversion arrow between two ID styles */}
                <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-cyan-500/20 to-teal-600/10 border border-cyan-500/20 flex flex-col items-center justify-center gap-1 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                  <span className="font-black text-[8px] px-1 py-[2px] rounded-sm bg-[#f5c518] text-black leading-none">IMDb</span>
                  <RefreshCw className="w-3 h-3 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-black text-[9px] text-cyan-400 font-mono leading-none">TMDB</span>
                </div>

                <h3 className="font-[family-name:var(--font-sora)] font-bold text-[20px] text-[var(--text-primary)] mb-3 group-hover:text-white transition-colors">
                  IMDb → TMDB ID
                </h3>
                <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-[14px] leading-relaxed flex-1">
                  Paste an IMDb ID like <code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded text-[12px] font-mono">tt0111161</code> and instantly get the matching TMDB ID.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mt-5 mb-6">
                  {['IMDb ID', 'TMDB ID', 'Instant'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-cyan-500/8 border border-cyan-500/20 text-[11px] text-cyan-400/80 font-[family-name:var(--font-dm-sans)]">{tag}</span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-[14px] font-[family-name:var(--font-sora)] group-hover:gap-3 transition-all duration-300">
                  Convert ID
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

          </div>
        </section>

        {/* SECTION 3: TOOLS STRIP */}
        <section className="py-16 px-4 md:px-8 max-w-[1200px] mx-auto border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-[20px] text-[var(--text-primary)]">All Free Tools</h2>
            <Link href="/tools" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              →
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar md:grid md:grid-cols-4 md:overflow-visible">
            {[
              { name: '⭐ IMDb Player', href: '/imdb-movie-stream-player', desc: 'Stream by IMDb ID' },
              { name: '⭐ Movie Search', href: '/movie-search', desc: 'Find & stream movies' },
              { name: 'HLS Player', href: '/hls-m3u8-stream-player', desc: '.m3u8 file support' },
              { name: 'Google Drive', href: '/google-drive-video-player', desc: 'Play Drive links' },
              { name: 'Paste & Play', href: '/play-direct-video-links', desc: 'Direct URL streaming' },
              { name: 'Telegram', href: '/telegram-video-player', desc: 'Watch TG files' },
              { name: 'Subtitle Player', href: '/subtitle-video-player', desc: 'Add SRT/VTT' },
              { name: '⭐ IMDb↔TMDB', href: '/tools/imdb-tmdb-converter', desc: 'Convert media IDs' },
            ].map(tool => (
              <Link
                key={tool.name}
                href={tool.href}
                className="shrink-0 w-[240px] md:w-auto bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] p-[12px_16px] hover:border-[var(--accent)] transition-colors group flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                  <PlaySquare className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div>
                  <div className="font-[family-name:var(--font-sora)] font-bold text-[14px] text-[var(--text-primary)] mb-1">{tool.name}</div>
                  <div className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[var(--text-muted)] truncate">{tool.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 4: STATS */}
        <LandingPageStats />

        {/* SECTION 5: BLOG PREVIEW */}
        <section className="py-20 px-4 md:px-8 max-w-[1200px] mx-auto border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { title: 'How to Stream Videos Without Downloading', readTime: '4 min read', href: '/blog/how-to-stream-videos-without-downloading', tag: 'Guide' },
              { title: 'MP4 vs WEBM: Which Format Streams Better?', readTime: '5 min read', href: '/blog/mp4-vs-webm-streaming', tag: 'Tech' },
              { title: 'How Browser Video Streaming Works', readTime: '6 min read', href: '/blog/how-browser-video-streaming-works', tag: 'Explained' }
            ].map(post => (
              <Link key={post.title} href={post.href} className="group flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 hover:border-[var(--accent)] transition-all hover:-translate-y-1">
                <span className="self-start px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[12px] font-bold uppercase tracking-wider mb-4">
                  {post.tag}
                </span>
                <h3 className="font-[family-name:var(--font-sora)] font-bold text-[16px] text-[var(--text-primary)] leading-snug mb-4 group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h3>
                <div className="mt-auto flex items-center justify-between text-[13px] text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
                  <span>{post.readTime}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/blog" className="text-[var(--text-primary)] font-[family-name:var(--font-dm-sans)] font-semibold hover:text-[var(--accent)] transition-colors">
              View all articles →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
