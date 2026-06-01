"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function DevToolsProtection() {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    // Secret console backdoor for Subham
    if (typeof window !== "undefined") {
      Object.defineProperty(window, "imsubham", {
        get: function () {
          localStorage.setItem("allow_devtools", "true");
          setTimeout(() => window.location.reload(), 500);
          return "Access granted, boss! Reloading...";
        },
        configurable: true
      });

      Object.defineProperty(window, "lock", {
        get: function () {
          localStorage.removeItem("allow_devtools");
          setTimeout(() => window.location.reload(), 500);
          return "Protection restored! Reloading...";
        },
        configurable: true
      });
    }

    // Disable right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable common shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
        (e.metaKey && e.altKey && (e.key === "I" || e.key === "i")) ||
        (e.metaKey && e.altKey && (e.key === "J" || e.key === "j")) ||
        (e.metaKey && e.altKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // DevTools detection loop
    let devtoolsDetectionInterval: NodeJS.Timeout;

    const detectDevTools = () => {
      // Owner bypass: if you set localStorage.getItem('allow_devtools') = 'true', it bypasses protection
      if (typeof window !== "undefined" && localStorage.getItem("allow_devtools") === "true") {
        setIsDevToolsOpen(false);
        return;
      }

      let devtools = false;

      // 1. Check window dimensions (docked devtools)
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        devtools = true;
      }

      setIsDevToolsOpen(devtools);
    };

    // Run detection continuously
    devtoolsDetectionInterval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(devtoolsDetectionInterval);
    };
  }, []);

  if (!isDevToolsOpen) {
    return null;
  }

  return (
    <div 
      id="devtools-protection" 
      className="fixed inset-0 z-[999999] bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col min-h-screen overflow-y-auto"
    >
      <Script id="devtools-ad-script" strategy="afterInteractive">
        {`(function(s){s.dataset.zone='11083923',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));`}
      </Script>

      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full mt-10">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)] font-[family-name:var(--font-jetbrains-mono)] mb-4">
              Action Required
            </p>
            <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-sora)] font-bold text-[var(--text-primary)] mb-4">
              Developer Tools Detected
            </h1>
            <p className="mx-auto max-w-2xl text-[15px] text-[var(--text-secondary)] leading-7">
              Please close developer tools to continue using FluxPlays.
            </p>
          </div>

          <div className="mt-8">
            <iframe
              title="sponsor-loader"
              src="https://omg10.com/4/11083927"
              className="w-full h-56 md:h-96 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>

          <div className="mt-8 text-center">
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.href = "/"}
                className="inline-flex items-center justify-center rounded-[12px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
