"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import BlurText from "./BlurText";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const stats = [
  { target: 600, suffix: "+", label: "Works at auction" },
  { target: 80, suffix: "+", label: "Years of artistry" },
  { target: 1993, suffix: "", label: "National Award" },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      // Staggered reveal of the label + paragraphs
      gsap.from(".about-reveal", {
        y: 42,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
      });

      // Accent line draws itself downward
      gsap.from(".about-line", {
        scaleY: 0,
        transformOrigin: "top center",
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
      });

      // Count-up stat numbers
      numberRefs.current.forEach((el, i) => {
        if (!el) return;
        const s = stats[i];
        const counter = { v: 0 };
        gsap.to(counter, {
          v: s.target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(counter.v) + s.suffix;
          },
        });
      });

      // Gentle parallax drift on the stats row
      gsap.to(".about-stats", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative z-10 overflow-hidden px-6 py-28 text-black lg:px-16"
    >
      <div className="relative mx-auto max-w-4xl">
        {/* Drawn accent line */}
        <span className="about-line pointer-events-none absolute -left-4 top-2 hidden h-24 w-px bg-gradient-to-b from-[#f2741f] to-transparent lg:block" />

        <p className="about-reveal mb-6 text-[10px] uppercase tracking-[0.4em] text-black/50">
          The Artist
        </p>
        <h2 className="font-display text-4xl font-medium tracking-[-0.03em] text-black sm:text-5xl lg:text-[3.5rem] leading-[1.1]">
          <BlurText
            text={"“I am a part of what I paint.”"}
            animateBy="words"
            delay={100}
            stepDuration={0.4}
          />
        </h2>
        <p className="about-reveal mt-8 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
          Born in 1942 in Burugupalli, Telangana, Thota Vaikuntam has spent over
          eight decades capturing the dignity, beauty, and vibrant spirit of
          rural Telangana women — translating bold primary colours and folk
          traditions into paintings, serigraphs, and striking bronze sculptures
          exhibited across New York, London, Dubai, and beyond.
        </p>
        <p className="about-reveal mt-4 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
          Trained under K.G. Subramanyan at M.S. University of Baroda, his
          visual language is unmistakable: almond-shaped eyes, vermilion bindis,
          ornate jewellery, and rich primary colours that celebrate Telangana
          heritage with unflinching authenticity.
        </p>

        <div className="about-stats mt-14 grid max-w-xl grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={stat.label}>
              <div className="font-display text-3xl text-black sm:text-4xl">
                <span
                  ref={(el) => {
                    numberRefs.current[i] = el;
                  }}
                >
                  0{stat.suffix}
                </span>
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-black/50">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
