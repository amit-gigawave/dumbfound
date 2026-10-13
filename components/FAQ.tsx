"use client";

import { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

const EASE = "ease-[cubic-bezier(.3,.7,.3,1)]";

/**
 * Accordion, one question open at a time, hairline rules between.
 * Opening: the panel's height eases open (grid-row 0fr → 1fr), the answer fades
 * and settles into place, the + turns into −, and a thin accent line grows down
 * beside the open question. Closed panels are inert (no focus, not read out).
 */
export default function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-rule">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question} className="relative border-b border-rule">
            {/* Accent line beside the open item */}
            <span
              aria-hidden
              className={`absolute bottom-0 left-0 top-0 w-[2px] origin-top bg-accent transition-transform duration-500 ${EASE} ${
                isOpen ? "scale-y-100" : "scale-y-0"
              }`}
            />
            <h3>
              <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className={`group flex w-full items-center justify-between gap-6 py-5 text-left font-display text-[21px] leading-snug transition-[color,padding] duration-500 ${EASE} hover:text-accent ${
                  isOpen ? "pl-5 text-accent" : "pl-0"
                }`}
              >
                {item.question}
                {/* + that turns into − : the vertical bar rotates flat */}
                <span
                  aria-hidden
                  className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-[transform,border-color,background-color] duration-500 ${EASE} ${
                    isOpen
                      ? "rotate-180 border-accent bg-accent text-white"
                      : "border-rule text-stone group-hover:border-accent group-hover:text-accent"
                  }`}
                >
                  <span className="absolute h-[1.5px] w-3 rounded bg-current" />
                  <span
                    className={`absolute h-3 w-[1.5px] rounded bg-current transition-transform duration-500 ${EASE} ${
                      isOpen ? "rotate-90" : "rotate-0"
                    }`}
                  />
                </span>
              </button>
            </h3>
            <div
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-500 ${EASE} ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p
                  className={`font-text max-w-[62ch] pb-6 text-[17px] leading-[1.75] text-stone transition-[opacity,transform] duration-500 ${EASE} ${
                    isOpen
                      ? "translate-y-0 pl-5 opacity-100 delay-150"
                      : "-translate-y-2 pl-5 opacity-0"
                  }`}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
