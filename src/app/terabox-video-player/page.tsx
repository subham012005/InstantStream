import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { landingPages } from "@/app/landingPagesData";
import FAQSection from "@/components/FAQSection";
import TeraBoxPlayerClient from "@/components/TeraBoxPlayerClient";

const data = landingPages["terabox-video-player"];

export const metadata: Metadata = {
  title: "TeraBox Video Player Online — Watch TeraBox Videos Without Login",
  description:
    "Free online TeraBox video player and viewer. Paste any public TeraBox video share link to stream and watch online directly in your browser without login or downloading.",
  keywords: [
    "terabox video player online",
    "watch terabox video without login",
    "terabox link player",
    "play terabox video online",
    "terabox video viewer",
    "terabox online player",
    "terabox video player online free",
    "terabox link video player",
    "terabox video stream online",
    "play terabox video online without downloading",
    "terabox player web",
    "terabox stream",
    "terabox direct player",
    "watch terabox online",
    "1024tera video player",
    "freeterabox player",
    "terabox video link opener",
    "fluxplays",
    "fluxplays.live",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "TeraBox Video Player Online — Stream Without Login | FluxPlays",
    description:
      "Paste any public TeraBox video share link to stream and watch online directly in your browser without login or downloading.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeraBox Video Player Online | FluxPlays",
    description: "Stream and play TeraBox videos directly in your browser without downloading or logging in.",
  },
};

export default function TeraBoxVideoPlayerPage() {
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "TeraBox Video Player Online",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All (Browser, Windows, Mac, Android, iOS)",
    url: data.canonicalUrl,
    description:
      "Play and watch public TeraBox videos online directly in your browser without login or downloading.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Stream public TeraBox videos online without login",
      "Direct browser playback without downloading large files",
      "Full player controls including seeking, speed, and fullscreen",
      "Support for terabox.com, 1024tera.com, and public mirrors",
      "100% free with no registration required",
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Play TeraBox Video Online Without Login",
    description: "Step-by-step instructions to stream and watch public TeraBox videos in any web browser.",
    step: data.steps.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.title,
      text: s.body,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="min-h-screen bg-[var(--bg-base)] pt-[100px] pb-[60px]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)] mb-8">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--text-primary)] font-medium">TeraBox Video Player</span>
          </nav>

          {/* Heading */}
          <div className="mb-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              {data.badge}
            </div>
            <h1 className="font-[family-name:var(--font-sora)] font-bold text-[36px] md:text-[48px] text-[var(--text-primary)] mb-4 leading-tight">
              {data.headlinePart1}{" "}
              <span style={{ color: "#0086f8" }}>{data.headlinePart2}</span>
            </h1>
            <p className="font-[family-name:var(--font-dm-sans)] text-[16px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
              {data.subheadline}
            </p>
          </div>

          {/* Player Card */}
          <div className="mb-16">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="relative z-10 w-full">
                <TeraBoxPlayerClient />
              </div>
            </div>
          </div>

          {/* Features */}
          <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.features.map((feature, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[14px] p-6 transition-transform hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-2xl mb-4" style={{ background: "rgba(0,134,248,0.1)" }}>
                    {feature.icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-sora)] font-bold text-[16px] text-[var(--text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-20">
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-[24px] text-[var(--text-primary)] mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.steps.map((step, i) => (
                <div key={i} className="flex flex-col">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white mb-4" style={{ background: "#0086f8" }}>
                    {step.step}
                  </div>
                  <h3 className="font-[family-name:var(--font-sora)] font-bold text-[16px] text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)] leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-20">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 md:p-10">
              <FAQSection
                title="Frequently Asked Questions"
                subtitle="FAQ"
                description="Learn more about playing TeraBox videos online."
                faqs={data.faqs}
              />
            </div>
          </section>

          {/* Related Tools */}
          <section>
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-[20px] text-[var(--text-primary)] mb-6">Explore More Tools</h2>
            <div className="flex flex-wrap gap-3">
              {data.relatedLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-secondary)] font-[family-name:var(--font-dm-sans)] hover:border-[#0086f8]/50 hover:text-[var(--text-primary)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
