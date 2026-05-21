import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["no-download-video-streaming"];

export const metadata: Metadata = {
  title: "No Download Video Streaming — Watch Online Without Saving Files | FluxPlays",
  description:
    "Watch any video online without saving it. 100% browser-based streaming — no downloads, no installs, no storage drain. Paste a link and press play instantly.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "No Download Video Streaming — Watch Without Saving | FluxPlays",
    description: "100% browser-based streaming. No downloads, no installs, no storage drain. Paste and play.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function NoDownloadVideoStreamingPage() {
  return <LandingPage data={data} />;
}
