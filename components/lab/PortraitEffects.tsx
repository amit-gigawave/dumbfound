"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface LabArtist {
  slug: string;
  name: string;
  portrait: string;
  work?: string;
}

const SIZES = "(min-width: 1024px) 200px, 30vw";
const plate =
  "relative isolate aspect-square overflow-hidden rounded-[14px] border border-rule bg-plate";

/* ------------------------------------------------------------------ */
/* Shared SVG filters (bronze duotone)                                 */
/* ------------------------------------------------------------------ */

const Defs = () => (
  <svg width="0" height="0" aria-hidden className="absolute">
    <defs>
      {/* Luminance mapped onto a dark-patina → gold ramp. */}
      <filter id="lab-bronze" colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.09 0.36 0.66 0.95" />
          <feFuncG type="table" tableValues="0.06 0.22 0.47 0.82" />
          <feFuncB type="table" tableValues="0.04 0.11 0.24 0.56" />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
);

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* Keyframes and blend tricks that Tailwind classes can't express. */
const CSS = `
.lab-molten-edge { opacity: 0; bottom: 0; }
.group:hover .lab-molten-edge { animation: lab-molten 1.5s cubic-bezier(.5,0,.3,1) forwards; }
@keyframes lab-molten {
  0% { bottom: 0; opacity: 1; }
  88% { opacity: 1; }
  100% { bottom: 100%; opacity: 0; }
}
.lab-cloth.is-off { animation: lab-unveil 1.7s cubic-bezier(.6,0,.2,1) forwards; animation-delay: var(--d, 0ms); }
@keyframes lab-unveil {
  0% { transform: translateY(0) skewX(0); }
  22% { transform: translateY(5%) skewX(-1.5deg); }
  100% { transform: translateY(-112%) skewX(5deg); }
}
.lab-unveiled img { transition: transform 2.2s cubic-bezier(.2,.7,.2,1); transform: scale(1.08); }
.lab-unveiled.is-off img { transform: scale(1); }
.lab-halftone { filter: contrast(22) grayscale(1); background: #fff; }
.lab-halftone .lab-ink { filter: grayscale(1) blur(0.6px) brightness(1.55) contrast(.8); }
.lab-halftone::after {
  content: ""; position: absolute; inset: 0; mix-blend-mode: multiply; pointer-events: none;
  background: repeating-linear-gradient(-45deg, #fff 0, #000 2.2px, #fff 4.4px);
  opacity: .5;
}
`;

/* ------------------------------------------------------------------ */
/* 0. Current (as on the site today)                                   */
/* ------------------------------------------------------------------ */

const Current = ({ a }: { a: LabArtist }) => (
  <div className={`${plate} group`}>
    <Image
      src={a.portrait}
      alt={a.name}
      fill
      sizes={SIZES}
      className="object-cover grayscale-[0.6] transition-[transform,filter] duration-[2200ms] ease-[cubic-bezier(0.45,0,0.2,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
    />
  </div>
);

/* ------------------------------------------------------------------ */
/* 1. Bronze cast + molten reveal                                      */
/* ------------------------------------------------------------------ */

const Bronze = ({ a }: { a: LabArtist }) => (
  <div className={`${plate} group`}>
    <Image
      src={a.portrait}
      alt={a.name}
      fill
      sizes={SIZES}
      className="object-cover"
      style={{ filter: "url(#lab-bronze)" }}
    />
    {/* True colour rises from the base like metal filling a mould. */}
    <Image
      src={a.portrait}
      alt=""
      fill
      sizes={SIZES}
      className="object-cover [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-[1500ms] ease-[cubic-bezier(.5,0,.3,1)] group-hover:[clip-path:inset(0_0_0_0)]"
    />
    <span
      aria-hidden
      className="lab-molten-edge absolute inset-x-0 h-[3px] bg-gradient-to-r from-[#ff8a1f] via-[#ffd27a] to-[#ff8a1f] shadow-[0_0_14px_4px_rgba(255,140,40,.65)]"
    />
  </div>
);

/* ------------------------------------------------------------------ */
/* 2. Raking light relief — light follows the cursor                   */
/* ------------------------------------------------------------------ */

