"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Sculpture } from "@/lib/sculptures";
import BlurText from "./BlurText";

const SculptureScene = dynamic(() => import("./SculptureScene"), {
  ssr: false,
});

const SculpturePreviewCard = ({
  sculpture,
  index,
}: {
  sculpture: Sculpture;
  index: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05, rootMargin: "25% 0px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      ref={ref}
      href={`/gallery/${sculpture.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white/40 ring-1 ring-black/5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)] hover:ring-black/10"
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className="relative h-[340px] w-full overflow-hidden">
        {/* Accent stage backdrop */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(120% 90% at 50% 30%, ${sculpture.accent}26 0%, ${sculpture.accent}12 35%, transparent 70%)`,
          }}
        />
        {isVisible ? (
          <SculptureScene
            url={sculpture.modelUrl}
            offsetX={sculpture.offsetX}
            offsetY={sculpture.offsetY}
            defaultZoom={sculpture.defaultZoom}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black/30" />
          </div>
        )}

        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:rotate-0 -rotate-45">
          <ArrowUpRight size={18} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-black/5 px-6 py-5">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-black/40">
            {sculpture.subtitle}
          </span>
          <h3 className="mt-1 font-display text-2xl tracking-[-0.02em] text-black">
            <BlurText
              text={sculpture.title}
              animateBy="words"
              delay={80}
              stepDuration={0.4}
            />
          </h3>
        </div>
        <span className="shrink-0 text-[11px] uppercase tracking-[0.25em] text-black/40">
          {sculpture.material}
        </span>
      </div>
    </Link>
  );
};

export default SculpturePreviewCard;
