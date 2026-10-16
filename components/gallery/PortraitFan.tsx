import Link from "next/link";
import Image from "next/image";
import type { Artist } from "@/lib/artists";

/**
 * Artist portraits in an overlapping row, upright, spaced so part of every
 * face shows. Hovering the row spreads it wider; the card under the pointer
 * comes to the front, lifts, turns from black and white to colour and shows
 * its name. Each card opens that artist. Below md it becomes a swipeable row
 * with names shown.
 */
export default function PortraitFan({ artists }: { artists: Artist[] }) {
  const n = artists.length;
  const mid = (n - 1) / 2;
  return (
    <>
      {/* Phones: no hover, and the overlap crops faces, so a swipeable row of
          separate cards with the name under each. */}
      <ul className="-mx-[clamp(16px,4vw,40px)] flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[clamp(16px,4vw,40px)] px-[clamp(16px,4vw,40px)] pb-2 [scrollbar-width:none] md:hidden">
        {artists.map((a) => (
          <li key={a.slug} className="w-[40%] shrink-0 snap-start">
            <Link href={`/artists/${a.slug}`} className="grid gap-2.5">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-[12px] bg-[#1d1d1d] ring-1 ring-white/15">
                {a.portrait && (
                  <Image
                    src={a.portrait}
                    alt=""
                    fill
                    sizes="40vw"
                    className="object-cover grayscale transition-[filter] duration-500 active:grayscale-0"
                  />
                )}
              </span>
              <span className="text-[13px] leading-snug tracking-[0.04em] text-[#d0d0d0]">
                {a.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="group/fan relative mx-auto hidden aspect-[5/4] w-full max-w-[460px] md:block">
        {artists.map((a, i) => {
          const k = i - mid; // -2 … 2
          return (
            <Link
              key={a.slug}
              href={`/artists/${a.slug}`}
              aria-label={a.name}
              className="group/card absolute bottom-[6%] left-1/2 aspect-[4/5] w-[36%] overflow-hidden rounded-[12px] bg-[#1d1d1d] shadow-[0_18px_40px_-18px_rgba(0,0,0,.8)] ring-1 ring-white/15 transition-[translate,scale,box-shadow] duration-500 ease-[cubic-bezier(.3,.7,.3,1)] z-(--z) [translate:calc(-50%_+_var(--k)*40%)_0] group-hover/fan:[translate:calc(-50%_+_var(--k)*56%)_0] hover:z-20 hover:scale-[1.06] hover:shadow-[0_28px_50px_-18px_rgba(0,0,0,.9)] hover:ring-white/35"
              // Stacking goes through --z, not an inline z-index, so hover:z-20 can
              // bring the hovered card (and its name) to the front.
              style={
                {
                  "--z": 10 - Math.abs(Math.round(k)),
                  "--k": k,
                } as React.CSSProperties
              }
            >
              {a.portrait && (
                <Image
                  src={a.portrait}
                  alt=""
                  fill
                  sizes="180px"
                  className="object-cover grayscale transition-[filter] duration-500 group-hover/card:grayscale-0"
                />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 text-[12px] leading-tight tracking-[0.04em] text-white opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                {a.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
