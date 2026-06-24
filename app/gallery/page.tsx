import type { Metadata } from "next";
import { sculptures } from "@/lib/sculptures";
import SculpturePreviewCard from "@/components/SculpturePreviewCard";
import BlurText from "@/components/BlurText";

export const metadata: Metadata = {
  title: "Gallery | Thota Vaikuntam Sculptures",
  description:
    "Browse the full collection of Thota Vaikuntam's sculptures in interactive 3D. Click any piece to explore it up close.",
};

export default function GalleryPage() {
  return (
    <main className="relative min-h-screen page-gradient font-sans text-foreground">
      <section className="mx-auto max-w-7xl px-6 pb-32 pt-36 md:px-12 md:pt-44">
        <header className="mb-16 max-w-2xl">
          <span className="text-[11px] uppercase tracking-[0.45em] text-black/40">
            The Collection
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-[-0.03em] text-black md:text-7xl">
            <span className="block">
              <BlurText
                text="Sculptures in"
                animateBy="words"
                delay={120}
                stepDuration={0.4}
              />
            </span>
            <span className="block">
              <BlurText
                text="three dimensions"
                animateBy="words"
                delay={120}
                startDelay={350}
                stepDuration={0.4}
              />
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-black/50">
            Each piece is a fully interactive 3D model. Select a sculpture to
            rotate and study it from every angle.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sculptures.map((sculpture, index) => (
            <SculpturePreviewCard
              key={sculpture.slug}
              sculpture={sculpture}
              index={index}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
