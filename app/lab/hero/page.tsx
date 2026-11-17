import type { Metadata } from "next";
import { publishedArtists } from "@/lib/artists";
import { sculptures } from "@/lib/sculptures";
import HeroConcepts from "@/components/lab/HeroConcepts";

// Internal comparison page for typographic hero ideas — not linked anywhere.
export const metadata: Metadata = {
  title: "Hero — typography concepts",
  robots: { index: false, follow: false },
};

export default function HeroLab() {
  const artists = publishedArtists();
  return (
    <HeroConcepts
      names={artists.map((a) => a.name)}
      media={[...new Set(artists.flatMap((a) => a.medium.split(/,\s*/)))].slice(
        0,
        10,
      )}
      counts={{ artists: artists.length, works: sculptures.length }}
    />
  );
}
