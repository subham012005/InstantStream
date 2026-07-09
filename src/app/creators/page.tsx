import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators & Authors | FluxPlays",
  description: "Meet the engineering team behind FluxPlays. Read our technical backgrounds and track records in building modern React web apps.",
  alternates: { canonical: "https://fluxplays.live/creators" },
};

export default function CreatorsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Organization",
      "name": "FluxPlays Team",
      "url": "https://fluxplays.live/about"
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-[720px] mx-auto px-6 pt-24 pb-16 prose dark:prose-invert">
        <h1>Authors & Creators</h1>
        <p>FluxPlays is built and maintained by a team of developers passionate about building modern web application architectures and open-source video streaming tools.</p>
        <div className="border border-black/10 dark:border-white/10 p-6 rounded-xl mt-8">
          <h2>FluxPlays Team</h2>
          <p className="text-sm uppercase tracking-widest text-primary font-bold">Open Source Contributors</p>
          <p>We are a group of developers focusing on Next.js performance optimization and streaming architectures.</p>
        </div>
      </main>
    </div>
  );
}
