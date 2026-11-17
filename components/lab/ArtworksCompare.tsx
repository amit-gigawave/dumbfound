"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sculptures } from "@/lib/sculptures";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import SectionHeader from "@/components/gallery/SectionHeader";
import ArtistFilter, {
  type ArtistOption,
} from "@/components/gallery/ArtistFilter";

export interface LabWork {
  slug: string;
  title: string;
  thumbnail: string;
  year: string;
  material: string;
  dimensions?: string;
  edition?: string;
  artistSlug: string;
  artist: string;
  artistMeta: string;
}

const wrap = "mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)]";
const EASE = "ease-[cubic-bezier(.2,.7,.1,1)]";

const CSS = `
@keyframes p-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.p-in > * { animation: p-in 1s cubic-bezier(.2,.7,.1,1) both; }
.p-in > *:nth-child(2) { animation-delay: .08s } .p-in > *:nth-child(3) { animation-delay: .16s }
.p-in > *:nth-child(4) { animation-delay: .24s } .p-in > *:nth-child(5) { animation-delay: .32s }
.p-in > *:nth-child(n+6) { animation-delay: .4s }
@media (prefers-reduced-motion: reduce) { .p-in > * { animation: none; } }
`;

/* ------------------------------------------------------------------ */
/* Current page, as it is live (real components)                       */
/* ------------------------------------------------------------------ */

const Current = ({ options }: { options: ArtistOption[] }) => (
  <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(48px,7vw,88px)]">
    <span className="label">The collection</span>
    <p className="font-text mb-10 mt-4 max-w-[56ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
      Each work is presented as in a catalogue. Open any piece to read about its
      maker, its material and its story.
    </p>
    <SectionHeader
      title="All artworks"
      as="h1"
      action={
        <nav aria-label="Filter by artist" className="w-full sm:w-auto">
          <ArtistFilter options={options} total={sculptures.length} />
        </nav>
      }
    />
    <div
      data-reveal-stagger
      className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      {sculptures.map((work, i) => (
        <ArtworkTile
          key={work.slug}
          work={work}
          priority={i < 3}
          showcase
          ambient
        />
      ))}
    </div>
  </main>
);

/* ------------------------------------------------------------------ */
/* Premium direction                                                   */
/* ------------------------------------------------------------------ */

/** The work on a warm plate with a soft floor shadow; slow zoom on hover. */
const Plate = ({
  work,
  ratio = "aspect-[4/5]",
  sizes,
  priority,
  dark,
}: {
  work: LabWork;
  ratio?: string;
  sizes: string;
  priority?: boolean;
  dark?: boolean;
}) => (
  <div
    className={`relative isolate overflow-hidden ${ratio} ${
      dark
        ? ""
        : "bg-[radial-gradient(120%_90%_at_50%_30%,#f1eee8_0%,#e7e3da_100%)]"
    }`}
  >
    <span
      aria-hidden
      className={`absolute bottom-[9%] left-1/2 h-[5%] w-[42%] -translate-x-1/2 rounded-[50%] blur-xl ${
        dark ? "bg-black/70" : "bg-[#5a4a35]/25"
      }`}
    />
    <Image
      src={work.thumbnail}
      alt={`${work.title}${work.artist ? ` by ${work.artist}` : ""}`}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-contain p-[9%] transition-transform duration-[1400ms] ${EASE} group-hover:scale-[1.03]`}
    />
  </div>
);

/** Museum caption: ARTIST / Title, year / medium · size · edition. */
const Caption = ({
  work,
  index,
  large,
  dark,
}: {
  work: LabWork;
  index?: number;
  large?: boolean;
  dark?: boolean;
}) => {
  const meta = [
    work.material,
    work.dimensions,
    work.edition && `Edition ${work.edition}`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline gap-3">
        {index !== undefined && (
          <span
            className={`text-[11px] tabular-nums tracking-[0.2em] ${dark ? "text-white/40" : "text-stone/70"}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <span
          className={`text-[11px] uppercase tracking-[0.26em] ${dark ? "text-white/60" : "text-stone"}`}
        >
          {work.artist}
        </span>
      </div>
      <p
        className={`font-text italic leading-[1.2] ${large ? "text-[clamp(26px,2.6vw,38px)]" : "text-[21px]"} ${dark ? "text-white" : "text-ink"}`}
      >
        <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-700 ease-out group-hover:bg-[length:100%_1px]">
          {work.title}
        </span>
        {work.year && (
          <span
            className={`not-italic ${dark ? "text-white/50" : "text-stone"}`}
          >
            , {work.year}
          </span>
        )}
      </p>
      {meta && (
        <p className={`text-[13px] ${dark ? "text-white/50" : "text-stone"}`}>
          {meta}
        </p>
      )}
    </div>
  );
};

