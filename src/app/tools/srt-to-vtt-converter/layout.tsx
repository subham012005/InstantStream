import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SRT to VTT Converter Online — Free Subtitle Converter | FluxPlays",
  description:
    "Convert SRT subtitle files to WebVTT (.vtt) format online instantly. Fast, free, browser-based subtitle converter with live preview and zero file upload limits.",
  keywords: [
    "srt to vtt converter",
    "convert srt to vtt online",
    "subtitle converter free",
    "vtt converter",
    "srt to webvtt",
    "online subtitle format converter",
    "browser subtitle converter",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://fluxplays.live/tools/srt-to-vtt-converter" },
  openGraph: {
    title: "SRT to VTT Converter Online — Free Subtitle Converter | FluxPlays",
    description:
      "Convert SRT subtitle files to WebVTT (.vtt) format online instantly. Fast, free, browser-based subtitle converter with live preview and zero file upload limits.",
    url: "https://fluxplays.live/tools/srt-to-vtt-converter",
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "SRT to VTT Converter Online — Free Subtitle Converter",
    description: "Convert SRT subtitles to WebVTT (.vtt) online instantly in your browser.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

