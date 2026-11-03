import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { landingPages } from "@/app/landingPagesData";
import FAQSection from "@/components/FAQSection";
import TelegramPlayerClient from "@/components/TelegramPlayerClient";

const data = landingPages["telegram-video-player"];

export const metadata: Metadata = {
  title: "Telegram Video Viewer & Player Online — Play Telegram Video Links Without Downloading | FluxPlays",
  description:
    "Free online Telegram video player and viewer. Paste any public Telegram post or CDN video link to stream and watch Telegram videos online in your browser without the app or downloading.",
  keywords: [
    "telegram video viewer",
    "telegram player online",
    "telegram link video player",
    "telegram video player",
    "telegram link player",
    "telegram video player online",
    "telegram video link player",
    "telegram online video player",
    "play telegram video",
    "telegram video watch online",
    "telegram video open",
    "telegram video stream online",
    "telegram link video player online",
    "telegram player video link",
    "telegram video opener",
    "telegram link video play",
    "online telegram video player",
    "telegram link online player",
    "telegram online player",
    "telegram video player online free",
    "telegram link player online",
    "telegram link play",
    "fluplayer telegram",
    "telegram player link",
    "telegram video play",
    "telegram video viewer online",
    "telegram videos player",
    "online telegram player",
    "telegram video link open online",
    "telegram player web",
    "play telegram video online without downloading",
    "teligram video player",
    "telegram player",
    "video player telegram",
    "watch telegram videos online",
    "telegram video watcher",
    "telegram link to video player",
    "cdn video link telegram",
    "telegram video online play",
    "telegram watch online",
    "telegram video player link",
    "telegram player online free",
    "telegram video link player online",
    "telegram video play online",
    "telegram video stream",
    "play telegram video online",
    "telegram video watch online free",
    "telegram video streaming",
    "stream telegram video",
    "telegram video link open",
    "telegram video player by link",
    "telegram web video",
    "telegram video player website",
    "telegram online watch",
    "telegram video watch online without downloading",
    "view telegram video",
    "video player for telegram",
    "telegram cast video link",
    "telegram videos online",
    "telegram online video",
    "telegram videos watch online",
    "telegram movie player",
    "how to play video in telegram without downloading",
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
    title: "Telegram Video Viewer & Player Online — Stream Without Downloading | FluxPlays",
    description:
      "Paste any public Telegram link or CDN video URL and watch instantly in your browser without installing the Telegram app.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Telegram Video Viewer & Online Player | FluxPlays",
    description: "Stream and play Telegram videos directly in your browser without downloading or logging in.",
  },
};

export default function TelegramVideoPlayerPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Telegram Video Viewer & Player Online",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All (Browser, Windows, Mac, Android, iOS)",
    url: data.canonicalUrl,
    description:
      "Play and watch public Telegram videos online directly in your browser without downloading or using the Telegram app.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Stream public Telegram videos without downloading",
      "Automatic video codec compatibility and instant web playback",
      "Extract original Telegram caption and emojis",
      "High-speed full quality original video download",
      "No login or installation required",
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Play Telegram Video Online Without Downloading",
    description: "Step-by-step instructions to open and stream public Telegram videos in any browser.",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />
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
            <span className="text-[var(--text-primary)] font-medium">Telegram Video Player</span>
          </nav>

          {/* Heading */}
          <div className="mb-10 max-w-3xl">
            <h1 className="font-[family-name:var(--font-sora)] font-bold text-[36px] md:text-[48px] text-[var(--text-primary)] mb-4 leading-tight">
              {data.headlinePart1}{" "}
              <span style={{ color: "#0088cc" }}>{data.headlinePart2}</span>
            </h1>
            <p className="font-[family-name:var(--font-dm-sans)] text-[16px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
              {data.subheadline}
            </p>
          </div>

          {/* Player Card */}
          <div className="mb-16">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="relative z-10 w-full">
                <TelegramPlayerClient />
              </div>
            </div>
          </div>

          {/* Features */}
          <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.features.map((feature, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[14px] p-6 transition-transform hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-2xl mb-4" style={{ background: "rgba(0,136,204,0.1)" }}>
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
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white mb-4" style={{ background: "#0088cc" }}>
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
                description="Learn more about streaming Telegram videos."
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
                  className="px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-secondary)] font-[family-name:var(--font-dm-sans)] hover:border-[#0088cc]/50 hover:text-[var(--text-primary)] transition-colors"
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
