"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ConceptWork } from "./types";
import { useImageStats } from "./imageStats";
import { FIT_CARD } from "../../three/modelLoader";

const SculptureScene = dynamic(() => import("../../SculptureScene"), {
  ssr: false,
});

/**
 * Height the tallest work is drawn at: what is left of the screen under the
 * site header, the title bar, the captions and the floating view switch.
 */
const STAGE = "max(260px, calc(100svh - 440px))";
/** The caption area under the floor line (px), and the line itself. */
const CAPTION_PX = 95;
/** Space between works. */
const GAP = "clamp(44px,6.5vw,96px)";

/**
 * A box that reports the pointer coming in and going out, using the native
 * mouseenter/mouseleave. React's own onMouseLeave goes by the React tree, so
 * it fires when the pointer moves onto the 3D view's loading spinner (a
 * separate React root) even though that sits inside this box.
 */
function HoverZone({
  onEnter,
  onLeave,
  children,
  ...rest
}: {
  onEnter: () => void;
  onLeave: () => void;
} & Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onMouseEnter" | "onMouseLeave"
>) {
  const ref = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onEnter, onLeave });
  useEffect(() => {
    handlers.current = { onEnter, onLeave };
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inn = () => handlers.current.onEnter();
    const out = () => handlers.current.onLeave();
    el.addEventListener("mouseenter", inn);
    el.addEventListener("mouseleave", out);
    return () => {
      el.removeEventListener("mouseenter", inn);
      el.removeEventListener("mouseleave", out);
    };
  }, []);
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}

