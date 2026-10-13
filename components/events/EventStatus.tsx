"use client";

import { useEffect, useState } from "react";

const DAY = 86_400_000;
const parse = (iso: string) => new Date(`${iso}T00:00:00`);
const short = (iso: string) =>
  parse(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/**
 * Live status from the visitor's own date: "Opens in 3 days", "On now ·
 * closes 15 Oct", "Last day today" or "Ended". Worked out after mount, so a
 * page built days earlier still shows the right thing; until then it shows
 * `fallback`.
 */
export default function EventStatus({
  start,
  end,
  fallback,
  dark,
}: {
  start: string;
  end: string;
  fallback: string;
  dark?: boolean;
}) {
  const [label, setLabel] = useState<{ text: string; live: boolean } | null>(
    null,
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
      const s = parse(start).getTime();
      const e = parse(end).getTime();
      if (today < s) {
        const days = Math.round((s - today) / DAY);
        setLabel({
          text: days === 1 ? "Opens tomorrow" : `Opens in ${days} days`,
          live: false,
        });
      } else if (today <= e) {
        setLabel({
          text:
            today === e
              ? "On now · last day today"
              : `On now · closes ${short(end)}`,
          live: true,
        });
      } else {
        setLabel({ text: "Ended", live: false });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [start, end]);

  const text = label?.text ?? fallback;
  const live = label?.live ?? false;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${
        live
          ? "border-accent bg-accent text-white"
          : dark
            ? "border-white/30 text-[#d0d0d0]"
            : "border-rule text-stone"
      }`}
    >
      {live && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
      )}
      {text}
    </span>
  );
}
