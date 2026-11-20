"use client";

import { useEffect, useRef, useState } from "react";

export interface ArtistSection {
  id: string;
  label: string;
  /** How many items the section holds, shown beside its name. */
  count?: number;
}

/**
 * The artist page's section links, stuck under the site header. The link for
 * the section on screen is underlined; on phones the row scrolls sideways and
 * keeps that link in view.
 */
export default function ArtistSectionNav({
  sections,
}: {
  sections: ArtistSection[];
}) {
  const [current, setCurrent] = useState(sections[0]?.id);
  const row = useRef<HTMLDivElement>(null);

  // The current section is the last one whose top has passed the bar.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = 84 + 64 + 24; // header + this bar + a little
      let id = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) id = s.id;
      }
      setCurrent(id);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sections]);

  // Keep the current link visible in the sideways-scrolling row (phones).
  useEffect(() => {
    const el = row.current?.querySelector<HTMLElement>(`[data-id="${current}"]`);
    const box = row.current;
    if (!el || !box || box.scrollWidth <= box.clientWidth) return;
    box.scrollTo({ left: el.offsetLeft - 16, behavior: "smooth" });
  }, [current]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[84px] z-40 border-y border-rule bg-white"
    >
      <div
        ref={row}
        className="mx-auto flex h-16 max-w-[1200px] items-stretch gap-[clamp(24px,3.5vw,44px)] overflow-x-auto px-[clamp(16px,4vw,40px)] [scrollbar-width:none]"
      >
        {sections.map((s) => {
          const on = s.id === current;
          return (
            <a
              key={s.id}
              data-id={s.id}
              href={`#${s.id}`}
              aria-current={on ? "location" : undefined}
              className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 text-[14px] transition-colors ${
                on
                  ? "border-accent text-ink"
                  : "border-transparent text-stone hover:text-ink"
              }`}
            >
              {s.label}
              {s.count !== undefined && (
                <span className="tabular-nums text-stone">{s.count}</span>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
