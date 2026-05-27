import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["browser-video-player-online"];

export const metadata: Metadata = {
  title: "Browser Video Player Online | Zero Installation | FluxPlays",
  description: data.subheadline,
  keywords: [
    "browser video player",
    "online video player",
    "web video player",
    "stream video online",
    "no download video player",
    "HTML5 video player",
    "video streaming",
    "play video online",
    "free video player",
    "instant video player",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Browser Video Player Online | Zero Installation | FluxPlays",
    description: data.subheadline,
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browser Video Player Online | FluxPlays",
    description: "Zero installation browser-based video player for streaming any video URL.",
  },
};

export default function BrowserVideoPlayerPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Browser Video Player Online",
    description: "Zero installation browser-based video player for streaming content.",
    thumbnailUrl: "https://fluxplays.vercel.app/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - Browser Video Player",
    description: "Free online browser-based video player with zero installation",
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
