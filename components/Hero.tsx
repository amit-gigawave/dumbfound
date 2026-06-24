"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import { heroScrollStore } from "./heroScrollStore";
import BlurText from "./BlurText";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function Hero() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  // The scroll-pinned slide choreography is desktop-only; mobile gets a simple
  // stacked layout instead (no 250vh pin, no off-screen model slide).
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const onScroll = () => {
      if (!spacerRef.current) return;
      const rect = spacerRef.current.getBoundingClientRect();
      const scrollable = spacerRef.current.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const rawProgress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const animProgress = Math.min(1, rawProgress / 0.45);

      heroScrollStore.progress = animProgress;
      setDone(rawProgress >= 0.95);

      if (modelRef.current) {
        const moveX = animProgress * -45;
        modelRef.current.style.transform = `translateX(${moveX}vw)`;
      }

      if (textRef.current) {
        const opacity = 1 - animProgress * 2.5;
        const moveUp = animProgress * -150;
        textRef.current.style.opacity = `${Math.max(0, opacity)}`;
        textRef.current.style.transform = `translateY(${moveUp}px)`;
      }

      if (titleRef.current) {
        const titleP = Math.max(0, (animProgress - 0.3) / 0.5);
        const moveDown = (1 - titleP) * 40;
        titleRef.current.style.opacity = `${Math.min(1, titleP)}`;
        titleRef.current.style.transform = `translateY(${moveDown}px)`;
      }

      if (rightTextRef.current) {
        const textP = Math.max(0, (animProgress - 0.45) / 0.55);
        const moveUp = (1 - textP) * 60;
        rightTextRef.current.style.opacity = `${Math.min(1, textP)}`;
        rightTextRef.current.style.transform = `translateY(${moveUp}px)`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  if (isMobile) {
    return (
      <section
        id="home"
        className="relative flex flex-col items-center px-6 pt-28 pb-10 text-center"
      >
        <p className="text-[11px] uppercase tracking-[0.4em] text-black/40 mb-4">
          Indian Contemporary Artist &amp; Sculptor
        </p>
        <h1 className="text-[clamp(38px,11vw,64px)] leading-[0.95] tracking-[-0.03em] font-display font-medium text-black">
          <span className="block">
            <BlurText text="Thota" animateBy="letters" delay={70} stepDuration={0.4} />
          </span>
          <span className="block">
            <BlurText
              text="Vaikuntam"
              animateBy="letters"
              delay={70}
              startDelay={350}
              stepDuration={0.4}
            />
          </span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-black/50">
          Where Telangana&#39;s soul takes form in bronze and colour — bold
          primary hues, almond eyes, and vermilion bindis rendered across eight
          decades of art.
        </p>
        <a
          href="#collection"
          className="mt-7 inline-block border border-black/20 px-8 py-3 text-[12px] uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-black hover:text-white"
        >
          View Sculptures
        </a>

        <div className="mt-6 h-[55vh] min-h-[360px] w-full">
          <HeroScene />
        </div>
      </section>
    );
  }

  return (
    <section id="home">
      <div ref={spacerRef} style={{ height: "250vh", position: "relative" }}>
        <div
          className="flex items-center justify-center"
          style={{
            position: done ? "absolute" : "fixed",
            top: done ? "auto" : 0,
            bottom: done ? 0 : "auto",
            left: 0,
            right: 0,
            height: "100vh",
            zIndex: 10,
            pointerEvents: done ? "none" : "auto",
          }}
        >
          {/* Section title - fades in at top center */}
          <div
            ref={titleRef}
            className="absolute top-20 left-0 right-0 text-center pointer-events-none"
            style={{ opacity: 0, willChange: "transform, opacity" }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-black/40 mb-3">
              The Sculpture Collection
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-black">
              Bronze &amp; Form
            </h2>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 gap-8">
            {/* Hero text - fades out and goes up */}
            <div
              ref={textRef}
              className="flex-1 text-center lg:text-left max-w-xl"
              style={{ willChange: "transform, opacity" }}
            >
              <p className="text-[11px] uppercase tracking-[0.4em] text-black/40 mb-4">
                Indian Contemporary Artist &amp; Sculptor
              </p>
              <h1 className="text-[clamp(36px,5vw,72px)] leading-[0.95] tracking-[-0.03em] font-display font-medium text-black">
                <span className="block">
                  <BlurText text="Thota" animateBy="letters" delay={70} stepDuration={0.4} />
                </span>
                <span className="block">
                  <BlurText
                    text="Vaikuntam"
                    animateBy="letters"
                    delay={70}
                    startDelay={350}
                    stepDuration={0.4}
                  />
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-black/50 max-w-md mx-auto lg:mx-0">
                Where Telangana&#39;s soul takes form in bronze and colour —
                bold primary hues, almond eyes, and vermilion bindis rendered
                across eight decades of art.
              </p>
              <a
                href="#collection"
                className="inline-block mt-8 border border-black/20 text-black px-8 py-3 text-[12px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
              >
                View Sculptures
              </a>
            </div>

            {/* 3D Model - slides left */}
            <div
              ref={modelRef}
              className="flex-1 w-full h-[600px] sm:h-[700px] lg:h-[850px]"
              style={{ willChange: "transform" }}
            >
              <HeroScene />
            </div>
          </div>

          {/* Right side text - appears after model slides left */}
          <div
            ref={rightTextRef}
            className="absolute right-8 lg:right-16 xl:right-24 top-1/2 -translate-y-1/2 max-w-md text-left pointer-events-none"
            style={{ opacity: 0, willChange: "transform, opacity" }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-black/40">
              01
            </span>
            <h3 className="mt-3 text-3xl lg:text-5xl font-display tracking-[-0.03em] text-black">
              Dancing Shiva
            </h3>
            <p className="mt-5 text-base leading-relaxed text-black/50 max-w-sm">
              Vaikuntam&#39;s interpretation of Nataraja — the cosmic dancer
              rendered in his signature bold contours, channelling the rhythmic
              energy of Telangana&#39;s temple frieze traditions into sculptural
              form.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
