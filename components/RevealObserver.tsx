"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal], [data-reveal-stagger] > *";
const STEP = 90;
const MAX_DELAY = 720;

/**
 * Adds `is-visible` to `[data-reveal]` elements (and the children of
 * `[data-reveal-stagger]`) as they scroll into view. Stagger children that
 * arrive together (a row of a grid, or the whole first screen) fade up one
 * after another, in reading order, STEP ms apart. Also watches the DOM, so
 * content that appears later — a new page, a filtered grid — is picked up too.
 * The hidden starting state lives in globals.css.
 */
export default function RevealObserver() {
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        const arrived = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({ el: e.target as HTMLElement, box: e.boundingClientRect }))
          .sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left);
        let i = 0;
        for (const { el } of arrived) {
          if (el.parentElement?.hasAttribute("data-reveal-stagger")) {
            const delay = Math.min(i++ * STEP, MAX_DELAY);
            el.style.setProperty("--reveal-delay", `${delay}ms`);
            // Clear it once revealed so later transitions start at once.
            setTimeout(() => el.style.removeProperty("--reveal-delay"), delay + 1000);
          }
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
