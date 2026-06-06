"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function DevToolsProtection() {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // ── Owner backdoor ──────────────────────────────────────────────────────
    try {
      Object.defineProperty(window, "imsubham", {
        get() {
          try { localStorage.setItem("allow_devtools", "true"); } catch (e) {}
          setTimeout(() => window.location.reload(), 300);
          return "✅ Access granted, boss! Reloading...";
        },
        configurable: true,
      });
      Object.defineProperty(window, "lock", {
        get() {
          try { localStorage.removeItem("allow_devtools"); } catch (e) {}
          setTimeout(() => window.location.reload(), 300);
          return "🔒 Protection restored! Reloading...";
        },
        configurable: true,
      });
    } catch (_) {}

    // ── Disable right-click ─────────────────────────────────────────────────
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", onContextMenu);

    // ── Block common DevTools keyboard shortcuts ─────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      const blocked =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i","I","j","J","c","C"].includes(e.key)) ||
        (e.ctrlKey && ["u","U"].includes(e.key)) ||
        (e.metaKey && e.altKey && ["i","I","j","J","u","U"].includes(e.key));
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    // ── Skip detection for owner ────────────────────────────────────────────
    try {
      if (localStorage.getItem("allow_devtools") === "true") {
        return () => {
          document.removeEventListener("contextmenu", onContextMenu);
          document.removeEventListener("keydown", onKeyDown, true);
        };
      }
    } catch (e) {}

    // ── Skip detection on mobile devices ────────────────────────────────────
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || "ontouchstart" in window;

    if (isMobile) {
      return () => {
        document.removeEventListener("contextmenu", onContextMenu);
        document.removeEventListener("keydown", onKeyDown, true);
      };
    }

    // ── Aggressive DevTools Detector Integration (Option A) ──────────────────
    let devtoolsModule: any = null;

    import("devtools-detector").then((mod) => {
      devtoolsModule = mod.default || mod;
      
      devtoolsModule.addListener((isOpen: boolean) => {
        setIsDevToolsOpen(isOpen);
      });
      
      devtoolsModule.launch();
    });

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown, true);
      if (devtoolsModule && typeof devtoolsModule.stop === "function") {
        devtoolsModule.stop();
      }
    };
  }, []);

  const returnToHomepage = () => {
    window.location.href = "/";
  };

  if (!isClient || !isDevToolsOpen) return null;

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
            <button
              type="button"
              onClick={returnToHomepage}
              className="inline-flex items-center justify-center rounded-[12px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            >
              Return to Homepage
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
