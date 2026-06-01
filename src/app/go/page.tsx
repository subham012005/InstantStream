import { Suspense } from "react";
import GoPageClient from "./GoPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaving FluxPlays? Confirm your destination",
  description: "See a quick ad before continuing to your selected community site.",
};

export default function GoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)]">Loading...</div>}>
      <GoPageClient />
    </Suspense>
  );
}
