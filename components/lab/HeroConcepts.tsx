"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";

interface Props {
  names: string[];
  media: string[];
  counts: { artists: number; works: number };
}

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";
const SUB =
  "A gallery of artists and their works, established names and new voices, across every medium, each presented with the care of a museum catalogue.";

const CSS = `
@keyframes h-rise { from { transform: translateY(105%); } to { transform: none; } }
@keyframes h-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes h-marquee { to { transform: translateX(-50%); } }
@keyframes h-marquee-r { from { transform: translateX(-50%); } to { transform: none; } }
.h-line { display: block; overflow: hidden; padding-bottom: .06em; }
.h-line > span { display: block; animation: h-rise 1.1s cubic-bezier(.2,.7,.1,1) both; }
.h-fade { animation: h-fade .9s ease both; }
.h-outline { color: transparent; -webkit-text-stroke: 1px #111; }
.h-outline-light { color: transparent; -webkit-text-stroke: 1px rgba(17,17,17,.14); }
/* Mixes: a roomier mask so lifted letters and the underline aren't clipped. */
@keyframes h-rise2 { from { transform: translateY(140%); } to { transform: none; } }
@keyframes h-ink { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes h-draw { to { stroke-dashoffset: 0; } }
.h-line2 { display: block; overflow: hidden; padding: .16em 0 .22em; margin: -.16em 0 -.22em; }
.h-line2 > span { display: block; animation: h-rise2 1.1s cubic-bezier(.2,.7,.1,1) both; }
@media (prefers-reduced-motion: reduce) {
  .h-line > span, .h-line2 > span, .h-fade { animation: none; }
  .h-mq { animation: none !important; }
  .h-ink { animation: none !important; clip-path: none !important; }
  .h-underline { animation: none !important; stroke-dashoffset: 0 !important; }
}
`;

const Concept = ({
  n,
  title,
  note,
  children,
  onReplay,
}: {
  n: number | string;
  title: string;
  note: string;
  children: React.ReactNode;
  onReplay?: () => void;
}) => (
  <section className="relative border-b border-rule">
    <div
      className={`${wrap} flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-6 text-[12px] text-stone`}
    >
      <span className="rounded-full border border-accent/50 px-2.5 py-0.5 uppercase tracking-[0.16em] text-accent">
        {typeof n === "number" ? `Hero ${n}` : n}
      </span>
      <span className="font-medium uppercase tracking-[0.14em]">{title}</span>
      <span>— {note}</span>
      {onReplay && (
        <button type="button" onClick={onReplay} className="text-link ml-auto">
          Replay
        </button>
      )}
    </div>
    {children}
  </section>
);

const Ctas = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="h-fade mt-10 flex flex-wrap items-center gap-8"
    style={{ animationDelay: `${delay}ms` }}
  >
    <Link href="/artworks" className="btn">
      View the artworks <span className="nudge">→</span>
    </Link>
    <Link href="/artists" className="text-link">
      Meet the artists <span className="nudge">→</span>
    </Link>
  </div>
);

/* 1 · Line-by-line rise ------------------------------------------------ */
const LineRise = () => {
  const [k, setK] = useState(0);
  const lines = ["Art, and", "the hands", "that made it."];
  return (
    <Concept
      n={1}
      title="Line rise"
      note="each line slides up out of a mask, one after another; quiet and confident."
      onReplay={() => setK(k + 1)}
    >
      <div key={k} className={`${wrap} pb-24 pt-16`}>
        <span className="label h-fade">Contemporary art</span>
        <h1 className="heading-caps mt-6 text-[clamp(48px,9vw,128px)] leading-[0.98] tracking-[0.02em]">
          {lines.map((l, i) => (
            <span key={l} className="h-line">
              <span style={{ animationDelay: `${150 + i * 140}ms` }}>{l}</span>
            </span>
          ))}
        </h1>
        <p
          className="h-fade font-text mt-8 max-w-[50ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone"
          style={{ animationDelay: "750ms" }}
        >
          {SUB}
        </p>
        <Ctas delay={900} />
      </div>
    </Concept>
  );
};

