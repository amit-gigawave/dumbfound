"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mail, Rotate3d, Search, Smartphone } from "lucide-react";
import { FIT_CARD } from "../three/modelLoader";

const SculptureScene = dynamic(() => import("../SculptureScene"), { ssr: false });

interface Props {
  stats: { artists: number; works: number; inRound: number; from: number; to: number };
  portraits: { slug: string; name: string; portrait: string; medium: string }[];
  events: { title: string; kind: string; dates: string; venue: string; past: boolean }[];
}

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

const CSS = `
@keyframes lab-marquee { to { transform: translateX(-50%); } }
.lab-marquee { animation: lab-marquee 70s linear infinite; }
.lab-marquee:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .lab-marquee { animation: none; } }
`;

/* ------------------------------------------------------------------ */

const Concept = ({ n, title, note, dark }: { n: number; title: string; note: string; dark?: boolean }) => (
  <div className={`mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12px] ${dark ? "text-[#bdbdbd]" : "text-stone"}`}>
    <span className="rounded-full border border-accent/50 px-2.5 py-0.5 uppercase tracking-[0.16em] text-accent">
      Concept {n}
    </span>
    <span className="font-medium uppercase tracking-[0.14em]">{title}</span>
    <span className="basis-full sm:basis-auto">— {note}</span>
  </div>
);

const Draft = () => (
  <span className="ml-2 align-middle text-[10px] uppercase tracking-[0.16em] text-accent/80">draft copy</span>
);

/* 1 · Hero with a live, turning sculpture ---------------------------- */

const Hero = () => (
  <section className={`${wrap} pb-[clamp(56px,8vw,110px)] pt-[clamp(40px,6vw,80px)]`}>
    <Concept n={1} title="Living hero" note="the mission line beside a sculpture turning slowly in 3D — the site's signature, up front." />
    <div className="grid items-center gap-[clamp(32px,5vw,72px)] md:grid-cols-[1.1fr_1fr]">
      <div>
        <span className="label">The Initiative</span>
        <h1 className="heading-caps mt-5 text-[clamp(34px,5.2vw,66px)] leading-[1.08] tracking-[0.035em]">
          Placing sculpture at the centre.
        </h1>
        <p className="font-text mt-6 max-w-[46ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
          A pioneering public art initiative advancing modern and contemporary
          Indian sculpture — at its fullest scale, ambition, and impact.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-7">
          <Link href="/artworks" className="btn">View the artworks</Link>
          <Link href="/contact" className="text-link">Write to us</Link>
        </div>
      </div>
      <figure className="grid gap-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-rule bg-plate">
          <SculptureScene url="/sculptures/DancingShiva.glb" fit={FIT_CARD} adaptiveBackground={false} />
        </div>
        <figcaption className="text-[13px] text-stone">
          Thota Vaikuntam, <em>Dancing Shiva</em> — turning live, in the round.
        </figcaption>
      </figure>
    </div>
  </section>
);

/** Split text into words, flagging the ones inside **double asterisks** as key words. */
const tokens = (text: string) =>
  text.split("**").flatMap((seg, si) =>
    seg
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, key: si % 2 === 1, group: si })),
  );

const ACCENT = "var(--color-accent, #b3261e)";

/* 2 · Manifesto that lights up word by word as you scroll ------------ */

const MANIFESTO =
  "Sculpture has always been one of the most **powerful and enduring** forms of artistic expression — yet it has often remained on the **periphery** of India's art ecosystem. Sculpted India was founded to **change that.**";