/** Type-led filter: "Showing all artists ⌄", menu of names in the serif. */
const TextFilter = ({
  options,
  value,
  onChange,
}: {
  options: ArtistOption[];
  value?: string;
  onChange: (slug?: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.slug === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const row = (label: string, count: number, slug?: string) => (
    <li key={label}>
      <button
        type="button"
        onClick={() => {
          onChange(slug);
          setOpen(false);
        }}
        className={`group/row flex w-full items-baseline justify-between gap-6 py-2.5 text-left transition-colors ${
          value === slug ? "text-ink" : "text-stone hover:text-ink"
        }`}
      >
        <span className="font-text text-[19px]">
          <span
            className={`mr-3 inline-block h-px align-middle transition-[width] duration-500 ${
              value === slug ? "w-5 bg-ink" : "w-0 bg-ink group-hover/row:w-3"
            }`}
          />
          {label}
        </span>
        <span className="text-[11px] tabular-nums tracking-[0.2em]">
          {String(count).padStart(2, "0")}
        </span>
      </button>
    </li>
  );

  return (
    <div ref={root} className="relative">
      <span className="font-text text-[17px] text-stone">Showing </span>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="font-text text-[17px] italic text-ink underline decoration-ink/30 decoration-1 underline-offset-[6px] transition-colors hover:decoration-ink"
      >
        {current ? current.name : "all artists"}
        <span
          aria-hidden
          className={`ml-1.5 inline-block text-[12px] not-italic transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          ⌄
        </span>
      </button>
      <div
        inert={!open}
        className={`absolute right-0 top-[calc(100%+14px)] z-30 w-[320px] max-w-[calc(100vw-40px)] border-t border-ink bg-[#f6f4ef] px-1 pb-3 pt-2 shadow-[0_30px_60px_-40px_rgba(0,0,0,.35)] transition-[opacity,transform] duration-300 ${EASE} ${
          open
            ? "opacity-100"
            : "pointer-events-none -translate-y-1.5 opacity-0"
        }`}
      >
        <ul className="divide-y divide-[#e2ddd3]">
          {row(
            "All artists",
            options.reduce((n, o) => n + o.count, 0),
          )}
          {options.map((o) => row(o.name, o.count, o.slug))}
        </ul>
      </div>
    </div>
  );
};

const Premium = ({
  works,
  options,
}: {
  works: LabWork[];
  options: ArtistOption[];
}) => {
  const [artist, setArtist] = useState<string>();
  const selected = options.find((o) => o.slug === artist);
  const list = artist ? works.filter((w) => w.artistSlug === artist) : works;
  const editorial = !artist && list.length >= 6;
  // The viewing-room work gets its own dark band, so it's left out of the grid.
  const room = works.find((w) => w.slug === "dancing-shiva") ?? works[0];
  const [lead, second, third, ...rest] = editorial
    ? list.filter((w) => w.slug !== room.slug)
    : list;

  const card = (w: LabWork, i: number, sizes: string, cls = "") => (
    <Link
      key={w.slug}
      href={`/artworks/${w.slug}`}
      className={`group grid content-start gap-5 ${cls}`}
    >
      <Plate work={w} sizes={sizes} />
      <Caption work={w} index={i} />
    </Link>
  );

  return (
    <main className="bg-[#f6f4ef] text-ink">
      {/* Masthead */}
      <header className={`${wrap} pb-12 pt-[clamp(72px,11vw,160px)]`}>
        <p className="text-[11px] uppercase tracking-[0.32em] text-stone">
          Sculpted India · The collection
        </p>
        <h1 className="font-display mt-6 text-[clamp(56px,10.5vw,164px)] leading-[0.92] tracking-[-0.015em]">
          {selected ? selected.name : "The Collection"}
        </h1>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-6 border-t border-ink/80 pt-5">
          <p className="font-text max-w-[46ch] text-[17px] leading-[1.7] text-stone">
            {list.length} works{selected ? "" : ` by ${options.length} artists`}
            , each presented as in a museum catalogue.
          </p>
          <TextFilter options={options} value={artist} onChange={setArtist} />
        </div>
      </header>

      <div key={artist ?? "all"} className="p-in">
        {editorial ? (
          <>
            {/* Lead work, at scale */}
            <section className={`${wrap} pb-[clamp(80px,10vw,160px)]`}>
              <Link
                href={`/artworks/${lead.slug}`}
                className="group grid items-end gap-10 lg:grid-cols-12"
              >
                <div className="lg:col-span-8">
                  <Plate
                    work={lead}
                    ratio="aspect-[4/5] lg:aspect-[5/4]"
                    sizes="(min-width:1024px) 66vw, 100vw"
                    priority
                  />
                </div>
                <div className="lg:col-span-4 lg:pb-6">
                  <Caption work={lead} index={0} large />
                  <span className="mt-8 inline-block text-[11px] uppercase tracking-[0.26em] text-ink">
                    View the work <span className="nudge">→</span>
                  </span>
                </div>
              </Link>
            </section>

            {/* An offset pair */}
            <section
              className={`${wrap} grid gap-x-[clamp(32px,6vw,120px)] gap-y-16 pb-[clamp(80px,10vw,160px)] md:grid-cols-2`}
            >
              {card(second, 1, "(min-width:768px) 45vw, 100vw")}
              {card(third, 2, "(min-width:768px) 45vw, 100vw", "md:mt-40")}
            </section>

            {/* A pause */}
            <section className={`${wrap} pb-[clamp(80px,10vw,160px)]`}>
              <p className="font-display mx-auto max-w-[18ch] text-center text-[clamp(32px,4.4vw,64px)] leading-[1.12]">
                Every work has a maker, and a story.
              </p>
            </section>

            {/* Viewing room */}
            <section className="relative overflow-hidden bg-[#0e0d0c] text-white">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(40%_60%_at_32%_42%,rgba(255,240,215,.16),transparent_70%)]"
              />
              <Link
                href={`/artworks/${room.slug}`}
                className={`${wrap} group relative grid items-center gap-10 py-[clamp(72px,9vw,140px)] lg:grid-cols-12`}
              >
                <div className="lg:col-span-7">
                  <Plate
                    work={room}
                    ratio="aspect-square"
                    sizes="(min-width:1024px) 58vw, 100vw"
                    dark
                  />
                </div>
                <div className="lg:col-span-5">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-white/50">
                    Viewing room
                  </p>
                  <div className="mt-6">
                    <Caption work={room} large dark />
                  </div>
                  <p className="font-text mt-6 max-w-[38ch] text-[16px] leading-[1.75] text-white/60">
                    Turn it in the round, then place it in your own room in
                    augmented reality.
                  </p>
                  <span className="mt-10 inline-flex items-center gap-3 border-b border-white/40 pb-1 text-[11px] uppercase tracking-[0.26em] transition-colors group-hover:border-white">
                    Enter the viewing room <span className="nudge">→</span>
                  </span>
                </div>
              </Link>
            </section>

            {/* The rest of the collection */}
            <section className={`${wrap} py-[clamp(80px,10vw,160px)]`}>
              <div className="mb-14 flex items-baseline justify-between border-t border-ink/80 pt-5">
                <h2 className="text-[11px] uppercase tracking-[0.32em]">
                  The full collection
                </h2>
                <span className="text-[11px] tabular-nums tracking-[0.2em] text-stone">
                  {String(rest.length).padStart(2, "0")} works
                </span>
              </div>
              <div className="grid gap-x-[clamp(24px,3.5vw,56px)] gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((w, i) =>
                  card(
                    w,
                    i + 3,
                    "(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw",
                  ),
                )}
              </div>
            </section>
          </>
        ) : (
          <section className={`${wrap} pb-[clamp(80px,10vw,160px)] pt-6`}>
            <div className="grid gap-x-[clamp(24px,3.5vw,56px)] gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((w, i) =>
                card(
                  w,
                  i,
                  "(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw",
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

/* ------------------------------------------------------------------ */

export default function ArtworksCompare({
  works,
  options,
}: {
  works: LabWork[];
  options: ArtistOption[];
}) {
  const [view, setView] = useState<"current" | "premium">("premium");

  const tab = (v: typeof view, label: string) => (
    <button
      type="button"
      aria-pressed={view === v}
      onClick={() => {
        setView(v);
        window.scrollTo({ top: 0 });
      }}
      className={`rounded-full px-5 py-2 text-[12px] uppercase tracking-[0.18em] transition-colors ${
        view === v ? "bg-white text-ink" : "text-white/70 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <style>{CSS}</style>
      {view === "current" ? (
        <Current options={options} />
      ) : (
        <Premium works={works} options={options} />
      )}
      <div className="fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink/90 p-1 shadow-[0_14px_40px_-12px_rgba(0,0,0,.5)] backdrop-blur">
        {tab("current", "Current")}
        {tab("premium", "Premium")}
      </div>
    </>
  );
}
