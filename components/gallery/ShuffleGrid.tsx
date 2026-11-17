"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * A grid whose cards glide to their new places when its contents change (e.g.
 * choosing an artist): each card that stays is animated from where it was to
 * where it now is (FLIP, with the Web Animations API, so nothing is left in
 * inline styles). Cards that arrive fade up through RevealObserver as usual.
 * Each child must carry a `data-key` that is stable across changes.
 */
export default function ShuffleGrid({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { "data-reveal-stagger"?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // Where each card was after the last render, relative to the grid.
  const last = useRef<Map<string, { x: number; y: number }>>(new Map());

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const origin = grid.getBoundingClientRect();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const now = new Map<string, { x: number; y: number }>();
    let moved = 0;
    for (const el of Array.from(grid.children) as HTMLElement[]) {
      const key = el.dataset.key;
      if (!key) continue;
      const r = el.getBoundingClientRect();
      const at = { x: r.left - origin.left, y: r.top - origin.top };
      now.set(key, at);
      const was = last.current.get(key);
      if (!was || still) continue;
      const dx = was.x - at.x;
      const dy = was.y - at.y;
      if (!dx && !dy) continue;
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0, 0)" },
        ],
        {
          duration: 650,
          delay: Math.min(moved++ * 25, 300),
          easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
          fill: "backwards",
        },
      );
    }
    last.current = now;
  });

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
