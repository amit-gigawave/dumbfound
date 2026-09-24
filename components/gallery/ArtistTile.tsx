import Link from "next/link";
import Image from "next/image";
import { initials, type Artist } from "@/lib/artists";

/** Portrait (or initials) with name, birth and medium. Placeholders don't link. */
const ArtistTile = ({ artist }: { artist: Artist }) => {
  const body = (
    <>
      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden border border-rule bg-plate">
        {artist.portrait ? (
          <Image
            src={artist.portrait}
            alt={artist.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover grayscale-[0.15] transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <span aria-hidden className="font-display text-[42px] text-[#b6afa3]">
            {initials(artist.name)}
          </span>
        )}
      </div>
      <div>
        <h3
          className={`text-[21px] leading-tight transition-colors ${
            artist.placeholder ? "text-[#8a857c]" : "group-hover:text-accent"
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
          <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-[#a39e94]">
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
