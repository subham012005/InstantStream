import { Metadata } from "next";
import { Suspense } from "react";
import ImdbPlayerClient from "@/components/ImdbPlayerClient";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["imdb-movie-stream-player"];

export const metadata: Metadata = {
  title: "IMDbPlayer Free — Watch Movies Using IMDb ID | FluxPlays",
  description: "Looking for an IMDb player free of ads? FluxPlays is the ultimate IMDb movie viewer where you can play movies by IMDb ID (e.g. tt0111161) online instantly.",
  keywords: [
    "imdbplayer",
    "imdb player free",
    "imdb player",
    "imdp player",
    "watch movies using imdb id",
    "a movie site where you can play movie by imdb id",
    "imdb movie viewer",
    "imdb id movie player",
    "stream movie by imdb id",
    "imdb id player online free",
    "tt0111161 watch online"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "IMDbPlayer Free — Watch Movies Using IMDb ID | FluxPlays",
    description: "Looking for an IMDb player free of ads? FluxPlays is the ultimate IMDb movie viewer where you can play movies by IMDb ID online instantly.",
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMDbPlayer Free — Watch Movies Using IMDb ID",
    description: "Free online IMDb movie viewer and player.",
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
