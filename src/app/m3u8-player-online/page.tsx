import { Metadata } from "next";
import Script from "next/script";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["m3u8-player-online"];

export const metadata: Metadata = {
  title: "M3U8 Player Online — Open Any HLS Link in Your Browser | FluxPlays",
  description:
    "Open and play any .m3u8 HLS playlist link directly in your browser. No VLC, no media player install. Fast M3U8 decoding with adaptive bitrate and live stream support.",
  keywords: [
    "M3U8 player online",
    "HLS playlist player",
    "play M3U8 files",
    "stream M3U8 links",
    "HLS stream player web",
    "online video streaming",
    "browser video player",
    "adaptive bitrate streaming",
    "hls.js",
    "IPTV player",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "M3U8 Player Online — Open Any HLS Link in Browser | FluxPlays",
    description: "Play any .m3u8 HLS link directly in your browser. No VLC needed. Adaptive bitrate, live streams.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "M3U8 Player Online | FluxPlays",
    description: "Play HLS and M3U8 streams directly in your browser.",
  },
};

export default function M3u8PlayerOnlinePage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "M3U8 Player Online",
    description: "Stream M3U8 and HLS playlists directly in your browser.",
    thumbnailUrl: "https://fluxplays.live/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - M3U8 Player Online",
    description: "Free online M3U8 and HLS stream player",
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
