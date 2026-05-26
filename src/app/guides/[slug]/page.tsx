import { getGuide, guides } from "../guideData";
import Link from "next/link";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import type { Metadata } from "next";
import { ArrowLeft, Play, HelpCircle } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `https://fluxplays.vercel.app/guides/${slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `https://fluxplays.vercel.app/guides/${slug}`,
      type: "article",
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  // Related Guides logic
  const related = guides.filter((g) => g.slug !== slug).slice(0, 3);

  // schemas
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    author: { "@type": "Organization", name: "FluxPlays" },
    publisher: { "@type": "Organization", name: "FluxPlays", url: "https://fluxplays.vercel.app" },
    datePublished: guide.publishDate,
    url: `https://fluxplays.vercel.app/guides/${slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fluxplays.vercel.app" },
      { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://fluxplays.vercel.app/guides" },
      { "@type": "ListItem", "position": 3, "name": guide.title, "item": `https://fluxplays.vercel.app/guides/${slug}` }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": guide.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="max-w-[720px] mx-auto px-6 md:px-8 pt-24 pb-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-primary transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-on-surface-variant truncate max-w-[200px]">{guide.title}</span>
        </nav>

        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{guide.category}</span>
        </div>

        <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-8 leading-tight">
          {guide.title}
        </h1>

        <div className="prose prose-lg dark:prose-invert prose-p:text-on-surface-variant prose-headings:text-on-surface mb-12">
          <p>{guide.content}</p>
        </div>

        {/* FAQs Section */}
        <div className="mt-12">
          <h2 className="font-headline-md text-on-surface text-xl mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {guide.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 border border-black/5 dark:border-white/5 rounded-xl bg-black/[0.01] dark:bg-white/[0.01]">
                <h3 className="font-semibold text-on-surface mb-2">{faq.question}</h3>
                <p className="text-sm text-on-surface-variant">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 glass-panel rounded-2xl p-8 text-center border border-black/5 bg-primary/5">
          <p className="text-on-surface font-semibold mb-2">Build your knowledge into practice</p>
          <p className="text-on-surface-variant text-sm mb-5">Try the FluxEngine streaming architecture yourself by pasting a link.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all text-sm">
            <Play className="w-4 h-4 fill-current" />
            Stream a Video
          </Link>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-headline-md text-on-surface mb-6">More Guides</h2>
            <div className="flex flex-col gap-3">
              {related.map((rel) => rel && (
                <Link key={rel.slug} href={`/guides/${rel.slug}`} className="group flex justify-between items-center glass-panel p-4 rounded-xl border border-black/5 hover:border-primary/20 transition-all">
                  <div>
                    <p className="text-on-surface font-semibold text-sm group-hover:text-primary transition-colors">{rel.title}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1 block">{rel.category}</span>
                  </div>
                  <span className="text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">Read →</span>
                </Link>
              ))}
            </div>
            <Link href="/blog" className="mt-6 block text-sm text-center text-on-surface-variant hover:text-primary transition-colors border border-black/10 dark:border-white/10 rounded-xl py-3">
              View all blog articles
            </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-black/5 dark:border-white/5 py-8 px-6 md:px-16 mt-10">
        <div className="max-w-[1200px] mx-auto text-center text-xs text-on-surface-variant">
          © 2026 FluxPlays - Built for speed and performance.
        </div>
      </footer>
    </div>
  );
}
