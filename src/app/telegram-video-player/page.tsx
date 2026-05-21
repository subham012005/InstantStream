import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["telegram-video-player"];

export const metadata: Metadata = {
  title: "Telegram Video Player Online — Stream Telegram Videos in Browser | FluxPlays",
  description:
    "Stream Telegram videos online in your browser. Paste any public Telegram CDN video link and watch it instantly — no Telegram app, no downloading required.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "Telegram Video Player Online — Stream in Browser | FluxPlays",
    description: "Stream Telegram CDN videos instantly in your browser. No app, no download required.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function TelegramVideoPlayerPage() {
  return <LandingPage data={data} />;
}
