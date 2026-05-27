import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["watch-mkv-online-player"];

export const metadata: Metadata = {
  title: "Watch MKV Videos Online Player | Instant Stream | FluxPlays",
  description: data.subheadline,
  keywords: [
    "watch MKV online",
    "MKV player",
    "MKV video player online",
    "stream MKV files",
    "online MKV player",
    "browser video player",
    "video player",
    "free video player",
    "no installation player",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Watch MKV Videos Online Player | Instant Stream | FluxPlays",
    description: data.subheadline,
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch MKV Videos Online | FluxPlays",
    description: "Stream MKV videos instantly in your browser.",
  },
};

export default function WatchMkvOnlinePlayerPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Watch MKV Online Player",
    description: "Stream MKV videos instantly in your browser.",
    thumbnailUrl: "https://fluxplays.live/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - MKV Online Player",
    description: "Free online MKV video player",
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
