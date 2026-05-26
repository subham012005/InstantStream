import Link from "next/link";
import Logo from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | FluxPlays",
  description: "Read the FluxPlays terms of service regarding legitimate use of our streaming platform.",
  alternates: { canonical: "https://fluxplays.vercel.app/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-[720px] mx-auto px-6 pt-24 pb-16 prose dark:prose-invert">
        <h1>Terms of Service</h1>
        <p>Last Updated: May 2026</p>
        <p>By accessing or using FluxPlays, you agree to comply with and be bound by these Terms of Service. If you do not agree, do not use the application.</p>
        <h2>Platform Usage</h2>
        <p>FluxPlays provides a utility interface (a browser video player) to consume media URLs explicitly provided by the user. FluxPlays does not host, upload, or index any video media itself.</p>
        <h2>User Responsibility</h2>
        <ul>
          <li>Users must hold the necessary rights to any content they stream through the interface.</li>
          <li>The platform must not be used for illicit streaming, piracy, or bypassing DRM security natively.</li>
          <li>FluxPlays takes no responsibility for the contents passed through the player; the user initiates all HTTP requests from their own client IP.</li>
        </ul>
        <h2>Liability</h2>
        <p>The application is provided "as is", without warranty of any kind. The creators are not liable for any damages arising out of the use of the platform.</p>
      </main>
    </div>
  );
}
