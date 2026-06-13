"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 0.9,
      lerp: 0.085,
      anchors: {
        offset: -96,
      },
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const refreshTimeout = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      window.clearTimeout(refreshTimeout);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
