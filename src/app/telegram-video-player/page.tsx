import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["telegram-video-player"];

export const metadata: Metadata = {
  title: "Telegram Video Player Online — Stream Telegram Videos in Browser | FluxPlays",
  description:
    "Stream Telegram videos online in your browser. Paste any public Telegram CDN video link and watch it instantly — no Telegram app, no downloading required.",
  keywords: [
    "Telegram video player",
    "stream Telegram videos",
    "Telegram CDN player",
    "watch Telegram videos",
    "Telegram video streaming",
    "online Telegram player",
    "browser video player",
    "Telegram video link player",
    "instant video streaming",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Telegram Video Player Online — Stream in Browser | FluxPlays",
    description: "Stream Telegram CDN videos instantly in your browser. No app, no download required.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Telegram Video Player Online | FluxPlays",
    description: "Stream Telegram videos directly in your browser without the app.",
  },
};

export default function TelegramVideoPlayerPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Telegram Video Player Online",
    description: "Stream Telegram videos directly in your browser.",
    thumbnailUrl: "https://fluxplays.live/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - Telegram Video Player",
    description: "Free online player to stream Telegram videos without the app",
    url: data.canonicalUrl,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <LandingPage data={data} />
    </>
  );
}
