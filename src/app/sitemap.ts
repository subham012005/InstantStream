import { MetadataRoute } from "next";
import { articles } from "./blog/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fluxplays.vercel.app";

  const seoPages = [
    "stream-videos-without-downloading",
    "google-drive-video-player",
    "telegram-video-player",
    "watch-mp4-online-player",
    "hls-m3u8-stream-player",
    "play-direct-video-links",
    "watch-videos-online-without-saving",
    "browser-video-player-online",
    "stream-url-video-player"
  ];

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...seoPages.map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }))
  ];

  // Dynamic blog articles
  const blogRoutes = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