const Manifesto = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setProgress(Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.2))));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const words = tokens(MANIFESTO);
  return (
    <section className="border-y border-rule bg-white py-[clamp(70px,10vw,140px)]">
      <div className={wrap}>
        <Concept n={2} title="Scroll manifesto" note="the founding idea, lighting up word by word as the visitor scrolls — key words light up in red (words from the current About text)." />
        <p ref={ref} className="font-display max-w-[30ch] text-[clamp(28px,4.2vw,54px)] leading-[1.22] tracking-[0.01em]">
          {words.map(({ w, key }, i) => (
            <span
              key={i}
              className="transition-colors duration-300"
              style={{ color: i / words.length < progress ? (key ? ACCENT : "var(--color-ink, #111)") : "#cfcfcf" }}
            >
              {w}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
};

/* 3 · Staggered story — words rise in, key phrases get a marker swipe -- */

const STORY = [
  "More than an exhibition platform, Sculpted India serves as a **bridge** between artists, collectors, galleries, institutions, architects, designers, and art enthusiasts — creating meaningful opportunities for **dialogue, collaboration, and patronage.**",
  "What distinguishes Sculpted India is its **long-term commitment** to the medium. Rather than a one-time exhibition, it is envisioned as a **sustained cultural initiative** — building **visibility, accessibility, and patronage** for sculpture across India.",
  "The mission remains clear: to become **the leading platform** for modern and contemporary Indian sculpture, positioning the medium at the **forefront of India's cultural imagination.**",
];

const WORD_STEP = 28; // ms between words

const StaggerPara = ({ text }: { text: string }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = tokens(text);
  // Render key phrases as one <mark> so the marker sweeps across the whole phrase.
  const groups: { key: boolean; g: number; items: { w: string; i: number }[] }[] = [];
  words.forEach(({ w, key, group }, i) => {
    const last = groups[groups.length - 1];
    if (last && last.g === group) last.items.push({ w, i });
    else groups.push({ key, g: group, items: [{ w, i }] });
  });
  const end = words.length * WORD_STEP;

  const word = ({ w, i }: { w: string; i: number }) => (
    <span key={i}>
      <span
        className="inline-block"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "none" : "translateY(0.6em)",
          filter: shown ? "none" : "blur(3px)",
          transition: `opacity .6s ease ${i * WORD_STEP}ms, transform .7s cubic-bezier(.2,.7,.2,1) ${i * WORD_STEP}ms, filter .6s ease ${i * WORD_STEP}ms`,
        }}
      >
        {w}
      </span>{" "}
    </span>
  );

  return (
    <p ref={ref} className="font-text max-w-[56ch] text-[clamp(19px,1.9vw,24px)] leading-[1.7] text-stone">
      {groups.map((g, gi) =>
        g.key ? (
          <mark
            key={gi}
            className="text-ink"
            style={{
              backgroundColor: "transparent",
              backgroundImage: "linear-gradient(rgba(179,38,30,.15), rgba(179,38,30,.15))",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 90%",
              backgroundSize: shown ? "100% 42%" : "0% 42%",
              transition: `background-size .9s cubic-bezier(.6,0,.2,1) ${end + 150 + gi * 120}ms`,
              color: shown ? "var(--color-ink, #111)" : undefined,
            }}
          >
            {g.items.map(word)}
          </mark>
        ) : (
          g.items.map(word)
        ),
      )}
    </p>
  );
};

const Story = () => (
  <section className={`${wrap} py-[clamp(64px,8vw,110px)]`}>
    <Concept n={3} title="Staggered story" note="the About paragraphs rise in word by word as they scroll into view, then a marker sweeps across the main phrases (current About text, key phrases marked)." />
    <div className="grid gap-[clamp(40px,6vw,80px)] md:grid-cols-[220px_1fr]">
      <span className="label md:sticky md:top-36 md:self-start">Our story</span>
      <div className="grid gap-10">
        {STORY.map((t) => (
          <StaggerPara key={t} text={t} />
        ))}
      </div>
    </div>
  </section>
);

/* 4 · The collection in numbers (counted from the site's data) -------- */

const CountUp = ({ to }: { to: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / 1400);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n}</span>;
};

