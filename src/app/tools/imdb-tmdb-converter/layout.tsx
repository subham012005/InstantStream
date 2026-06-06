import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IMDb to TMDB ID Converter — Free Online Tool",
  description: "Convert any IMDb ID to TMDB ID instantly. Free online IMDb to TMDB converter tool — paste tt ID and get matching TMDB ID with full movie metadata.",
  keywords: [
    "imdb to tmdb converter", "imdb id to tmdb id",
    "convert imdb to tmdb online", "tmdb to imdb converter",
    "find tmdb id from imdb", "movie id converter online",
    "imdb tmdb mapping tool",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://fluxplays.live/tools/imdb-tmdb-converter" },
  openGraph: {
    title: "IMDb to TMDB ID Converter — Free Online Tool",
    description: "Convert any IMDb ID to TMDB ID instantly. Free online IMDb to TMDB converter tool — paste tt ID and get matching TMDB ID with full movie metadata.",
    url: "https://fluxplays.live/tools/imdb-tmdb-converter",
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMDb to TMDB ID Converter — Free Online Tool",
    description: "Convert any IMDb ID to TMDB ID instantly. Free online IMDb to TMDB converter tool — paste tt ID and get matching TMDB ID with full movie metadata.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
