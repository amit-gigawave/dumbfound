"use client";

import { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

/** Plain accordion: one question open at a time, hairline rules between. */
export default function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-rule">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question} className="border-b border-rule">
            <h3>
              <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-baseline justify-between gap-6 py-5 text-left font-display text-[21px] leading-snug transition-colors hover:text-accent"
              >
                {item.question}
                <span aria-hidden className="font-sans text-lg text-stone">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
              hidden={!isOpen}
              className="font-text max-w-[62ch] pb-6 text-[17px] leading-[1.75] text-stone"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
