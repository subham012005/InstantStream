import Link from "next/link";
import Logo from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators & Authors | FluxPlays",
  description: "Meet the engineering team behind FluxPlays. Read our technical backgrounds and track records in building modern React web apps.",
  alternates: { canonical: "https://fluxplays.vercel.app/creators" },
};

export default function CreatorsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "Subham Sharma",
      "jobTitle": "Lead Developer",
      "url": "https://fluxplays.vercel.app/creators",
      "sameAs": [
        "https://github.com/subham012005"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-[720px] mx-auto px-6 pt-24 pb-16 prose dark:prose-invert">
        <h1>Authors & Creators</h1>
        <p>FluxPlays is built and maintained by individuals deeply embedded in the React and open-source ecosystems.</p>
        <div className="border border-black/10 dark:border-white/10 p-6 rounded-xl mt-8">
          <h2>Subham Sharma</h2>
          <p className="text-sm uppercase tracking-widest text-primary font-bold">Creator & Lead Engineer</p>
          <p>Full-stack developer focusing on Next.js performance optimization and streaming architectures.</p>
          <a href="https://github.com/subham012005" target="_blank" className="text-primary hover:underline">GitHub Profile</a>
        </div>
      </main>
    </div>
  );
}