const Relief = ({ a, id }: { a: LabArtist; id: string }) => {
  const light = useRef<SVGFEDistantLightElement>(null);
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const az = (Math.atan2(dy, dx) * 180) / Math.PI;
    const dist = Math.min(1, Math.hypot(dx, dy) / (r.width / 2));
    light.current?.setAttribute("azimuth", az.toFixed(1));
    light.current?.setAttribute("elevation", (60 - dist * 42).toFixed(1));
  };
  const reset = () => {
    light.current?.setAttribute("azimuth", "225");
    light.current?.setAttribute("elevation", "38");
  };
  return (
    <div className={plate} onPointerMove={move} onPointerLeave={reset}>
      <svg width="0" height="0" aria-hidden className="absolute">
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="luminanceToAlpha" in="SourceGraphic" result="bump0" />
          <feGaussianBlur in="bump0" stdDeviation="1.4" result="bump" />
          <feDiffuseLighting in="bump" surfaceScale="5" diffuseConstant="1.15" lightingColor="#ece3d6" result="lit">
            <feDistantLight ref={light} azimuth="225" elevation="38" />
          </feDiffuseLighting>
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
            result="grey"
          />
          <feComposite in="lit" in2="grey" operator="arithmetic" k1="0.55" k2="0.55" k3="0.2" k4="-0.05" />
        </filter>
      </svg>
      <Image
        src={a.portrait}
        alt={a.name}
        fill
        sizes={SIZES}
        className="object-cover"
        style={{ filter: `url(#${id})` }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 3. The maker and the work                                           */
/* ------------------------------------------------------------------ */

const MakerWork = ({ a }: { a: LabArtist }) => (
  <div className={`${plate} group`}>
    {a.work ? (
      <Image
        src={a.work}
        alt=""
        fill
        sizes={SIZES}
        className="scale-95 object-contain p-[10%] opacity-0 transition-[opacity,transform] duration-[1600ms] ease-[cubic-bezier(.45,0,.2,1)] group-hover:scale-100 group-hover:opacity-100"
      />
    ) : (
      <span className="absolute inset-0 grid place-items-center p-4 text-center text-[11px] uppercase tracking-[0.14em] text-stone opacity-0 transition-opacity duration-700 group-hover:opacity-100">
        No work in the catalogue yet
      </span>
    )}
    <Image
      src={a.portrait}
      alt={a.name}
      fill
      sizes={SIZES}
      className="object-cover grayscale-[0.5] transition-[opacity,transform,filter] duration-[1600ms] ease-[cubic-bezier(.45,0,.2,1)] group-hover:scale-[1.06] group-hover:opacity-0 group-hover:blur-[3px]"
    />
  </div>
);

/* ------------------------------------------------------------------ */
/* 4. The unveiling — a cloth slides off as it scrolls into view       */
/* ------------------------------------------------------------------ */

const Unveil = ({ a, i, run }: { a: LabArtist; i: number; run: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [off, setOff] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOff(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [run]);
  const cls = off ? "is-off" : "";
  return (
    <div ref={ref} className={`${plate} lab-unveiled ${cls}`}>
      <Image src={a.portrait} alt={a.name} fill sizes={SIZES} className="object-cover" />
      <div
        aria-hidden
        className={`lab-cloth ${cls} absolute -inset-x-2 -inset-y-1 origin-top`}
        style={
          {
            "--d": `${i * 160}ms`,
            background:
              "linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.35)), repeating-linear-gradient(90deg, #5b1e1e 0px, #7a2a26 14px, #4a1616 28px, #6c2420 40px)",
            boxShadow: "inset 0 -18px 30px rgba(0,0,0,.45)",
          } as React.CSSProperties
        }
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Plaster cast — matte grain that clears on hover                  */
/* ------------------------------------------------------------------ */

const Plaster = ({ a }: { a: LabArtist }) => (
  <div className={`${plate} group`}>
    <Image
      src={a.portrait}
      alt={a.name}
      fill
      sizes={SIZES}
      className="object-cover [filter:grayscale(1)_sepia(.18)_contrast(.88)_brightness(1.1)] transition-[filter] duration-[1400ms] group-hover:[filter:none]"
    />
    <span
      aria-hidden
      className="absolute inset-0 opacity-60 mix-blend-multiply transition-opacity duration-[1400ms] group-hover:opacity-0"
      style={{ backgroundImage: GRAIN }}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/* 6. Catalogue engraving — line print, photo on hover                 */
/* ------------------------------------------------------------------ */

const Engraving = ({ a }: { a: LabArtist }) => (
  <div className={`${plate} group`}>
    <div className="lab-halftone absolute inset-0">
      <Image src={a.portrait} alt={a.name} fill sizes={SIZES} className="lab-ink object-cover" />
    </div>
    <Image
      src={a.portrait}
      alt=""
      fill
      sizes={SIZES}
      className="object-cover opacity-0 transition-opacity duration-[1200ms] group-hover:opacity-100"
    />
  </div>
);

/* ------------------------------------------------------------------ */
/* 7. Gallery spotlight — a pool of light follows the cursor           */
/* ------------------------------------------------------------------ */

const Spotlight = ({ a }: { a: LabArtist }) => {
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  const mask =
    "radial-gradient(circle 85px at var(--x, 50%) var(--y, 40%), #000 35%, transparent 100%)";
  return (
    <div className={`${plate} group bg-[#111]`} onPointerMove={move}>
      <Image
        src={a.portrait}
        alt={a.name}
        fill
        sizes={SIZES}
        className="object-cover [filter:grayscale(.7)_brightness(.32)]"
      />
      <Image
        src={a.portrait}
        alt=""
        fill
        sizes={SIZES}
        className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */

const ROWS: {
  title: string;
  note: string;
  pick?: boolean;
  render: (a: LabArtist, i: number, run: number) => React.ReactNode;
}[] = [
  {
    title: "0 · Current",
    note: "What the site does today: 60% grey, colour and slow zoom on hover.",
    render: (a) => <Current a={a} />,
  },
  {
    title: "1 · Bronze cast",
    note: "Every portrait cast in one bronze tone; on hover, colour rises from the base like molten metal.",
    pick: true,
    render: (a) => <Bronze a={a} />,
  },
  {
    title: "2 · Raking light relief",
    note: "Read as a stone relief; move the cursor across it and the light moves with you.",
    render: (a, i) => <Relief a={a} id={`lab-relief-${i}`} />,
  },
  {
    title: "3 · The maker and the work",
    note: "On hover the portrait dissolves into one of the artist's works in the catalogue.",
    pick: true,
    render: (a) => <MakerWork a={a} />,
  },
  {
    title: "4 · The unveiling",
    note: "A cloth slides off as each portrait scrolls into view — once per visit.",
    render: (a, i, run) => <Unveil key={`${a.slug}-${run}`} a={a} i={i} run={run} />,
  },
  {
    title: "5 · Plaster cast",
    note: "Matte, grainy plaster tone; the grain clears to the photo on hover.",
    render: (a) => <Plaster a={a} />,
  },
  {
    title: "6 · Catalogue engraving",
    note: "Line-engraved like an old exhibition catalogue; the photo appears on hover.",
    render: (a) => <Engraving a={a} />,
  },
  {
    title: "7 · Gallery spotlight",
    note: "Dim tile; a soft pool of light follows the cursor, like a work in a dark room.",
    render: (a) => <Spotlight a={a} />,
  },
];

export default function PortraitEffects({ artists }: { artists: LabArtist[] }) {
  const [run, setRun] = useState(0);
  return (
    <div className="mt-12 grid gap-14">
      <style>{CSS}</style>
      <Defs />
      {ROWS.map((row) => (
        <section key={row.title} className="grid gap-4 border-t border-rule pt-6">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="font-display text-[22px] tracking-[0.03em]">{row.title}</h2>
            {row.pick && (
              <span className="label rounded-full border border-accent/40 px-2 py-0.5">
                Recommended
              </span>
            )}
            {row.title.startsWith("4") && (
              <button
                type="button"
                onClick={() => setRun((r) => r + 1)}
                className="text-link text-[11px] uppercase tracking-[0.16em]"
              >
                Replay
              </button>
            )}
            <p className="basis-full text-sm text-stone">{row.note}</p>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {artists.map((a, i) => (
              <figure key={a.slug} className="grid gap-2">
                {row.render(a, i, run)}
                <figcaption className="text-[13px] text-stone">{a.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
