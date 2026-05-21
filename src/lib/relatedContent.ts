import { allArticles, Article } from "@/app/blog/articles";
import { trendingData, TrendingPage } from "@/app/trending/trendingData";
import { comparisonData, ComparisonPage } from "@/app/compare/comparisonData";

export type ContentType = "blog" | "trending" | "compare";

export interface RelatedItem {
  type: ContentType;
  slug: string;
  title: string;
  tag: string;
  href: string;
}

/** Keyword-based similarity: counts overlapping words between two strings */
function keywordScore(a: string, b: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3);
  const setA = new Set(normalize(a));
  const bWords = normalize(b);
  return bWords.filter((w) => setA.has(w)).length;
}

function scoreArticle(current: string, candidate: Article): number {
  return keywordScore(current, candidate.title + " " + candidate.tag);
}

function scoreTrending(current: string, candidate: TrendingPage): number {
  return keywordScore(current, candidate.title + " " + candidate.h1);
}

function scoreComparison(current: string, candidate: ComparisonPage): number {
  return keywordScore(current, candidate.title + " " + candidate.h1);
}

export function getRelatedContent(
  currentSlug: string,
  currentTitle: string,
  limit = 4
): RelatedItem[] {
  const scored: { item: RelatedItem; score: number }[] = [];

  // Score articles
  for (const article of allArticles) {
    if (article.slug === currentSlug) continue;
    const score = scoreArticle(currentTitle, article);
    scored.push({
      score,
      item: {
        type: "blog",
        slug: article.slug,
        title: article.title,
        tag: article.tag,
        href: `/blog/${article.slug}`,
      },
    });
  }

  // Score trending pages
  for (const page of trendingData) {
    if (page.slug === currentSlug) continue;
    const score = scoreTrending(currentTitle, page);
    scored.push({
      score,
      item: {
        type: "trending",
        slug: page.slug,
        title: page.title,
        tag: "Trending",
        href: `/trending/${page.slug}`,
      },
    });
  }

  // Score comparison pages
  for (const page of comparisonData) {
    if (page.slug === currentSlug) continue;
    const score = scoreComparison(currentTitle, page);
    scored.push({
      score,
      item: {
        type: "compare",
        slug: page.slug,
        title: page.title,
        tag: "Comparison",
        href: `/compare/${page.slug}`,
      },
    });
  }

  // Sort descending by score, fallback to most important pages
  scored.sort((a, b) => b.score - a.score);

  const results = scored.slice(0, limit).map((s) => s.item);

  // Fallback: always include homepage-adjacent items if results < limit
  if (results.length < limit) {
    const fallbacks: RelatedItem[] = [
      { type: "blog", slug: "how-to-stream-videos-without-downloading", title: "How to Stream Videos Without Downloading", tag: "Beginner Guide", href: "/blog/how-to-stream-videos-without-downloading" },
      { type: "trending", slug: "free-streaming-platforms", title: "Top Free Streaming Platforms", tag: "Trending", href: "/trending/free-streaming-platforms" },
    ];
    for (const fb of fallbacks) {
      if (results.length >= limit) break;
      if (!results.find((r) => r.slug === fb.slug)) {
        results.push(fb);
      }
    }
  }

  return results;
}
