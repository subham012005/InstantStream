import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["watch-mp4-online-player"];

export const metadata: Metadata = {
  title: "Watch MP4 Online Player — Stream MP4 Videos Instantly | FluxPlays",
  description:
    "Fast, secure online MP4 video player. Paste your direct MP4 URL and watch instantly in your browser — no downloads, no plugins, no account required.",
  keywords: [
    "watch MP4 online",
    "MP4 video player",
    "online video player",
    "stream MP4 files",
    "watch videos online",
    "browser video player",
    "instant video playback",
    "free video player",
    "no installation player",
    "video streaming",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Watch MP4 Online Player — Stream MP4 Videos Instantly | FluxPlays",
    description: "Fast, secure online MP4 video player. Paste your direct MP4 URL and watch instantly in your browser.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch MP4 Online | FluxPlays",
    description: "Stream MP4 videos instantly in your browser.",
  },
};

export default function WatchMp4OnlinePlayerPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Watch MP4 Online Player",
    description: "Stream MP4 videos instantly in your browser.",
    thumbnailUrl: "https://fluxplays.vercel.app/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - MP4 Online Player",
    description: "Free online MP4 video player with zero installation",
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
