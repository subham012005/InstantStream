import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["stream-videos-without-downloading"];

export const metadata: Metadata = {
  title: "Stream Videos Without Downloading — Zero-Download Browser Player | FluxPlays",
  description:
    "Watch any video online without downloading it to your device. Paste MP4, HLS, Google Drive or Telegram links and stream instantly — nothing saved, nothing wasted.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Stream Videos Without Downloading | FluxPlays",
    description: "Watch any video without downloading. paste and stream — nothing saved to your device.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function StreamWithoutDownloadingPage() {
  return <LandingPage data={data} />;
}
