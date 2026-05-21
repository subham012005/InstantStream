import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["mp4-stream-player"];

export const metadata: Metadata = {
  title: "MP4 Stream Player — Progressive Streaming from Any URL | FluxPlays",
  description:
    "The zero-install MP4 stream player. Paste any direct MP4 URL and get progressive streaming with speed controls, seek, and HD quality — entirely in your browser.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "MP4 Stream Player — Progressive Streaming from Any URL | FluxPlays",
    description: "Zero-install MP4 stream player. Paste a direct URL and get progressive streaming with full controls.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function Mp4StreamPlayerPage() {
  return <LandingPage data={data} />;
}
