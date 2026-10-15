"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A sentence that lights up word by word as it scrolls through the viewport.
 * Words inside **double asterisks** light up in the accent colour.
 * Visitors who prefer reduced motion see it fully lit.
 * `dark` suits black bands; `className` replaces the default type size;
 * `as="h2"` when the sentence is the section's heading.
 */
export default function Manifesto({
  text,
  dark = false,
  className = "font-display max-w-[30ch] text-[clamp(28px,4.2vw,54px)] leading-[1.22] tracking-[0.01em]",
  as: Tag = "p",
}: {
  text: string;
  dark?: boolean;
  className?: string;
  as?: "p" | "h2";
}) {
  const ref = useRef<HTMLParagraphElement & HTMLHeadingElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (still) return setProgress(1);
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the text enters the lower part of the screen, 1 once it nears the top.
      setProgress(
        Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.2))),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    onScroll();
    if (still) return () => cancelAnimationFrame(frame);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const words = text.split("**").flatMap((seg, si) =>
    seg
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, key: si % 2 === 1 })),
  );

  return (
    <Tag ref={ref} className={className}>
      {words.map(({ w, key }, i) => {
        const lit = i / words.length < progress;
        const tone = dark
          ? lit
            ? key
              ? "text-accent-light"
              : "text-[#f2f2f2]"
            : "text-white/20"
          : lit
            ? key
              ? "text-accent"
              : "text-ink"
            : "text-[#cfcfcf]";
        return (
          <span key={i} className={`transition-colors duration-300 ${tone}`}>
            {w}{" "}
          </span>
        );
      })}
    </Tag>
  );
}
