"use client";

import { useState } from "react";
import { Plus, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BlurText from "./BlurText";

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

const EASE = [0.22, 1, 0.36, 1] as const;

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative z-10 overflow-hidden px-6 py-24 lg:px-16 text-foreground">
      {/* soft warm glow to tie into the palette */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.6, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
        className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,158,109,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <motion.div
          variants={listContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 mb-8"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-[#f2741f]"
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/80">
              FAQ
            </span>
          </motion.div>
          <h2 className="font-display text-4xl sm:text-[3.5rem] leading-[1.1] font-medium tracking-tight mb-6 text-black">
            <span className="block">
              <BlurText
                text="Frequently Asked"
                animateBy="words"
                delay={120}
                stepDuration={0.4}
              />
            </span>
            <span className="block">
              <BlurText
                text="Questions"
                animateBy="words"
                delay={120}
                startDelay={350}
                stepDuration={0.4}
              />
            </span>
          </h2>
          <motion.p
            variants={fadeUp}
            className="max-w-md text-sm sm:text-[0.95rem] leading-7 text-black/50"
          >
            Everything you need to know about our process in one place—commissions,
            materials, installations, and more, all answered for you.
          </motion.p>

          {/* Still curious? — warm CTA card */}
          <motion.div
            variants={fadeUp}
            className="mt-10 max-w-md rounded-2xl border border-[#f2741f]/15 bg-gradient-to-br from-[#fff3ea] to-[#fbf7f0] p-6"
          >
            <h3 className="font-display text-lg font-medium text-black">
              Still have a question?
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-black/50">
              Our studio team is happy to walk you through a commission.
            </p>
            <motion.a
              href="#contact"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ffd3be] to-[#ff9e6d] px-5 py-2.5 text-[0.8rem] font-semibold text-[#5a2e16] shadow-[0_4px_16px_rgba(255,158,109,0.35)]"
            >
              Talk to the studio
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          variants={listContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col gap-3"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                layout
                variants={fadeUp}
                transition={{ layout: { duration: 0.4, ease: EASE } }}
                className={`group rounded-2xl border bg-white overflow-hidden ${
                  isOpen
                    ? "border-[#f2741f]/25 shadow-[0_10px_30px_rgba(242,116,31,0.10)]"
                    : "border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-black/10"
                }`}
              >
                <motion.button
                  layout="position"
                  onClick={() => toggleOpen(index)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="flex items-center gap-4">
                    <span
                      className={`font-display text-sm transition-colors ${
                        isOpen ? "text-[#f2741f]" : "text-black/30"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium text-[0.95rem] text-black">
                      {faq.question}
                    </span>
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                      isOpen
                        ? "bg-gradient-to-br from-[#ffd3be] to-[#ff9e6d] text-[#5a2e16]"
                        : "bg-black/5 text-black/50 group-hover:bg-black/10"
                    }`}
                  >
                    {isOpen ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </motion.span>
                </motion.button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.38, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-[3.75rem] text-sm leading-relaxed text-black/60">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
