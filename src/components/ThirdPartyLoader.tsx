"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function ThirdPartyLoader() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Only load scripts on user interaction or after a long timeout
    const loadScripts = () => {
      setShouldLoad(true);
      removeEventListeners();
    };

    const removeEventListeners = () => {
      window.removeEventListener("scroll", loadScripts);
      window.removeEventListener("mousemove", loadScripts);
      window.removeEventListener("touchstart", loadScripts);
      window.removeEventListener("keydown", loadScripts);
    };

    window.addEventListener("scroll", loadScripts, { passive: true });
    window.addEventListener("mousemove", loadScripts, { passive: true });
    window.addEventListener("touchstart", loadScripts, { passive: true });
    window.addEventListener("keydown", loadScripts, { passive: true });

    // Fallback: Load after 6 seconds anyway if no interaction
    const timer = setTimeout(loadScripts, 6000);

    return () => {
      removeEventListeners();
      clearTimeout(timer);
    };
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      {/* Google Tag Manager */}
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

      {/* Google Analytics */}
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

      {/* Google AdSense */}
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3111082445226249"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />

      {/* Microsoft Clarity */}
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
