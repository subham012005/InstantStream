import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fluxplays.vercel.app"),
  title: {
    default: "FluxPlays – Modern Movie & Video Streaming Web App",
    template: "%s | FluxPlays",
  },
  description:
    "FluxPlays is a fast and modern video streaming web app built for discovering and watching movies, shows, and entertainment content online.",
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
    "progressive video stream player"
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
    url: "https://fluxplays.vercel.app",
    siteName: "FluxPlays",
    title: "FluxPlays – Modern Movie & Video Streaming Web App",
    description:
      "FluxPlays is a fast and modern video streaming web app built for discovering and watching movies, shows, and entertainment content online.",
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
    title: "FluxPlays – Modern Movie & Video Streaming Web App",
    description:
      "FluxPlays is a fast and modern video streaming web app built for discovering and watching movies, shows, and entertainment content online.",
    images: ["/og-image.png"],
    creator: "@fluxplays",
  },
  alternates: {
    canonical: "https://fluxplays.vercel.app",
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
        {/* Inline theme init — runs before paint, eliminates FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="KqdYTJrHIT42Hgxlk50mHAaHCQODltsy-x2AzSsFbuI"
        />
        {/* Bing Webmaster Verification */}
        <meta name="msvalidate.01" content="34F600811BDD9E429D675B2E52369FA0" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "FluxPlays",
              alternateName: "InstantStream",
              url: "https://fluxplays.vercel.app/",
              description:
                "FluxPlays is a modern video streaming web app for discovering and watching movies, shows, and entertainment content online.",
              applicationCategory: "EntertainmentApplication",
              operatingSystem: "Web",
              creator: {
                "@type": "Person",
                name: "Subham Sharma"
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "287"
              },
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
        {/* SearchAction Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "FluxPlays",
              url: "https://fluxplays.vercel.app/",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://fluxplays.vercel.app/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${jetbrainsMono.variable} bg-surface font-body-md text-on-surface antialiased transition-colors duration-300`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WD5DJHHT"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <Script
          id="gtm-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WD5DJHHT');`,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-H7J24Y6QDM"
          strategy="lazyOnload"
        />
        <Script
          id="ga-config"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-H7J24Y6QDM');
            `,
          }}
        />
      </body>
    </html>
  );
}
