import Link from "next/link";
import Logo from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | FluxPlays",
  description: "Read the FluxPlays privacy policy to understand how we protect your data while streaming video content online.",
  alternates: { canonical: "https://fluxplays.vercel.app/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-black/5 dark:border-white/5 py-5 px-6 md:px-16">
        <Link href="/" className="flex items-center gap-2 font-display-lg"><Logo className="w-8 h-8" /><span>FluxPlays</span></Link>
      </header>
      <main className="max-w-[720px] mx-auto px-6 py-16 prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p>Last Updated: May 2026</p>
        <p>At FluxPlays, we take your privacy extremely seriously. Our architecture is fundamentally designed to limit data collection.</p>
        <h2>Data We Don't Collect</h2>
        <ul>
          <li>We do NOT track the URLs you stream.</li>
          <li>We do NOT log your IP address related to streams.</li>
          <li>We do NOT download or cache video files from external sources on our servers.</li>
        </ul>
        <h2>Local Storage</h2>
        <p>Your streaming history is saved exclusively in your browser's local storage (LocalStorage). This data never leaves your device and is only used to populate your 'Recent Streams' list. You can clear this at any time by clearing your browser site data.</p>
        <h2>Analytics</h2>
        <p>We use standard, anonymized analytics (Google Analytics, Vercel Web Analytics) purely to understand traffic scale and ensure performance SLAs. No personal-identifying information is attached to these logs.</p>
      </main>
    </div>
  );
}
