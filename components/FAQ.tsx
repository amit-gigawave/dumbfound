"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

const faqs = [
  {
    question: "How does the commissioning process work?",
    answer:
      "We begin with a site visit and concept phase, followed by material selection. Once approved, fabrication begins in our studio. We handle the final installation and patina work on-site.",
  },
  {
    question: "Can architectural firms integrate your pieces?",
    answer:
      "Yes, we frequently partner with architects and landscape designers during the early phases of a project to ensure seamless integration into the site's structural logic.",
  },
  {
    question: "How long does a typical piece take to create?",
    answer:
      "Depending on scale and material, most pieces take between 12 to 24 weeks from concept approval to final installation.",
  },
  {
    question: "Do you offer international shipping and installation?",
    answer:
      "Yes, we coordinate global logistics, crates, and customs. Our team often travels internationally for the final installation.",
  },
  {
    question: "How do the materials weather over time?",
    answer:
      "We design with the elements in mind. Bronze, weathering steel, and certain stones will develop a natural patina over time. We provide a full care guide upon installation.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative z-10 overflow-hidden px-6 py-20 lg:px-16 text-foreground">
      <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="inline-flex rounded-full border border-black/10 bg-black/5 px-3 py-1 mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/80">
              FAQ
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-[3.5rem] leading-[1.1] font-medium tracking-tight mb-6 text-black">
            Frequently Asked
            <br />
            Questions
          </h2>
          <p className="max-w-md text-sm sm:text-[0.95rem] leading-7 text-black/50">
            Everything you need to know about our process in one place—commissions,
            materials, installations, and more, all answered for you.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            >
              <button
                onClick={() => toggleOpen(index)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="font-medium text-[0.95rem] text-black">
                  {faq.question}
                </span>
                <span className="text-black/50 shrink-0">
                  {openIndex === index ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-sm leading-relaxed text-black/60">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
