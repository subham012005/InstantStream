import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["browser-video-player-online"];

export const metadata: Metadata = {
  title: "Browser Video Player Online | Zero Installation | FluxPlays",
  description: data.subheadline,
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Browser Video Player Online | Zero Installation | FluxPlays",
    description: data.subheadline,
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function BrowserVideoPlayerPage() {
  return <LandingPage data={data} />;
}
