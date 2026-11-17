"use client";

import Image from "next/image";
import Link from "next/link";
import type { ConceptWork } from "@/components/gallery/views/types";
import { hsl, mix, useImageStats } from "@/components/gallery/views/imageStats";

const WHITE: [number, number, number] = [255, 255, 255];

/**
 * The collection sorted by colour: the quiet bronzes first, from dark to
 * light, then the painted works around the colour wheel. Each work sits on a
 * tint of its own colour, so the page reads as one continuous field.
 */
export default function Spectrum({ works }: { works: ConceptWork[] }) {
  const stats = useImageStats(works.map((w) => w.thumbnail));
  const ready = works.every((w) => stats[w.thumbnail] !== undefined);

  // Works with no signature colour (bronze, stone) lead, dark to light; the
  // painted ones follow around the wheel, starting at red so the browns lead in.
  const hue = (w: ConceptWork) => {
    const a = stats[w.thumbnail]?.accent;
    return a ? (hsl(a)[0] + 20) % 360 : null;
  };
  const ordered = ready
    ? [...works].sort((a, b) => {
        const ha = hue(a),
          hb = hue(b);
        if ((ha === null) !== (hb === null)) return ha === null ? -1 : 1;
        if (ha === null || hb === null)
          return (
            (stats[a.thumbnail]?.hsl[2] ?? 0) -
            (stats[b.thumbnail]?.hsl[2] ?? 0)
          );
        return ha - hb;
      })
    : works;

  return (
    <section>
      <div className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,48px)] pb-6 pt-[clamp(32px,5vh,56px)]">
        <h2 className="font-display text-[clamp(30px,4.4vw,56px)] leading-none">
          The collection by colour
        </h2>
        <p className="mt-3 max-w-[60ch] text-[14px] text-stone">
          Bronzes from dark to light, then the painted works around the colour
          wheel.
        </p>
      </div>
      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {ordered.map((w) => {
          const s = stats[w.thumbnail];
          return (
            <li key={w.slug}>
              <Link
                href={`/artworks/${w.slug}`}
                className="group relative block aspect-[4/5] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink"
                style={{
                  backgroundColor: s
                    ? mix(s.accent ?? s.rgb, WHITE, 0.6)
                    : "#f0f0f0",
                }}
              >
                <Image
                  unoptimized
                  src={w.thumbnail}
                  alt={w.title}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-contain p-[9%] transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                />
                <span className="absolute inset-x-3 bottom-2.5 truncate text-[12px] text-ink/80">
                  {w.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
