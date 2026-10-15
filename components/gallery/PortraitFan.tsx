import Link from "next/link";
import Image from "next/image";
import type { Artist } from "@/lib/artists";

/**
 * Artist portraits held like a hand of cards. At rest they fan slightly; when
 * the fan is hovered they spread wide, and the card under the pointer lifts
 * into colour and shows its name. Each card opens that artist.
 */
export default function PortraitFan({ artists }: { artists: Artist[] }) {
  const n = artists.length;
  const mid = (n - 1) / 2;
  return (
    <div className="group/fan relative mx-auto aspect-[5/4] w-full max-w-[460px]">
      {artists.map((a, i) => {
        const k = i - mid; // -2 … 2
        return (
          <Link
            key={a.slug}
            href={`/artists/${a.slug}`}
            aria-label={a.name}
            className="group/card absolute bottom-[6%] left-1/2 aspect-[4/5] w-[36%] origin-[50%_115%] overflow-hidden rounded-[12px] bg-[#1d1d1d] shadow-[0_18px_40px_-18px_rgba(0,0,0,.8)] ring-1 ring-white/15 transition-[rotate,translate,scale,box-shadow] duration-700 ease-[cubic-bezier(.3,.7,.3,1)] [rotate:var(--r)] [translate:var(--x)_var(--y)] hover:z-20 hover:scale-[1.08] hover:shadow-[0_26px_50px_-18px_rgba(0,0,0,.9)] group-hover/fan:[rotate:var(--r2)] group-hover/fan:[translate:var(--x2)_var(--y2)]"
            style={
              {
                zIndex: 10 - Math.abs(Math.round(k)),
                "--r": `${k * 6}deg`,
                "--x": `calc(-50% + ${k * 18}%)`,
                "--y": `${Math.abs(k) * 3}%`,
                "--r2": `${k * 11}deg`,
                "--x2": `calc(-50% + ${k * 52}%)`,
                "--y2": `${Math.abs(k) * 6}%`,
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
            <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 text-[12px] leading-tight tracking-[0.04em] text-white transition-transform duration-500 group-hover/card:translate-y-0">
              {a.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
