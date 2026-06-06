"use client";

import Link from "next/link";
import FAQSection from "@/components/FAQSection";
import HomeClient from "@/components/HomeClient";
import type { LandingPageData } from "@/app/landingPagesData";
import { ChevronRight } from "lucide-react";

export default function LandingPage({ data }: { data: LandingPageData }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${data.headlinePart1} ${data.headlinePart2}`,
    description: data.subheadline,
    url: data.canonicalUrl,
    isPartOf: { "@type": "WebSite", name: "FluxPlays", url: "https://fluxplays.live" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

      <main className="min-h-screen bg-[var(--bg-base)] pt-[100px] pb-[60px]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)] mb-8">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--text-primary)] font-medium truncate">{data.badge}</span>
          </nav>

          {/* Heading */}
          <div className="mb-10 max-w-3xl">
            <h1 className="font-[family-name:var(--font-sora)] font-bold text-[36px] md:text-[48px] text-[var(--text-primary)] mb-4 leading-tight">
              {data.headlinePart1} <span className="text-[var(--accent)]">{data.headlinePart2}</span>
            </h1>
            <p className="font-[family-name:var(--font-dm-sans)] text-[16px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
              {data.subheadline}
            </p>
          </div>

          {/* Input Card Wrapper */}
          <div className="mb-16">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 md:p-10 shadow-sm relative overflow-hidden">
               {/* Background glow for input area */}
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
               
               <div className="relative z-10 w-full">
                 <HomeClient />
               </div>
            </div>
          </div>

          {/* Features Section */}
          <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.features.map((feature, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[14px] p-6 transition-transform hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-sora)] font-bold text-[16px] text-[var(--text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-20">
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-[24px] text-[var(--text-primary)] mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.steps.map((step, i) => (
                <div key={i} className="flex flex-col">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[12px] font-bold text-[var(--text-primary)] mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-[family-name:var(--font-sora)] font-bold text-[16px] text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)] leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-20">
             <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 md:p-10">
               <FAQSection
                 title="Frequently Asked Questions"
                 subtitle="FAQ"
                 description="Learn more about streaming."
                 faqs={data.faqs}
               />
             </div>
          </section>

          {/* Related Tools */}
          <section>
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-[20px] text-[var(--text-primary)] mb-6">Explore More Tools</h2>
            <div className="flex flex-wrap gap-3">
              {data.relatedLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-secondary)] font-[family-name:var(--font-dm-sans)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
