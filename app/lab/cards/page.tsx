import type { Metadata } from "next";
import Link from "next/link";
import { sculptures } from "@/lib/sculptures";
import { catalogueOrder, groupByForm } from "@/lib/catalogue-order";
import { getArtist, publishedArtists } from "@/lib/artists";
import ArtworkTile from "@/components/gallery/ArtworkTile";

// Internal comparison page for the artwork card: the live card vs a wall-label
// card with a height line and an always-visible 3D badge. Not linked anywhere.
export const metadata: Metadata = {
  title: "Artwork cards — comparison",
  robots: { index: false, follow: false },
};

type Card = "live" | "label";

const pill = (on: boolean) =>
  `rounded-full px-4 py-2 text-[13px] transition-colors ${
    on ? "bg-ink text-paper" : "text-stone hover:text-ink"
  }`;

export default async function CardsLab({
  searchParams,
}: {
  searchParams: Promise<{ card?: string; artist?: string }>;
}) {
  const params = await searchParams;
  const card: Card = params.card === "live" ? "live" : "label";
  const selected = params.artist ? getArtist(params.artist) : undefined;
  const works = groupByForm(
    catalogueOrder(
      selected
        ? sculptures.filter((w) => w.artistSlug === selected.slug)
        : sculptures,
    ),
  );
  const artists = publishedArtists().filter((a) =>
    sculptures.some((w) => w.artistSlug === a.slug),
  );
  const href = (next: { card?: Card; artist?: string | null }) => {
    const q = new URLSearchParams();
    const c = next.card ?? card;
    const a = next.artist === undefined ? selected?.slug : next.artist;
    if (c === "live") q.set("card", "live");
    if (a) q.set("artist", a);
    const s = q.toString();
    return `/lab/cards${s ? `?${s}` : ""}`;
  };

  return (
    <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(32px,5vw,56px)]">
      <h1 className="font-display text-[clamp(28px,4vw,40px)] leading-tight">
        Artwork cards
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-stone">
        The proposed card captions each work like a wall label, draws its real
        height beside it, and marks works you can turn in 3D. Switch to the live
        card to compare.
      </p>

      <div className="mt-6 inline-flex rounded-full border border-rule bg-white p-1">
        <Link href={href({ card: "label" })} className={pill(card === "label")}>
          Proposed card
        </Link>
        <Link href={href({ card: "live" })} className={pill(card === "live")}>
          Live card
        </Link>
      </div>

      <nav
        aria-label="Filter by artist"
        className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13px]"
      >
        <Link
          href={href({ artist: null })}
          className={selected ? "text-stone hover:text-ink" : "text-ink underline underline-offset-4"}
        >
          All artists
        </Link>
        {artists.map((a) => (
          <Link
            key={a.slug}
            href={href({ artist: a.slug })}
            className={
              selected?.slug === a.slug
                ? "text-ink underline underline-offset-4"
                : "text-stone hover:text-ink"
            }
          >
            {a.name}
          </Link>
        ))}
      </nav>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
        {works.map((work, i) => (
          <ArtworkTile
            key={work.slug}
            work={work}
            priority={i < 3}
            showcase
            variant={card === "label" ? "label" : "catalogue"}
            // The wall label leaves the artist out once you've picked one.
            showArtist={card === "live" || !selected}
          />
        ))}
      </div>
    </main>
  );
}
