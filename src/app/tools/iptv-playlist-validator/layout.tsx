import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IPTV Playlist Validator & M3U Parser Online — FluxPlays",
  description:
    "Free online IPTV playlist validator and M3U file parser. Inspect channels, filter groups, extract logos, and verify stream URLs directly in your browser.",
  keywords: [
    "iptv playlist validator",
    "m3u parser online",
    "validate iptv playlist",
    "m3u checker online",
    "iptv m3u link validator",
    "check iptv playlist online",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://fluxplays.live/tools/iptv-playlist-validator" },
  openGraph: {
    title: "IPTV Playlist Validator & M3U Parser Online — FluxPlays",
    description:
      "Free online IPTV playlist validator and M3U file parser. Inspect channels, filter groups, extract logos, and verify stream URLs directly in your browser.",
    url: "https://fluxplays.live/tools/iptv-playlist-validator",
    type: "website",
    siteName: "FluxPlays",
  },
  twitter: {
    card: "summary_large_image",
    title: "IPTV Playlist Validator & M3U Parser Online",
    description: "Validate and parse M3U IPTV playlists in your browser with zero install.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

