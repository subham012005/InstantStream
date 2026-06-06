import { MetadataRoute } from "next";
import { allArticles } from "./blog/articles";
import { guides } from "./guides/guideData";
import { trendingData } from "./trending/trendingData";
import { comparisonData } from "./compare/comparisonData";
import { landingPages } from "./landingPagesData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fluxplays.live";
  const now = new Date();

  // Landing pages — core SEO targets
  const landingPageUrls: MetadataRoute.Sitemap = Object.keys(landingPages).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.92,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/guides`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/tools/imdb-tmdb-converter`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/creators`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookie-notice`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    // /search is intentionally excluded — noindex utility page
  ];

  const blogPages: MetadataRoute.Sitemap = allArticles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const trendingPages: MetadataRoute.Sitemap = trendingData.map((page) => ({
    url: `${baseUrl}/trending/${page.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const comparePages: MetadataRoute.Sitemap = comparisonData.map((page) => ({
    url: `${baseUrl}/compare/${page.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...landingPageUrls,
    ...staticPages,
    ...blogPages,
    ...guidePages,
    ...trendingPages,
    ...comparePages,
  ];
}