/* 2 · Rotating verb ---------------------------------------------------- */
const VERBS = ["made", "carved", "cast", "painted", "shaped", "drew"];
const RotatingVerb = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % VERBS.length), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <Concept
      n={2}
      title="Rotating verb"
      note="the verb rolls through how the works came to be — made, carved, cast, painted… (draft word list)."
    >
      <div className={`${wrap} pb-24 pt-16`}>
        <span className="label">Contemporary art</span>
        <h1 className="heading-caps mt-6 text-[clamp(40px,7vw,96px)] leading-[1.05] tracking-[0.03em]">
          Art, and the hands
          <br />
          that{" "}
          <span className="relative inline-flex h-[1.05em] overflow-hidden align-bottom text-accent">
            <span
              className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)]"
              style={{ transform: `translateY(-${i * 1.05}em)` }}
            >
              {VERBS.map((v) => (
                <span key={v} className="h-[1.05em] leading-[1.05]">
                  {v}
                </span>
              ))}
            </span>
          </span>{" "}
          it.
        </h1>
        <p className="font-text mt-8 max-w-[50ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
          {SUB}
        </p>
        <Ctas />
      </div>
    </Concept>
  );
};

/* 3 · Outline that fills ----------------------------------------------- */
const OutlineFill = () => (
  <Concept
    n={3}
    title="Outline → ink"
    note="huge outlined letters; hover the headline and ink floods in from the left."
  >
    <div className={`${wrap} pb-24 pt-16`}>
      <span className="label">Contemporary art</span>
      <h1 className="group mt-6 cursor-default">
        {["Art, and the", "hands that", "made it."].map((l) => (
          <span
            key={l}
            className="relative block heading-caps text-[clamp(44px,8.4vw,120px)] leading-[1] tracking-[0.02em]"
          >
            <span className="h-outline">{l}</span>
            <span
              aria-hidden
              className="absolute inset-0 text-ink transition-[clip-path] duration-[1100ms] ease-[cubic-bezier(.7,0,.2,1)] [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)]"
            >
              {l}
            </span>
          </span>
        ))}
      </h1>
      <p className="font-text mt-8 max-w-[50ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
        {SUB}
      </p>
      <Ctas />
    </div>
  </Concept>
);

/* 4 · Editorial grid --------------------------------------------------- */
const Editorial = ({ counts, media }: Pick<Props, "counts" | "media">) => (
  <Concept
    n={4}
    title="Editorial grid"
    note="a magazine-cover layout: index number, rules, small caps and a column of facts from the catalogue."
  >
    <div className={`${wrap} grid gap-10 pb-24 pt-14 md:grid-cols-[1fr_260px]`}>
      <div>
        <div className="flex items-baseline gap-5 border-b border-ink pb-3 text-[11px] uppercase tracking-[0.22em]">
          <span className="font-display text-[40px] leading-none tracking-normal">
            01
          </span>
          <span>Contemporary Indian art</span>
          <span className="ml-auto text-stone">Sculpted India</span>
        </div>
        <h1 className="mt-8 text-[clamp(44px,8vw,116px)] leading-[0.95]">
          <span className="heading-caps block tracking-[0.02em]">Art,</span>
          <span className="font-text block pl-[12%] italic tracking-[-0.01em] text-accent">
            and the hands
          </span>
          <span className="heading-caps block text-right tracking-[0.02em]">
            that made it.
          </span>
        </h1>
      </div>
      <aside className="grid content-end gap-6 border-l border-rule pl-6 text-[13px]">
        <div>
          <p className="font-display text-[44px] leading-none">
            {counts.artists}
          </p>
          <p className="label mt-1">Artists</p>
        </div>
        <div>
          <p className="font-display text-[44px] leading-none">
            {counts.works}
          </p>
          <p className="label mt-1">Works in 3D</p>
        </div>
        <p className="font-text italic leading-relaxed text-stone">
          {media.join(" · ")}
        </p>
        <Link href="/artworks" className="btn justify-center">
          View the artworks <span className="nudge">→</span>
        </Link>
      </aside>
    </div>
  </Concept>
);

