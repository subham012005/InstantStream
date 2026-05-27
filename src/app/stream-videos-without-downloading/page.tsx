import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["stream-videos-without-downloading"];

export const metadata: Metadata = {
  title: "Stream Videos Without Downloading — Zero-Download Browser Player | FluxPlays",
  description:
    "Watch any video online without downloading it to your device. Paste MP4, HLS, Google Drive or Telegram links and stream instantly — nothing saved, nothing wasted.",
  keywords: [
    "stream videos without downloading",
    "zero download video player",
    "online streaming",
    "stream without saving",
    "browser video player",
    "cloud streaming",
    "instant video playback",
    "no installation video player",
    "video streaming service",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Stream Videos Without Downloading | FluxPlays",
    description: "Watch any video without downloading. paste and stream — nothing saved to your device.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stream Videos Without Downloading | FluxPlays",
    description: "Stream any video online without saving it to your device. Instant playback, zero storage.",
  },
};

export default function StreamWithoutDownloadingPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Stream Videos Without Downloading",
    description: "Stream videos without downloading them to your device.",
    thumbnailUrl: "https://fluxplays.vercel.app/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - Stream Without Downloading",
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
  return <LandingPage data={data} />;
}
