"use client";

import Link from "next/link";
import Image from "next/image";
import { initials, type Artist } from "@/lib/artists";

/**
 * Portrait (or initials) with name, birth and medium. Placeholders don't link.
 * Portraits are black and white until hovered on desktop (lg+), when they
 * ease into full colour over ~2s and the plate grows a little. Inside a [data-spotlight]
 * grid, every other artist goes dark meanwhile, so the hovered one is in
 * focus (styles in globals.css). No tilt.
 */
/** `compact`: name and birth only, for the home page. */
const ArtistTile = ({ artist, compact = false }: { artist: Artist; compact?: boolean }) => {
  const body = (
    <>
      <div
        className="artist-plate relative isolate grid aspect-square place-items-center overflow-hidden rounded-[14px] border border-rule bg-plate"
      >
        {artist.portrait ? (
          <Image
            src={artist.portrait}
            alt={artist.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover grayscale transition-[filter] duration-[2200ms] ease-[cubic-bezier(0.45,0,0.2,1)] lg:group-hover:grayscale-0"
          />
        ) : (
          <span
            aria-hidden
            className="font-display text-[42px] text-[#bdbdbd]"
          >
            {initials(artist.name)}
          </span>
        )}
      </div>
      <div className="artist-caption">
        <h3
          className={`text-[21px] leading-tight tracking-[0.04em] ${
            artist.placeholder ? "text-[#8a8a8a]" : ""
          }`}
        >
          {artist.name}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-stone">
          {compact
            ? artist.born
            : [artist.born, artist.place.split(",").pop()?.trim()].filter(Boolean).join(" · ")}
          {!compact && (
            <>
              <br />
              {artist.medium}
            </>
          )}
        </p>
        {artist.placeholder && (
          <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-[#a0a0a0]">
            Coming soon
          </span>
        )}
      </div>
    </>
  );

  return artist.placeholder ? (
    <div className="artist-tile grid gap-3.5">{body}</div>
  ) : (
    <Link
      href={`/artists/${artist.slug}`}
      className="artist-tile group grid gap-3.5"
    >
      {body}
    </Link>
  );
};

export default ArtistTile;