/* 5 · Caps with an italic heart ---------------------------------------- */
const ItalicAccent = () => (
  <Concept
    n={5}
    title="Italic accent"
    note="museum wall-text capitals with one word set in red Lora italic, underlined by a hand-drawn stroke."
  >
    <div className={`${wrap} pb-24 pt-20 text-center`}>
      <span className="label">Contemporary art</span>
      <h1 className="heading-caps mx-auto mt-7 max-w-[16ch] text-[clamp(40px,7vw,100px)] leading-[1.06] tracking-[0.04em]">
        Art, and the{" "}
        <span className="relative inline-block font-text normal-case italic tracking-[-0.01em] text-accent">
          hands
          <svg
            viewBox="0 0 200 20"
            preserveAspectRatio="none"
            aria-hidden
            className="absolute -bottom-[0.12em] left-0 h-[0.22em] w-full"
          >
            <path
              d="M3 14 C 50 4, 120 4, 197 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength={1}
              className="[stroke-dasharray:1] [stroke-dashoffset:1] [animation:h-draw_1.2s_.4s_cubic-bezier(.6,0,.2,1)_forwards]"
            />
          </svg>
        </span>{" "}
        that made it.
      </h1>
      <style>{`@keyframes h-draw { to { stroke-dashoffset: 0; } }`}</style>
      <p className="font-text mx-auto mt-8 max-w-[50ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
        {SUB}
      </p>
      <div className="flex justify-center">
        <Ctas />
      </div>
    </div>
  </Concept>
);

/* 6 · Shrinks as you scroll -------------------------------------------- */
const ScrollShrink = ({ mix = false }: { mix?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let f = 0;
    const measure = () => {
      f = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setP(Math.max(0, Math.min(1, -r.top / (r.height - window.innerHeight))));
    };
    const on = () => {
      if (!f) f = requestAnimationFrame(measure);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(f);
    };
  }, []);
  return (
    <Concept
      n={mix ? "Mix C" : 6}
      title={mix ? "Statement · 6 + 5" : "Scroll to settle"}
      note={
        mix
          ? "the giant ART, settles into the headline as you scroll; the italic hands draws its underline as it lands."
          : "one giant word fills the screen, then shrinks and tightens into the headline as you scroll through."
      }
    >
      <div ref={ref} className="relative h-[200vh]">
        <div className="sticky top-[84px] flex h-[calc(100vh-84px)] flex-col justify-center overflow-hidden">
          <div className={wrap}>
            <h1
              className="heading-caps origin-left whitespace-nowrap leading-[0.9]"
              style={{
                fontSize: `calc(${(1 - p) * 26 + p * 7}vw)`,
                letterSpacing: `${(1 - p) * -0.02 + p * 0.03}em`,
              }}
            >
              Art<span className="text-accent">,</span>
            </h1>
            <p
              className="heading-caps mt-3 text-[clamp(28px,4.6vw,64px)] leading-[1.05] tracking-[0.03em]"
              style={{
                opacity: Math.max(0, (p - 0.35) / 0.4),
                transform: `translateY(${(1 - p) * 30}px)`,
              }}
            >
              and the{" "}
              {mix ? (
                <Hands progress={Math.max(0, Math.min(1, (p - 0.55) / 0.35))} />
              ) : (
                "hands"
              )}{" "}
              that made it.
            </p>
            <div style={{ opacity: Math.max(0, (p - 0.65) / 0.35) }}>
              <p className="font-text mt-6 max-w-[50ch] text-[17px] leading-relaxed text-stone">
                {SUB}
              </p>
              <Ctas />
            </div>
          </div>
        </div>
      </div>
    </Concept>
  );
};

