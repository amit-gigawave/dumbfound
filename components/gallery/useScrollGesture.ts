"use client";

import { useEffect, useRef } from "react";

/*
 * Scroll gestures: while the page scrolls, one or two sculptures on screen —
 * picked at random — make a small gesture (a wobble, a nod, a hop, a lean),
 * then settle. Never more than two at once, so the grid feels alive without
 * everything moving together. Skipped for visitors who prefer reduced motion.
 */

/** Most sculptures gesturing at the same moment. */
const MAX_AT_ONCE = 2;
/** Pause between picks while scrolling, in ms (a random value in this range). */
const GAP_MIN = 650;
const GAP_MAX = 1400;

// Small gestures, pivoting near the sculpture's base.
const GESTURES: Keyframe[][] = [
  // wobble
  [
    { transform: "rotate(0deg)" },
    { transform: "rotate(-3deg)" },
    { transform: "rotate(2.5deg)" },
    { transform: "rotate(-1.5deg)" },
    { transform: "rotate(0.6deg)" },
    { transform: "rotate(0deg)" },
  ],
  // nod
  [
    { transform: "translateY(0) scaleY(1)" },
    { transform: "translateY(3px) scaleY(0.985)" },
    { transform: "translateY(-2px) scaleY(1.008)" },
    { transform: "translateY(2px) scaleY(0.992)" },
    { transform: "translateY(0) scaleY(1)" },
  ],
  // hop
  [
    { transform: "translateY(0) scale(1, 1)" },
    { transform: "translateY(0) scale(1.02, 0.97)", offset: 0.15 },
    { transform: "translateY(-9px) scale(0.99, 1.02)", offset: 0.45 },
    { transform: "translateY(0) scale(1.015, 0.985)", offset: 0.75 },
    { transform: "translateY(0) scale(1, 1)" },
  ],
  // lean
  [
    { transform: "rotate(0deg) translateX(0)" },
    { transform: "rotate(2.5deg) translateX(3px)", offset: 0.35 },
    { transform: "rotate(2.5deg) translateX(3px)", offset: 0.55 },
    { transform: "rotate(-0.8deg) translateX(-1px)", offset: 0.82 },
    { transform: "rotate(0deg) translateX(0)" },
  ],
];

const sculptures = new Set<HTMLElement>();
const busy = new Set<HTMLElement>();
let nextPick = 0;
let listening = false;

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const onScroll = () => {
  const now = performance.now();
  if (now < nextPick || busy.size >= MAX_AT_ONCE) return;
  nextPick = now + GAP_MIN + Math.random() * (GAP_MAX - GAP_MIN);

  const h = window.innerHeight;
  const candidates = [...sculptures].filter((el) => {
    if (busy.has(el) || el.closest("[data-turning]")) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > h * 0.1 && r.top < h * 0.9;
  });

  const count = Math.min(
    MAX_AT_ONCE - busy.size,
    Math.random() < 0.6 ? 1 : 2,
    candidates.length,
  );
  for (let i = 0; i < count; i++) {
    const el = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
    busy.add(el);
    const anim = el.animate(pick(GESTURES), {
      duration: 850 + Math.random() * 450,
      easing: "ease-in-out",
    });
    const done = () => busy.delete(el);
    anim.onfinish = done;
    anim.oncancel = done;
  }
};

/** Attach the returned ref to the element that should gesture (the sculpture, not its card). */
export function useScrollGesture<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    sculptures.add(el);
    if (!listening) {
      window.addEventListener("scroll", onScroll, { passive: true });
      listening = true;
    }

    return () => {
      sculptures.delete(el);
      busy.delete(el);
      el.getAnimations().forEach((a) => a.cancel());
      if (!sculptures.size && listening) {
        window.removeEventListener("scroll", onScroll);
        listening = false;
      }
    };
  }, [enabled]);

  return ref;
}
