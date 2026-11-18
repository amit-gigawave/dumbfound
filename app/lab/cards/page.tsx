import type { Metadata } from "next";
import Link from "next/link";
import { sculptures } from "@/lib/sculptures";
import { catalogueOrder, groupByForm } from "@/lib/catalogue-order";
import { getArtist, publishedArtists } from "@/lib/artists";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import { VariantCard, type CardVariant } from "@/components/lab/CardVariants";

// Internal comparison page for the artwork card: the live card and several
// proposed ones on the same grid. Not linked anywhere.
export const metadata: Metadata = {
  title: "Artwork cards — comparison",
  robots: { index: false, follow: false },
};

type Card = CardVariant | "live";

const CARDS: { id: Card; name: string; about: string }[] = [
  {
    id: "label",
    name: "Wall label",
    about:
      "A thin line beside the work with its real height, and the caption set like a museum wall label.",
  },
  {
    id: "scalebar",
    name: "Scale bar",
    about:
      "The black-and-white bar museums and archives photograph objects with, one band per 5, 10, 20, 25, 50 or 100 cm.",
  },
  {
    id: "person",
    name: "Person",
    about:
      "A small figure of a 1.7 m visitor beside the work's silhouette, both at true relative size.",
  },
  {
    id: "tint",
    name: "Tinted plate",
    about:
      "The plate takes a faint wash of the work's own colour, so the grid shows the colour of the collection.",
  },
  {
    id: "plinth",
    name: "Plinth",
    about:
      "The work stands on a block, with its height on the block's front, as in a gallery.",
  },
  {
    id: "compact",
    name: "Compact",
    about:
      "Two short lines, title and then artist with height, for a denser grid on phones.",
  },
  { id: "live", name: "Live card", about: "The card on the site today." },
];

const pill = (on: boolean) =>
  `whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition-colors ${
    on ? "bg-ink text-paper" : "text-stone hover:text-ink"
  }`;

export default async function CardsLab({
  searchParams,
}: {
  searchParams: Promise<{ card?: string; artist?: string }>;
}) {
  const params = await searchParams;
  const card: Card =
    CARDS.find((c) => c.id === params.card)?.id ?? "label";
  const about = CARDS.find((c) => c.id === card)!.about;
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
    if (c !== "label") q.set("card", c);
    if (a) q.set("artist", a);
    const s = q.toString();
    return `/lab/cards${s ? `?${s}` : ""}`;
  };

  return (
    <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(32px,5vw,56px)]">
      <h1 className="font-display text-[clamp(28px,4vw,40px)] leading-tight">
        Artwork cards
      </h1>

      <div className="-mx-[clamp(16px,4vw,40px)] mt-6 overflow-x-auto px-[clamp(16px,4vw,40px)]">
        <div className="inline-flex rounded-full border border-rule bg-white p-1">
          {CARDS.map((c) => (
            <Link key={c.id} href={href({ card: c.id })} className={pill(card === c.id)}>
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-stone">
        {about}
      </p>

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
        {works.map((work, i) =>
          card === "live" ? (
            <ArtworkTile key={work.slug} work={work} priority={i < 3} showcase />
          ) : (
            <VariantCard
              key={work.slug}
              work={work}
              variant={card}
              priority={i < 3}
              // The new captions leave the artist out once you've picked one.
              showArtist={!selected}
            />
          ),
        )}
      </div>
    </main>
  );
}
