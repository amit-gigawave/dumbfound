import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  sculptures,
  getSculpture,
  getWorksByArtist,
  hasValue,
} from "@/lib/sculptures";
import { getArtist, initials } from "@/lib/artists";
import { catalogueOrder } from "@/lib/catalogue-order";
import { openGraphDefaults } from "@/lib/site";
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
  // Works without a written description fall back to their catalogue line.
  const description =
    work.description ||
    [artist?.name, work.material, work.dimensions].filter(Boolean).join(", ");
  return {
    title,
    description,
    openGraph: {
      ...openGraphDefaults,
      title,
      description,
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
  const more = catalogueOrder(
    getWorksByArtist(work.artistSlug).filter((w) => w.slug !== work.slug),
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

      {/* No scroll reveal here: the plate and details are above the fold and
          should show at once, not wait for scripts to load. */}
      <div className="grid items-start gap-[clamp(32px,5vw,72px)] pb-[72px] pt-7 min-[820px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
      >
        {/* The work stays in view while the visitor reads down the column beside it. */}
        <div className="min-[820px]:sticky min-[820px]:top-[100px]">
          <ArtworkStage
            key={work.slug}
            work={work}
            alt={`${work.title}${artist ? ` by ${artist.name}` : ""}`}
          />
        </div>

        <div>
          {artist &&
            (artist.placeholder ? (
              <span className="label">{artist.name}</span>
            ) : (
              <Link
                href={`/artists/${artist.slug}`}
                className="label hover:underline"
              >
                {artist.name}
              </Link>
            ))}
          <h1 className="heading-caps mt-3 text-[clamp(34px,4.4vw,56px)] leading-[1.1] tracking-[0.04em]">
            {work.title}
          </h1>
          {hasValue(work.year) && (
            <p className="mt-2.5 text-xs uppercase tracking-[0.14em] text-stone">
              {work.year}
            </p>
          )}

          {hasValue(work.description) && (
            <p className="font-text mt-6 text-[17px] leading-[1.75] text-[#333333]">
              {work.description}
            </p>
          )}
          {hasValue(work.longDescription) && (
            <p className="font-text mt-4 text-[17px] leading-[1.75] text-[#333333]">
              {work.longDescription}
            </p>
          )}

          {/* Works with no known details get no empty table (and no stray rule). */}
          {details.length > 0 && (
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
          )}

          <Link href={`/contact?work=${work.slug}`} className="btn mt-8">
            Interested in this artwork <span className="nudge">→</span>
          </Link>

          {/* About the artist: their sourced summary, biography, a quote and
              some honours and collections (all from lib/artists.ts, where each
              fact keeps its source), so the column carries real reading. */}
          {artist && !artist.placeholder && (
            <section
              aria-labelledby="about-artist"
              className="mt-12 border-t border-rule pt-8"
            >
              <Link
                href={`/artists/${artist.slug}`}
                className="group flex items-center gap-4"
              >
                <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-plate">
                  {artist.portrait ? (
                    <Image
                      src={artist.portrait}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="font-display text-xl text-[#bdbdbd]"
                    >
                      {initials(artist.name)}
                    </span>
                  )}
                </span>
                <span className="grid min-w-0 gap-0.5">
                  <span className="label">About the artist</span>
                  <span
                    id="about-artist"
                    className="font-display text-[22px] tracking-[0.03em] transition-colors group-hover:text-accent"
                  >
                    {artist.name}
                  </span>
                  <span className="text-[13px] text-stone">
                    {[artist.born, artist.place].filter(Boolean).join(", ")}
                  </span>
                </span>
              </Link>

              {[artist.summary, ...artist.bio].filter(hasValue).map((para, i) => (
                <p
                  key={i}
                  className="font-text mt-5 text-[16px] leading-[1.75] text-[#333333]"
                >
                  {para}
                </p>
              ))}

              {artist.quotes[0] && (
                <figure className="mt-7 border-l-2 border-accent pl-5">
                  <blockquote className="font-display text-[19px] leading-[1.45] text-ink">
                    “{artist.quotes[0].text}”
                  </blockquote>
                  <figcaption className="mt-2 text-[13px] text-stone">
                    <a
                      href={artist.quotes[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent hover:underline"
                    >
                      {artist.quotes[0].source}
                    </a>
                  </figcaption>
                </figure>
              )}

              {(
                [
                  ["Honours", artist.honours],
                  ["In collections", artist.collections],
                ] as const
              )
                .filter(([, facts]) => facts.length > 0)
                .map(([label, facts]) => (
                  <div key={label} className="mt-7">
                    <h2 className="label">{label}</h2>
                    <ul className="mt-2 border-t border-rule">
                      {facts.slice(0, 3).map((f, i) => (
                        <li
                          key={i}
                          className="flex gap-4 border-b border-rule py-2.5 text-sm"
                        >
                          {f.when && (
                            <span className="w-[4.5rem] shrink-0 tabular-nums text-stone">
                              {f.when}
                            </span>
                          )}
                          <span>{f.what}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

              <Link
                href={`/artists/${artist.slug}`}
                className="mt-7 inline-flex items-center gap-2 text-sm text-ink underline decoration-rule underline-offset-4 hover:text-accent hover:decoration-accent"
              >
                More about {artist.name}{" "}
                <span aria-hidden className="nudge">
                  →
                </span>
              </Link>
            </section>
          )}
        </div>
      </div>

      {more.length > 0 && artist && !artist.placeholder && (
        <section className="pb-[clamp(64px,8vw,104px)]">
          <SectionHeader
            title={`More by ${artist.name}`}
            link={{ label: "View artist", href: `/artists/${artist.slug}` }}
          />
          <div
            data-reveal-stagger
            className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3"
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
