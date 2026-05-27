import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Notice | FluxPlays",
  description:
    "Read FluxPlays' cookie notice to understand how cookies and similar technologies are used for analytics, personalization, and ad services.",
  alternates: { canonical: "https://fluxplays.vercel.app/cookie-notice" },
};

export default function CookieNoticePage() {
  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-[720px] mx-auto px-6 pt-24 pb-16 prose dark:prose-invert">
        <h1>Cookie Notice</h1>
        <p>
          FluxPlays uses cookies and similar technologies to improve the website experience, analyze traffic, and support advertising services.
          This notice explains what cookies are used and how you can control them.
        </p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files placed on your device by websites. They can store information such as preferences, login status, or analytics data.
        </p>

        <h2>Why FluxPlays uses cookies</h2>
        <ul>
          <li>Analytics: We use cookies to understand how visitors use FluxPlays and to improve performance.</li>
          <li>Advertising: When Google Ads or advertising services are present, cookies help deliver relevant ads and measure campaign performance.</li>
          <li>Service integrity: Cookies can be used to enable essential site features and security checks.</li>
        </ul>

        <h2>Third-party cookies</h2>
        <p>
          FluxPlays may load third-party scripts such as Google Analytics, Google Tag Manager, and Microsoft Clarity. These services may set cookies on your browser for analytics, optimization, and advertising purposes.
        </p>

        <h2>How to manage cookies</h2>
        <p>
          You can control or delete cookies through your browser settings. You can also opt out of many analytics and advertising cookies using browser privacy controls or opt-out tools provided by the service providers.
        </p>

        <h2>Your choices</h2>
        <p>
          If you disable cookies, some features of FluxPlays may not work as expected. Core streaming functionality remains available, but analytics and personalization may be reduced.
        </p>

        <h2>Legal references</h2>
        <p>
          For more information about how we process personal data, please read our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Service</Link>.
        </p>
      </main>
    </div>
  );
}
