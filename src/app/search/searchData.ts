import { allArticles } from "@/app/blog/articles";
import { trendingData } from "@/app/trending/trendingData";
import { comparisonData } from "@/app/compare/comparisonData";

export interface SearchResult {
  title: string;
  description: string;
  href: string;
  badge: string;
}

export const ALL_CONTENT: SearchResult[] = [
  ...allArticles.map((a) => ({
    title: a.title,
    description: a.intro.slice(0, 120) + "…",
    href: `/blog/${a.slug}`,
    badge: a.tag,
  })),
  ...trendingData.map((t) => ({
    title: t.title,
    description: t.intro.slice(0, 120) + "…",
    href: `/trending/${t.slug}`,
    badge: "Trending",
  })),
  ...comparisonData.map((c) => ({
    title: c.title,
    description: c.intro.slice(0, 120) + "…",
    href: `/compare/${c.slug}`,
    badge: "Comparison",
  })),
];
