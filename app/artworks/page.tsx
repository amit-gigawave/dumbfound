import type { Metadata } from "next";
import Link from "next/link";
import { sculptures } from "@/lib/sculptures";
import { getArtist, publishedArtists } from "@/lib/artists";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import SectionHeader from "@/components/gallery/SectionHeader";

export const metadata: Metadata = {
  title: "Artworks",
  description:
    "Every work in the collection, with its artist, year and medium.",
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
  const filters = publishedArtists();

  const filterLink = (href: string, label: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border-b pb-0.5 transition-colors ${
        active
          ? "border-ink text-ink"
          : "border-transparent text-stone hover:text-accent"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(48px,7vw,88px)]">
      <span className="label">The collection</span>
      <p className="font-text mb-10 mt-4 max-w-[56ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
        Each work is presented as in a catalogue. Open any piece to read about
        its maker, its material and its story.
      </p>

      {filters.length > 1 && (
        <nav
          aria-label="Filter by artist"
          className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm"
        >
          {filterLink("/artworks", "All artists", !selected)}
          {filters.map((a) =>
            filterLink(
              `/artworks?artist=${a.slug}`,
              a.name,
              selected?.slug === a.slug,
            ),
          )}
        </nav>
      )}

      <SectionHeader
        title={selected ? `Works by ${selected.name}` : "All artworks"}
        as="h1"
      />
      <div
        data-reveal-stagger
        className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
      >
        {works.map((work, i) => (
          <ArtworkTile key={work.slug} work={work} priority={i < 3} />
        ))}
      </div>
    </main>
  );
}
