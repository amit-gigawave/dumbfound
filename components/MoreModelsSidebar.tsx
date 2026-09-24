"use client";

import Link from "next/link";
import Image from "next/image";
import type { Sculpture } from "@/lib/sculptures";
import { preloadModel } from "./three/modelLoader";
import { formatCount } from "@/lib/utils";

/**
 * "More models" list. Vertical and sticky beside the viewer on desktop; a
 * horizontal snap-scroll row on mobile. Hover/touch preloads the model so the
 * next page opens instantly.
 */
const MoreModelsSidebar = ({
  sculptures,
  heading,
}: {
  sculptures: Sculpture[];
  heading: string;
}) => {
  if (sculptures.length === 0) return null;

  return (
    <aside aria-label={heading} className="min-w-0 lg:sticky lg:top-28">
      <h2 className="mb-4 text-[11px] uppercase tracking-[0.3em] text-black/45">
        {heading}
      </h2>
      <ul className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 lg:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0">
        {sculptures.map((s) => (
          <li key={s.slug} className="w-40 shrink-0 snap-start lg:w-auto">
            <Link
              href={`/gallery/${s.slug}`}
              onPointerEnter={() => preloadModel(s.modelUrl)}
              onFocus={() => preloadModel(s.modelUrl)}
              className="group flex flex-col gap-2 rounded-xl p-1.5 transition-colors hover:bg-black/[0.04] lg:flex-row lg:items-center lg:gap-3"
            >
              <span
                className="relative block aspect-[4/5] w-full shrink-0 overflow-hidden rounded-lg lg:w-20"
                style={{
                  background: `radial-gradient(120% 90% at 50% 30%, ${s.accent}30 0%, ${s.accent}10 45%, transparent 75%)`,
                }}
              >
                <Image
                  src={s.thumbnail}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 80px, 160px"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-base text-black">
                  {s.title}
                </span>
                <span className="block truncate text-xs text-black/50">
                  {s.artist.name}
                </span>
                <span className="mt-0.5 block text-[10px] uppercase tracking-[0.15em] text-black/35">
                  {s.material} · {formatCount(s.stats.triangles)} tris
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default MoreModelsSidebar;
