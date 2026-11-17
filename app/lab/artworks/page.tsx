import type { Metadata } from "next";
import { sculptures } from "@/lib/sculptures";
import { getArtist, initials, publishedArtists } from "@/lib/artists";
import ArtworksCompare, {
  type LabWork,
} from "@/components/lab/ArtworksCompare";

// Internal comparison page: current Artworks page vs a premium direction.
// Not linked anywhere.
export const metadata: Metadata = {
  title: "Artworks — premium comparison",
  robots: { index: false, follow: false },
};

export default function ArtworksLab() {
  const works: LabWork[] = sculptures.map((w) => {
    const a = getArtist(w.artistSlug);
    return {
      slug: w.slug,
      title: w.title,
      thumbnail: w.thumbnail,
      year: w.year,
      material: w.material,
      dimensions: w.dimensions,
      edition: w.edition,
      artistSlug: w.artistSlug,
      artist: a?.name ?? "",
      artistMeta: a ? [a.born, a.place].filter(Boolean).join(", ") : "",
    };
  });
  const options = publishedArtists()
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      initials: initials(a.name),
      portrait: a.portrait,
      count: sculptures.filter((w) => w.artistSlug === a.slug).length,
    }))
    .filter((o) => o.count > 0);

  return <ArtworksCompare works={works} options={options} />;
}
