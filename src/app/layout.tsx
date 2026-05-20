import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fluxplays.vercel.app"),
  title: {
    default: "fluxplays.live — Paste Any Video Link. Stream Instantly.",
    template: "%s | fluxplays.live",
  },
  description:
    "Watch videos online without downloading. Paste any MP4, Google Drive, Telegram, HLS, or direct video URL and stream it instantly in your browser.",
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
    siteName: "fluxplays.live",
    title: "fluxplays.live — Paste Any Video Link. Stream Instantly.",
    description:
      "Watch videos online without downloading. Paste any MP4, Drive, Telegram, or video URL and stream instantly.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "fluxplays.live — Instant Video Streaming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "fluxplays.live — Paste Any Video Link. Stream Instantly.",
    description:
      "Watch videos online without downloading. Paste any MP4, Drive, Telegram, or video URL and stream instantly.",
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WD5DJHHT');`,
          }}
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
              name: "fluxplays.live",
              url: "https://fluxplays.vercel.app",
              description:
                "Paste any video link and stream it instantly in your browser. No downloads needed.",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
      </body>
    </html>
  );
}
