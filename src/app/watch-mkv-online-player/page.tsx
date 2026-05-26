import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["watch-mkv-online-player"];

export const metadata: Metadata = {
  title: "Watch MKV Videos Online Player | Instant Stream | FluxPlays",
  description: data.subheadline,
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Watch MKV Videos Online Player | Instant Stream | FluxPlays",
    description: data.subheadline,
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function WatchMkvOnlinePlayerPage() {
  return <LandingPage data={data} />;
}
