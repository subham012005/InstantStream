"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function DevToolsProtection() {
  const pathname = usePathname();
  const isInitialized = useRef(false);

  useEffect(() => {
    // ── Owner backdoor ──────────────────────────────────────────────────────
    try {
      Object.defineProperty(window, "ownerbypass", {
        get() {
          try { localStorage.setItem("allow_devtools", "true"); } catch (e) {}
          setTimeout(() => window.location.reload(), 300);
          return "✅ Access granted. Reloading...";
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

    // ── Skip detection for owner ────────────────────────────────────────────
    try {
      if (localStorage.getItem("allow_devtools") === "true") return;
    } catch (e) {}

    // ── Skip if on the blocked page ─────────────────────────────────────────
    if (pathname === "/blocked") return;

    // ── Initialize DisableDevtool (Aggressive Mode & Custom Handler) ────────
    import("disable-devtool").then((mod) => {
      const DisableDevtool = mod.default || mod;
      DisableDevtool({
        disableMenu: true,
        clearLog: true,
        interval: 200, // Very aggressive polling (default is 500ms)
        ondevtoolopen: (type: any, next: any) => {
          // Manually intercept detection to prevent any rogue library loops
          if (window.location.pathname !== "/blocked") {
            window.location.replace("/blocked");
          }
        }
      });
    }).catch(() => {
      // Ignore load errors
    });

    // ── Force a check on every single click ─────────────────────────────────
    const forceClickCheck = () => {
      try {
        // This instantly freezes the UI and triggers detection if devtools is open
        (function() { return false; })["constructor"]("debugger")();
      } catch (e) {}
    };
    
    document.addEventListener("click", forceClickCheck, true);
    document.addEventListener("contextmenu", forceClickCheck, true);

    return () => {
      document.removeEventListener("click", forceClickCheck, true);
      document.removeEventListener("contextmenu", forceClickCheck, true);
    };
  }, [pathname]);

  return null;
}
