import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["google-drive-video-player"];

export const metadata: Metadata = {
  title: "Google Drive Video Player — Stream Drive Videos Without Downloading | FluxPlays",
  description:
    "Watch Google Drive videos online instantly without downloading. Paste your shared Google Drive video link and stream it in a full-featured browser player.",
  keywords: [
    "Google Drive video player",
    "stream Google Drive videos",
    "Google Drive player online",
    "watch Drive videos",
    "Google Drive streaming",
    "video player for Google Drive",
    "browser video player",
    "cloud storage video player",
    "online video streaming",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Google Drive Video Player — Stream Without Downloading | FluxPlays",
    description: "Watch Google Drive videos instantly without downloading. Full HD player right in your browser.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Google Drive Video Player | FluxPlays",
    description: "Stream Google Drive videos instantly without downloading them to your device.",
  },
};

export default function GoogleDrivePlayerPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Google Drive Video Player",
    description: "Stream Google Drive videos directly in your browser.",
    thumbnailUrl: "https://fluxplays.vercel.app/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - Google Drive Video Player",
    description: "Free online player to stream Google Drive videos without downloading",
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
