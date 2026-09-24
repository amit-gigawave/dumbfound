"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal], [data-reveal-stagger] > *";

/**
 * Adds `is-visible` to `[data-reveal]` elements (and the children of
 * `[data-reveal-stagger]`) as they scroll into view. Also watches the DOM, so
 * content that appears later — a new page, a filtered grid — is picked up too.
 * The hidden starting state lives in globals.css.
 */
export default function RevealObserver() {
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
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
