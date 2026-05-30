import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IMDb ↔ TMDB ID Converter | FluxPlays",
  description: "Convert IMDb IDs to TMDB Movie IDs and vice versa instantly. Free, fast, and no API key required.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
