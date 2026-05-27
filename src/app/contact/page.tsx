import Link from "next/link";
import Logo from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | FluxPlays",
  description: "Get in touch with the FluxPlays engineering and support team.",
  alternates: { canonical: "https://fluxplays.live/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-[720px] mx-auto px-6 pt-24 pb-16 prose dark:prose-invert">
        <h1>Contact Us</h1>
        <p>If you have any business propositions, technical feedback, or want to contribute to the open-source architecture, you can contact the team behind FluxPlays.</p>
        <h2>Technical Support</h2>
        <p>If you are experiencing issues with video links, please ensure you have read our <Link href="/faq">FAQ</Link> first. Note that we do not host any videos, so dead links are outside of our control.</p>
        <h2>GitHub</h2>
        <p>The best way to contact the engineering team is directly through the open-source repository on GitHub.</p>
        <p><a href="https://github.com/subham012005" target="_blank" rel="noopener noreferrer">Visit GitHub Profile</a></p>
      </main>
    </div>
  );
}
