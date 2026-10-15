"use client";

import Link from "next/link";
import Image from "next/image";
import { initials, type Artist } from "@/lib/artists";

/**
 * Portrait (or initials) with name, birth and medium. Placeholders don't link.
 * Portraits are black and white until hovered, when they ease into full
 * colour over ~2s and zoom in slowly inside the plate, while a soft pool of
 * light follows the cursor. The plate itself stays still (no lift or tilt).
 */

/** Moves the spotlight to the cursor (mouse and pen; touch has no hover). */
const spot = (e: React.PointerEvent<HTMLElement>) => {
  if (e.pointerType === "touch") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
};

const ArtistTile = ({ artist }: { artist: Artist }) => {
  const body = (
    <>
      <div
        onPointerMove={artist.portrait ? spot : undefined}
        className="relative isolate grid aspect-square place-items-center overflow-hidden rounded-[14px] border border-rule bg-plate"
      >
        {artist.portrait ? (
          <>
            <Image
              src={artist.portrait}
              alt={artist.name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover grayscale transition-[filter,scale] duration-[2200ms] ease-[cubic-bezier(0.45,0,0.2,1)] group-hover:grayscale-0 motion-safe:group-hover:scale-[1.06]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle 140px at var(--spot-x, 50%) var(--spot-y, 40%), rgba(255,255,255,0.75), rgba(255,255,255,0) 70%), radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 40%), transparent 30%, rgba(0,0,0,0.35))",
              }}
            />
          </>
        ) : (
          <span
            aria-hidden
            className="font-display text-[42px] text-[#bdbdbd]"
          >
            {initials(artist.name)}
          </span>
        )}
      </div>
      <div>
        <h3
          className={`text-[21px] leading-tight tracking-[0.04em] ${
            artist.placeholder ? "text-[#8a8a8a]" : ""
          }`}
        >
          {artist.name}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-stone">
          {[artist.born, artist.place.split(",").pop()?.trim()].filter(Boolean).join(" · ")}
          <br />
          {artist.medium}
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
    <div className="grid gap-3.5">{body}</div>
  ) : (
    <Link
      href={`/artists/${artist.slug}`}
      className="group grid gap-3.5"
    >
      {body}
    </Link>
  );
};

export default ArtistTile;