/**
 * Every work with a recorded height, standing on one floor at its real size
 * relative to the others, beside a centimetre ruler. Each thumbnail is cropped
 * to the sculpture's own edges, so the drawn height is the real one.
 *
 * The stage fills the screen. The work nearest the centre is in focus (the
 * rest dim back) and named at the top; drag, the wheel, the arrow keys or the
 * side buttons walk the line. Hovering a work turns it into its 3D model. A
 * visitor can add their own height as a line across the whole stage.
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
  const cm = (h: number) => `calc(${h} * ${STAGE} / ${max})`;
  const ticks = Array.from(
    { length: Math.floor(max / 10) + 1 },
    (_, i) => i * 10,
  );

  const row = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const [focus, setFocus] = useState(0);
  // Whether the line is at its start or end (the arrow that can't go further hides).
  const [edges, setEdges] = useState({ start: true, end: false });
  // The "hover / drag" hint shows until the visitor first brings up a 3D model.
  const [hinted, setHinted] = useState(false);

  // Hover: the work under the pointer, and the one whose 3D model has drawn.
  // A short delay keeps a fast sweep along the row from loading every model;
  // only one 3D canvas exists at a time.
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

  // The visitor's own height, typed in (cm). Shown as a line across the stage.
  const [me, setMe] = useState("");
  const meCm = Number(me);
  const showMe = me !== "" && meCm >= 30 && meCm <= max * 1.2;

  // Focus: each work gets --f, 1 at the focus point fading to 0 half a screen
  // away; the nearest one is named at the top. The focus point travels with
  // the scroll, from the left of the stage at the start to its right at the
  // end, so the first works are in focus as the page opens and the last ones
  // can still reach it.
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      const end = el.scrollWidth - el.clientWidth;
      const progress = end > 0 ? el.scrollLeft / end : 0;
      const mid = box.left + box.width * (0.22 + 0.56 * progress);
      const start = el.scrollLeft <= 2;
      const atEnd = el.scrollLeft >= end - 2;
      setEdges((e) =>
        e.start === start && e.end === atEnd ? e : { start, end: atEnd },
      );
      let best = 0;
      let bestD = Infinity;
      items.current.forEach((li, i) => {
        if (!li) return;
        const r = li.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        const f = Math.max(0, 1 - d / (box.width * 0.55));
        li.style.setProperty("--f", f.toFixed(3));
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setFocus(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stats]);

  // The mouse wheel walks the row sideways. At either end it lets go, so the
  // page can keep scrolling. (A native listener: React's wheel handler can't cancel.)
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.ctrlKey) return;
      const end = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + e.deltaY;
      if (
        e.deltaY === 0 ||
        (next < 0 && el.scrollLeft <= 0) ||
        (next > end && el.scrollLeft >= end)
      )
        return;
      e.preventDefault();
      el.scrollLeft = next;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Where a press on a 3D model began, to tell a click (open the work) from a turn.
  const press = useRef<{ x: number; y: number } | null>(null);

  // Drag with the mouse to walk the line. A drag doesn't count as a click,
  // so letting go over a work doesn't open it.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !row.current) return;
    // A press on a 3D model turns the model; it doesn't walk the line.
    if ((e.target as Element).closest("canvas")) return;
    drag.current = { x: e.clientX, left: row.current.scrollLeft, moved: false };
    dragged.current = false;
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      const el = row.current;
      if (!d || !el) return;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 5) d.moved = true;
      if (d.moved) el.scrollLeft = d.left - dx;
    };
    const up = () => {
      if (drag.current?.moved) dragged.current = true;
      drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const step = (dir: 1 | -1) =>
    row.current?.scrollBy({
      left: dir * row.current.clientWidth * 0.6,
      behavior: "smooth",
    });

  const current = sized[focus];

  return (
    <section className="flex min-h-[calc(100svh-85px)] flex-col bg-[#f3f2ee] pb-24 pt-[clamp(20px,3.5vh,40px)]">
      {/* Title on the left; the work in focus, and "your height", on the right. */}
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 px-[clamp(16px,4vw,48px)]">
        <div>
          <h2 className="font-display text-[clamp(28px,3.6vw,48px)] leading-none">
            Side by side, at real size
          </h2>
          <p className="mt-2 max-w-[60ch] text-[13px] text-stone">
            Tallest to smallest. Drag, scroll or use the arrows to walk the
            line; hover a work to see it in 3D, and drag it to turn it.
            {unsized > 0 &&
              ` ${unsized} works without a recorded height aren't shown.`}
          </p>
        </div>
        <div className="flex items-end gap-8">
          {current && (
            <div aria-live="polite" className="min-w-0 text-right">
              <p className="text-[12px] text-stone">{current.artist}</p>
              <p className="font-display max-w-[22ch] truncate text-[clamp(18px,1.8vw,24px)] leading-tight">
                {current.title}
              </p>
              <p className="mt-0.5 text-[13px] tabular-nums text-ink">
                {current.heightCm} cm
                <Link
                  href={`/artworks/${current.slug}`}
                  className="ml-3 border-b border-current text-[12px] hover:opacity-70"
                >
                  Open
                </Link>
              </p>
            </div>
          )}
          <label className="flex flex-col text-[12px] text-stone">
            Your height
            <span className="mt-1 flex items-center gap-1">
              <input
                type="number"
                inputMode="numeric"
                min={30}
                max={Math.round(max * 1.2)}
                value={me}
                onChange={(e) => setMe(e.target.value)}
                placeholder="cm"
                className="w-[72px] rounded-full border border-[#bdb7a9] bg-white/70 px-3 py-1 text-[13px] text-ink outline-none focus-visible:border-ink"
              />
              <span>cm</span>
            </span>
          </label>
        </div>
      </div>

      {/* The stage: pushed to the bottom of the screen, so the works stand on its floor. */}
      <div className="mt-auto flex items-start pt-[clamp(16px,3vh,32px)]">
        {/* Ruler: its own column to the left of every model. It stays put while the works scroll, and shares their floor. */}
        <div
          aria-hidden
          className="flex shrink-0 flex-col pl-[clamp(16px,4vw,48px)] pr-3 pt-8"
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
            {showMe && (
              <span
                className="absolute -left-1 h-[2px] w-6 bg-accent"
                style={{ bottom: cm(meCm) }}
              />
            )}
          </div>
          <div className="h-px bg-[#bdb7a9]" />
          <div
            className="pt-2 text-[10px] text-[#6f6a5f]"
            style={{ height: CAPTION_PX }}
          >
            cm
          </div>
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            ref={row}
            tabIndex={0}
            aria-label="Works at real size. Use the arrow keys to move along the line."
            onPointerDown={onPointerDown}
            // Never pick up an image (or link) as a browser drag.
            onDragStart={(e) => e.preventDefault()}
            onClickCapture={(e) => {
              if (dragged.current) {
                e.preventDefault();
                e.stopPropagation();
                dragged.current = false;
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                step(1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                step(-1);
              }
            }}
            className="cursor-grab select-none overflow-x-auto pb-4 pt-8 outline-none [scrollbar-color:#8d887c_#e4e1d8] [scrollbar-width:auto] active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
          >
            <ol
              className="relative flex w-max items-end pl-[clamp(8px,1.5vw,20px)] pr-[clamp(16px,4vw,48px)]"
              style={{ gap: GAP }}
            >
              {/* The visitor's height, across the whole line; its label rides along the left edge. */}
              {showMe && (
                <li
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 z-20 flex border-t-2 border-dashed border-accent/70"
                  style={{ bottom: `calc(${CAPTION_PX + 1}px + ${cm(meCm)})` }}
                >
                  <span className="sticky left-2 -mt-6 rounded-full bg-accent px-2 py-0.5 text-[11px] tabular-nums text-white">
                    You, {meCm} cm
                  </span>
                </li>
              )}
              {sized.map((w, i) => {
                const s = stats[w.thumbnail];
                const [l, t, r, b] = s?.box ?? [0.2, 0.08, 0.8, 0.92];
                const bw = r - l,
                  bh = b - t;
                const live = hover === w.slug && ready === w.slug;
                return (
                  <li
                    key={w.slug}
                    ref={(el) => {
                      items.current[i] = el;
                    }}
                    className="flex w-max flex-col items-center"
                  >
                    {/* Hover (or focus) turns the still image into the 3D model, which the visitor turns by dragging. */}
                    <HoverZone
                      className="relative origin-bottom transition-transform duration-300"
                      style={{
                        transform: "scale(calc(0.96 + var(--f,1) * 0.04))",
                      }}
                      onEnter={() => enter(w.slug)}
                      onLeave={leave}
                      onFocus={() => enter(w.slug)}
                      onBlur={leave}
                    >
                      {hover === w.slug && w.modelUrl && (
                        <div
                          aria-hidden
                          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
                          style={{
                            height: `${100 / FIT_CARD}%`,
                            minWidth: `${100 / FIT_CARD}%`,
                            aspectRatio: "4 / 5",
                            opacity: ready === w.slug ? 1 : 0,
                          }}
                          // A press and release without moving still opens the work.
                          onPointerDown={(e) => {
                            press.current = { x: e.clientX, y: e.clientY };
                          }}
                          onPointerUp={(e) => {
                            const p = press.current;
                            press.current = null;
                            if (
                              p &&
                              Math.hypot(e.clientX - p.x, e.clientY - p.y) < 5
                            )
                              // Through the work's own link, like any other click on it.
                              e.currentTarget.parentElement
                                ?.querySelector<HTMLAnchorElement>("a[href]")
                                ?.click();
                          }}
                        >
                          <SculptureScene
                            url={w.modelUrl}
                            interactive
                            rotateOnly
                            fit={FIT_CARD}
                            adaptiveBackground={false}
                            reveal={false}
                            facing={w.facing}
                            look={w.look}
                            onReady={() => {
                              setReady(w.slug);
                              setHinted(true);
                            }}
                          />
                          {ready === w.slug && (
                            <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/85 px-2.5 py-1 text-[11px] text-white">
                              Drag to rotate
                            </span>
                          )}
                        </div>
                      )}
                      {/* A soft pool of shadow on the floor under each work. */}
                      <span
                        aria-hidden
                        className="absolute inset-x-[8%] -bottom-1 h-3 rounded-[50%] bg-black/15 blur-md"
                        style={{ opacity: "calc(0.4 + var(--f,1) * 0.6)" }}
                      />
                      <Link
                        href={`/artworks/${w.slug}`}
                        draggable={false}
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
                          draggable={false}
                          className="absolute max-w-none transition-opacity duration-500"
                          style={{
                            height: `${100 / bh}%`,
                            aspectRatio: "4 / 5",
                            top: `${(-t / bh) * 100}%`,
                            left: `${(-l / bw) * 100}%`,
                            opacity:
                              !s || live ? 0 : "calc(0.45 + var(--f,1) * 0.55)",
                          }}
                        />
                      </Link>
                    </HoverZone>
                    {/* Floor and caption */}
                    <div
                      className="h-px bg-[#bdb7a9]"
                      style={{ width: `calc(100% + ${GAP})` }}
                    />
                    <div
                      className="w-[clamp(84px,9vw,120px)] pt-2 text-center"
                      style={{
                        height: CAPTION_PX,
                        opacity: "calc(0.5 + var(--f,1) * 0.5)",
                      }}
                    >
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

          {/* A first-visit hint, until the visitor first brings up a 3D model. */}
          {!hinted && (
            <p className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3.5 py-1.5 text-[12px] text-ink shadow-[0_6px_20px_-8px_rgba(0,0,0,0.3)]">
              Hover a work to see it in 3D · drag to rotate
            </p>
          )}

          {/* Walk the line a screen at a time. Only the arrow that can still go somewhere shows. */}
          {(
            [
              [-1, "Earlier works", ChevronLeft, "left-2", edges.start],
              [1, "Later works", ChevronRight, "right-2", edges.end],
            ] as const
          ).map(([dir, label, Icon, side, atEdge]) =>
            atEdge ? null : (
              <button
                key={dir}
                type="button"
                aria-label={label}
                onClick={() => step(dir)}
                className={`absolute ${side} top-[40%] z-30 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow-[0_6px_20px_-8px_rgba(0,0,0,0.35)] backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 md:grid`}
              >
                <Icon size={20} />
              </button>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
