"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Sparkles, X, CheckCircle2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AndroidAppBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Using a versioned key so it resets for users who dismissed old testing banners
    const isDismissed = localStorage.getItem("fluxplays-apk-banner-v1");
    if (isDismissed === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("fluxplays-apk-banner-v1", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="py-12 px-4 md:px-8 max-w-[1200px] mx-auto w-full"
        >
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-red-950/40 via-[var(--bg-surface)] to-amber-950/20 border border-[var(--border)] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(230,59,46,0.1),transparent_50%)]" />
            
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-full transition-all cursor-pointer z-20"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Content */}
            <div className="relative z-10 max-w-[700px] flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
                <Sparkles className="w-2.5 h-2.5 text-red-400 animate-pulse" />
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-red-400 tracking-wider uppercase font-bold">New Mobile Release</span>
              </div>
              
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-[26px] md:text-[34px] text-[var(--text-primary)] leading-tight mb-3">
                FluxPlays on your <span className="text-[var(--accent)]">Android Device</span>
              </h3>
              
              <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-[15px] md:text-[16px] leading-relaxed mb-6">
                Take your streaming experience everywhere. Download the official FluxPlays APK to enjoy a fully optimized, lightweight mobile player with premium streaming features.
              </p>

              {/* APK App Details / Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                {[
                  "Zero Ads or Popups – 100% clean streaming",
                  "Picture-in-Picture (PiP) – watch while multitasking",
                  "Smart TV Casting – Cast instantly to Chromecast & TVs",
                  "Universal Player – stream IMDb IDs, MKV, MP4 & M3U8",
                  "Sleek Expo-powered native performance",
                  "Lightweight APK size (~20MB)"
                ].map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[13px] md:text-[14px] text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[var(--accent)] shrink-0 mt-0.5" />
                    <span className="font-[family-name:var(--font-dm-sans)]">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Action (Download Button & Specs) */}
            <div className="relative z-10 shrink-0 flex flex-col items-center gap-3 w-full lg:w-auto">
              <a
                href="https://expo.dev/artifacts/eas/daxowQ0Bl8asvwZOyQ70OjLU5y0giS9A0n3Z-V_lTq8.apk"
                download="FluxPlays.apk"
                className="w-full lg:w-auto flex items-center justify-center gap-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[14px] px-[32px] py-[18px] text-[16px] font-bold transition-all hover:scale-[1.03] shadow-[0_8px_32px_rgba(230,59,46,0.25)] border border-[rgba(230,59,46,0.2)]"
              >
                <Smartphone className="w-5 h-5" />
                <span>Download APK File</span>
              </a>
              <span className="text-[11px] font-[family-name:var(--font-jetbrains-mono)] text-[var(--text-muted)]">
                v1.0.0 (Stable) • Android 8.0+
              </span>
            </div>

          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
