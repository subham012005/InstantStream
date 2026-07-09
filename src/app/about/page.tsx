import Link from "next/link";
import Logo from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About FluxPlays | The Modern Web Video Streaming App",
  description: "Learn about FluxPlays, the team behind the modern browser video streaming utility, our mission, and our engineering principles.",
  alternates: { canonical: "https://fluxplays.live/about" },
};

export default function AboutPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "FluxPlays",
      "url": "https://fluxplays.live",
      "logo": "https://fluxplays.live/og-image.png",
      "foundingDate": "2026-01-01"
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-[720px] mx-auto px-6 pt-24 pb-16 prose dark:prose-invert">
        <h1>About FluxPlays</h1>
        <p>FluxPlays (formerly InstantStream) was built out of a fundamental frustration with the modern web: watching a video you have the link to shouldn't require installing bulky applications or waiting for multi-gigabyte downloads to finish.</p>
        <h2>Our Mission</h2>
        <p>Our mission is to bring zero-latency, high-performance video streaming back to the open web. By leveraging HLS capabilities, progressive chunking, and Edge computing via Vercel, we have engineered a player that can stream almost any valid video URL instantly in your browser.</p>
        <h2>The Team</h2>
        <p>FluxPlays is maintained by a team of open-source contributors passionate about web performance and frontend architectures. View our <Link href="/creators">Creators page</Link> for more information.</p>
      </main>
    </div>
  );
}
