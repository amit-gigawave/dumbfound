import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  sculptures,
  getSculpture,
  getWorksByArtist,
  hasValue,
} from "@/lib/sculptures";
import { getArtist } from "@/lib/artists";
import ArtworkStage from "@/components/gallery/ArtworkStage";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import SectionHeader from "@/components/gallery/SectionHeader";

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

export function generateStaticParams() {
  return sculptures.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getSculpture(slug);
  if (!work) return { title: "Artwork not found" };

  const artist = getArtist(work.artistSlug);
  const title = artist ? `${work.title}, ${artist.name}` : work.title;
  return {
    title,
    description: work.description,
    openGraph: {
      title,
      description: work.description,
      images: [{ url: work.thumbnail, width: 800, height: 1000 }],
    },
  };
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getSculpture(slug);
  if (!work) notFound();

  const artist = getArtist(work.artistSlug);
  const more = getWorksByArtist(work.artistSlug).filter(
    (w) => w.slug !== work.slug,
  );

  // Optional fields are only listed when filled in (never "TODO" placeholders).
  const details = (
    [
      ["Medium", work.material],
      ["Dimensions", work.dimensions],
      ["Edition", work.edition],
      ["Collection", work.location],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => hasValue(row[1]));

  return (
    <main className={wrap}>
      <p className="pt-8 text-xs tracking-[0.04em] text-stone">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/artworks" className="hover:text-accent">
          Artworks
        </Link>{" "}
        / {work.title}
      </p>

      <div
        data-reveal-stagger
        className="grid items-start gap-[clamp(32px,5vw,72px)] pb-[72px] pt-7 min-[820px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
      >
        <ArtworkStage
          key={work.slug}
          work={work}
          alt={`${work.title}${artist ? ` by ${artist.name}` : ""}`}
        />

        <div className="min-[820px]:sticky min-[820px]:top-[100px]">
          {artist && (
            <Link
              href={`/artists/${artist.slug}`}
              className="label hover:underline"
            >
              {artist.name}
            </Link>
          )}
          <h1 className="heading-caps mt-3 text-[clamp(34px,4.4vw,56px)] leading-[1.1] tracking-[0.04em]">
            {work.title}
          </h1>
          <p className="mt-2.5 text-xs uppercase tracking-[0.14em] text-stone">
            {work.year}
          </p>

          <p className="font-text mt-6 text-[17px] leading-[1.75] text-[#333333]">
            {work.description}
          </p>
          {hasValue(work.longDescription) && (
            <p className="font-text mt-4 text-[17px] leading-[1.75] text-[#333333]">
              {work.longDescription}
            </p>
          )}

          <dl className="mt-8 border-t border-rule">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-5 border-b border-rule py-2.5 text-sm"
              >
                <dt className="text-stone">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>

          <Link href={`/contact?work=${work.slug}`} className="btn mt-8">
            Enquire about this work <span className="nudge">→</span>
          </Link>
        </div>
      </div>

      {more.length > 0 && artist && (
        <section className="pb-[clamp(64px,8vw,104px)]">
          <SectionHeader
            title={`More by ${artist.name}`}
            link={{ label: "View artist", href: `/artists/${artist.slug}` }}
          />
          <div
            data-reveal-stagger
            className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          >
            {more.map((w) => (
              <ArtworkTile key={w.slug} work={w} showArtist={false} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
