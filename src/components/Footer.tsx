"use client";

import Link from "next/link";
import Logo from "./Logo";
import { landingPages } from "@/app/landingPagesData";
import { trendingData } from "@/app/trending/trendingData";
import { comparisonData } from "@/app/compare/comparisonData";
import { 
  Globe, Zap, Shield, Play, 
  ArrowRight, ExternalLink, Info, Heart
} from "lucide-react";

export function Footer() {
  const landingList = Object.values(landingPages);
  
  return (
    <footer className="w-full bg-[#050505] border-t border-white/[0.03] pt-24 pb-12 overflow-hidden relative">
      {/* Premium Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1280px] mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        
        {/* Main Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-16 gap-x-8 lg:gap-x-12 mb-20">
          
          {/* Brand Identity Column */}
          <div className="col-span-2 lg:col-span-2 pr-0 lg:pr-12">
            <Link href="/" className="flex items-center gap-3 font-display-lg text-2xl tracking-tighter text-white mb-8 group">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Logo className="w-7 h-7" />
              </div>
              <span className="font-bold">FluxPlays</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-sm">
              The ultimate browser-based utility for instant video streaming. We bridge the gap between complex video links and a cinematic viewing experience.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/subham012005/InstantStream" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/40 hover:bg-primary/10 hover:text-primary transition-all border border-white/[0.05] group" title="GitHub Contributor">
                <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/40 hover:bg-secondary/10 hover:text-secondary transition-all border border-white/[0.05] group" title="Twitter Community">
                <Globe className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
              </a>
              <a href="mailto:contact@fluxplays.live" className="w-9 h-9 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/40 hover:bg-tertiary/10 hover:text-tertiary transition-all border border-white/[0.05] group" title="Direct Contact">
                <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Player Ecosystem Column */}
          <div className="col-span-1">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-8 flex items-center gap-2">
               Player Stack
            </h3>
            <ul className="space-y-4">
              {landingList.slice(0, 6).map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`} className="text-[13px] text-white/50 hover:text-primary transition-colors flex items-center group">
                    <span className="truncate">{page.badge}</span>
                    <ArrowRight className="w-3 h-3 ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="col-span-1">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-8 flex items-center gap-2">
               Resources
            </h3>
            <ul className="space-y-4">
              <li><Link href="/blog" className="text-[13px] text-white/50 hover:text-secondary transition-colors">Blog & Guides</Link></li>
              <li><Link href="/guides" className="text-[13px] text-white/50 hover:text-secondary transition-colors">Technical Stack</Link></li>
              <li><Link href="/trending/video-streaming-for-developers" className="text-[13px] text-white/50 hover:text-secondary transition-colors">Developer API</Link></li>
              <li><Link href="/community-sites" className="text-[13px] text-primary/80 hover:text-primary transition-colors font-medium">Link Directory</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-8 flex items-center gap-2">
               Company
            </h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-[13px] text-white/50 hover:text-tertiary transition-colors">Our Story</Link></li>
              <li><Link href="/newsletter" className="text-[13px] text-white/50 hover:text-tertiary transition-colors">Newsletter</Link></li>
              <li><Link href="/contact" className="text-[13px] text-white/50 hover:text-tertiary transition-colors">Contact</Link></li>
              <li><Link href="/branding" className="text-[13px] text-white/50 hover:text-tertiary transition-colors">Press & Assets</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="col-span-1">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-8 flex items-center gap-2">
               Legal
            </h3>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-[13px] text-white/50 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[13px] text-white/50 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-notice" className="text-[13px] text-white/50 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* SEO Breadcrumbs Bar */}
        <div className="py-12 border-y border-white/[0.05]">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mr-3">Expertise:</span>
             {landingList.slice(6).map((page) => (
               <Link 
                key={page.slug} 
                href={`/${page.slug}`}
                className="text-[11px] text-white/30 hover:text-primary transition-colors px-1"
               >
                 {page.badge}
               </Link>
             ))}
             <span className="text-white/10 mx-1">/</span>
             <Link href="/community-sites" className="text-[11px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-tighter">
               Curated Directory
             </Link>
          </div>
        </div>

        {/* Bottom Social & Copyright Strip */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6 order-2 md:order-1 text-[11px] text-white/30 font-medium">
             <span className="flex items-center gap-2 group cursor-default">
               Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 group-hover:scale-125 transition-transform" /> for the internet
             </span>
             <div className="w-[1px] h-3 bg-white/10 hidden md:block"></div>
             <span>© 2026 FluxPlays Utility</span>
          </div>
          
          <div className="flex items-center gap-8 order-1 md:order-2">
             <Link href="/status" className="text-[11px] text-green-500/60 hover:text-green-500 transition-colors flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
               System Operational
             </Link>
             <div className="flex items-center gap-4">
               <div className="text-[11px] text-white/30">Network Status: <span className="text-white/60">Optimized</span></div>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
