"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ConceptWork } from "@/components/gallery/views/types";

/** Scroll distance (in viewport heights) spent on each work. */
const STEP_VH = 0.42;

/**
 * Scrolling down walks the collection sideways across the screen, like a
 * band marching past. The work at the centre steps forward to full size and
 * its title rises behind it.
 */
export default function Procession({ works }: { works: ConceptWork[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const n = works.length;

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const s = section.current,
        t = track.current;
      if (!s || !t) return;
      const vh = window.innerHeight,
        vw = window.innerWidth;
      const travel = s.offsetHeight - vh;
      const p = Math.min(
        1,
        Math.max(0, (window.scrollY - s.offsetTop) / Math.max(1, travel)),
      );
      const pos = p * (n - 1);
      // Spacing follows the works' drawn width, so narrow phones don't pile them up.
      const itemW = items.current[0]?.offsetWidth ?? vw * 0.3;
      const gap = Math.max(itemW * 0.78, Math.min(vw * 0.24, vh * 0.34));
      t.style.transform = `translate3d(${vw / 2 - pos * gap}px,0,0)`;
      items.current.forEach((el, i) => {
        if (!el) return;
        const d = Math.abs(i - pos);
        const near = Math.max(0, 1 - d);
        el.style.transform = `translate3d(${i * gap}px,0,0) translateX(-50%) scale(${0.62 + 0.5 * near})`;
        el.style.opacity = String(Math.max(0.28, 1 - d * 0.22));
        el.style.zIndex = String(100 - Math.round(d * 10));
      });
      const now = Math.round(pos);
      if (now !== last) {
        last = now;
        setActive(now);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  const w = works[active];

  return (
    <section
      ref={section}
      aria-label="The collection as a procession. Scroll to move along it."
      style={{ height: `calc(100svh + ${n * STEP_VH * 100}svh)` }}
      className="relative bg-[#e9e4da]"
    >
      <div className="sticky top-[85px] h-[calc(100svh-85px)] overflow-hidden">
        {/* The title of the work at the centre, large, behind the procession. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[8%] px-[clamp(16px,4vw,48px)] text-center"
        >
          <p
            key={w?.slug}
            className="font-display animate-[proc-rise_700ms_cubic-bezier(.2,.7,.1,1)] text-[clamp(44px,10vw,170px)] leading-[0.9] text-[#cfc6b6] motion-reduce:animate-none [text-wrap:balance]"
          >
            {w?.title}
          </p>
        </div>

        {/* The floor the works walk on. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-b from-[#d9d1c3] to-[#e9e4da]"
        />

        <div
          ref={track}
          className="absolute bottom-[19%] left-0 will-change-transform"
        >
          {works.map((x, i) => (
            <Link
              key={x.slug}
              ref={(el) => {
                items.current[i] = el;
              }}
              href={`/artworks/${x.slug}`}
              className="absolute bottom-0 left-0 block aspect-[4/5] h-[min(52vh,70vw)] origin-bottom will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5a4a35]"
            >
              <Image
                unoptimized
                src={x.thumbnail}
                alt={x.title}
                fill
                sizes="(min-width: 768px) 30vw, 60vw"
                className="object-contain object-bottom drop-shadow-[0_18px_18px_rgba(60,40,20,0.25)]"
              />
            </Link>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-[5%] flex items-baseline justify-between gap-4 px-[clamp(16px,4vw,48px)] text-[#4a3d2c]">
          <p className="font-text min-w-0 truncate text-[clamp(14px,1.4vw,17px)] italic">
            {w?.artist}
          </p>
          <p className="shrink-0 text-[13px] tabular-nums">
            {active + 1} of {works.length}
          </p>
        </div>
      </div>
      <style>{`@keyframes proc-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
