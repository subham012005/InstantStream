"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

export default function GoPageClient() {
  const searchParams = useSearchParams();
  const encodedUrl = searchParams.get("url") || "";
  const siteName = searchParams.get("name") || "";
  const siteDesc = searchParams.get("desc") || "";
  const siteType = searchParams.get("type") || "";

  const destinationUrl = useMemo(() => {
    if (!encodedUrl) return "";
    try {
      return decodeURIComponent(encodedUrl);
    } catch {
      return "";
    }
  }, [encodedUrl]);

  const isValidDestination = destinationUrl.startsWith("http://") || destinationUrl.startsWith("https://");

  const [count, setCount] = useState(5);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isValidDestination) return; // nothing to do when no destination
    if (count <= 0) {
      setEnabled(true);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, isValidDestination]);

  const continueToWebsite = () => {
    if (!isValidDestination || !enabled) return;
    try {
      // Push analytics events before leaving
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({ event: 'exit_continue_click', destination: destinationUrl });

      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'exit_continue_click', { destination: destinationUrl });
      }

      if (typeof (window as any).clarity === 'function') {
        try { (window as any).clarity('set', 'exit_destination', destinationUrl); } catch {}
        try { (window as any).clarity('event', 'exit_continue_click'); } catch {}
      }

      // Open the destination directly in a new tab (most reliable)
      try { window.open(destinationUrl, '_blank', 'noopener,noreferrer'); } catch (e) {}
    } catch (e) {
      // ignore
    }

    // Finally, navigate the current tab back to the homepage
    window.location.href = "/";
  };

  const destinationHost = useMemo(() => {
    try {
      return destinationUrl ? new URL(destinationUrl).hostname.replace(/^www\./, "") : "";
    } catch {
      return "";
    }
  }, [destinationUrl]);

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Script id="go-page-ad-script" strategy="afterInteractive">
        {`(function(s){s.dataset.zone='11083923',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));`}
      </Script>

      <Script
        id="go-page-ad-script-2"
        src="https://5gvci.com/act/files/tag.min.js?z=11083991"
        data-cfasync="false"
        async
        strategy="afterInteractive"
      />

      <Script id="go-page-ad-script-3" strategy="afterInteractive">
        {`(function(s){s.dataset.zone='11083994',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));`}
      </Script>

      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)] font-[family-name:var(--font-jetbrains-mono)] mb-4">
              External Site Redirect
            </p>
            <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-sora)] font-bold text-[var(--text-primary)] mb-4">
              One more step before you leave FluxPlays
            </h1>
            <p className="mx-auto max-w-2xl text-[15px] text-[var(--text-secondary)] leading-7">
              We keep you on FluxPlays a little longer so you can view this quick message and continue safely to the community site you selected.
            </p>
          </div>

          <div className="mt-10 rounded-[20px] border border-[var(--border)] bg-[var(--bg-base)] p-6">
            <p className="text-sm text-[var(--text-muted)] uppercase tracking-[0.15em] mb-4">You are visiting</p>
            <p className="text-[var(--text-primary)] font-bold text-3xl break-words mb-4 font-[family-name:var(--font-sora)]">
              {siteName || destinationHost || "Unknown destination"}
            </p>
            {siteDesc && (
              <p className="text-[var(--text-secondary)] text-[15px] mb-4 leading-relaxed">
                {siteDesc}
              </p>
            )}
            {siteType && (
              <div className="inline-block px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)] text-[var(--accent)] text-[12px] font-semibold uppercase tracking-widest">
                {siteType}
              </div>
            )}
            {destinationUrl && (
              <p className="mt-4 text-xs text-[var(--text-muted)]">
                {destinationUrl}
              </p>
            )}
          </div>

          <div className="mt-6">
            <div className="mt-6">
              <iframe
                title="sponsor-loader"
                src="https://omg10.com/4/11083927"
                className="w-full h-56 md:h-96 rounded-lg border border-[var(--border)]"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">You are leaving FluxPlays and visiting a third-party website.</p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">{siteName || destinationHost || "Unknown destination"}</p>

            <div className="mt-4">
              <button
                type="button"
                disabled={!isValidDestination || !enabled}
                onClick={continueToWebsite}
                className="inline-flex items-center justify-center rounded-[12px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[var(--accent-hover)]"
              >
                {isValidDestination ? (enabled ? 'Continue to Website' : `Please wait ${count} seconds...`) : 'Invalid destination'}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            <p>
              You will only leave FluxPlays when you click the button above.
            </p>
            <p className="mt-2">
              If you do not wish to continue, use the browser back button or return to the community page.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
