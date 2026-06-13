"use client";

import { useRef } from "react";
import BlurText from "./BlurText";

export default function Hero() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <section
      id="home"
      ref={scrollContainerRef}
      className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden py-0 pointer-events-none"
    >
      <video
        className="absolute inset-0 w-full h-full object-cover -z-10 pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_162107_3cd240af-dff4-4396-b8b7-22e25c9adb1c.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto px-6 text-white gap-7 mt-16">
        <h1 className="text-[clamp(36px,4.4vw,72px)] leading-[0.95] tracking-[-0.022em] font-normal m-0 text-white text-center w-full">
          <span className="font-sans block">
            <BlurText
              text="DUMBFOUND SCULPTURE STUDIO"
              startDelay={200}
              delay={50}
              animateBy="words"
              direction="top"
              className="font-medium"
            />
          </span>
          <span className="mt-[0.2em] block">
            <span className="font-serif italic text-[1.14em] tracking-[-0.01em] mr-[0.25em]">
              <BlurText
                text="Elevating modern spaces"
                startDelay={800}
                delay={50}
                animateBy="words"
                direction="top"
                className=""
              />
            </span>
            <span className="font-sans">
              <BlurText
                text="through"
                startDelay={1000}
                delay={50}
                animateBy="words"
                direction="top"
                className="font-normal"
              />
            </span>
          </span>
          <span className="mt-[0.2em] font-sans block">
            <BlurText
              text="the silent poetry of timeless form."
              startDelay={1200}
              delay={50}
              animateBy="words"
              direction="top"
              className="font-normal"
            />
          </span>
        </h1>
        <div className="pointer-events-auto mt-7">
          <button className="bg-white text-black px-[25px] py-[15px] text-[13px] font-semibold rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:scale-105 hover:shadow-[0_15px_40px_rgba(255,255,255,0.15)] transition-all duration-300">
            Explore Our Work
          </button>
        </div>
      </div>
    </section>
  );
}
