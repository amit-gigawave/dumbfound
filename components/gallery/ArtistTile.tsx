import Link from "next/link";
import Image from "next/image";
import { initials, type Artist } from "@/lib/artists";

/**
 * Portrait (or initials) with name, birth and medium. Placeholders don't link.
 * Hover is deliberately slow: the portrait eases in over ~2s and a thin
 * mount-style frame fades in.
 */
const ArtistTile = ({ artist }: { artist: Artist }) => {
  const body = (
    <>
      <div className="relative isolate grid aspect-square place-items-center overflow-hidden rounded-[14px] border border-rule bg-plate transition-colors duration-[1800ms] ease-[cubic-bezier(0.45,0,0.2,1)] group-hover:bg-[#e8e8e8]">
        {artist.portrait ? (
          <Image
            src={artist.portrait}
            alt={artist.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover grayscale-[0.6] transition-[transform,filter] duration-[2200ms] ease-[cubic-bezier(0.45,0,0.2,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        ) : (
          <span
            aria-hidden
            className="font-display text-[42px] text-[#bdbdbd] transition-transform duration-[2200ms] ease-[cubic-bezier(0.45,0,0.2,1)] group-hover:scale-110"
          >
            {initials(artist.name)}
          </span>
        )}
        {!artist.placeholder && (
          // Thin mount-style frame that fades in on hover
          <span
            aria-hidden
            className="pointer-events-none absolute inset-2.5 scale-[1.03] rounded-[6px] border border-paper/80 opacity-0 transition-[opacity,transform] duration-[1800ms] ease-[cubic-bezier(0.45,0,0.2,1)] group-hover:scale-100 group-hover:opacity-100"
          />
        )}
      </div>
      <div>
        <h3
          className={`text-[21px] leading-tight tracking-[0.04em] transition-colors duration-[1200ms] ease-[cubic-bezier(0.45,0,0.2,1)] ${
            artist.placeholder ? "text-[#8a8a8a]" : "group-hover:text-accent"
          }`}
        >
          {artist.name}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-stone">
          {artist.born} · {artist.place.split(",").pop()?.trim()}
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
    <Link href={`/artists/${artist.slug}`} className="group grid gap-3.5">
      {body}
    </Link>
  );
};

export default ArtistTile;
