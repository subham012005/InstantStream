import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["no-download-video-streaming"];

export const metadata: Metadata = {
  title: "No Download Video Streaming — Watch Online Without Saving Files | FluxPlays",
  description:
    "Watch any video online without saving it. 100% browser-based streaming — no downloads, no installs, no storage drain. Paste a link and press play instantly.",
  keywords: [
    "no download video streaming",
    "stream video without downloading",
    "online video streaming",
    "stream without saving",
    "browser streaming",
    "zero-download player",
    "video player no download",
    "cloud streaming",
    "instant video player",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "No Download Video Streaming — Watch Without Saving | FluxPlays",
    description: "100% browser-based streaming. No downloads, no installs, no storage drain. Paste and play.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "No Download Video Streaming | FluxPlays",
    description: "Stream videos online without downloading or saving any files to your device.",
  },
};

export default function NoDownloadVideoStreamingPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "No Download Video Streaming",
    description: "Stream videos online without saving them to your device.",
    thumbnailUrl: "https://fluxplays.vercel.app/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - No Download Video Streaming",
    description: "Free online video streaming without downloads or storage drain",
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
