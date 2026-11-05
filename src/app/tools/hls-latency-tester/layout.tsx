import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HLS Latency Tester & Stream Analyzer Online — FluxPlays",
  description:
    "Test live HLS (.m3u8) stream response latency, analyze manifest target durations, media sequences, and diagnose buffering issues in real time.",
  keywords: [
    "hls latency tester",
    "m3u8 latency test",
    "hls stream analyzer",
    "test m3u8 stream online",
    "hls stream tester",
    "live stream latency checker",
    "hls manifest inspector",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://fluxplays.live/tools/hls-latency-tester" },
  openGraph: {
    title: "HLS Latency Tester & Stream Analyzer Online — FluxPlays",
    description:
      "Test live HLS (.m3u8) stream response latency, analyze manifest target durations, media sequences, and diagnose buffering issues in real time.",
    url: "https://fluxplays.live/tools/hls-latency-tester",
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "HLS Latency Tester & Stream Analyzer Online",
    description: "Measure live HLS stream latency and inspect manifests in real time.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

