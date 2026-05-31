import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse & Search Movies Online Free — FluxPlays",
  description: "Search 500K+ movies and stream instantly. Browse free movies online by title, genre or year — no account needed.",
  keywords: [
    "search movies online free", "browse movies online",
    "find movies to watch free", "movie search engine free",
    "discover movies online", "free movie browser",
    "watch movies online free", "online movie finder",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://fluxplays.live/movie-search" },
  openGraph: {
    title: "Browse & Search Movies Online Free — FluxPlays",
    description: "Search 500K+ movies and stream instantly. Browse free movies online by title, genre or year — no account needed.",
    url: "https://fluxplays.live/movie-search",
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse & Search Movies Online Free — FluxPlays",
    description: "Search 500K+ movies and stream instantly. Browse free movies online by title, genre or year — no account needed.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