const Numbers = ({ stats }: Pick<Props, "stats">) => {
  const decades = Math.round((stats.to - stats.from) / 10);
  const items = [
    { value: <CountUp to={stats.artists} />, label: "Artists on the platform" },
    { value: <CountUp to={stats.inRound} />, label: "Works you can turn in 3D and place in your room" },
    { value: <>{stats.from}–{stats.to}</>, label: `Artists born across ${decades} decades — four generations` },
    { value: <CountUp to={2026} />, label: "Debut showcase, Design Democracy, Hyderabad" },
  ];
  return (
    <section className={`${wrap} py-[clamp(64px,8vw,110px)]`}>
      <Concept n={4} title="The collection in numbers" note="counted live from the catalogue — nothing invented; they update as artists and works are added." />
      <div className="grid gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div key={i} className="bg-paper p-7 transition-colors duration-500 hover:bg-white">
            <div className="font-display text-[clamp(38px,4.6vw,58px)] leading-none tracking-[0.02em] text-accent">{it.value}</div>
            <p className="mt-4 max-w-[24ch] text-[14px] leading-relaxed text-stone">{it.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* 5 · Who we bring together — a hoverable network ------------------- */

const ROLES = [
  { name: "Artists", line: "Space to show sculpture at its full scale and ambition." },
  { name: "Collectors", line: "Works seen in the round, in context, before a single visit." },
  { name: "Galleries", line: "A shared stage for the medium, beyond any one exhibition." },
  { name: "Institutions", line: "Partners in building a lasting public life for sculpture." },
  { name: "Architects", line: "Sculpture imagined into buildings and public space." },
  { name: "Designers", line: "Form, material and craft in conversation." },
];

const Network = () => {
  const [active, setActive] = useState<number | null>(null);
  const R = 39; // % radius
  const pos = ROLES.map((_, i) => {
    const a = (i / ROLES.length) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * R, y: 50 + Math.sin(a) * R };
  });
  return (
    <section className="border-y border-rule bg-white py-[clamp(64px,8vw,110px)]">
      <div className={wrap}>
        <Concept n={5} title="Who we bring together" note="the six groups the About text names, as a network — hover a group to read its line." />
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="heading-caps text-[clamp(26px,3.4vw,42px)] leading-[1.15] tracking-[0.05em]">More than an exhibition — a bridge.</h2>
            <p className="font-text mt-5 max-w-[46ch] text-[17px] leading-[1.75] text-stone">
              Sculpted India creates meaningful opportunities for dialogue,
              collaboration, and patronage, fostering a stronger ecosystem
              around sculpture.
            </p>
            <p className="font-display mt-8 min-h-[3.2em] max-w-[34ch] text-[22px] leading-snug text-accent">
              {active === null ? "Hover a circle →" : ROLES[active].line}
              {active !== null && <Draft />}
            </p>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              {pos.map((p, i) => (
                <line
                  key={i}
                  x1="50" y1="50" x2={p.x} y2={p.y}
                  stroke={active === i ? "var(--color-accent, #b3261e)" : "#d9d9d9"}
                  strokeWidth={active === i ? 0.6 : 0.3}
                  className="transition-all duration-300"
                />
              ))}
            </svg>
            <div className="absolute left-1/2 top-1/2 grid h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink p-3 text-center text-[11px] uppercase tracking-[0.16em] text-paper">
              Sculpted India
            </div>
            {ROLES.map((r, i) => (
              <button
                key={r.name}
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                className={`absolute grid h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[12px] transition-all duration-300 ${
                  active === i ? "scale-110 border-accent bg-accent text-white shadow-lg" : "border-rule bg-paper text-ink"
                }`}
                style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%` }}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* 6 · Values, on the dark band -------------------------------------- */

const VALUES = [
  { title: "Excellence", line: "Every work presented with the care of a museum catalogue." },
  { title: "Inclusivity", line: "Established names and new voices, side by side." },
  { title: "Innovation", line: "Sculpture you can turn, and place in your own room." },
  { title: "Cultural stewardship", line: "A lasting legacy for artists, audiences and future generations." },
];

const Values = () => (
  <section className="deep">
    <div className={`${wrap} py-[clamp(70px,9vw,120px)]`}>
      <Concept n={6} dark title="Values" note="the four values from the About text, as cards that lift and lean on hover." />
      <h2 className="heading-caps max-w-[20ch] text-[clamp(26px,3.4vw,42px)] leading-[1.15] tracking-[0.05em]">
        What we stand for <Draft />
      </h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v, i) => (
          <div
            key={v.title}
            className="group rounded-[14px] border border-white/15 p-7 transition-[transform,background-color,border-color] duration-500 hover:-translate-y-1.5 hover:rotate-[-0.6deg] hover:border-white/40 hover:bg-white/[0.06]"
          >
            <span className="font-display text-[15px] text-accent">0{i + 1}</span>
            <h3 className="font-display mt-6 text-[24px] leading-tight tracking-[0.03em]">{v.title}</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#c9c9c9]">{v.line}</p>
            <span aria-hidden className="mt-6 block h-px w-0 bg-accent transition-[width] duration-500 group-hover:w-12" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* 7 · Portrait strip of every artist -------------------------------- */

const Portraits = ({ portraits }: Pick<Props, "portraits">) => (
  <section className="overflow-hidden py-[clamp(64px,8vw,110px)]">
    <div className={wrap}>
      <Concept n={7} title="The artists, in one sweep" note="every portrait drifting past slowly; hover pauses it, click opens the artist." />
      <h2 className="heading-caps text-[clamp(26px,3.4vw,42px)] tracking-[0.05em]">The hands behind the work</h2>
    </div>
    <div className="mt-10 flex w-max gap-6 lab-marquee">
      {[...portraits, ...portraits].map((p, i) => (
        <Link key={i} href={`/artists/${p.slug}`} className="group w-[200px] shrink-0">
          <div className="relative aspect-square overflow-hidden rounded-[14px] border border-rule bg-plate">
            <Image
              src={p.portrait}
              alt={i < portraits.length ? p.name : ""}
              fill
              sizes="200px"
              className="object-cover grayscale-[0.6] transition-[transform,filter] duration-700 group-hover:scale-105 group-hover:grayscale-0"
            />
          </div>
          <p className="font-display mt-3 text-[17px] tracking-[0.03em] transition-colors group-hover:text-accent">{p.name}</p>
          <p className="text-[12px] text-stone">{p.medium}</p>
        </Link>
      ))}
    </div>
  </section>
);

/* 8 · How to experience a work -------------------------------------- */

const STEPS = [
  { icon: Search, title: "Browse", line: "Artists and their works, each presented with the care of a museum catalogue." },
  { icon: Rotate3d, title: "View in the round", line: "Turn a sculpture and look at it from every side, as you would in a gallery." },
  { icon: Smartphone, title: "See it in your space", line: "On a phone, place the work in your room through the camera, at its real size." },
  { icon: Mail, title: "Enquire", line: "Ask about availability, editions and viewing — we'll put you in touch." },
];

const Steps = () => (
  <section className="border-y border-rule bg-white py-[clamp(64px,8vw,110px)]">
    <div className={wrap}>
      <Concept n={8} title="How to experience a work" note="explains the 3D and AR features many visitors would otherwise never find (wording from the current FAQ)." />
      <h2 className="heading-caps text-[clamp(26px,3.4vw,42px)] tracking-[0.05em]">From screen to your room</h2>
      <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="group relative">
            {i < STEPS.length - 1 && (
              <span aria-hidden className="absolute left-14 right-[-20px] top-6 hidden h-px bg-rule lg:block" />
            )}
            <span className="relative grid h-12 w-12 place-items-center rounded-full border border-rule bg-paper text-accent transition-all duration-500 group-hover:scale-110 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
              <s.icon size={20} strokeWidth={1.6} />
            </span>
            <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-stone">Step {i + 1}</p>
            <h3 className="font-display mt-1 text-[22px] tracking-[0.03em]">{s.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-stone">{s.line}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* 9 · Milestones from the events list ------------------------------- */

const Milestones = ({ events }: Pick<Props, "events">) => (
  <section className={`${wrap} py-[clamp(64px,8vw,110px)]`}>
    <Concept n={9} title="Milestones" note="a timeline built from the events list; grows automatically as new exhibitions are added." />
    <h2 className="heading-caps text-[clamp(26px,3.4vw,42px)] tracking-[0.05em]">The journey so far</h2>
    <ol className="relative mt-10 grid gap-10 border-l border-rule pl-8">
      {[...events].reverse().map((e) => (
        <li key={e.title} className="group relative">
          <span
            aria-hidden
            className={`absolute -left-[38px] top-1.5 h-3.5 w-3.5 rounded-full border-2 transition-transform duration-300 group-hover:scale-125 ${
              e.past ? "border-stone bg-paper" : "border-accent bg-accent"
            }`}
          />
          <p className="text-[12px] uppercase tracking-[0.16em] text-stone">
            {e.dates}
            {!e.past && <span className="ml-3 rounded-full bg-accent px-2 py-0.5 text-[10px] text-white">Upcoming</span>}
          </p>
          <h3 className="font-display mt-1.5 text-[24px] tracking-[0.02em]">{e.title}</h3>
          <p className="text-[14px] text-stone">{e.kind} · {e.venue}</p>
        </li>
      ))}
    </ol>
  </section>
);

/* 10 · Sections that need content from the team ---------------------- */

const NeedsContent = () => (
  <section className="border-t border-rule bg-white py-[clamp(64px,8vw,110px)]">
    <div className={wrap}>
      <Concept n={10} title="Team & partners" note="layouts ready; these need photos, bios and logo permissions from the team before they can go live." />
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="heading-caps text-[clamp(22px,2.6vw,32px)] tracking-[0.05em]">The people</h2>
          <div className="mt-6 grid grid-cols-2 gap-6">
            {["Raj", "Sanya"].map((n) => (
              <div key={n}>
                <div className="grid aspect-square place-items-center rounded-[14px] border border-dashed border-stone/40 bg-plate text-[11px] uppercase tracking-[0.14em] text-stone">
                  Photo needed
                </div>
                <p className="font-display mt-3 text-[19px]">{n}</p>
                <p className="text-[12px] text-stone">Role and one-line bio needed</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="heading-caps text-[clamp(22px,2.6vw,32px)] tracking-[0.05em]">In association with</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {["Black Cube Gallery", "Partner", "Partner", "Partner"].map((n, i) => (
              <div
                key={i}
                className="grid h-24 place-items-center rounded-[14px] border border-dashed border-stone/40 px-4 text-center text-[12px] uppercase tracking-[0.14em] text-stone grayscale transition hover:border-ink hover:text-ink"
              >
                {n}
                <span className="block text-[10px] normal-case tracking-normal">logo, with permission</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */

export default function AboutConcepts({ stats, portraits, events }: Props) {
  return (
    <main>
      <style>{CSS}</style>
      <div className="sticky top-[84px] z-30 border-b border-accent/30 bg-[#fff7f5]/95 backdrop-blur">
        <p className={`${wrap} py-2 text-[12px] text-accent`}>
          Inspiration for the About page — {10} concepts, top to bottom. Scroll, hover and click to try each one. Not public.
        </p>
      </div>
      <Hero />
      <Manifesto />
      <Story />
      <Numbers stats={stats} />
      <Network />
      <Values />
      <Portraits portraits={portraits} />
      <Steps />
      <Milestones events={events} />
      <NeedsContent />
    </main>
  );
}
