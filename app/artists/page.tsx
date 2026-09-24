import type { Metadata } from "next";
import { artists } from "@/lib/artists";
import ArtistTile from "@/components/gallery/ArtistTile";
import SectionHeader from "@/components/gallery/SectionHeader";

export const metadata: Metadata = {
  title: "Artists",
  description: "The artists presented by the gallery.",
};

export default function ArtistsPage() {
  // Real artists alphabetically, placeholders after them.
  const ordered = [...artists].sort(
    (a, b) => Number(!!a.placeholder) - Number(!!b.placeholder) || a.name.localeCompare(b.name),
  );

  return (
    <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(48px,7vw,88px)]">
      <span className="label">The artists</span>
      <p className="font-text mb-14 mt-4 max-w-[56ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
        Established names and new voices, across every medium — each presented with their
        story, in their own words.
      </p>
      <SectionHeader title="Artists" as="h1" />
      <div className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {ordered.map((artist) => (
          <ArtistTile key={artist.slug} artist={artist} />
        ))}
      </div>
    </main>
  );
}
