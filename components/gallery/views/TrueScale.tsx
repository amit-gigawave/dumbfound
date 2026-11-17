"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ConceptWork } from "./types";
import { FIT_CARD } from "../../three/modelLoader";

const SculptureScene = dynamic(() => import("../../SculptureScene"), {
  ssr: false,
});
import { useImageStats } from "./imageStats";

/** How much of the screen's height the tallest work takes. */
const TALLEST_VH = 50;

/**
 * Every work with a recorded height, standing on one floor at its real size
 * relative to the others, next to a centimetre ruler. Each thumbnail is
 * cropped to the sculpture's own edges, so the drawn height is the real one.
 */
export default function TrueScale({
  works,
  unsized,
}: {
  works: ConceptWork[];
  unsized: number;
}) {
  const sized = [...works]
    .filter((w) => w.heightCm)
    .sort((a, b) => b.heightCm! - a.heightCm!);
  const stats = useImageStats(sized.map((w) => w.thumbnail));
  const max = Math.max(...sized.map((w) => w.heightCm!));
  const cm = (h: number) => `calc(${h} * ${TALLEST_VH}svh / ${max})`;
  const ticks = Array.from(
    { length: Math.floor(max / 10) + 1 },
    (_, i) => i * 10,
  );

  // The work under the pointer, and the one whose 3D model has drawn. A short
  // delay keeps a fast sweep along the row from loading every model; only one
  // 3D canvas exists at a time.
  const [hover, setHover] = useState<string | null>(null);
  const [ready, setReady] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enter = (slug: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHover(slug), 140);
  };
  const leave = () => {
    clearTimeout(timer.current);
    setHover(null);
    setReady(null);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  // The mouse wheel walks the row sideways. At either end it lets go, so the
  // page can keep scrolling. (A native listener: React's wheel handler can't cancel.)
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.ctrlKey) return;
      const max = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + e.deltaY;
      if (
        e.deltaY === 0 ||
        (next < 0 && el.scrollLeft <= 0) ||
        (next > max && el.scrollLeft >= max)
      )
        return;
      e.preventDefault();
      el.scrollLeft = next;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className="bg-[#f3f2ee] pb-24 pt-[clamp(32px,5vh,56px)]">
      <div className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,48px)]">
        <h2 className="font-display text-[clamp(30px,4.4vw,56px)] leading-none">
          Side by side, at real size
        </h2>
        <p className="mt-3 max-w-[60ch] text-[14px] text-stone">
          Tallest to smallest. Scroll sideways along the line.
          {unsized > 0 &&
            ` ${unsized} works without a recorded height aren't shown.`}
        </p>
      </div>

      <div className="mt-[clamp(8px,5vh,64px)] flex items-start">
        {/* Ruler: its own column to the left of every model. It stays put while the works scroll, and shares their floor. */}
        <div
          aria-hidden
          className="flex shrink-0 flex-col pt-8 pl-[clamp(16px,4vw,48px)] pr-3"
        >
          <div className="relative w-10" style={{ height: cm(max) }}>
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute left-0 flex w-full items-center gap-1"
                style={{ bottom: cm(t) }}
              >
                <span
                  className={`h-px bg-[#8d887c] ${t % 50 === 0 ? "w-4" : "w-2"}`}
                />
                {t % 50 === 0 && (
                  <span className="text-[10px] tabular-nums leading-none text-[#6f6a5f]">
                    {t}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="h-px bg-[#bdb7a9]" />
          <div className="h-[95px] pt-2 text-[10px] text-[#6f6a5f]">cm</div>
        </div>
        <div
          ref={row}
          className="min-w-0 flex-1 overflow-x-auto pb-4 pt-8 [scrollbar-color:#8d887c_#e4e1d8] [scrollbar-width:auto]"
        >
          <ol className="flex w-max items-end gap-[clamp(44px,6.5vw,96px)] pl-[clamp(8px,1.5vw,20px)] pr-[clamp(16px,4vw,48px)]">
            {sized.map((w) => {
              const s = stats[w.thumbnail];
              const [l, t, r, b] = s?.box ?? [0.2, 0.08, 0.8, 0.92];
              const bw = r - l,
                bh = b - t;
              return (
                <li key={w.slug} className="flex w-max flex-col items-center">
                  {/* Hover (or focus) turns the still image into the live 3D model, turning slowly. */}
                  <div
                    className="relative"
                    onMouseEnter={() => enter(w.slug)}
                    onMouseLeave={leave}
                    onFocus={() => enter(w.slug)}
                    onBlur={leave}
                  >
                    {hover === w.slug && w.modelUrl && (
                      <div
                        aria-hidden
                        className="pointer-events-none [&_*]:!pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
                        style={{
                          height: `${100 / FIT_CARD}%`,
                          minWidth: `${100 / FIT_CARD}%`,
                          aspectRatio: "4 / 5",
                          opacity: ready === w.slug ? 1 : 0,
                        }}
                      >
                        <SculptureScene
                          url={w.modelUrl}
                          fit={FIT_CARD}
                          adaptiveBackground={false}
                          reveal={false}
                          facing={w.facing}
                          look={w.look}
                          onReady={() => setReady(w.slug)}
                        />
                      </div>
                    )}
                    <Link
                      href={`/artworks/${w.slug}`}
                      aria-label={`${w.title}, ${w.heightCm} cm`}
                      className="group relative block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                      style={{
                        height: cm(w.heightCm!),
                        aspectRatio: `${(bw * 0.8) / bh}`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={w.thumbnail}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={`absolute max-w-none transition-opacity duration-500 ${
                          s && !(hover === w.slug && ready === w.slug)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                        style={{
                          height: `${100 / bh}%`,
                          aspectRatio: "4 / 5",
                          top: `${(-t / bh) * 100}%`,
                          left: `${(-l / bw) * 100}%`,
                        }}
                      />
                    </Link>
                  </div>
                  {/* Floor and caption */}
                  <div className="h-px w-[calc(100%+clamp(44px,6.5vw,96px))] bg-[#bdb7a9]" />
                  <div className="h-[95px] w-[clamp(84px,9vw,120px)] pt-2 text-center">
                    <p className="text-[13px] tabular-nums text-ink">
                      {w.heightCm} cm
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-stone">
                      {w.title}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
