"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Magnetic from "./Magnetic";
import { FIT_VIEWER } from "./three/modelLoader";

const SculptureScene = dynamic(() => import("./SculptureScene"), {
  ssr: false,
});

export interface HeroWork {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  artist: string;
  meta: string;
  modelUrl: string;
  facing?: number;
}

/** Share of the pinned scroll spent on the move; the rest is a pause to read. */
const MOVE = 0.55;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * Home hero (desktop): the intro sits left and a featured sculpture turns on
 * the right. While the section is pinned, scrolling slides the sculpture to
 * the left, the intro lifts away, and the work's details appear on the right.
 * Phones and reduced motion get a simple stacked layout. The hidden starting
 * states only apply once JS has marked the page (html.js), so nothing is lost
 * without scripts.
 */
export default function HeroScroll({ work }: { work: HeroWork }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const set = (
      el: HTMLElement | null,
      opacity: number,
      transform: string,
    ) => {
      if (!el) return;
      el.style.opacity = String(opacity);
      el.style.transform = transform;
    };
    const reset = () =>
      [introRef, modelRef, titleRef, infoRef].forEach(({ current }) => {
        if (!current) return;
        current.style.opacity = "";
        current.style.transform = "";
        current.style.pointerEvents = "";
      });

    const update = () => {
      frame = 0;
      const pin = pinRef.current;
      if (!pin) return;
      if (!desktop.matches || still.matches) return reset();
      const r = pin.getBoundingClientRect();
      const scrollable = pin.offsetHeight - window.innerHeight;
      const p = clamp(clamp(-r.top / scrollable) / MOVE);
      const move = ease(p);

      set(
        introRef.current,
        clamp(1 - p * 2.4),
        `translateY(${(-p * 120).toFixed(1)}px)`,
      );
      set(modelRef.current, 1, `translateX(${(-move * 100).toFixed(2)}%)`);
      const t = clamp((p - 0.3) / 0.5);
      set(titleRef.current, t, `translateY(${((1 - t) * 30).toFixed(1)}px)`);
      const i = clamp((p - 0.45) / 0.55);
      set(infoRef.current, i, `translateY(${((1 - i) * 50).toFixed(1)}px)`);
      if (infoRef.current)
        infoRef.current.style.pointerEvents = i > 0.6 ? "auto" : "none";
      if (introRef.current)
        introRef.current.style.pointerEvents = p < 0.3 ? "auto" : "none";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    desktop.addEventListener("change", onScroll);
    still.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktop.removeEventListener("change", onScroll);
      still.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <section
      ref={pinRef}
      className="relative lg:h-[260vh] motion-reduce:lg:h-auto"
    >
      <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] lg:sticky lg:top-[84px] lg:h-[calc(100svh-84px)] motion-reduce:lg:static motion-reduce:lg:h-auto">
        <div className="relative grid gap-8 pb-[clamp(40px,6vw,64px)] pt-[clamp(56px,9vw,100px)] lg:h-full lg:grid-cols-2 lg:items-center lg:py-0 motion-reduce:lg:py-[clamp(56px,9vw,100px)]">
          {/* Section title — appears at the top as the sculpture moves */}
          <p
            ref={titleRef}
            className="label pointer-events-none absolute inset-x-0 top-8 hidden text-center lg:block lg:[html.js_&]:opacity-0 motion-reduce:lg:hidden"
          >
            From the collection
          </p>

          {/* Intro — lifts away as you scroll */}
          <div ref={introRef} className="relative z-10">
            <span className="label">Contemporary art</span>
            <h1 className="heading-caps mt-[22px] max-w-[15ch] text-[clamp(38px,5.4vw,76px)] leading-[1.06] tracking-[0.03em]">
              Art, and the hands that made it.
            </h1>
            <p className="font-text mt-[26px] max-w-[46ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
              A gallery of artists and their works, established names and new
              voices, across every medium, each presented with the care of a
              museum catalogue.
            </p>
            <div className="mt-[34px] flex flex-wrap items-center gap-[30px]">
              <Magnetic>
                <Link href="/artworks" className="btn">
                  View the artworks <span className="nudge">→</span>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/artists" className="text-link">
                  Meet the artists <span className="nudge">→</span>
                </Link>
              </Magnetic>
            </div>
          </div>

          {/* The sculpture — starts on the right, slides to the left */}
          <div
            ref={modelRef}
            className="relative h-[58vh] min-h-[340px] will-change-transform lg:absolute lg:inset-y-0 lg:left-1/2 lg:h-auto lg:w-1/2"
          >
            <SculptureScene
              url={work.modelUrl}
              fit={FIT_VIEWER}
              facing={work.facing}
              adaptiveBackground={false}
            />
          </div>

          {/* The work's details — take the right half once the sculpture has moved */}
          <div
            ref={infoRef}
            className="lg:absolute lg:inset-y-0 lg:left-1/2 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:pl-[clamp(24px,4vw,64px)] lg:[html.js_&]:pointer-events-none lg:[html.js_&]:opacity-0 motion-reduce:lg:static motion-reduce:lg:w-auto motion-reduce:lg:pl-0 motion-reduce:lg:opacity-100"
          >
            <span className="label">Featured · {work.artist}</span>
            <h2 className="heading-caps mt-4 text-[clamp(30px,3.6vw,52px)] leading-[1.08] tracking-[0.04em]">
              {work.title}
            </h2>
            {work.subtitle && (
              <p className="font-text mt-2 text-[17px] italic text-accent">
                {work.subtitle}
              </p>
            )}
            <p className="mt-3 text-[13px] uppercase tracking-[0.14em] text-stone">
              {work.meta}
            </p>
            <p className="font-text mt-6 max-w-[44ch] text-[17px] leading-[1.75] text-stone">
              {work.description}
            </p>
            <div className="mt-8">
              <Link href={`/artworks/${work.slug}`} className="btn">
                View in the round <span className="nudge">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
