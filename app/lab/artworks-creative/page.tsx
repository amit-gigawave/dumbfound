import type { Metadata } from "next";
import Link from "next/link";
import { conceptWorks } from "@/lib/concept-works";
import Spotlight from "@/components/gallery/views/Spotlight";
import Procession from "@/components/lab/creative/Procession";
import TrueScale from "@/components/gallery/views/TrueScale";
import Spectrum from "@/components/lab/creative/Spectrum";

// Internal page: creative takes on the Artworks grid. Not linked anywhere.
// Switch with ?v=spotlight|procession|scale|spectrum.
export const metadata: Metadata = {
  title: "Artworks: creative concepts",
  robots: { index: false, follow: false },
};

const CONCEPTS = [
  { id: "spotlight", name: "Spotlight" },
  { id: "procession", name: "Procession" },
  { id: "scale", name: "True scale" },
  { id: "spectrum", name: "Spectrum" },
] as const;
type ConceptId = (typeof CONCEPTS)[number]["id"];

export default async function ArtworksCreativeLab({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const current: ConceptId = CONCEPTS.some((c) => c.id === v)
    ? (v as ConceptId)
    : "spotlight";

  const works = conceptWorks();

  return (
    <main className="relative">
      {current === "spotlight" && <Spotlight works={works} />}
      {current === "procession" && <Procession works={works} />}
      {current === "scale" && (
        <TrueScale
          works={works}
          unsized={works.filter((w) => !w.heightCm).length}
        />
      )}
      {current === "spectrum" && <Spectrum works={works} />}

      {/* Concept switcher, out of the way at the bottom of the screen. */}
      <nav
        aria-label="Concept"
        className="fixed bottom-4 left-1/2 z-[60] flex max-w-[calc(100vw-32px)] -translate-x-1/2 gap-1 overflow-x-auto rounded-full bg-white/85 p-1 shadow-[0_6px_24px_-8px_rgba(0,0,0,0.3)] backdrop-blur [scrollbar-width:none]"
      >
        {CONCEPTS.map((c) => (
          <Link
            key={c.id}
            href={`?v=${c.id}`}
            aria-current={c.id === current ? "page" : undefined}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              c.id === current
                ? "bg-ink text-paper"
                : "text-stone hover:text-ink"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </nav>
    </main>
  );
}
