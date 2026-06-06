import { Metadata } from "next";
import Script from "next/script";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["hls-m3u8-stream-player"];

export const metadata: Metadata = {
  title: "Free HLS M3U8 Player Online — Test & Play Streams in Browser",
  description: "Play any M3U8 or HLS stream instantly in your browser. Free online HLS player — no install, no signup. Supports live streams, IPTV, and VOD.",
  keywords: [
    "hls player online free", "m3u8 player online",
    "play m3u8 in browser", "hls stream tester",
    "test hls stream online", "m3u8 link player",
    "iptv m3u8 player online", "http live streaming player browser",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "HLS M3U8 Stream Player — Adaptive Bitrate Streaming | FluxPlays",
    description: "Stream HLS M3U8 playlists directly in your browser. Adaptive bitrate, no VLC, no plugins.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "HLS M3U8 Stream Player | FluxPlays",
    description: "Stream M3U8 and HLS playlists directly in your browser with adaptive bitrate streaming.",
  },
};

export default function HlsM3u8StreamPlayerPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "HLS M3U8 Stream Player",
    description: "Stream HLS and M3U8 video playlists directly in your browser with adaptive bitrate streaming.",
    thumbnailUrl: "https://fluxplays.live/og-image.png",
    uploadDate: "2026-01-15",
    duration: "PT5M",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - HLS M3U8 Player",
    description: "Free online HLS and M3U8 stream player for adaptive bitrate video streaming",
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
