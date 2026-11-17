"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import type { ConceptWork } from "./types";
import { mix, useImageStats } from "./imageStats";
import { FIT_CARD } from "../../three/modelLoader";

const SculptureScene = dynamic(() => import("../../SculptureScene"), {
  ssr: false,
});

/**
 * The work on screen as a live 3D model you can turn by dragging. It exists
 * only while its panel is the current one: scroll on and it unmounts, and the
 * still image takes over again. Framed like the thumbnail (FIT_CARD), so the
 * hand-over from image to model doesn't jump.
 */
function Live({
  work,
  onReady,
  onGone,
}: {
  work: ConceptWork;
  onReady: () => void;
  onGone: () => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => onGone, [onGone]);
  return (
    <div
      className={`absolute inset-0 cursor-grab transition-opacity duration-500 active:cursor-grabbing ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      <SculptureScene
        url={work.modelUrl!}
        interactive
        rotateOnly
        fit={FIT_CARD}
        adaptiveBackground={false}
        reveal={false}
        facing={work.facing}
        look={work.look}
        onReady={() => {
          setReady(true);
          onReady();
        }}
      />
      {ready && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-[12px] text-[var(--deep)] opacity-60">
          Drag to turn
        </p>
      )}
    </div>
  );
}

const WHITE: [number, number, number] = [255, 255, 255];
const INK: [number, number, number] = [24, 22, 20];

/**
 * sessionStorage key: the work on screen. Kept up to date as the visitor moves,
 * so coming back to Spotlight (from another view, or Back from a work's page)
 * lands on the same work for the rest of the browser session.
 */
const PLACE_KEY = "spotlight:at";

/**
 * A text line that trails the scroll by `px` and fades faster the further it
 * is from place. `side` (1 = the text is on the right, -1 = on the left) also
 * slides it in from its own edge of the screen.
 */
const rise = (
  px: number,
  fade: number,
  side: 1 | -1 = 1,
): React.CSSProperties => ({
  transform: `translate3d(calc(var(--p,0)*var(--p,0)*${side * px * 0.9}px),calc(var(--p,0)*${px}px),0)`,
  opacity: `calc(1 - var(--p,0)*var(--p,0)*${fade})`,
});

/**
 * One work per screen. The room takes its tint from the work itself (the
 * average colour of its paint or bronze), and the tint changes as you move
 * from work to work. Scroll snaps a work at a time; the rail jumps anywhere.
 */
export default function Spotlight({
  works: allWorks,
  offset = 85,
}: {
  works: ConceptWork[];
  /** Pixels of page above the gallery (the site header, plus any bar of the page's own). */
  offset?: number;
}) {
  const stats = useImageStats(allWorks.map((w) => w.thumbnail));
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState<string | null>(null);
  // Slug of the work whose live model has drawn (its image steps aside).
  const [liveReady, setLiveReady] = useState<string | null>(null);
  const onGone = useCallback(() => setLiveReady(null), []);
  // The rail icon being hovered, and where (inside the room) its large preview sits.
  const [preview, setPreview] = useState<{ i: number; y: number } | null>(null);
  const room$ = useRef<HTMLDivElement>(null);
  const showPreview = (i: number, btn: HTMLElement) => {
    const box = room$.current?.getBoundingClientRect();
    if (!box) return;
    const r = btn.getBoundingClientRect();
    // Centred on the icon, kept clear of the top and bottom edges of the room.
    const half = 235;
    const y = Math.min(
      Math.max(r.top + r.height / 2 - box.top, half + 8),
      box.height - half - 8,
    );
    setPreview({ i, y });
  };
  const scroller = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);

  // Filters: the artist and 3D chips, then the search words (title or artist).
  const works = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return allWorks.filter(
      (w) =>
        (!artist || w.artistSlug === artist) &&
        words.every((x) => `${w.title} ${w.artist}`.toLowerCase().includes(x)),
    );
  }, [allWorks, query, artist]);

  // Artists in catalogue order, with how many works each has.
  const artists = useMemo(() => {
    const m = new Map<string, { slug: string; name: string; n: number }>();
    for (const w of allWorks) {
      const a = m.get(w.artistSlug) ?? {
        slug: w.artistSlug,
        name: w.artist,
        n: 0,
      };
      a.n++;
      m.set(w.artistSlug, a);
    }
    return [...m.values()];
  }, [allWorks]);
  const filtered = Boolean(query || artist);

  // A new filter starts again from the first match.
  const restart = () => {
    setActive(0);
    scroller.current?.scrollTo({ top: 0 });
  };
  const clear = () => {
    setQuery("");
    setArtist(null);
    restart();
  };

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    panels.current = panels.current.slice(0, works.length);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { root, threshold: 0.6 },
    );
    panels.current.forEach((p) => p && io.observe(p));

    // Scroll-linked motion: each panel gets --p, its distance from the centre
    // of the view in screens (0 = in place, +1 = a screen below, -1 = above).
    // The figure and the text lines read it at different rates, so they slide
    // at different speeds and settle one after another.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = root.clientHeight || 1;
      const top = root.scrollTop;
      panels.current.forEach((el) => {
        if (!el) return;
        const p = still ? 0 : (el.offsetTop - top) / h;
        el.style.setProperty(
          "--p",
          Math.max(-1.2, Math.min(1.2, p)).toFixed(4),
        );
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [works]);

  // On arrival, go back to the work the visitor was last on (see PLACE_KEY).
  const placed = useRef(false);
  useEffect(() => {
    let slug: string | null = null;
    try {
      slug = sessionStorage.getItem(PLACE_KEY);
    } catch {}
    const i = slug ? works.findIndex((w) => w.slug === slug) : -1;
    const panel = i > 0 ? panels.current[i] : null;
    if (panel && scroller.current) {
      scroller.current.scrollTo({ top: panel.offsetTop, behavior: "instant" });
      setActive(i);
    }
    placed.current = true;
    // Once, on arrival: later filter changes restart at the top on their own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remember the work on screen as the visitor moves (only after the arrival
  // above has read the old one).
  const here = works[active]?.slug;
  useEffect(() => {
    if (!placed.current || !here) return;
    try {
      sessionStorage.setItem(PLACE_KEY, here);
    } catch {}
  }, [here]);

  const go = (i: number) =>
    panels.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Up / Down (and Page Up / Down) step between works from anywhere on the
  // page, except while typing in the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      if (e.target === scroller.current) return; // the gallery scrolls itself
      const d =
        e.key === "ArrowDown" || e.key === "PageDown"
          ? 1
          : e.key === "ArrowUp" || e.key === "PageUp"
            ? -1
            : 0;
      const next = active + d;
      if (!d || next < 0 || next >= works.length) return;
      e.preventDefault();
      panels.current[next]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, works.length]);

  // The room takes the work's signature (painted) colour; bronzes and stone,
  // which have none, get a warm tint of their own average colour.
  const s = stats[works[active]?.thumbnail];
  const tone = s?.accent ?? s?.rgb;
  const room = tone ? mix(tone, WHITE, s?.accent ? 0.6 : 0.74) : "#efede8";
  const glow = tone ? mix(tone, WHITE, 0.35) : "#dcd8cf";
  const deep = tone ? mix(tone, INK, 0.78) : "#2a2724";

  return (
    <div
      ref={room$}
      className="relative transition-[background-color] duration-[900ms] ease-out motion-reduce:transition-none"
      style={{
        backgroundColor: room,
        ["--deep" as string]: deep,
        ["--room-h" as string]: `calc(100svh - ${offset}px)`,
      }}
    >
      {/* Find a work: search, 3D, and one artist at a time. */}
      <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-2 px-[clamp(16px,5vw,72px)] pt-3 text-[var(--deep)] md:pr-[clamp(96px,10vw,160px)]">
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              restart();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") (e.target as HTMLInputElement).blur();
            }}
            placeholder="Find a work or artist"
            aria-label="Find a work or artist"
            className="w-full max-w-[18rem] rounded-full border border-[var(--deep)]/25 bg-white/60 px-4 py-1.5 text-[14px] outline-none placeholder:text-[var(--deep)]/55 focus-visible:border-[var(--deep)]"
          />
          <p className="text-[13px] tabular-nums" aria-live="polite">
            {filtered
              ? `${works.length} of ${allWorks.length}`
              : `${allWorks.length} works`}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={clear}
              className="text-[13px] underline underline-offset-4 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Clear
            </button>
          )}
        </div>
        <div
          role="group"
          aria-label="Filter works"
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
        >
          {[
            ...artists.map((a) => ({
              key: a.slug,
              label: a.name,
              n: a.n,
              on: artist === a.slug,
              toggle: () =>
                setArtist((cur) => (cur === a.slug ? null : a.slug)),
            })),
          ].map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={c.on}
              onClick={() => {
                c.toggle();
                restart();
              }}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                c.on
                  ? "border-[var(--deep)] bg-[var(--deep)] text-white"
                  : "border-[var(--deep)]/25 bg-white/40 hover:bg-white/70"
              }`}
            >
              {c.label} <span className="opacity-60">{c.n}</span>
            </button>
          ))}
        </div>
      </div>

      {works.length === 0 && (
        <div className="absolute inset-0 z-10 grid place-items-center px-6 text-center text-[var(--deep)]">
          <div>
            <p className="font-display text-[clamp(26px,3.4vw,44px)]">
              No work matches.
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-4 border-b border-current pb-0.5 text-[14px] hover:opacity-70"
            >
              Clear the filters
            </button>
          </div>
        </div>
      )}

      <div
        ref={scroller}
        tabIndex={0}
        aria-label="Works, one at a time. Scroll or use the arrow keys."
        className="h-[var(--room-h)] snap-y snap-mandatory overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--deep)] [scrollbar-width:none]"
      >
        {works.map((w, i) => {
          // Slides alternate: the model on the left and the text on the right, then the other way round.
          const flip = i % 2 === 1;
          const side = flip ? -1 : 1;
          return (
            <section
              key={w.slug}
              ref={(el) => {
                panels.current[i] = el;
              }}
              data-i={i}
              className={`relative grid h-[var(--room-h)] snap-start grid-rows-[1fr_auto] gap-4 px-[clamp(16px,5vw,72px)] pb-[clamp(72px,9vh,104px)] pt-[104px] md:grid-rows-1 md:items-center md:gap-[clamp(24px,5vw,80px)] md:pr-[clamp(96px,10vw,160px)] ${
                flip
                  ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
                  : "md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
              }`}
            >
              <div
                className={`relative h-full min-h-0 ${flip ? "md:order-2" : ""}`}
              >
                {/* A pool of the work's own colour under it, like light off a plinth. */}
                <div
                  aria-hidden
                  className="absolute inset-x-[14%] bottom-[2%] h-[16%] rounded-[50%] blur-2xl transition-[background-color] duration-[900ms] motion-reduce:transition-none"
                  style={{
                    backgroundColor: i === active ? glow : "transparent",
                  }}
                />
                {/* The still image, and over it, for the current work only, the live model. */}
                <div
                  className="absolute inset-0 will-change-transform"
                  style={{
                    transform:
                      "translate3d(0,calc(var(--p,0)*-9%),0) scale(calc(1 - var(--p,0)*var(--p,0)*0.12))",
                    opacity: "calc(1 - var(--p,0)*var(--p,0)*1.1)",
                  }}
                >
                  <Image
                    unoptimized
                    src={w.thumbnail}
                    alt={w.title}
                    fill
                    priority={i < 2}
                    sizes="(min-width: 768px) 55vw, 100vw"
                    className={`object-contain object-bottom drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)] transition-opacity duration-500 ${
                      i === active && liveReady === w.slug
                        ? "opacity-0"
                        : "opacity-100"
                    }`}
                  />
                  {i === active && w.modelUrl && (
                    <Live
                      key={w.slug}
                      work={w}
                      onReady={() => setLiveReady(w.slug)}
                      onGone={onGone}
                    />
                  )}
                </div>
              </div>
              <div
                className={`max-w-[34rem] text-[var(--deep)] ${flip ? "md:order-1 md:justify-self-end" : ""}`}
              >
                <p
                  className="text-[12px] tabular-nums tracking-[0.22em] opacity-60"
                  style={rise(24, 1.6, side)}
                >
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(works.length).padStart(2, "0")}
                </p>
                <p
                  className="font-text mt-3 text-[clamp(15px,1.5vw,19px)] italic"
                  style={rise(36, 1.6, side)}
                >
                  {w.artist}
                </p>
                <h2
                  className="font-display mt-2 text-[clamp(34px,5.4vw,84px)] leading-[0.98] [text-wrap:balance]"
                  style={rise(70, 1.5, side)}
                >
                  {w.title}
                </h2>
                {(w.year || w.material || w.dimensions || w.heightCm) && (
                  <dl
                    className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-[var(--deep)]/15 pt-4 text-[14px]"
                    style={rise(110, 1.8, side)}
                  >
                    {w.year && (
                      <>
                        <dt className="opacity-60">Year</dt>
                        <dd>{w.year}</dd>
                      </>
                    )}
                    {w.material && (
                      <>
                        <dt className="opacity-60">Medium</dt>
                        <dd>{w.material}</dd>
                      </>
                    )}
                    {w.dimensions && (
                      <>
                        <dt className="opacity-60">Size</dt>
                        <dd>{w.dimensions}</dd>
                      </>
                    )}
                    {!w.dimensions && w.heightCm && (
                      <>
                        <dt className="opacity-60">Height</dt>
                        <dd>{w.heightCm} cm</dd>
                      </>
                    )}
                  </dl>
                )}
                <Link
                  href={`/artworks/${w.slug}`}
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[var(--deep)] py-1.5 pl-5 pr-1.5 text-[14px] text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.55)] transition-[gap,box-shadow] duration-300 hover:gap-4 hover:shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--deep)]"
                  style={rise(150, 2, side)}
                >
                  Open this work
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:bg-white/25">
                    <ArrowRight size={16} aria-hidden />
                  </span>
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      {/* Rail: every work as a small figure; the current one stands out. */}
      <nav
        aria-label="Jump to a work"
        className="absolute right-[clamp(12px,2vw,28px)] top-1/2 hidden max-h-[80%] -translate-y-1/2 flex-col gap-1 overflow-y-auto py-2 [scrollbar-width:none] md:flex"
      >
        {works.map((w, i) => (
          <button
            key={w.slug}
            type="button"
            onClick={() => go(i)}
            onMouseEnter={(e) => showPreview(i, e.currentTarget)}
            onFocus={(e) => showPreview(i, e.currentTarget)}
            onMouseLeave={() => setPreview(null)}
            onBlur={() => setPreview(null)}
            aria-label={w.title}
            aria-current={i === active}
            className={`relative h-11 w-9 shrink-0 rounded-[4px] transition-[opacity,transform] duration-300 focus-visible:outline-2 focus-visible:outline-[var(--deep)] ${
              i === active
                ? "scale-110 opacity-100"
                : "opacity-35 hover:opacity-80"
            }`}
          >
            <Image
              unoptimized
              src={w.thumbnail}
              alt=""
              fill
              sizes="36px"
              className="object-contain"
            />
          </button>
        ))}
      </nav>

      {/* Hovering a rail icon: the work shown large beside the rail. */}
      {preview && works[preview.i] && (
        <figure
          aria-hidden
          className="pointer-events-none absolute right-[calc(clamp(12px,2vw,28px)+56px)] z-30 hidden w-[clamp(220px,22vw,320px)] -translate-y-1/2 rounded-[14px] bg-white/95 p-3 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)] md:block"
          style={{ top: preview.y }}
        >
          <div className="relative aspect-[4/5]">
            <Image
              unoptimized
              src={works[preview.i].thumbnail}
              alt=""
              fill
              sizes="320px"
              className="object-contain"
            />
          </div>
          <figcaption className="mt-2 text-[13px] leading-snug text-ink">
            {works[preview.i].title}
            <span className="block text-[12px] text-stone">
              {works[preview.i].artist}
            </span>
          </figcaption>
        </figure>
      )}

      {/* Step through the works one at a time, with how far along you are. */}
      {works.length > 0 && (
        <div className="absolute bottom-[clamp(16px,3vh,28px)] left-[clamp(16px,5vw,72px)] flex items-center gap-3 text-[13px] tabular-nums text-[var(--deep)]">
          <div className="flex gap-1">
            {(
              [
                [-1, "Previous work", ChevronUp],
                [1, "Next work", ChevronDown],
              ] as const
            ).map(([d, label, Icon]) => (
              <button
                key={d}
                type="button"
                aria-label={label}
                disabled={d < 0 ? active === 0 : active === works.length - 1}
                onClick={() => go(active + d)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--deep)]/25 bg-white/40 transition-colors hover:bg-white/80 disabled:opacity-30 disabled:hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--deep)]"
              >
                <Icon size={16} aria-hidden />
              </button>
            ))}
          </div>
          <span>
            {active + 1} of {works.length}
          </span>
          <span
            aria-hidden
            className="relative hidden h-[2px] w-24 overflow-hidden rounded-full bg-[var(--deep)]/15 sm:block"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--deep)] transition-[width] duration-500"
              style={{ width: `${((active + 1) / works.length) * 100}%` }}
            />
          </span>
        </div>
      )}
    </div>
  );
}
