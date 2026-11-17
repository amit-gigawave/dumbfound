import type { Metadata } from "next";
import { sculptures } from "@/lib/sculptures";
import { catalogueOrder } from "@/lib/catalogue-order";
import { getArtist, initials, publishedArtists } from "@/lib/artists";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import type { ArtistOption } from "@/components/gallery/ArtistFilter";
import ArtistPills from "@/components/gallery/ArtistPills";
import ShuffleGrid from "@/components/gallery/ShuffleGrid";
import SectionHeader from "@/components/gallery/SectionHeader";
import PageHeader from "@/components/PageHeader";
import ViewSwitch, { parseView } from "@/components/gallery/ViewSwitch";
import Spotlight from "@/components/gallery/views/Spotlight";
import TrueScale from "@/components/gallery/views/TrueScale";
import { conceptWorks } from "@/lib/concept-works";

/** Height of the site header above every page. */
const HEADER_PX = 85;

export const metadata: Metadata = {
  title: "Artworks",
  description:
    "Every work in the collection, with its artist, year and medium where known.",
};

export default async function ArtworksPage({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string; view?: string }>;
}) {
  const { artist: artistSlug, view: viewParam } = await searchParams;
  const view = parseView(viewParam);

  // Spotlight and True scale fill the screen, in place of the big header. The
  // floating switch sits outside <main>: its page-in animation would otherwise
  // make it the containing block of a fixed element.
  if (view !== "cards") {
    const all = conceptWorks();
    return (
      <>
        <main>
          <h1 className="sr-only">Artworks</h1>
          {view === "spotlight" ? (
            <Spotlight works={all} offset={HEADER_PX} />
          ) : (
            <TrueScale
              works={all}
              unsized={all.filter((w) => !w.heightCm).length}
            />
          )}
        </main>
        <ViewSwitch current={view} />
      </>
    );
  }

  const selected = artistSlug ? getArtist(artistSlug) : undefined;
  const works = catalogueOrder(
    selected
      ? sculptures.filter((w) => w.artistSlug === selected.slug)
      : sculptures,
  );
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
    <>
      <main>
        <PageHeader
          label="The collection"
          title="Artworks"
          line="Each work is presented as in a catalogue. Open any piece to read about its maker, its material and its story."
        />
        <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(40px,6vw,72px)]">
          {options.length > 1 && (
            <nav aria-label="Filter by artist" className="mb-8">
              <ArtistPills
                options={options}
                selected={selected?.slug}
                total={sculptures.length}
              />
            </nav>
          )}
          <SectionHeader
            title={selected ? `Works by ${selected.name}` : "All artworks"}
          />
          {/* Choosing an artist shuffles the cards: the ones that stay glide to their new places. */}
          <ShuffleGrid
            data-reveal-stagger
            className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3"
          >
            {works.map((work, i) => (
              <div key={work.slug} data-key={work.slug}>
                <ArtworkTile work={work} priority={i < 3} showcase ambient />
              </div>
            ))}
          </ShuffleGrid>
        </div>
      </main>
      <ViewSwitch current={view} />
    </>
  );
}
