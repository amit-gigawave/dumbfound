"use client";

import { motion } from "motion/react";

/**
 * Small premium "eyebrow" pill used above section titles.
 * Frosted glass surface with an inner top highlight + soft shadow, and a
 * glowing accent dot that emits a slow pulsing halo.
 */
export default function SectionBadge({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/55 px-4 py-1.5 ring-1 ring-black/[0.04] backdrop-blur-md shadow-[0_2px_12px_rgba(21,20,21,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ${className}`}
    >
      {/* accent dot with pulsing halo */}
      <span className="relative flex h-2 w-2 items-center justify-center">
        <motion.span
          className="absolute h-2 w-2 rounded-full bg-[#f2741f]"
          animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative h-2 w-2 rounded-full bg-gradient-to-br from-[#ffb184] to-[#f2741f] shadow-[0_0_8px_rgba(242,116,31,0.6)]" />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/70">
        {label}
      </span>
    </span>
  );
}
