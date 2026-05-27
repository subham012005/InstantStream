import { notFound } from "next/navigation";
import { Metadata } from "next";
import { trendingData } from "../trendingData";
import FAQSection from "@/components/FAQSection";
import Link from "next/link";
import { ArrowLeft, Home, Zap, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return trendingData.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const page = trendingData.find((p) => p.slug === resolvedParams.slug);
  if (!page) {
    return { title: "Page Not Found" };
  }

  const url = `https://fluxplays.live/trending/${page.slug}`;

  return {
    title: `${page.title} | FluxPlays`,
    description: page.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.metaDescription,
    },
  };
}

export default async function TrendingPage({ params }: Props) {
  const resolvedParams = await params;
  const page = trendingData.find((p) => p.slug === resolvedParams.slug);

  if (!page) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://fluxplays.live/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Trending",
            "item": "https://fluxplays.live/trending"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": page.title,
            "item": `https://fluxplays.live/trending/${page.slug}`
          }
        ]
      },
      {
        "@type": "Article",
        "headline": page.h1,
        "description": page.metaDescription,
        "author": {
          "@type": "Organization",
          "name": "FluxPlays"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": page.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": { "@type": "Answer", "text": faq.a }
        }))
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="pt-24 pb-20 px-6 max-w-[900px] mx-auto">
        <div className="mb-10 block">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <article>
          <header className="mb-12">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-3 block">Trending Guide</span>
            <h1 className="font-display-lg text-4xl md:text-5xl leading-tight mb-6 text-on-surface">{page.h1}</h1>
            <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed">{page.intro}</p>
          </header>

          <div className="space-y-12 mb-16">
            {page.contentSections.map((section, idx) => (
              <section key={idx} className="scroll-mt-24">
                <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface mb-4">{section.title}</h2>
                <div className="space-y-4 text-on-surface-variant font-body-md leading-relaxed">
                  {section.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="my-16 p-8 glass-panel border border-primary/20 bg-primary/5 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div>
                <h3 className="font-headline-md text-xl text-on-surface flex items-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-primary" /> Ready to stream instantly?
                </h3>
                <p className="text-on-surface-variant">Stop waiting and start watching. Paste your video URL into our high-performance utility player.</p>
              </div>
              <Link href="/" className="premium-button-gradient shadow-lg text-on-primary px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                Try FluxPlays Free
              </Link>
            </div>
          </div>
          
          <div className="mt-16 border-t border-black/10 dark:border-white/10 pt-10">
            <FAQSection 
              title="Topics and Questions" 
              subtitle="More Info" 
              faqs={page.faqs} 
             
            />
          </div>
        </article>
      </main>
    </>
  );
}
