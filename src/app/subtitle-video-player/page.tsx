import { Metadata } from "next";
import Script from "next/script";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["subtitle-video-player"];

export const metadata: Metadata = {
  title: "Subtitle Video Player — Watch Videos with SRT & VTT Captions Online | FluxPlays",
  description:
    "Load SRT or VTT subtitle files alongside any video URL and watch with perfectly synced captions in your browser. No uploads, no apps — fully local subtitle support.",
  keywords: [
    "subtitle video player",
    "SRT player online",
    "VTT captions",
    "video captions",
    "subtitle loader",
    "webvtt player",
    "synced subtitles",
    "video with captions",
    "online subtitle editor",
    "browser video player",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Subtitle Video Player — SRT & VTT Captions Online | FluxPlays",
    description: "Load SRT or VTT subtitles on any video URL. Synced captions in your browser — no uploads needed.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subtitle Video Player | FluxPlays",
    description: "Add SRT and VTT subtitles to any video URL for perfectly synced captions.",
  },
};

export default function SubtitleVideoPlayerPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Subtitle Video Player",
    description: "Watch videos with SRT and VTT subtitles in your browser.",
    thumbnailUrl: "https://fluxplays.vercel.app/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - Subtitle Video Player",
    description: "Free online video player with SRT and VTT subtitle support",
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
