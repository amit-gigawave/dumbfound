"use client";

import dynamic from "next/dynamic";

const ScrollFloat = dynamic(() => import("./ScrollFloat"), { ssr: false });

const stats = [
  { value: "150+", label: "Sculptures installed" },
  { value: "30+", label: "Global clients" },
  { value: "15", label: "Years in practice" },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative z-20 overflow-hidden bg-transparent px-6 py-24 text-black lg:px-16"
    >
      <div className="relative mx-auto max-w-7xl flex flex-col items-center justify-center">
        <div className="max-w-4xl">
          <p className="mb-5 text-[10px] uppercase tracking-[0.42em] text-black/60">
            About The Studio
          </p>
          <ScrollFloat
            containerClassName="text-left"
            textClassName="font-display block text-4xl font-medium tracking-[-0.03em] text-black sm:text-5xl lg:text-[3.5rem] leading-[1.1]"
          >
            Precision That Reveals Itself On Scroll
          </ScrollFloat>
          <p className="mt-6 max-w-2xl text-base leading-8 text-black/80 sm:text-lg text-center mx-auto">
            Each principle enters only when the page has room for it. The
            section keeps its natural height, and the story unfolds in thirds
            instead of arriving as one crowded slab.
          </p>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.35rem] border border-white/60 bg-white/40 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:bg-white/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
              >
                <div className="font-display text-3xl text-black">
                  {stat.value}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.26em] text-black/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
