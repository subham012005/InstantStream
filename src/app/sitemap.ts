import { MetadataRoute } from "next";
import { allArticles } from "./blog/articles";
import { guides } from "./guides/guideData";
import { trendingData } from "./trending/trendingData";
import { comparisonData } from "./compare/comparisonData";
import { landingPages } from "./landingPagesData";

// Genuine last-modified dates verified against codebase commit logs
const LANDING_PAGE_DATES: Record<string, Date> = {
  "telegram-video-player": new Date("2026-11-04"),
  "terabox-video-player": new Date("2026-11-06"),
  "imdb-movie-stream-player": new Date("2026-07-13"),
  "hls-m3u8-stream-player": new Date("2026-05-31"),
};
const DEFAULT_LANDING_DATE = new Date("2026-05-27");

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fluxplays.live";

  // Landing pages — core SEO targets
  const landingPageUrls: MetadataRoute.Sitemap = Object.keys(landingPages).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: LANDING_PAGE_DATES[slug] || DEFAULT_LANDING_DATE,
    changeFrequency: "monthly" as const,
    priority: slug === "telegram-video-player" ? 1.0 : 0.95,
  }));

  const standaloneLandingPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/stream-url-video-player`, lastModified: new Date("2026-05-27"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/watch-videos-online-without-saving`, lastModified: new Date("2026-05-27"), changeFrequency: "monthly", priority: 0.8 },
  ];

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date("2026-10-29"), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/movie-search`, lastModified: new Date("2026-10-29"), changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/tools`, lastModified: new Date("2026-07-13"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/tools/srt-to-vtt-converter`, lastModified: new Date("2026-07-13"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/tools/iptv-playlist-validator`, lastModified: new Date("2026-07-13"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/tools/hls-latency-tester`, lastModified: new Date("2026-07-13"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/tools/imdb-tmdb-converter`, lastModified: new Date("2026-06-16"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/blog`, lastModified: new Date("2026-05-27"), changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/guides`, lastModified: new Date("2026-05-27"), changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/community-sites`, lastModified: new Date("2026-05-27"), changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/about`, lastModified: new Date("2026-07-09"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/status`, lastModified: new Date("2026-07-13"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/branding`, lastModified: new Date("2026-07-13"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/creators`, lastModified: new Date("2026-05-27"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/newsletter`, lastModified: new Date("2026-05-27"), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date("2026-05-27"), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date("2026-05-27"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date("2026-05-27"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookie-notice`, lastModified: new Date("2026-05-27"), changeFrequency: "yearly", priority: 0.3 },
    // Intentionally excluded (noindex): /search, /admin, /test-server, /go, /blocked, /netflix-mirror
  ];

  const blogPages: MetadataRoute.Sitemap = allArticles.map((article) => {
    // Verified article update dates
    const articleDate = article.slug === "does-netflix-use-nextjs" 
      ? new Date("2026-07-13") 
      : new Date("2026-05-27");
    return {
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: articleDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    };
  });

  const guidePages: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const trendingPages: MetadataRoute.Sitemap = trendingData.map((page) => ({
    url: `${baseUrl}/trending/${page.slug}`,
    lastModified: new Date("2026-07-13"),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const comparePages: MetadataRoute.Sitemap = comparisonData.map((page) => ({
    url: `${baseUrl}/compare/${page.slug}`,
    lastModified: new Date("2026-07-13"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...landingPageUrls,
    ...standaloneLandingPages,
    ...staticPages,
    ...blogPages,
    ...guidePages,
    ...trendingPages,
    ...comparePages,
  ];
}
