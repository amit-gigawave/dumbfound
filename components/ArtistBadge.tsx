import Image from "next/image";
import type { Artist } from "@/lib/sculptures";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Avatar (or initials) + artist name, Sketchfab-style. */
const ArtistBadge = ({
  artist,
  size = "sm",
  accent,
}: {
  artist: Artist;
  size?: "sm" | "md";
  accent?: string;
}) => {
  const dim = size === "md" ? 40 : 24;
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {artist.avatar ? (
        <Image
          src={artist.avatar}
          alt=""
          width={dim}
          height={dim}
          className="shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex shrink-0 items-center justify-center rounded-full font-medium text-white"
          style={{
            width: dim,
            height: dim,
            fontSize: size === "md" ? 13 : 9,
            background: accent ?? "#151415",
          }}
        >
          {initials(artist.name)}
        </span>
      )}
      <span
        className={`truncate text-black/70 ${size === "md" ? "text-sm font-medium" : "text-xs"}`}
      >
        {artist.name}
      </span>
    </span>
  );
};

export default ArtistBadge;
