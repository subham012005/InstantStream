import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["direct-video-link-tester"];

export const metadata: Metadata = {
  title: "Direct Video Link Tester & Validator | Check Server CORS | FluxPlays",
  description: data.subheadline,
  keywords: [
    "video link tester",
    "URL validator",
    "CORS checker",
    "video link checker",
    "streaming URL test",
    "direct link validator",
    "video URL validation",
    "server CORS test",
    "streaming diagnostics",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Direct Video Link Tester & Validator | FluxPlays Tools",
    description: data.subheadline,
    url: data.canonicalUrl,
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Direct Video Link Tester | FluxPlays",
    description: "Test and validate video URLs with CORS checking and server diagnostics.",
  },
};

export default function DirectVideoLinkTesterPage() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FluxPlays - Video Link Tester",
    description: "Free online video link validator and CORS checker",
    url: data.canonicalUrl,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <LandingPage data={data} />
    </>
  );
}
