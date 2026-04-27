"use client";

import { useState } from "react";
import { Icon } from "../Icon";

export type FAQItem = {
  question: string;
  answer: string;
};

type Props = {
  items: FAQItem[];
  heading?: string;
};

/**
 * FAQ accordion. Server-side renders all items expanded so Google + JS-off
 * users see the answers; toggling collapses on the client. The structured
 * data (FAQPage schema) is emitted separately at the page level so this
 * component stays presentation-only.
 */
export default function FAQAccordion({ items, heading }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
      {heading && (
        <h2 className="font-headline font-bold text-3xl md:text-5xl text-on-surface mb-8 md:mb-12">
          {heading}
        </h2>
      )}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-on-surface/[0.08] bg-surface-container-lowest overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5 text-left hover:bg-primary-fixed/15 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-headline font-semibold text-base md:text-lg text-on-surface">
                  {item.question}
                </span>
                <Icon
                  name={isOpen ? "remove" : "add"}
                  className="text-[20px] text-primary shrink-0"
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 md:px-6 md:pb-6 text-on-surface/70 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
