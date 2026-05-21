import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["play-direct-video-links"];

export const metadata: Metadata = {
  title: "Play Direct Video Links Online — Universal URL Video Player | FluxPlays",
  description:
    "Play direct video URLs effortlessly online. FluxPlays supports MP4, WebM, HLS, and more — paste any raw video link for instant browser streaming with no plugins.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Play Direct Video Links Online | FluxPlays",
    description: "Convert raw video URLs into instant streams. Universal link player in your browser.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function PlayDirectVideoLinksPage() {
  return <LandingPage data={data} />;
}
