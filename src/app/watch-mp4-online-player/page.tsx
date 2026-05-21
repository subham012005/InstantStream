import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["watch-mp4-online-player"];

export const metadata: Metadata = {
  title: "Watch MP4 Online Player — Stream MP4 Videos Instantly | FluxPlays",
  description:
    "Fast, secure online MP4 video player. Paste your direct MP4 URL and watch instantly in your browser — no downloads, no plugins, no account required.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Watch MP4 Online Player — Stream MP4 Videos Instantly | FluxPlays",
    description: "Fast, secure online MP4 video player. Paste your direct MP4 URL and watch instantly in your browser.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function WatchMp4OnlinePlayerPage() {
  return <LandingPage data={data} />;
}
