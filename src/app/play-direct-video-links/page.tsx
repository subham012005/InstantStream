import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["play-direct-video-links"];

export const metadata: Metadata = {
  title: "Play Direct Video Links Online — Universal URL Video Player | FluxPlays",
  description:
    "Play direct video URLs effortlessly online. FluxPlays supports MP4, WebM, HLS, and more — paste any raw video link for instant browser streaming with no plugins.",
  keywords: [
    "play video links",
    "direct video link player",
    "URL video player",
    "universal video player",
    "stream MP4 links",
    "online video player",
    "browser video player",
    "direct link streaming",
    "video URL player",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Play Direct Video Links Online | FluxPlays",
    description: "Convert raw video URLs into instant streams. Universal link player in your browser.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Direct Video Links Online | FluxPlays",
    description: "Universal video player for direct URLs - paste any link and play instantly.",
  },
};

export default function PlayDirectVideoLinksPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Play Direct Video Links",
    description: "Universal video player for direct video links.",
    thumbnailUrl: "https://fluxplays.vercel.app/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - Direct Video Link Player",
    description: "Free universal video player for direct URL streaming",
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
  return <LandingPage data={data} />;
}
