"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "@/types/faq";

export type { FAQItem };

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  faqs: FAQItem[];
}

export default function FAQSection({
  title = "Frequently Asked Questions",
  subtitle = "FAQ",
  description,
  faqs,
}: FAQSectionProps) {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-20 px-container-padding-mobile md:px-container-padding-desktop max-w-3xl mx-auto">
      {(title || subtitle || description) && (
        <div className="text-center mb-12">
          {subtitle && (
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 block">
              {subtitle}
            </span>
          )}
          {title && <h2 className="font-headline-lg text-on-surface mb-3">{title}</h2>}
          {description && (
            <p className="text-on-surface-variant max-w-md mx-auto">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = activeFaqIndex === i;
          return (
            <div
              key={i}
              className="border border-black/5 dark:border-white/5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden"
            >
              <button
                onClick={() => setActiveFaqIndex(isOpen ? null : i)}
                className="w-full flex justify-between items-center p-5 text-left transition-colors duration-200 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-on-surface text-sm md:text-base pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-on-surface-variant shrink-0 transition-transform duration-250 ease-in-out ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className="faq-accordion-panel grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 text-on-surface-variant text-sm leading-relaxed border-t border-black/[0.03] dark:border-white/[0.03] pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
