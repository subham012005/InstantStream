import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["direct-video-link-tester"];

export const metadata: Metadata = {
  title: "Direct Video Link Tester & Validator | Check Server CORS | FluxPlays",
  description: data.subheadline,
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Direct Video Link Tester & Validator | FluxPlays Tools",
    description: data.subheadline,
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function DirectVideoLinkTesterPage() {
  return <LandingPage data={data} />;
}
