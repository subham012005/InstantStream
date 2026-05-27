import { articles } from "./articles";
import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { ArrowLeft, FileText, Play } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Streaming Guides & Tutorials | FluxPlays",
  description:
    "Learn how to stream videos online, understand video formats, and get the most out of browser-based video streaming. Free guides from FluxPlays.",
  alternates: { canonical: "https://fluxplays.live/blog" },
  openGraph: {
    title: "Blog — Streaming Guides & Tutorials | FluxPlays",
    description: "Browser streaming guides, video format comparisons, and tutorials.",
    url: "https://fluxplays.live/blog",
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-[1200px] mx-auto px-6 md:px-16 pt-24 pb-16">
        {/* Hero */}
        <div className="mb-14">
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-3 block">Guides &amp; Tutorials</span>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4 leading-tight">
            Learn how streaming works
          </h1>
          <p className="text-on-surface-variant text-body-md max-w-xl">
            Practical guides on browser video streaming, video formats, and getting the most out of instant online playback.
          </p>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group glass-panel rounded-2xl border border-black/5 dark:border-white/5 hover:border-primary/20 overflow-hidden transition-all duration-300 flex flex-col"
            >
              <div className="h-44 bg-gradient-to-br from-primary/10 via-surface-container to-secondary/5 flex items-center justify-center">
                <FileText className="w-16 h-16 text-primary/30" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
                  {post.tag}
                </span>
                <h2 className="font-semibold text-on-surface text-base leading-snug mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed flex-1">{post.intro.slice(0, 120)}…</p>
                <div className="flex items-center justify-between mt-5">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <span className="text-primary text-xs font-medium group-hover:underline">Read →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 glass-panel rounded-3xl p-10 text-center border border-black/5">
          <h2 className="font-headline-lg text-on-surface mb-3">Ready to try it?</h2>
          <p className="text-on-surface-variant mb-6 max-w-sm mx-auto">
            Paste any video link and stream it instantly — no account, no download.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Streaming Free
          </Link>
        </div>
      </main>

    </div>
  );
}
