import { notFound } from "next/navigation";
import { Metadata } from "next";
import { comparisonData } from "../comparisonData";
import FAQSection from "@/components/FAQSection";
import Link from "next/link";
import { ArrowLeft, Home, CheckCircle2, XCircle, Info } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return comparisonData.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = comparisonData.find((p) => p.slug === params.slug);
  if (!page) {
    return { title: "Compare | Not Found" };
  }

  const url = `https://fluxplays.vercel.app/compare/${page.slug}`;

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

export default function ComparePage({ params }: Props) {
  const page = comparisonData.find((p) => p.slug === params.slug);

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
            "item": "https://fluxplays.vercel.app/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Compare",
            "item": "https://fluxplays.vercel.app/compare"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": page.title,
            "item": `https://fluxplays.vercel.app/compare/${page.slug}`
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
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-[32px] border-b border-black/5 dark:border-white/5">
        <div className="flex justify-between items-center px-6 max-w-[1200px] mx-auto h-16">
          <Link href="/" className="flex items-center gap-2 font-display-lg text-headline-md tracking-tighter text-on-surface hover:text-primary transition-colors">
            <Logo className="w-8 h-8" />
            <span>FluxPlays</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all duration-200">Start Streaming</Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-[1000px] mx-auto">
        <div className="mb-10 block">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <article>
          <header className="mb-12 text-center max-w-3xl mx-auto">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-3 block">Head to Head</span>
            <h1 className="font-display-lg text-4xl md:text-5xl leading-tight mb-6 text-on-surface">{page.h1}</h1>
            <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed">{page.intro}</p>
          </header>

          <section className="my-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-2xl border-t-4 border-t-primary">
              <h2 className="font-headline-md text-2xl text-on-surface mb-6 flex items-center gap-2">
                FluxPlays
              </h2>
              <div className="mb-8">
                <span className="text-sm font-bold uppercase text-on-surface-variant mb-2 block">Best For</span>
                <p className="text-sm leading-relaxed">{page.bestFor.fluxplays}</p>
              </div>
              <div className="space-y-6">
                <div>
                  <span className="text-sm font-bold uppercase text-[#22c55e] mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Pros</span>
                  <ul className="space-y-2 text-sm">
                    {page.prosCons.fluxplays.pros.map((p, i) => <li key={i} className="flex items-start gap-2"><span className="text-[#22c55e] mt-0.5">•</span> <span>{p}</span></li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-sm font-bold uppercase text-[#ef4444] mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> Cons</span>
                  <ul className="space-y-2 text-sm">
                    {page.prosCons.fluxplays.cons.map((p, i) => <li key={i} className="flex items-start gap-2"><span className="text-[#ef4444] mt-0.5">•</span> <span>{p}</span></li>)}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-8 rounded-2xl border-t-4 border-t-secondary">
              <h2 className="font-headline-md text-2xl text-on-surface mb-6 flex items-center gap-2">
                {page.bestFor.alternativeName}
              </h2>
              <div className="mb-8">
                <span className="text-sm font-bold uppercase text-on-surface-variant mb-2 block">Best For</span>
                <p className="text-sm leading-relaxed">{page.bestFor.alternative}</p>
              </div>
              <div className="space-y-6">
                <div>
                  <span className="text-sm font-bold uppercase text-[#22c55e] mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Pros</span>
                  <ul className="space-y-2 text-sm">
                    {page.prosCons.alternative.pros.map((p, i) => <li key={i} className="flex items-start gap-2"><span className="text-[#22c55e] mt-0.5">•</span> <span>{p}</span></li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-sm font-bold uppercase text-[#ef4444] mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> Cons</span>
                  <ul className="space-y-2 text-sm">
                    {page.prosCons.alternative.cons.map((p, i) => <li key={i} className="flex items-start gap-2"><span className="text-[#ef4444] mt-0.5">•</span> <span>{p}</span></li>)}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface mb-8 text-center">Feature Comparison Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse glass-panel rounded-xl overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-surface-container-high border-b border-black/10 dark:border-white/10">
                    <th className="p-4 font-semibold text-on-surface">Feature</th>
                    <th className="p-4 font-semibold text-on-surface">FluxPlays</th>
                    <th className="p-4 font-semibold text-on-surface">{page.bestFor.alternativeName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
                  {page.featuresTable.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4 font-medium text-on-surface">{row.feature}</td>
                      <td className="p-4 text-on-surface-variant relative">
                        {typeof row.fluxplays === 'boolean' 
                          ? (row.fluxplays ? <CheckCircle2 className="w-5 h-5 text-[#22c55e]" /> : <XCircle className="w-5 h-5 text-[#ef4444]" />)
                          : row.fluxplays}
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {typeof row.alternative === 'boolean' 
                          ? (row.alternative ? <CheckCircle2 className="w-5 h-5 text-[#22c55e]" /> : <XCircle className="w-5 h-5 text-[#ef4444]" />)
                          : row.alternative}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs text-on-surface-variant/70">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Note: This comparison is based on the features available in 2026. Architectures evolve, and specific use cases may shift the balance.</p>
            </div>
          </section>

          <div className="space-y-12 mb-16 max-w-3xl mx-auto">
            {page.contentSections.map((section, idx) => (
              <section key={idx}>
                <h2 className="font-headline-md text-2xl text-on-surface mb-4">{section.title}</h2>
                <div className="space-y-4 text-on-surface-variant font-body-md leading-relaxed">
                  {section.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          
          <div className="mt-16 border-t border-black/10 dark:border-white/10 pt-10 text-left">
            <FAQSection 
              title="Comparison FAQs" 
              subtitle="Deep Dive" 
              faqs={page.faqs} 
              injectSchema={true} 
            />
          </div>
        </article>
      </main>
    </>
  );
}