/* 7 · Letters lean toward the cursor ----------------------------------- */
const CursorLetters = () => {
  const ref = useRef<HTMLHeadingElement>(null);
  const move = (e: React.PointerEvent) => {
    ref.current?.querySelectorAll<HTMLSpanElement>("[data-ch]").forEach((s) => {
      const r = s.getBoundingClientRect();
      const d = Math.hypot(
        e.clientX - (r.left + r.width / 2),
        e.clientY - (r.top + r.height / 2),
      );
      const t = Math.max(0, 1 - d / 160);
      s.style.transform = `translateY(${(-t * 14).toFixed(1)}px)`;
      s.style.color = t > 0.55 ? "var(--color-accent)" : "";
    });
  };
  const leave = () =>
    ref.current?.querySelectorAll<HTMLSpanElement>("[data-ch]").forEach((s) => {
      s.style.transform = "";
      s.style.color = "";
    });
  const text = "Art, and the hands that made it.";
  return (
    <Concept
      n={7}
      title="Hands-on letters"
      note="move the mouse across the headline — letters near it rise and warm to red, as if lifted by hand."
    >
      <div className={`${wrap} pb-24 pt-16`}>
        <span className="label">Contemporary art</span>
        <h1
          ref={ref}
          onPointerMove={move}
          onPointerLeave={leave}
          aria-label={text}
          className="heading-caps mt-6 max-w-[14ch] text-[clamp(44px,8vw,112px)] leading-[1.02] tracking-[0.03em]"
        >
          {text.split(" ").map((w, wi) => (
            <span
              key={wi}
              aria-hidden
              className="inline-block whitespace-nowrap"
            >
              {[...w].map((c, ci) => (
                <span
                  key={ci}
                  data-ch
                  className="inline-block transition-[transform,color] duration-300 ease-out"
                >
                  {c}
                </span>
              ))}
              &nbsp;
            </span>
          ))}
        </h1>
        <p className="font-text mt-8 max-w-[50ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
          {SUB}
        </p>
        <Ctas />
      </div>
    </Concept>
  );
};

