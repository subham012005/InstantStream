import { getArticle, articles, allArticles } from "../articles";
import Link from "next/link";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, Clock, Play, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `https://fluxplays.live/blog/${slug}` },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `https://fluxplays.live/blog/${slug}`,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = article.relatedSlugs
    .map((s) => articles.find((a) => a.slug === s))
    .filter(Boolean);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    author: { "@type": "Person", name: article.author.name, url: article.author.url },
    publisher: { "@type": "Organization", name: "FluxPlays", url: "https://fluxplays.live" },
    datePublished: "2026-05-18",
    url: `https://fluxplays.live/blog/${slug}`,
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fluxplays.live" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://fluxplays.live/blog" },
          { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://fluxplays.live/blog/${slug}` }
        ]
      }) }} />

      <main className="max-w-[720px] mx-auto px-6 md:px-8 pt-24 pb-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-on-surface-variant truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Meta */}
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{article.tag}</span>
        </div>

        {/* Title */}
        <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-5 leading-tight">
          {article.title}
        </h1>

        {/* Date + read time */}
        <div className="flex items-center gap-3 text-sm text-on-surface-variant mb-8 pb-8 border-b border-black/5 dark:border-white/5">
          <Calendar className="w-4 h-4" />
          <span>{article.date}</span>
          <span>·</span>
          <Clock className="w-4 h-4" />
          <span>{article.readTime}</span>
        </div>

        {/* Intro */}
        <p className="text-on-surface-variant text-body-md leading-relaxed mb-10 text-lg">
          {article.intro}
        </p>

        {/* Key Takeaways - Featured Snippet Target */}
        {article.keyTakeaways && (
          <div className="mb-10 p-6 rounded-2xl bg-surface-container-highest/30 border border-black/5 dark:border-white/5">
            <h2 className="font-headline-sm text-on-surface mb-4 flex items-center gap-2">
              <span className="text-primary">💡</span> Key Takeaways
            </h2>
            <ul className="space-y-3">
              {article.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3 text-on-surface-variant text-sm">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections */}
        <article className="space-y-10">
          {article.sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-headline-md text-on-surface text-xl mb-3">{section.heading}</h2>
              <p className="text-on-surface-variant leading-relaxed">{section.body}</p>
            </section>
          ))}
        </article>

        {/* Conclusion */}
        <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10">
          <h2 className="font-semibold text-on-surface mb-2">Conclusion</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">{article.conclusion}</p>
        </div>

        {/* CTA */}
        <div className="mt-12 glass-panel rounded-2xl p-8 text-center border border-black/5">
          <p className="text-on-surface font-semibold mb-2">Try instant streaming now</p>
          <p className="text-on-surface-variant text-sm mb-5">Paste a video link and watch without downloading — free, no account needed.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            Stream a Video Free
          </Link>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-headline-md text-on-surface mb-6">Related Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rel) => rel && (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group glass-panel p-5 rounded-xl border border-black/5 hover:border-primary/20 transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">{rel.tag}</span>
                  <p className="text-on-surface font-semibold text-sm group-hover:text-primary transition-colors">{rel.title}</p>
                  <p className="text-on-surface-variant text-xs mt-1">{rel.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
