"use client";

import { useState } from "react";
import { Sparkles, Heart, X, AlertCircle, Download, Search, Film } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function QuickAccessButtons() {
  const [showModal, setShowModal] = useState(false);
  const [showFeatureIntro, setShowFeatureIntro] = useState(false);

  useEffect(() => {
    const hasSeenFeature = localStorage.getItem("hasSeenFluxplaysDownloadFeature");
    if (!hasSeenFeature) {
      setShowFeatureIntro(true);
    }
  }, []);

  const closeFeatureIntro = () => {
    localStorage.setItem("hasSeenFluxplaysDownloadFeature", "true");
    setShowFeatureIntro(false);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto z-20 mt-12 mb-8">
      {/* "NEW" Label */}
      <div className="flex items-center justify-center gap-3 mb-8 opacity-90">
        <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[var(--accent)]/50"></span>
        <span className="text-[12px] font-[family-name:var(--font-dm-sans)] font-bold tracking-[0.3em] text-[var(--text-primary)] uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          New Platforms
        </span>
        <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[var(--accent)]/50"></span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
        
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

        {/* ───── FLUXPLAYS DOWNLOAD CARD (INDIAN) ───── */}
        <div className="relative group rounded-[20px] overflow-hidden p-[2px] transition-transform duration-500 hover:-translate-y-3 hover:shadow-[0_28px_70px_rgba(34,197,94,0.3)] cursor-pointer">
          {/* Always-on Spinning Light Ray */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_280deg,#22c55e_360deg)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          {/* A second light ray for extra glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_180deg,transparent_0_280deg,#22c55e_360deg)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          
          <a
            href="https://download2.fluxplays.live/"
            target="_blank" rel="noopener noreferrer"
            className="relative bg-[var(--bg-surface)] rounded-[18px] w-full h-full p-8 flex flex-col items-center justify-center min-h-[220px] overflow-hidden flex-1 text-center gap-4"
          >
            {/* Background texture image */}
            <div className="absolute inset-0 z-0">
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)]/95 to-[#22c55e]/15" />
            </div>

            {/* Ambient inner glows */}
            <div className="absolute -bottom-10 -right-10 z-0 w-44 h-44 rounded-full bg-[#22c55e]/20 blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -top-10 -left-10 z-0 w-32 h-32 rounded-full bg-[#22c55e]/10 blur-[45px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <div className="flex flex-col items-center gap-1 text-[#22c55e] mb-2">
                <Download className="w-10 h-10 drop-shadow-[0_4px_20px_rgba(34,197,94,0.6)] mb-1" />
                <span className="text-xl font-black tracking-wider uppercase drop-shadow-[0_4px_20px_rgba(34,197,94,0.6)] text-center leading-tight">Indian<br/>Download</span>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-green-400/80 uppercase bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">Hindi Audio</span>
            </div>
          </a>
        </div>

        {/* ───── FLUXPLAYS DOWNLOAD CARD (ORIGINAL) ───── */}
        <div className="relative group rounded-[20px] overflow-hidden p-[2px] transition-transform duration-500 hover:-translate-y-3 hover:shadow-[0_28px_70px_rgba(168,85,247,0.3)] cursor-pointer">
          {/* Always-on Spinning Light Ray */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_280deg,#a855f7_360deg)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          {/* A second light ray for extra glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_180deg,transparent_0_280deg,#a855f7_360deg)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          
          <a
            href="https://download.fluxplays.live"
            target="_blank" rel="noopener noreferrer"
            className="relative bg-[var(--bg-surface)] rounded-[18px] w-full h-full p-8 flex flex-col items-center justify-center min-h-[220px] overflow-hidden flex-1 text-center gap-4"
          >
            {/* Background texture image */}
            <div className="absolute inset-0 z-0">
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)]/95 to-[#a855f7]/15" />
            </div>

            {/* Ambient inner glows */}
            <div className="absolute -bottom-10 -right-10 z-0 w-44 h-44 rounded-full bg-[#a855f7]/20 blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -top-10 -left-10 z-0 w-32 h-32 rounded-full bg-[#a855f7]/10 blur-[45px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <div className="flex flex-col items-center gap-1 text-[#a855f7] mb-2">
                <Download className="w-10 h-10 drop-shadow-[0_4px_20px_rgba(168,85,247,0.6)] mb-1" />
                <span className="text-xl font-black tracking-wider uppercase drop-shadow-[0_4px_20px_rgba(168,85,247,0.6)] text-center leading-tight">Original<br/>Download</span>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-purple-400/80 uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">Global Audio</span>
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

      {/* New Feature Intro Modal */}
      {showFeatureIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-green-500/30 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.15)] p-8 text-center overflow-hidden">
            {/* Background effects */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-500/20 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
            
            <button 
              onClick={closeFeatureIntro}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-6 relative">
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full scale-150" />
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full text-green-400 relative border border-green-500/30">
                <Sparkles className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
              New Feature Unlocked!
            </h3>
            
            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400 mt-0.5">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Direct Search</h4>
                  <p className="text-white/70 text-sm">Find any movie or TV show instantly with our powerful new search engine.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400 mt-0.5">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Free Downloads</h4>
                  <p className="text-white/70 text-sm">Download your favorites directly. No ads, completely free, zero hassle.</p>
                </div>
              </div>
            </div>

            <button
              onClick={closeFeatureIntro}
              className="group relative inline-flex w-full items-center justify-center gap-2 px-6 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000" />
              <Film className="w-5 h-5" />
              <span>Try it out now!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
