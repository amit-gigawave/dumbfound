import type { Metadata } from "next";
import { artists } from "@/lib/artists";
import ArtistTile from "@/components/gallery/ArtistTile";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Artists",
  description: "The artists presented by the gallery.",
};

export default function ArtistsPage() {
  // Real artists alphabetically, placeholders after them.
  const ordered = [...artists].sort(
    (a, b) =>
      Number(!!a.placeholder) - Number(!!b.placeholder) ||
      a.name.localeCompare(b.name),
  );

  return (
    <main>
      <PageHeader
        label="The artists"
        title="Artists"
        line="Established names and new voices, across every medium — each presented with their story, in their own words."
      />
      <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(40px,6vw,72px)]">
        <div
          data-reveal-stagger
          data-spotlight
          className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {ordered.map((artist) => (
            <ArtistTile key={artist.slug} artist={artist} />
          ))}
        </div>
      </div>
    </main>
  );
}
