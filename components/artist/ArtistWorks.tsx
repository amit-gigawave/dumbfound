"use client";

import { useState } from "react";
import type { Sculpture } from "@/lib/sculptures";
import type { ConceptWork } from "../gallery/views/types";
import ArtworkTile from "../gallery/ArtworkTile";
import ToScaleShelf from "../home/ToScaleShelf";

/** Works shown before "See all". */
const FIRST = 8;

/**
 * An artist's works: the catalogue grid ("Same size"), or the works with a
 * recorded height standing on one shelf at their real heights ("To scale").
 */
export default function ArtistWorks({
  works,
  sized,
}: {
  works: Sculpture[];
  /** The same works as plain data, those with a height only. */
  sized: ConceptWork[];
}) {
  const [view, setView] = useState<"same" | "scale">("same");
  const [all, setAll] = useState(works.length <= FIRST);
  const shown = all ? works : works.slice(0, FIRST);
  const unsized = works.length - sized.length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="flex flex-wrap items-baseline gap-x-7 gap-y-1">
          <h2 className="font-display text-[clamp(34px,3.1vw,44px)] leading-[1.2]">
            Works
          </h2>
          <p className="text-[14px] text-stone">
            {works.length} in the collection
          </p>
        </div>
        {sized.length > 1 && (
          <div
            role="group"
            aria-label="Show the works"
            className="flex rounded-full bg-plate p-1 text-[14px]"
          >
            {(
              [
                ["same", "Same size"],
                ["scale", "To scale"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => setView(id)}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  view === id
                    ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                    : "text-stone hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "same" ? (
        <>
          <div className="mt-[clamp(32px,3.5vw,48px)] grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-7 lg:grid-cols-4">
            {shown.map((work, i) => (
              // Phones show the first four until "See all".
              <div key={work.slug} className={!all && i >= 4 ? "hidden lg:block" : undefined}>
                <ArtworkTile
                  work={work}
                  showArtist={false}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </div>
            ))}
          </div>
          {!all && (
            <button
              type="button"
              onClick={() => setAll(true)}
              className="mt-[clamp(40px,5vw,72px)] w-full rounded-[2px] border border-ink px-5 py-3 text-[14px] transition-colors hover:bg-ink hover:text-white sm:w-auto"
            >
              See all {works.length} works
            </button>
          )}
        </>
      ) : (
        <div className="mt-[clamp(150px,13vw,190px)]">
          <ToScaleShelf works={sized} />
          {unsized > 0 && (
            <p className="mt-6 text-[13px] text-stone">
              {unsized === 1
                ? "1 work has no recorded height, so it isn't on the shelf."
                : `${unsized} works have no recorded height, so they aren't on the shelf.`}
            </p>
          )}
        </div>
      )}
    </>
  );
}
