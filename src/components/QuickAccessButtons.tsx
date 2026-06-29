"use client";

import { useState } from "react";
import { Sparkles, Heart, X, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function QuickAccessButtons() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-full max-w-[900px] mx-auto z-20 mt-12 mb-8">
      {/* "NEW" Label */}
      <div className="flex items-center justify-center gap-3 mb-8 opacity-90">
        <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[var(--accent)]/50"></span>
        <span className="text-[12px] font-[family-name:var(--font-dm-sans)] font-bold tracking-[0.3em] text-[var(--text-primary)] uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          New Platforms
        </span>
        <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[var(--accent)]/50"></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
        
        {/* ───── NETFLIX CARD ───── */}
        <div className="relative group rounded-[20px] overflow-hidden p-[2px] transition-transform duration-500 hover:-translate-y-3 hover:shadow-[0_28px_70px_rgba(229,9,20,0.3)] cursor-pointer">
          {/* Always-on Spinning Light Ray */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_280deg,#E50914_360deg)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          {/* A second light ray for extra glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_180deg,transparent_0_280deg,#E50914_360deg)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          
          <a
            href="https://netmirror.fluxplays.live"
            onClick={(e) => { e.preventDefault(); setShowModal(true); }}
            target="_blank" rel="noopener noreferrer"
            className="relative bg-[var(--bg-surface)] rounded-[18px] w-full h-full p-12 flex flex-col items-center justify-center min-h-[220px] overflow-hidden flex-1"
          >
            {/* Background texture image */}
            <div className="absolute inset-0 z-0">
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)]/95 to-[#E50914]/15" />
            </div>

            {/* Ambient inner glows */}
            <div className="absolute -bottom-10 -right-10 z-0 w-44 h-44 rounded-full bg-[#E50914]/20 blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -top-10 -left-10 z-0 w-32 h-32 rounded-full bg-[#E50914]/10 blur-[45px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Content (Just Huge Logo) */}
            <div className="relative z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Image src="/logos/netflix.svg" alt="Netflix" width={180} height={48} className="w-auto h-20 drop-shadow-[0_4px_20px_rgba(229,9,20,0.6)]" />
            </div>
          </a>
        </div>

        {/* ───── PRIME VIDEO CARD ───── */}
        <div className="relative group rounded-[20px] overflow-hidden p-[2px] transition-transform duration-500 hover:-translate-y-3 hover:shadow-[0_28px_70px_rgba(0,168,225,0.3)] cursor-pointer">
          {/* Always-on Spinning Light Ray */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_280deg,#00A8E1_360deg)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          {/* A second light ray for extra glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_180deg,transparent_0_280deg,#00A8E1_360deg)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          
          <a
            href="https://amazon.fluxplays.live"
            onClick={(e) => { e.preventDefault(); setShowModal(true); }}
            target="_blank" rel="noopener noreferrer"
            className="relative bg-[var(--bg-surface)] rounded-[18px] w-full h-full p-12 flex flex-col items-center justify-center min-h-[220px] overflow-hidden flex-1 text-left"
          >
            {/* Background texture image */}
            <div className="absolute inset-0 z-0">
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)]/95 to-[#00A8E1]/15" />
            </div>

            {/* Ambient inner glows */}
            <div className="absolute -bottom-10 -right-10 z-0 w-44 h-44 rounded-full bg-[#00A8E1]/20 blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -top-10 -left-10 z-0 w-32 h-32 rounded-full bg-[#00A8E1]/10 blur-[45px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Content (Just Huge Logo) */}
            <div className="relative z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Image src="/logos/prime.svg" alt="Prime Video" width={200} height={60} className="w-auto h-16 drop-shadow-[0_4px_20px_rgba(0,168,225,0.5)]" />
            </div>
          </a>
        </div>

      </div>

      {/* ───── TIP BUTTON ───── */}
      <div className="mt-12 flex justify-center">
        <a
          href="https://ko-fi.com/fluxplays"
          target="_blank" rel="noopener noreferrer"
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-[18px] overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(245,158,11,0.5)]"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000" />
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <span>Support on Ko-fi</span>
        </a>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[var(--bg-surface)] border border-white/10 rounded-2xl shadow-2xl p-6 text-center overflow-hidden">
            {/* Background effects */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none" />
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Service Unavailable</h3>
            <p className="text-white/70 mb-6 text-sm leading-relaxed">
              Due to a lack of funds to purchase a premium proxy, Netflix and Amazon Prime Video are currently not working. If you'd like to help bring these services back, please consider supporting the project!
            </p>

            <a
              href="https://ko-fi.com/fluxplays"
              target="_blank" rel="noopener noreferrer"
              className="group relative inline-flex w-full items-center justify-center gap-2 px-6 py-3 font-bold text-white transition-all duration-300 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000" />
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <span>Support on Ko-fi</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
