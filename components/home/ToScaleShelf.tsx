"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ConceptWork } from "../gallery/views/types";
import { useImageStats } from "../gallery/views/imageStats";

/**
 * Pixels per centimetre. 1.9 px at the 1440 px design width (a 183 cm work
 * stands 348 px tall); it shrinks with the screen down to 1.25 px on phones,
 * where the shelf scrolls sideways instead.
 */
const CM = "clamp(1.25px, 0.132vw, 1.9px)";
const cm = (h: number) => `calc(${h} * var(--cm))`;
/** Height guides behind the works. */
const GUIDES = [50, 100, 150];

/**
 * The home page's taste of True scale: a fixed set of works standing on one
 * shelf at their real heights. Each thumbnail is cropped to the sculpture's
 * own edges (measured in the browser), so the drawn height is the real one.
 * Hover or focus a work for its label; a click opens it.
 */
export default function ToScaleShelf({ works }: { works: ConceptWork[] }) {
  const stats = useImageStats(works.map((w) => w.thumbnail));
  const tallest = Math.max(...works.map((w) => w.heightCm ?? 0));

  // On wider screens every work fits on one shelf: the scale is whatever lets
  // the row fill the width (never above the design's 1.9 px/cm). Phones keep
  // CM and scroll.
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const [fit, setFit] = useState<number | null>(null);
  const measured = works.every((w) => stats[w.thumbnail] !== undefined);
  useEffect(() => {
    const el = box.current;
    const ol = list.current;
    if (!el || !ol || !measured) return;
    const update = () => {
      if (window.innerWidth < 768) return setFit(null);
      const cs = getComputedStyle(ol);
      const fixed =
        parseFloat(cs.columnGap || "0") * (works.length - 1) +
        parseFloat(cs.paddingLeft) +
        parseFloat(cs.paddingRight);
      // Width of all the works at 1 px per cm.
      const perCm = works.reduce((sum, w) => {
        const [l, t, r, b] = stats[w.thumbnail]?.box ?? [0.2, 0.08, 0.8, 0.92];
        return sum + w.heightCm! * ((r - l) * 0.8) / (b - t);
      }, 0);
      setFit(Math.min(1.9, (el.clientWidth - fixed) / perCm));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measured, stats, works]);

  return (
    <div
      ref={box}
      className="relative"
      style={{ "--cm": fit ? `${fit}px` : CM } as React.CSSProperties}
    >
      {/* Guides: a line every 50 cm, labelled in the left margin (wider screens). */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[25px] hidden md:block" style={{ height: cm(tallest) }}>
        {GUIDES.filter((g) => g < tallest).map((g) => (
          <div
            key={g}
            className="absolute inset-x-0 flex items-center gap-4"
            style={{ bottom: cm(g) }}
          >
            <span className="w-[42px] shrink-0 translate-y-1/2 text-[11px] tabular-nums text-stone">
              {g} cm
            </span>
            <span className="h-px flex-1 translate-y-1/2 bg-rule/80" />
          </div>
        ))}
      </div>

      <div className="-mx-[clamp(16px,4vw,40px)] overflow-x-auto px-[clamp(16px,4vw,40px)] [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0">
        <div className="relative w-max min-w-full">
        <ol ref={list} className="flex w-max min-w-full items-end justify-between gap-[clamp(14px,1.6vw,24px)] pr-1 md:pl-[58px]">
          {works.map((w) => {
            const s = stats[w.thumbnail];
            const [l, t, r, b] = s?.box ?? [0.2, 0.08, 0.8, 0.92];
            const bw = r - l,
              bh = b - t;
            return (
              <li key={w.slug} className="group relative flex flex-col items-center pb-[25px]">
                {/* Label: title, artist, listed size and height. */}
                <div
                  role="tooltip"
                  id={`scale-${w.slug}`}
                  className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-10 w-max max-w-[240px] -translate-x-1/2 rounded-[4px] bg-ink px-3.5 py-3 text-[12px] leading-[1.45] text-white/80 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100"
                >
                  <p className="font-text text-[15px] italic text-white">{w.title}</p>
                  {w.artist && <p>{w.artist}</p>}
                  {w.dimensions && <p>{w.dimensions}</p>}
                  <p>{w.heightCm} cm tall</p>
                </div>

                <Link
                  href={`/artworks/${w.slug}`}
                  aria-label={`${w.title}${w.artist ? `, ${w.artist}` : ""}, ${w.heightCm} cm tall`}
                  aria-describedby={`scale-${w.slug}`}
                  className="relative block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  style={{
                    height: cm(w.heightCm!),
                    aspectRatio: `${(bw * 0.8) / bh}`,
                  }}
                >
                  {/* A soft pool of shadow where the work meets the shelf. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-[6%] -bottom-[5px] h-3 rounded-[50%] bg-ink/15 blur-[3px]"
                  />
                  <span className="absolute inset-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={w.thumbnail}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute max-w-none transition-opacity duration-500"
                      style={{
                        height: `${100 / bh}%`,
                        aspectRatio: "4 / 5",
                        top: `${(-t / bh) * 100}%`,
                        left: `${(-l / bw) * 100}%`,
                        opacity: s ? 1 : 0,
                      }}
                    />
                  </span>
                </Link>

                {/* Placed under the work without widening it, so the row's width is the works' own. */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] leading-[13px] tabular-nums text-stone">
                  {w.heightCm} cm
                </span>
              </li>
            );
          })}
        </ol>
        {/* The shelf: one line under every work, the heights below it. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[23px] h-[2px] bg-ink"
        />
        </div>
      </div>
    </div>
  );
}