/* 8 · Names in motion behind the headline ------------------------------ */
const NamesMarquee = ({ names, media }: Pick<Props, "names" | "media">) => {
  const row = (items: string[], reverse: boolean, speed: number) => (
    <div className="flex w-max">
      <div
        className="h-mq flex w-max gap-[0.6em] whitespace-nowrap pr-[0.6em]"
        style={{
          animation: `${reverse ? "h-marquee-r" : "h-marquee"} ${speed}s linear infinite`,
        }}
      >
        {[...items, ...items].map((t, i) => (
          <span key={i}>
            {t} <span className="text-accent/30">·</span>
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <Concept
      n={8}
      title="Names in motion"
      note="every artist's name and medium drifts behind the headline in huge outlined type, in opposite directions."
    >
      <div className="relative overflow-hidden py-24">
        <div
          aria-hidden
          className="heading-caps h-outline-light pointer-events-none absolute inset-0 flex flex-col justify-center gap-2 text-[clamp(56px,9vw,130px)] leading-[1]"
        >
          {row(names, false, 90)}
          {row(media, true, 70)}
          {row([...names].reverse(), false, 110)}
        </div>
        <div className={`${wrap} relative text-center`}>
          <span className="label">Contemporary art</span>
          <h1 className="heading-caps mx-auto mt-6 max-w-[15ch] text-[clamp(40px,6.4vw,88px)] leading-[1.06] tracking-[0.03em]">
            Art, and the hands that made it.
          </h1>
          <p className="font-text mx-auto mt-7 max-w-[50ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
            {SUB}
          </p>
          <div className="flex justify-center">
            <Ctas />
          </div>
        </div>
      </div>
    </Concept>
  );
};

/* ---- Mixes ----------------------------------------------------------- */

/** Per-letter spans that the hands-on lift can move. */
const Letters = ({ text }: { text: string }) => (
  <>
    {text.split(" ").map((w, wi, all) => (
      <Fragment key={wi}>
        <span className="inline-block whitespace-nowrap">
          {[...w].map((c, ci) => (
            <span
              key={ci}
              data-ch
              className="inline-block transition-[transform,color] duration-300 ease-out"
            >
              {c}
            </span>
          ))}
        </span>
        {/* The space sits between word boxes; inside one it would collapse. */}
        {wi < all.length - 1 && " "}
      </Fragment>
    ))}
  </>
);

/** Letters near the pointer rise and warm to red (concept 7), for any heading. */
const useLetterLift = () => {
  const ref = useRef<HTMLHeadingElement>(null);
  const each = (fn: (s: HTMLSpanElement) => void) =>
    ref.current?.querySelectorAll<HTMLSpanElement>("[data-ch]").forEach(fn);
  const onPointerMove = (e: React.PointerEvent) =>
    each((s) => {
      const r = s.getBoundingClientRect();
      const d = Math.hypot(
        e.clientX - (r.left + r.width / 2),
        e.clientY - (r.top + r.height / 2),
      );
      const t = Math.max(0, 1 - d / 160);
      s.style.transform = `translateY(${(-t * 12).toFixed(1)}px)`;
      s.style.color = t > 0.55 ? "var(--color-accent)" : "";
    });
  const onPointerLeave = () =>
    each((s) => {
      s.style.transform = "";
      s.style.color = "";
    });
  return { ref, onPointerMove, onPointerLeave };
};

/**
 * The red italic "hands" with a hand-drawn underline (concept 5). The stroke
 * either draws itself after `delay` ms, or follows `progress` (0–1) on scroll.
 */
const Hands = ({
  delay = 0,
  progress,
  letters,
}: {
  delay?: number;
  progress?: number;
  letters?: boolean;
}) => (
  <span className="relative inline-block font-text normal-case italic tracking-[-0.01em] text-accent">
    {letters ? <Letters text="hands" /> : "hands"}
    <svg
      viewBox="0 0 200 20"
      preserveAspectRatio="none"
      aria-hidden
      className="absolute -bottom-[0.12em] left-0 h-[0.22em] w-full"
    >
      <path
        d="M3 14 C 50 4, 120 4, 197 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        className={progress === undefined ? "h-underline" : undefined}
        style={
          progress === undefined
            ? {
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: `h-draw 1.1s ${delay}ms cubic-bezier(.6,0,.2,1) forwards`,
              }
            : { strokeDasharray: 1, strokeDashoffset: 1 - progress }
        }
      />
    </svg>
  </span>
);

/* Mix A · line rise + italic accent + hands-on letters ----------------- */
const MixA = () => {
  const [k, setK] = useState(0);
  const lift = useLetterLift();
  const line = (delay: number, children: React.ReactNode) => (
    <span className="h-line2" aria-hidden>
      <span style={{ animationDelay: `${delay}ms` }}>{children}</span>
    </span>
  );
  return (
    <Concept
      n="Mix A"
      title="Gallery classic · 1 + 5 + 7"
      note="lines rise in; the italic hands draws its underline as they land; letters lift toward the mouse. Recommended."
      onReplay={() => setK(k + 1)}
    >
      <div key={k} className={`${wrap} pb-24 pt-16`}>
        <span className="label h-fade">Contemporary art</span>
        <h1
          {...lift}
          aria-label="Art, and the hands that made it."
          className="heading-caps mt-6 text-[clamp(48px,8.6vw,124px)] leading-[1] tracking-[0.02em]"
        >
          {line(150, <Letters text="Art, and the" />)}
          {line(
            290,
            <>
              <Hands delay={1050} letters /> <Letters text="that" />
            </>,
          )}
          {line(430, <Letters text="made it." />)}
        </h1>
        <p
          className="h-fade font-text mt-9 max-w-[50ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone"
          style={{ animationDelay: "750ms" }}
        >
          {SUB}
        </p>
        <Ctas delay={900} />
      </div>
    </Concept>
  );
};

/* Mix B · line rise + outline → ink + names in motion ------------------- */
const MixB = ({ names, media }: Pick<Props, "names" | "media">) => {
  const [k, setK] = useState(0);
  const lines = ["Art, and the", "hands that", "made it."];
  const row = (items: string[], reverse: boolean, speed: number) => (
    <div className="flex w-max">
      <div
        className="h-mq flex w-max gap-[0.6em] whitespace-nowrap pr-[0.6em]"
        style={{
          animation: `${reverse ? "h-marquee-r" : "h-marquee"} ${speed}s linear infinite`,
        }}
      >
        {[...items, ...items].map((t, i) => (
          <span key={i}>{t} ·</span>
        ))}
      </div>
    </div>
  );
  return (
    <Concept
      n="Mix B"
      title="Ink & motion · 1 + 3 + 8"
      note="outlined lines rise, then ink floods into each in turn; the artists' names drift faintly behind."
      onReplay={() => setK(k + 1)}
    >
      <div className="relative overflow-hidden py-20">
        <div
          aria-hidden
          className="heading-caps h-outline-light pointer-events-none absolute inset-0 flex flex-col justify-center gap-2 text-[clamp(56px,9vw,130px)] leading-[1]"
        >
          {row(names, false, 90)}
          {row(media, true, 70)}
          {row([...names].reverse(), false, 110)}
        </div>
        <div key={k} className={`${wrap} relative text-center`}>
          <span className="label h-fade">Contemporary art</span>
          <h1
            aria-label="Art, and the hands that made it."
            className="heading-caps mt-6 text-[clamp(44px,8vw,116px)] leading-[1] tracking-[0.02em]"
          >
            {lines.map((l, i) => (
              <span key={l} className="h-line2" aria-hidden>
                <span
                  className="relative"
                  style={{ animationDelay: `${150 + i * 140}ms` }}
                >
                  <span className="h-outline">{l}</span>
                  <span
                    className="h-ink absolute inset-0 text-ink"
                    style={{
                      clipPath: "inset(0 100% 0 0)",
                      animation: `h-ink 1s ${1100 + i * 200}ms cubic-bezier(.7,0,.2,1) forwards`,
                    }}
                  >
                    {l}
                  </span>
                </span>
              </span>
            ))}
          </h1>
          <p
            className="h-fade font-text mx-auto mt-8 max-w-[50ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone"
            style={{ animationDelay: "1600ms" }}
          >
            {SUB}
          </p>
          <div className="flex justify-center">
            <Ctas delay={1800} />
          </div>
        </div>
      </div>
    </Concept>
  );
};

export default function HeroConcepts({ names, media, counts }: Props) {
  return (
    <main>
      <style>{CSS}</style>
      <div className="sticky top-[84px] z-30 border-b border-accent/30 bg-[#fff7f5]/95 backdrop-blur">
        <p className={`${wrap} py-2 text-[12px] text-accent`}>
          Hero ideas — typography only. Three mixes first, then the 8 single
          concepts. Scroll, hover and replay to compare. Not public.
        </p>
      </div>
      <MixA />
      <MixB names={names} media={media} />
      <ScrollShrink mix />
      <div className={`${wrap} pb-2 pt-16`}>
        <p className="label">The single concepts</p>
      </div>
      <LineRise />
      <RotatingVerb />
      <OutlineFill />
      <Editorial counts={counts} media={media} />
      <ItalicAccent />
      <ScrollShrink />
      <CursorLetters />
      <NamesMarquee names={names} media={media} />
    </main>
  );
}
