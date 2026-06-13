"use client";

import Grainient from "@/components/Grainient";
import Hero from "@/components/Hero";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import SculptureCards from "@/components/SculptureCards";
import Footer from "@/components/Footer";
import { useRef, useState } from "react";
import { ScatterBoard } from "./components/scatter-board";

export default function Home() {
  const [imgZIndex, setImgZIndex] = useState<number[]>([
    1, 1, 2, 3, 3, 1, 1, 4, 1, 1, 1,
  ]);
  const zCounterRef = useRef(10);
  const [arrowVisible] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white font-sans text-foreground">
      <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none opacity-80">
        <Grainient
          color1="#ebebeb"
          color2="#d2c3a8"
          color3="#f2ece1"
          timeSpeed={0.85}
          colorBalance={-0.33}
          warpStrength={1}
          warpFrequency={2.5}
          warpSpeed={3}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={3.2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={1.05}
        />
      </div>

      <div id="sequence-trigger" className="relative">
        <Hero />
        <About />
      </div>

      <ScatterBoard
        imgZIndex={imgZIndex}
        setImgZIndex={setImgZIndex}
        zCounterRef={zCounterRef}
        arrowVisible={arrowVisible}
        setBursts={setBursts}
        bursts={bursts}
      />

      <SculptureCards />

      <div className="bg-linear-to-b from-transparent to-background">
        <FAQ />
        <Contact />
      </div>

      <Footer />
    </div>
  );
}
