import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Footer } from "@/components/Footer";
import DevToolsProtection from "@/components/DevToolsProtection";
import { Sora, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ThirdPartyLoader from "@/components/ThirdPartyLoader";
import TelegramFloatingButton from "@/components/TelegramFloatingButton";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fluxplays.live"),
  title: {
    default: "FluxPlays – Watch Movies Free Online | No Signup, No Ads",
    template: "%s | FluxPlays",
  },
  description: "Watch movies online free by IMDb ID, browse 500K+ titles, or paste any video URL. Stream instantly in your browser — no signup, no downloads, no ads.",
  keywords: [
    "fluxplays",
    "fluxplays.live",
    "instant video streaming",
    "stream video online",
    "watch video without downloading",
    "watch video online without downloading",
    "browser video player",
    "online video streaming",
    "stream direct video links",
    "paste and stream",
    "HLS streaming",
    "Google Drive video player",
    "google drive video player online",
    "stream google drive video online",
    "telegram video player browser",
    "stream telegram video online",
    "m3u8 player online",
    "HLS stream player web",
    "direct mp4 player online",
    "free web video player",
    "how to stream videos without downloading",
    "progressive video stream player",
    // Brand
    "fluxplays", "fluxplays.live",

    // Casual audience (HIGH PRIORITY — missing right now)
    "watch movies online free", "stream movies browser",
    "watch movies without downloading", "free movie streaming no signup",
    "online movie player no account", "watch movies free 2026",
    "stream movies instantly", "free video streaming website",

    // Tool audience
    "browser video player", "online video streaming",
    "stream direct video links", "paste and stream",
    "HLS streaming", "m3u8 player online",
    "HLS stream player web", "direct mp4 player online",
    "free web video player",

    // Players
    "Google Drive video player", "google drive video player online",
    "telegram video player browser", "stream telegram video online",

    // IMDb specific (HIGH PRIORITY — big gap in market)
    "imdb id movie player", "stream movie by imdb id",
    "watch movie using imdb id", "imdb id player online free",

    // Converter
    "imdb to tmdb converter", "imdb id to tmdb id",
    "convert imdb to tmdb online", "movie id converter online",
  ],
  authors: [{ name: "fluxplays.live" }],
  creator: "fluxplays.live",
  publisher: "fluxplays.live",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fluxplays.live",
    siteName: "FluxPlays",
    title: "FluxPlays – Watch Movies Free Online | No Signup, No Ads",
    description: "Watch movies online free by IMDb ID, browse 500K+ titles, or paste any video URL. Stream instantly in your browser — no signup, no downloads, no ads.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FluxPlays — Modern Video Streaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FluxPlays – Watch Movies Free Online | No Signup, No Ads",
    description: "Watch movies online free by IMDb ID, browse 500K+ titles, or paste any video URL. Stream instantly in your browser — no signup, no downloads, no ads.",
    images: ["/og-image.png"],
    creator: "@fluxplays",
  },
  alternates: {
    canonical: "https://fluxplays.live",
  },
  verification: {
    google: "KqdYTJrHIT42Hgxlk50mHAaHCQODltsy-x2AzSsFbuI",
  },
  other: {
    "msvalidate.01": "34F600811BDD9E429D675B2E52369FA0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />

        {/* DNS Prefetch for secondary origins */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />

        {/* Structured Data — WebApplication */}
        <script
          id="schema-web-app"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "FluxPlays",
              alternateName: "InstantStream",
              url: "https://fluxplays.live/",
              description:
                "FluxPlays is a modern video streaming web app for discovering and watching movies, shows, and entertainment content online.",
              applicationCategory: "EntertainmentApplication",
              operatingSystem: "Web",
              creator: { "@type": "Person", name: "Subham Sharma" },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "287",
              },
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />

        {/* Structured Data — WebSite SearchAction */}
        <script
          id="schema-search-action"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "FluxPlays",
              url: "https://fluxplays.live/",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://fluxplays.live/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${sora.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
        <Script id="theme-initializer" dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const t = localStorage.getItem('fx-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
          })();
        `}} />
        <ThemeProvider>
          <DevToolsProtection />
          <ConditionalNavbar />
          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-WD5DJHHT"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
          {children}
          <Footer />
          <TelegramFloatingButton />
          <Analytics />
          <ThirdPartyLoader />
        </ThemeProvider>
      </body>
    </html>
  );
}
