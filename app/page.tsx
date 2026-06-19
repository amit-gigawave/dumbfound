"use client";

import Grainient from "@/components/Grainient";
import Hero from "@/components/Hero";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import SculptureCards from "@/components/SculptureCards";
import Marquee from "@/components/Marquee";
import ParticleField from "@/components/ParticleField";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden page-gradient font-sans text-foreground">
      <ParticleField />

      <div id="sequence-trigger" className="relative">
        <Hero />
      </div>

      {/* <ScatterBoard
        imgZIndex={imgZIndex}
        setImgZIndex={setImgZIndex}
        zCounterRef={zCounterRef}
        arrowVisible={arrowVisible}
        setBursts={setBursts}
        bursts={bursts}
      /> */}

      <SculptureCards />

      {/* <Marquee /> */}

      <About />

      <div className="bg-linear-to-b from-transparent to-background">
        <FAQ />
        <Contact />
      </div>

      {/* <Footer /> */}
    </div>
  );
}
