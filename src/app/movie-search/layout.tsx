import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movie Search | FluxPlays",
  description: "Search for movies instantly and fetch rich details using our secure API.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
