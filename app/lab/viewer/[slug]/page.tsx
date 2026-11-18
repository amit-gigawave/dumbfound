import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sculptures, getSculpture, hasValue } from "@/lib/sculptures";
import { getArtist, initials } from "@/lib/artists";
import { catalogueOrder, groupByForm } from "@/lib/catalogue-order";
import ViewingRoom from "@/components/lab/ViewingRoom";

// Internal: an immersive version of the artwork page (the viewing room).
// Not linked anywhere.
export const metadata: Metadata = {
  title: "Viewing room — lab",
  robots: { index: false, follow: false },
};

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

export function generateStaticParams() {
  return sculptures.map((s) => ({ slug: s.slug }));
}

export default async function ViewingRoomLab({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getSculpture(slug);
  if (!work) notFound();
  const artist = getArtist(work.artistSlug);

  // Walk the gallery in the same order as the Artworks grid.
  const order = groupByForm(catalogueOrder(sculptures));
  const at = order.findIndex((w) => w.slug === work.slug);
  const prev = at > 0 ? order[at - 1] : undefined;
  const next = at < order.length - 1 ? order[at + 1] : undefined;

  // Wall label: medium and edition; size. Only what the catalogue holds.
  const edition = work.edition
    ? /^\d/.test(work.edition)
      ? `edition ${work.edition}`
      : work.edition.replace(/^Edition\b/, "edition")
    : "";
  const label = [
    [work.material, edition].filter(Boolean).join(", "),
    [
      work.dimensions?.replace(/\binches\b/g, "in"),
      work.heightCm ? `${Math.round(work.heightCm)} cm high` : "",
    ]
      .filter(Boolean)
      .join(", "),
  ].filter(Boolean);

  const details = (
    [
      ["Medium", work.material],
      ["Dimensions", work.dimensions],
      ["Edition", work.edition],
      ["Collection", work.location],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => hasValue(row[1]));

  return (
    <main>
      <ViewingRoom
        key={work.slug}
        work={work}
        artistName={artist && !artist.placeholder ? artist.name : undefined}
        artistBorn={artist?.born}
        label={label}
        prev={prev && { slug: prev.slug, title: prev.title }}
        next={next && { slug: next.slug, title: next.title }}
      />

      <div className={`${wrap} grid gap-[clamp(32px,5vw,72px)] py-[clamp(48px,7vw,88px)] md:grid-cols-2`}>
        <div>
          {hasValue(work.description) && (
            <p className="font-text text-[17px] leading-[1.75] text-[#333333]">{work.description}</p>
          )}
          {details.length > 0 && (
            <dl className="mt-2 border-t border-rule">
              {details.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-5 border-b border-rule py-2.5 text-sm">
                  <dt className="text-stone">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <Link href={`/contact?work=${work.slug}`} className="btn mt-8">
            Ask about this work
          </Link>
        </div>

        {artist && !artist.placeholder && (
          <Link
            href={`/artists/${artist.slug}`}
            className="group flex items-center gap-4 self-start rounded-[14px] border border-rule bg-white p-4 transition-colors duration-300 hover:border-accent"
          >
            <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-plate">
              {artist.portrait ? (
                <Image src={artist.portrait} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <span aria-hidden className="font-display text-xl text-[#bdbdbd]">
                  {initials(artist.name)}
                </span>
              )}
            </span>
            <span className="grid min-w-0 gap-0.5">
              <span className="text-[13px] text-stone">About the artist</span>
              <span className="font-display text-xl tracking-[0.03em] transition-colors group-hover:text-accent">
                {artist.name}
              </span>
              <span className="text-[13px] text-stone">
                {[artist.born, artist.medium].filter(Boolean).join(", ")}
              </span>
            </span>
          </Link>
        )}
      </div>
    </main>
  );
}
