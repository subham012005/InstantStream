import { Metadata } from "next";
import { Suspense } from "react";
import ImdbPlayerClient from "@/components/ImdbPlayerClient";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["imdb-movie-stream-player"];

export const metadata: Metadata = {
  title: "IMDb ID Movie Player — Stream Any Movie by IMDb ID Free FluxPlays",
  description: "Paste any IMDb ID like tt0111161 and watch the movie instantly in your browser. Free IMDb movie stream player — no signup, no downloads.",
  keywords: [
    "imdb id movie player", "stream movie by imdb id",
    "watch movie using imdb id", "imdb id player online free",
    "paste imdb id watch movie", "tt0111161 watch online",
    "imdb movie stream player", "watch movie by imdb code",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "IMDb ID Movie Player — Stream Any Movie by IMDb ID Free FluxPlays",
    description: "Paste any IMDb ID like tt0111161 and watch the movie instantly in your browser. Free IMDb movie stream player — no signup, no downloads.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMDb ID Movie Player — Stream Any Movie by IMDb ID Free FluxPlays",
    description: "Paste any IMDb ID like tt0111161 and watch the movie instantly in your browser. Free IMDb movie stream player — no signup, no downloads.",
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
      <Suspense fallback={<div className="min-h-screen bg-[#080810] flex items-center justify-center">Loading player...</div>}>
        <ImdbPlayerClient data={data} />
      </Suspense>
    </>
  );
}
