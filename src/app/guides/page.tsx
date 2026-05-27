import { guides } from "./guideData";
import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { ArrowLeft, BookOpen, Play } from "lucide-react";

export const metadata: Metadata = {
  title: "Streaming Guides & Comparisons | FluxPlays",
  description:
    "Comprehensive guides, comparisons, and technical blueprints for building and understanding modern video streaming platforms.",
  alternates: { canonical: "https://fluxplays.live/guides" },
  openGraph: {
    title: "Streaming Guides & Comparisons | FluxPlays",
    description: "Deep-dive programmatic SEO guides on video streaming.",
    url: "https://fluxplays.live/guides",
  },
};

export default function GuidesIndex() {
  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-[1200px] mx-auto px-6 md:px-16 pt-24 pb-16">
        <div className="mb-14">
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-3 block">Programmatic SEO Hub</span>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4 leading-tight">
            Streaming Infrastructure Guides
          </h1>
          <p className="text-on-surface-variant text-body-md max-w-xl">
            Technical breakdowns, comparisons, and tutorials on how modern video platforms deliver content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group glass-panel rounded-2xl border border-black/5 dark:border-white/5 hover:border-primary/20 overflow-hidden transition-all duration-300 flex flex-col"
            >
              <div className="h-44 bg-gradient-to-br from-secondary/10 via-surface-container to-primary/5 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-secondary/30" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">
                  {guide.category}
                </span>
                <h2 className="font-semibold text-on-surface text-base leading-snug mb-2 group-hover:text-primary transition-colors">
                  {guide.title}
                </h2>
                <div className="flex items-center justify-between mt-auto pt-5">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span>{guide.publishDate}</span>
                  </div>
                  <span className="text-secondary text-xs font-medium group-hover:underline">Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 glass-panel rounded-3xl p-10 text-center border border-black/5">
          <h2 className="font-headline-lg text-on-surface mb-3">Experience the tech live</h2>
          <p className="text-on-surface-variant mb-6 max-w-sm mx-auto">
            Try the FluxEngine for yourself. Paste a link and watch instantly.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
            <Play className="w-4 h-4 fill-current" />
            Launch App
          </Link>
        </div>
      </main>

    </div>
  );
}
