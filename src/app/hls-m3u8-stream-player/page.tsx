import { Metadata } from "next";
import Script from "next/script";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["hls-m3u8-stream-player"];

export const metadata: Metadata = {
  title: "HLS M3U8 Stream Player — Adaptive Bitrate Streaming in Browser | FluxPlays",
  description:
    "The best online M3U8 player. Stream HLS video playlists directly in your browser with adaptive bitrate. Paste your .m3u8 link for fast, buffer-free playback.",
  keywords: [
    "M3U8 player",
    "HLS stream player",
    "online HLS player",
    "M3U8 online",
    "HLS video streaming",
    "adaptive bitrate streaming",
    "stream M3U8 files",
    "play HLS streams",
    "web-based video player",
    "browser video player",
    "IPTV M3U8",
    "live stream player",
    "hls.js player",
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
    thumbnailUrl: "https://fluxplays.vercel.app/og-image.png",
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
