import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { landingPages } from "@/app/landingPagesData";

const data = landingPages["hls-m3u8-stream-player"];

export const metadata: Metadata = {
  title: "HLS M3U8 Stream Player — Adaptive Bitrate Streaming in Browser | FluxPlays",
  description:
    "The best online M3U8 player. Stream HLS video playlists directly in your browser with adaptive bitrate. Paste your .m3u8 link for fast, buffer-free playback.",
  alternates: { canonical: data.canonicalUrl },
  openGraph: {
    title: "HLS M3U8 Stream Player — Adaptive Bitrate Streaming | FluxPlays",
    description: "Stream HLS M3U8 playlists directly in your browser. Adaptive bitrate, no VLC, no plugins.",
    url: data.canonicalUrl,
    type: "website",
  },
};

export default function HlsM3u8StreamPlayerPage() {
  return <LandingPage data={data} />;
}
