import { Metadata } from "next";
import ImdbPlayerClient from "@/components/ImdbPlayerClient";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["imdb-movie-stream-player"];

export const metadata: Metadata = {
  title: "Stream Movies via IMDb ID Instantly | FluxPlays",
  description:
    "Paste any valid IMDb ID to find and stream your favorite movies directly in your browser without downloads or sign-ups.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Stream Movies via IMDb ID Instantly | FluxPlays",
    description: "Paste any valid IMDb ID (like tt0111161) to find and stream movies directly in your browser.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function ImdbMovieStreamPlayerPage() {
  return <ImdbPlayerClient data={data} />;
}
