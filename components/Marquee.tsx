"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WORDS = [
  "Bronze",
  "Telangana",
  "Vermilion",
  "Form",
  "Heritage",
  "Almond Eyes",
];

export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Seamless base loop — the track holds two identical halves, so a -50%
      // shift lands exactly back on itself.
      const loop = gsap.to(track.current, {
        xPercent: -50,
        ease: "none",
        duration: 26,
        repeat: -1,
      });

      let resetTween: gsap.core.Tween | null = null;

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          // Scroll velocity speeds the marquee up and biases its direction.
          const v = self.getVelocity();
          const dir = v < 0 ? -1 : 1;
          const speed = gsap.utils.clamp(1, 9, 1 + Math.abs(v) / 220);
          gsap.to(loop, {
            timeScale: speed * dir,
            duration: 0.25,
            overwrite: true,
          });
          resetTween?.kill();
          resetTween = gsap.to(loop, {
            timeScale: 1,
            duration: 1.1,
            delay: 0.25,
            ease: "power2.out",
          });
        },
      });

      return () => {
        st.kill();
        loop.kill();
        resetTween?.kill();
      };
    },
    { scope: root },
  );

  const items = [...WORDS, ...WORDS];

  return (
    <div
      ref={root}
      className="relative select-none overflow-hidden border-y border-black/10 bg-black/[0.015] py-7"
    >
      <div
        ref={track}
        className="flex w-max flex-nowrap items-center gap-10 will-change-transform"
      >
        {items.map((word, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            <span className="font-display text-3xl font-medium tracking-tight text-black/80 sm:text-5xl">
              {word}
            </span>
            <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-[#ffd3be] to-[#f2741f]" />
          </span>
        ))}
      </div>
    </div>
  );
}
