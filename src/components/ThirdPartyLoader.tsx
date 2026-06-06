"use client";

import Script from "next/script";

export default function ThirdPartyLoader() {
  return (
    <>
      {/* Google Tag Manager - Loads GTM Script */}
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WD5DJHHT');`,
        }}
      />

      {/* Google Analytics - Direct GA4 Loading */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-H7J24Y6QDM"
        strategy="afterInteractive"
      />
      <Script
        id="ga-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-H7J24Y6QDM');
          `,
        }}
      />

      {/* Microsoft Clarity - Direct Loading */}
      <Script
        id="clarity-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","wup6qmdbx4");`,
        }}
      />

    </>
  );
}
