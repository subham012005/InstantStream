import { Metadata } from "next";

// /search is noindex — it's a client-side utility page, not indexable content
export const metadata: Metadata = {
  title: "Search | FluxPlays",
  description: "Search guides, comparisons, and streaming articles on FluxPlays.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://fluxplays.vercel.app/search",
  },
};
