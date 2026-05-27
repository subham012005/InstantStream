import { Metadata } from "next";
import ImdbPlayerClient from "@/components/ImdbPlayerClient";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["imdb-movie-stream-player"];

export const metadata: Metadata = {
  title: "Stream Movies via IMDb ID Instantly | FluxPlays",
  description:
    "Paste any valid IMDb ID to find and stream your favorite movies directly in your browser without downloads or sign-ups.",
  keywords: [
    "IMDb movie player",
    "stream IMDb movies",
    "watch movies online",
    "IMDb ID streaming",
    "movie streaming",
    "online movie player",
    "free movie streaming",
    "browser video player",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Stream Movies via IMDb ID Instantly | FluxPlays",
    description: "Paste any valid IMDb ID (like tt0111161) to find and stream movies directly in your browser.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMDb Movie Streaming Player | FluxPlays",
    description: "Stream movies using IMDb IDs instantly.",
  },
};

export default function ImdbMovieStreamPlayerPage() {
  const movieSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "IMDb Movie Stream Player",
    description: "Stream movies using their IMDb IDs directly in your browser.",
    thumbnailUrl: "https://fluxplays.live/og-image.png",
    uploadDate: "2026-01-15",
    url: data.canonicalUrl,
  };

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - IMDb Movie Player",
    description: "Free online movie streaming player using IMDb IDs",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <ImdbPlayerClient data={data} />
    </>
  );
}
