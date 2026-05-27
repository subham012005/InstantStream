import { Metadata } from "next";
import Script from "next/script";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["mp4-stream-player"];

export const metadata: Metadata = {
  title: "MP4 Stream Player — Progressive Streaming from Any URL | FluxPlays",
  description:
    "The zero-install MP4 stream player. Paste any direct MP4 URL and get progressive streaming with speed controls, seek, and HD quality — entirely in your browser.",
  keywords: [
    "MP4 stream player",
    "progressive streaming",
    "stream MP4 online",
    "direct MP4 link player",
    "browser video player",
    "online video streaming",
    "MP4 progressive download",
    "playback speed control",
    "4K video streaming",
    "CDN streaming",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "MP4 Stream Player — Progressive Streaming from Any URL | FluxPlays",
    description: "Zero-install MP4 stream player. Paste a direct URL and get progressive streaming with full controls.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "MP4 Stream Player | FluxPlays",
    description: "Stream MP4 videos directly with progressive download and full browser controls.",
  },
};

export default function Mp4StreamPlayerPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "MP4 Stream Player",
    description: "Stream MP4 videos directly from any URL with progressive download.",
    thumbnailUrl: "https://fluxplays.live/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - MP4 Stream Player",
    description: "Free online MP4 progressive streaming player",
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
