import Link from "next/link";
import Image from "next/image";
import type { Artist } from "@/lib/artists";

/**
 * A slow, endless row of artist portraits. The list is doubled, so sliding by
 * half (portrait-marquee) is exactly one copy and the loop is seamless. It
 * pauses under the pointer; visitors who prefer reduced motion get a row they
 * can scroll instead.
 */
export default function ArtistMarquee({ artists }: { artists: Artist[] }) {
  const row = (copy: number) =>
    artists.map((a) => (
      <li key={`${copy}-${a.slug}`} aria-hidden={copy > 0 || undefined}>
        <Link
          href={`/artists/${a.slug}`}
          tabIndex={copy > 0 ? -1 : undefined}
          className="group/card grid w-[clamp(140px,15vw,200px)] gap-3"
        >
          <span className="relative block aspect-[4/5] overflow-hidden rounded-[12px] bg-plate">
            <Image
              src={a.portrait!}
              alt=""
              fill
              sizes="200px"
              className="object-cover grayscale transition-[filter,scale] duration-700 ease-[cubic-bezier(.3,.7,.3,1)] group-hover/card:scale-[1.04] group-hover/card:grayscale-0"
            />
          </span>
          <span className="text-[13px] tracking-[0.03em] text-stone transition-colors group-hover/card:text-accent">
            {a.name}
          </span>
        </Link>
      </li>
    ));

  return (
    <div className="group/row overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] motion-reduce:overflow-x-auto">
      <ul
        aria-label="Artists"
        className="flex w-max gap-[clamp(16px,2vw,28px)] pr-[clamp(16px,2vw,28px)] animate-[portrait-marquee_70s_linear_infinite] group-hover/row:[animation-play-state:paused] motion-reduce:animate-none"
      >
        {row(0)}
        {row(1)}
      </ul>
    </div>
  );
}
