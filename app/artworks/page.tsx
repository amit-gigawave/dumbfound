import type { Metadata } from "next";
import { sculptures } from "@/lib/sculptures";
import { getArtist, initials, publishedArtists } from "@/lib/artists";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import ArtistFilter, {
  type ArtistOption,
} from "@/components/gallery/ArtistFilter";
import SectionHeader from "@/components/gallery/SectionHeader";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Artworks",
  description:
    "Every work in the collection, with its artist, year and medium where known.",
};

export default async function ArtworksPage({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string }>;
}) {
  const { artist: artistSlug } = await searchParams;
  const selected = artistSlug ? getArtist(artistSlug) : undefined;
  const works = selected
    ? sculptures.filter((w) => w.artistSlug === selected.slug)
    : sculptures;
  // Only artists with works listed, so no choice leads to an empty grid.
  const options: ArtistOption[] = publishedArtists()
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      initials: initials(a.name),
      portrait: a.portrait,
      count: sculptures.filter((w) => w.artistSlug === a.slug).length,
    }))
    .filter((o) => o.count > 0);

  return (
    <main>
      <PageHeader
        label="The collection"
        title="Artworks"
        line="Each work is presented as in a catalogue. Open any piece to read about its maker, its material and its story."
      />
      <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(40px,6vw,72px)]">
        <SectionHeader
          title={selected ? `Works by ${selected.name}` : "All artworks"}
          action={
            options.length > 1 && (
              <nav aria-label="Filter by artist" className="w-full sm:w-auto">
                <ArtistFilter
                  options={options}
                  selected={selected?.slug}
                  total={sculptures.length}
                />
              </nav>
            )
          }
        />
        <div
          data-reveal-stagger
          className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3"
        >
          {works.map((work, i) => (
            <ArtworkTile
              key={work.slug}
              work={work}
              priority={i < 3}
              showcase
              ambient
            />
          ))}
        </div>
      </div>
    </main>
  );
}
