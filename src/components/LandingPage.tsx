import Link from "next/link";
import Logo from "@/components/Logo";
import FAQSection from "@/components/FAQSection";
import type { LandingPageData } from "@/app/landingPagesData";

export default function LandingPage({ data }: { data: LandingPageData }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${data.headlinePart1} ${data.headlinePart2}`,
    description: data.subheadline,
    url: data.canonicalUrl,
    isPartOf: { "@type": "WebSite", name: "FluxPlays", url: "https://fluxplays.vercel.app" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

      <div className="min-h-screen bg-background text-on-surface">

        {/* ── MINIMAL HEADER ── */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-on-surface hover:opacity-80 transition-opacity">
              <Logo className="w-7 h-7" />
              <span className="text-lg tracking-tight">FluxPlays</span>
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm text-on-surface-variant">
              <Link href="/blog" className="hover:text-on-surface transition-colors">Blog</Link>
              <Link href="/guides" className="hover:text-on-surface transition-colors">Guides</Link>
              <Link href="/about" className="hover:text-on-surface transition-colors">About</Link>
            </nav>
            <Link
              href="/"
              className="premium-button-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              Try Free →
            </Link>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16">
          {/* Animated background orbs */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "700px", height: "700px",
              top: "-200px", left: "-200px",
              background: data.accentColor,
              opacity: 0.12,
              filter: "blur(140px)",
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "500px", height: "500px",
              bottom: "-100px", right: "-100px",
              background: data.secondaryColor,
              opacity: 0.1,
              filter: "blur(120px)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(128,128,128,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.05) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />

          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-24">
            {/* Animated badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-8 border uppercase tracking-widest"
              style={{
                background: `${data.accentColor}18`,
                borderColor: `${data.accentColor}50`,
                color: data.accentColor,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: data.accentColor, boxShadow: `0 0 8px ${data.accentColor}` }}
              />
              {data.badge}
            </div>

            {/* H1 headline */}
            <h1
              className="font-bold mb-6 text-on-surface"
              style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: "1.05" }}
            >
              {data.headlinePart1}{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${data.accentColor} 0%, ${data.secondaryColor} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {data.headlinePart2}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              {data.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link
                href="/"
                className="premium-button-gradient button-glow-ring inline-flex items-center gap-2 px-9 py-4 rounded-full text-white font-semibold text-base shadow-2xl hover:scale-105 active:scale-95 transition-transform"
              >
                {data.ctaText}
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-medium text-on-surface-variant border border-outline hover:border-primary hover:text-on-surface transition-all bg-surface"
              >
                Read the Guide
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-on-surface-variant">
              {["No account required", "Zero downloads", "100% free", "Privacy-first", "No ads"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span style={{ color: data.accentColor }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-24 bg-surface-dim">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span
                className="text-xs font-bold uppercase tracking-widest mb-3 block"
                style={{ color: data.accentColor }}
              >
                Why FluxPlays
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-on-surface"
                style={{ letterSpacing: "-0.02em" }}
              >
                Everything You Need, Nothing You Don't
              </h2>
              <p className="text-on-surface-variant mt-4 max-w-xl mx-auto text-base">
                Built for speed and privacy — no bloat, no sign-ups, no nonsense.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.features.map((feature, i) => (
                <div
                  key={i}
                  className="feature-card p-6 rounded-2xl bg-surface border border-outline-variant group cursor-default"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${data.accentColor}15` }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-on-surface mb-2">{feature.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 bg-background">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <span
                className="text-xs font-bold uppercase tracking-widest mb-3 block"
                style={{ color: data.accentColor }}
              >
                Simple Steps
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-on-surface"
                style={{ letterSpacing: "-0.02em" }}
              >
                How It Works
              </h2>
              <p className="text-on-surface-variant mt-4 max-w-md mx-auto text-base">
                Three steps from link to stream. No friction, no fuss.
              </p>
            </div>

            <div className="space-y-5">
              {data.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-6 p-6 rounded-2xl bg-surface border border-outline-variant items-start hover:border-outline transition-colors"
                >
                  <div
                    className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${data.accentColor} 0%, ${data.secondaryColor} 100%)`,
                    }}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface mb-1.5 text-base">{step.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini CTA after steps */}
            <div className="mt-10 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
                style={{ background: `linear-gradient(135deg, ${data.accentColor}, ${data.secondaryColor})` }}
              >
                Try It Now — It's Free →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <div className="bg-surface-dim">
          <FAQSection
            title="Frequently Asked Questions"
            subtitle="FAQ"
            description="Everything you need to know about streaming with FluxPlays."
            faqs={data.faqs}
          />
        </div>

        {/* ── RELATED PAGES ── */}
        <section className="py-16 bg-background border-t border-outline-variant">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-lg font-semibold text-on-surface mb-6 text-center">
              Explore More Players
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {data.relatedLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary bg-surface transition-all hover:-translate-y-0.5"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section
          className="py-24 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${data.accentColor}20 0%, ${data.secondaryColor}20 100%)` }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, ${data.accentColor}30 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
              opacity: 0.4,
            }}
          />
          <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border uppercase tracking-widest"
              style={{ background: `${data.accentColor}18`, borderColor: `${data.accentColor}50`, color: data.accentColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: data.accentColor }} />
              Free Forever
            </div>
            <h2
              className="text-2xl md:text-4xl font-bold text-on-surface mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              Ready to Stream?
            </h2>
            <p className="text-on-surface-variant mb-9 leading-relaxed">
              No sign-up. No download. No credit card. Just paste your link and FluxPlays handles the rest — instantly.
            </p>
            <Link
              href="/"
              className="premium-button-gradient button-glow-ring inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-semibold text-base shadow-2xl hover:scale-105 active:scale-95 transition-transform"
            >
              Open FluxPlays Free →
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-10 bg-surface border-t border-outline-variant">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2 font-semibold text-on-surface opacity-80 hover:opacity-100 transition-opacity">
                <Logo className="w-5 h-5" />
                <span className="text-sm">FluxPlays</span>
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-on-surface-variant">
                <Link href="/" className="hover:text-on-surface transition-colors">Player</Link>
                <Link href="/blog" className="hover:text-on-surface transition-colors">Blog</Link>
                <Link href="/guides" className="hover:text-on-surface transition-colors">Guides</Link>
                <Link href="/about" className="hover:text-on-surface transition-colors">About</Link>
                <Link href="/contact" className="hover:text-on-surface transition-colors">Contact</Link>
                <Link href="/privacy" className="hover:text-on-surface transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-on-surface transition-colors">Terms</Link>
                <Link href="/cookie-notice" className="hover:text-on-surface transition-colors">Cookie Notice</Link>
              </div>
              <p className="text-xs text-on-surface-variant">© 2026 FluxPlays. Free forever.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
