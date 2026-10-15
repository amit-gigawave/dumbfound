"use client";

import { useEffect, useRef, useState } from "react";

/** Pause between words as a paragraph rises in, in ms. */
const WORD_STEP = 22;

/*
 * Paragraphs that rise in word by word as they scroll into view; afterwards a
 * marker sweeps across the key phrases, written in **double asterisks**.
 * Hidden states only apply once JS has marked the page (html.js), so the text
 * is always readable without scripts. Reduced motion: shown at once.
 */
function StaggerParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setInstant(still);
        setShown(true);
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Phrases: plain and key, in order; each phrase keeps its words' running index.
  let n = 0;
  const phrases = text.split("**").map((seg, si) => ({
    key: si % 2 === 1,
    words: seg
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, i: n++ })),
  }));
  const end = n * WORD_STEP;
  const delay = (ms: number) => (instant ? "0ms" : `${ms}ms`);

  const word = ({ w, i }: { w: string; i: number }, space = true) => (
    <span key={i}>
      <span
        className={`inline-block transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
          shown
            ? ""
            : "[html.js_&]:translate-y-[0.6em] [html.js_&]:opacity-0 [html.js_&]:blur-[3px]"
        }`}
        style={{ transitionDelay: delay(i * WORD_STEP) }}
      >
        {w}
      </span>
      {space && " "}
    </span>
  );

  return (
    <p ref={ref}>
      {phrases.map((p, pi) =>
        p.key ? (
          // The phrase's last word leaves its space outside, so the marker ends on the text.
          <span key={pi}>
            <mark
              className={`bg-transparent bg-[linear-gradient(rgba(57,96,70,.15),rgba(57,96,70,.15))] bg-[length:100%_42%] bg-[position:0_90%] bg-no-repeat text-ink transition-[background-size] duration-[900ms] ease-[cubic-bezier(.6,0,.2,1)] ${
                shown ? "" : "[html.js_&]:bg-[length:0%_42%]"
              }`}
              style={{ transitionDelay: delay(end + 150 + pi * 90) }}
            >
              {p.words.map((x, k) => word(x, k < p.words.length - 1))}
            </mark>{" "}
          </span>
        ) : (
          p.words.map((x) => word(x))
        ),
      )}
    </p>
  );
}

export default function StaggerStory({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="font-text grid max-w-[60ch] gap-8 text-[clamp(18px,1.7vw,21px)] leading-[1.75] text-stone">
      {paragraphs.map((t) => (
        <StaggerParagraph key={t} text={t} />
      ))}
    </div>
  );
}
