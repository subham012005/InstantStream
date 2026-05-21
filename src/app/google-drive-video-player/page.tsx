import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["google-drive-video-player"];

export const metadata: Metadata = {
  title: "Google Drive Video Player — Stream Drive Videos Without Downloading | FluxPlays",
  description:
    "Watch Google Drive videos online instantly without downloading. Paste your shared Google Drive video link and stream it in a full-featured browser player.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Google Drive Video Player — Stream Without Downloading | FluxPlays",
    description: "Watch Google Drive videos instantly without downloading. Full HD player right in your browser.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function GoogleDrivePlayerPage() {
  return <LandingPage data={data} />;
}
