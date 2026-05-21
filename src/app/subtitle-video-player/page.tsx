import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["subtitle-video-player"];

export const metadata: Metadata = {
  title: "Subtitle Video Player — Watch Videos with SRT & VTT Captions Online | FluxPlays",
  description:
    "Load SRT or VTT subtitle files alongside any video URL and watch with perfectly synced captions in your browser. No uploads, no apps — fully local subtitle support.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Subtitle Video Player — SRT & VTT Captions Online | FluxPlays",
    description: "Load SRT or VTT subtitles on any video URL. Synced captions in your browser — no uploads needed.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function SubtitleVideoPlayerPage() {
  return <LandingPage data={data} />;
}
