"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Hand } from "lucide-react";
import type { Sculpture } from "@/lib/sculptures";
import BlurText from "./BlurText";
import ARButton from "./ARButton";

const SculptureScene = dynamic(() => import("./SculptureScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-black/40" />
    </div>
  ),
});

const SculptureViewer = ({ sculpture }: { sculpture: Sculpture }) => {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden page-gradient lg:h-screen lg:overflow-hidden">
      {/* Accent ambience */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(70% 70% at 70% 45%, ${sculpture.accent}20 0%, ${sculpture.accent}0a 40%, transparent 75%)`,
        }}
      />

      {/* Back button */}
      <Link
        href="/gallery"
        className="absolute left-6 top-24 z-30 inline-flex items-center gap-2 rounded-full bg-white/50 px-5 py-2.5 text-sm font-medium text-black/70 ring-1 ring-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/70 hover:text-black md:left-12"
      >
        <ArrowLeft size={16} />
        Gallery
      </Link>

      <div className="relative z-10 mx-auto flex h-full min-h-screen max-w-7xl flex-col-reverse lg:min-h-0 lg:flex-row lg:items-stretch">
        {/* Info column — never overlaps the sculpture */}
        <div className="flex flex-col justify-center px-6 pb-14 pt-6 md:px-12 lg:w-[40%] lg:py-0 lg:pr-6">
          <span
            className="text-[11px] uppercase tracking-[0.4em]"
            style={{ color: sculpture.accent }}
          >
            {sculpture.subtitle} · {sculpture.year}
          </span>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-black md:text-6xl">
            <BlurText
              key={sculpture.slug}
              text={sculpture.title}
              animateBy="letters"
              delay={55}
              stepDuration={0.4}
            />
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-black/55">
            {sculpture.description}
          </p>

          <div className="mt-8">
            <ARButton sculpture={sculpture} />
          </div>

          <div className="mt-8 h-px w-16 bg-black/10" />

          <span className="mt-6 text-[10px] uppercase tracking-[0.35em] text-black/40">
            {sculpture.material}
          </span>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-black/45">
            <span className="inline-flex items-center gap-1.5">
              <Hand size={13} /> Drag to rotate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <RotateCcw size={13} /> Right-drag to pan
            </span>
          </div>
        </div>

        {/* Canvas column — sculpture has the full stage to itself */}
        <div className="relative h-[60vh] min-h-[360px] w-full lg:h-full lg:flex-1">
          <SculptureScene
            url={sculpture.modelUrl}
            offsetX={sculpture.offsetX}
            offsetY={sculpture.offsetY}
            defaultZoom={sculpture.defaultZoom}
            interactive
          />
        </div>
      </div>
    </main>
  );
};

export default SculptureViewer;
