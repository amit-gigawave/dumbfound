"use client";

import { useRef } from "react";

/** Furthest the child drifts toward the cursor, in px. */
const REACH = 8;

/**
 * Pulls its child gently toward the cursor while the mouse is over it, and
 * springs back on leave. Mouse and pen only; off for reduced motion.
 */
export default function Magnetic({
  children,
  className = "inline-block",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const move = (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2 * REACH;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2 * REACH * 0.6;
    el.style.transition = "transform 0.15s ease-out";
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  };

  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.6s cubic-bezier(0.3, 1.6, 0.5, 1)";
    el.style.transform = "";
  };

  return (
    <span
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={className}
    >
      {children}
    </span>
  );
}
