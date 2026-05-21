import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["m3u8-player-online"];

export const metadata: Metadata = {
  title: "M3U8 Player Online — Open Any HLS Link in Your Browser | FluxPlays",
  description:
    "Open and play any .m3u8 HLS playlist link directly in your browser. No VLC, no media player install. Fast M3U8 decoding with adaptive bitrate and live stream support.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "M3U8 Player Online — Open Any HLS Link in Browser | FluxPlays",
    description: "Play any .m3u8 HLS link directly in your browser. No VLC needed. Adaptive bitrate, live streams.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function M3u8PlayerOnlinePage() {
  return <LandingPage data={data} />;
}
