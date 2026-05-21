import { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import FAQSection from "@/components/FAQSection";
import { Mail, Zap, BookOpen, Rss, ArrowRight } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter | FluxPlays – Stay Ahead in Streaming",
  description:
    "Subscribe to the FluxPlays newsletter. Get the latest streaming technology guides, platform updates, and developer insights delivered to your inbox.",
  alternates: {
    canonical: "https://fluxplays.vercel.app/newsletter",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "FluxPlays Newsletter",
    description:
      "Subscribe for the latest streaming guides, open-source insights, and video technology news.",
    url: "https://fluxplays.vercel.app/newsletter",
    type: "website",
  },
};

const NEWSLETTER_FAQS = [
  {
    q: "How often will I receive emails?",
    a: "We send one curated email per week, usually on Thursdays. It covers new guides, notable updates to FluxPlays, and streaming technology news. We respect your inbox and will never spam.",
  },
  {
    q: "Will you share my email address?",
    a: "Never. Your email address is solely used to send you the FluxPlays newsletter. We do not sell, rent, or trade subscriber data to any third party.",
  },
  {
    q: "What kind of content will the newsletter include?",
    a: "Expect deep dives on streaming protocols (HLS, WebRTC), new FluxPlays feature announcements, curated open-source streaming project highlights, and practical how-to guides for developers and power users.",
  },
  {
    q: "Can I unsubscribe at any time?",
    a: "Yes. Every email includes a one-click unsubscribe link at the footer. You can also reply directly with 'unsubscribe' to be removed immediately.",
  },
];

export default function NewsletterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://fluxplays.vercel.app/" },
      { "@type": "ListItem", position: 2, name: "Newsletter", item: "https://fluxplays.vercel.app/newsletter" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-black/5 dark:border-white/5 py-5 px-6 md:px-16">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-display-lg text-headline-md tracking-tighter text-on-surface hover:text-primary transition-colors">
            <Logo className="w-8 h-8" />
            <span>FluxPlays</span>
          </Link>
          <Link href="/" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
            Start Streaming
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-24 px-6 max-w-[760px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Mail className="w-4 h-4 text-primary" />
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Weekly Newsletter</span>
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl leading-tight mb-6 text-on-surface">
            Stay ahead with the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              FluxPlays Newsletter
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-10">
            One email per week. Streaming technology breakdowns, open-source tool spotlights, new FluxPlays guides, and developer insights. No fluff. Unsubscribe anytime.
          </p>

          <NewsletterForm />
          <p className="text-xs text-on-surface-variant/60 mt-3">
            No spam, ever. Unsubscribe with one click. Your email stays private.
          </p>
        </section>

        {/* Why Subscribe */}
        <section className="py-16 px-6 bg-surface-container-lowest/40 border-y border-black/5 dark:border-white/5">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-headline-lg text-on-surface text-center mb-12">
              What you get every week
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Streaming Technology Deep Dives",
                  desc: "HLS adaptive bitrate strategy, WebRTC SFU selection, MSE buffer tuning — explained clearly for developers and enthusiasts.",
                },
                {
                  icon: BookOpen,
                  title: "New Guides & Tutorials",
                  desc: "First access to new FluxPlays guides the moment they go live. From beginner walkthroughs to advanced architectural breakdowns.",
                },
                {
                  icon: Rss,
                  title: "Open Source Spotlight",
                  desc: "We curate the best new open-source streaming tools, Jellyfin plugins, and React video libraries published each week.",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="glass-panel p-8 rounded-2xl border border-black/5 hover:border-primary/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="text-primary w-6 h-6" />
                    </div>
                    <h3 className="font-headline-md text-on-surface mb-3">{item.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular guides */}
        <section className="py-16 px-6 max-w-[960px] mx-auto">
          <h2 className="font-headline-md text-on-surface text-center mb-10">
            Start reading before you subscribe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { href: "/blog/best-streaming-platforms-in-2026", label: "Best Streaming Platforms in 2026", tag: "Reviews" },
              { href: "/blog/best-hls-streaming-tools", label: "Best HLS Streaming Tools", tag: "Technical" },
              { href: "/trending/video-streaming-for-developers", label: "Streaming For Developers", tag: "Trending" },
              { href: "/compare/fluxplays-vs-plex", label: "FluxPlays vs Plex", tag: "Comparison" },
              { href: "/blog/best-react-streaming-apps", label: "Best React Streaming Apps", tag: "Development" },
              { href: "/guides", label: "All Streaming Guides →", tag: "Guides" },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="group glass-panel p-5 rounded-xl border border-black/5 hover:border-primary/20 transition-all flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">{link.tag}</span>
                  <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">{link.label}</p>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 text-on-surface-variant group-hover:text-primary transition-colors mt-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <FAQSection
          title="Newsletter FAQ"
          subtitle="Questions"
          description="Everything you need to know before subscribing."
          faqs={NEWSLETTER_FAQS}
          
        />
      </main>

      <footer className="border-t border-black/5 dark:border-white/5 py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-on-surface-variant">
          <span className="flex items-center gap-2">
            <Logo className="w-6 h-6" />© 2026 FluxPlays
          </span>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link href="/guides" className="hover:text-primary transition-colors">Guides</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
