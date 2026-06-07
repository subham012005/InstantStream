import Script from "next/script";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Blocked - Developer Tools Detected",
  robots: { index: false, follow: false },
};

export default function BlockedPage() {
  return (
    <div className="fixed inset-0 z-[999999] bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col min-h-screen overflow-y-auto">
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
              Please close your developer tools to continue using FluxPlays.
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
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[12px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
