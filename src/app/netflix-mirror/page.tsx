import type { Metadata } from "next";
import { Suspense } from "react";
import NetflixMirrorClient from "@/components/NetflixMirrorClient";

export const metadata: Metadata = {
  title: "Netflix Mirror Player — Stream by ID | FluxPlays",
  description:
    "Paste a Netflix video ID and stream any movie or series instantly. Full HLS player with quality selection, audio tracks, season/episode browser — no account needed.",
  robots: { index: false, follow: false },
};

export default function NetflixMirrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NetflixMirrorClient />
    </Suspense>
  );
}
