import Link from "next/link";
import Image from "next/image";
import type { Sculpture } from "@/lib/sculptures";
import { getArtist } from "@/lib/artists";

/**
 * Catalogue tile: the work framed on a plate, captioned
 * ARTIST / Title / year · medium. Used on the home page, the artworks grid and
 * artist pages (where the artist line is hidden).
 */
const ArtworkTile = ({
  work,
  showArtist = true,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  work: Sculpture;
  showArtist?: boolean;
  priority?: boolean;
  sizes?: string;
}) => {
  const artist = getArtist(work.artistSlug);
  return (
    <Link href={`/artworks/${work.slug}`} className="group grid gap-3.5">
      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden border border-rule bg-plate">
        <Image
          src={work.thumbnail}
          alt={`${work.title}${artist ? ` by ${artist.name}` : ""}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-[6%] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        />
      </div>
      <div className="grid gap-0.5">
        {showArtist && artist && <span className="label">{artist.name}</span>}
        <span className="font-display text-xl italic leading-snug transition-colors group-hover:text-accent">
          {work.title}
        </span>
        <span className="text-[13px] text-stone">
          {work.year} · {work.material}
        </span>
      </div>
    </Link>
  );
};

export default ArtworkTile;
