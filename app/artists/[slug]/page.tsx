import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArtist,
  initials,
  publishedArtists,
  type Fact,
} from "@/lib/artists";
import { getWorksByArtist } from "@/lib/sculptures";
import { catalogueOrder } from "@/lib/catalogue-order";
import { conceptWorks } from "@/lib/concept-works";
import { events } from "@/lib/events";
import { formatDate, postsAboutArtist, readingMinutes } from "@/lib/blog";
import { openGraphDefaults } from "@/lib/site";
import ArtistSectionNav, {
  type ArtistSection,
} from "@/components/artist/ArtistSectionNav";
import ArtistWorks from "@/components/artist/ArtistWorks";

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";
/** Sections land below the site header and the sticky section links. */
const section = "scroll-mt-[148px]";
const heading = "font-display text-[clamp(34px,3.1vw,44px)] leading-[1.2]";

export function generateStaticParams() {
  return publishedArtists().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist || artist.placeholder) return { title: "Artist not found" };
  const description = artist.summary || undefined;
  return {
    title: artist.name,
    description,
    // Link previews show the portrait; without one, the site's default image.
    ...(artist.portrait && {
      openGraph: {
        ...openGraphDefaults,
        title: artist.name,
        description,
        images: [{ url: artist.portrait, width: 600, height: 600 }],
      },
    }),
  };
}

const FactList = ({ title, items }: { title: string; items: Fact[] }) =>
  items.length === 0 ? null : (
    <div>
      <h3 className="mb-3 font-sans text-[14px] font-medium tracking-normal">{title}</h3>
      <ul className="grid gap-2.5 text-[14px] leading-[1.5] text-[#333]">
        {items.map((f) => (
          <li key={f.what} className="grid grid-cols-[88px_1fr] gap-x-3">
            <span className="text-accent">{f.when}</span>
            <span>{f.what}</span>
          </li>
        ))}
      </ul>
    </div>
  );

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist || artist.placeholder) notFound();

  const works = catalogueOrder(getWorksByArtist(artist.slug));
  const sized = conceptWorks().filter(
    (w) => w.artistSlug === artist.slug && w.heightCm,
  );
  const posts = postsAboutArtist(artist.slug);
  const shows = events
    .filter((e) => e.artistSlugs.includes(artist.slug))
    .sort((a, b) => (b.start ?? "").localeCompare(a.start ?? ""));
  const [leadQuote, ...moreQuotes] = artist.quotes;
  const hasFacts =
    artist.education.length +
      artist.honours.length +
      artist.collections.length >
    0;
  const hasBiography = artist.bio.length > 0 || hasFacts;

  const sections: ArtistSection[] = [
    { id: "works", label: "Works", count: works.length },
    ...(hasBiography ? [{ id: "biography", label: "Biography" }] : []),
    ...(artist.quotes.length
      ? [{ id: "words", label: "In the artist's words", count: artist.quotes.length }]
      : []),
    ...(shows.length
      ? [{ id: "exhibitions", label: "Exhibitions", count: shows.length }]
      : []),
    ...(posts.length
      ? [{ id: "writing", label: "Writing", count: posts.length }]
      : []),
  ];

  return (
    <main>
      {/* The artist: portrait to the left, name and introduction beside it. */}
      <div className="grid md:min-h-[min(760px,calc(100svh-84px))] md:grid-cols-[43%_1fr]">
        <div className="relative aspect-[390/430] bg-plate md:aspect-auto">
          {artist.portrait ? (
            <Image
              src={artist.portrait}
              alt={artist.name}
              fill
              priority
              sizes="(min-width: 768px) 43vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="font-display absolute inset-0 grid place-items-center text-[96px] text-[#bdbdbd]"
            >
              {initials(artist.name)}
            </span>
          )}
        </div>

        <div className="px-[clamp(20px,7vw,100px)] pb-12 pt-8 md:pb-16 md:pt-16">
          <p className="hidden text-[13px] text-stone md:block">
            <Link href="/artists" className="hover:text-accent">
              Artists
            </Link>
            <span className="mx-2">/</span>
            {artist.name}
          </p>
          <h1 className="font-display mt-0 text-[clamp(44px,5.8vw,84px)] leading-[1.07] md:mt-6">
            {artist.name}
          </h1>
          <p className="mt-6 text-[16px] md:mt-5">
            {[artist.born, artist.place].filter(Boolean).join(", ")}
          </p>
          {(artist.role || artist.medium) && (
            <p className="mt-1.5 text-[15px] text-stone">
              {[artist.role, artist.medium]
                .filter(Boolean)
                .map((s) => `${s}.`)
                .join(" ")}
            </p>
          )}
          {artist.summary && (
            <p className="font-text mt-8 max-w-[38em] text-[clamp(16px,1.35vw,19px)] leading-[1.68] text-[#333]">
              {artist.summary}
            </p>
          )}
          {works.length > 0 && (
            <div className="mt-[clamp(32px,4.5vw,68px)] hidden flex-wrap gap-3 md:flex">
              <a
                href="#works"
                className="rounded-[2px] bg-ink px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-accent"
              >
                See {works.length} {works.length === 1 ? "work" : "works"}
              </a>
            </div>
          )}
        </div>
      </div>

      <ArtistSectionNav sections={sections} />

      <section id="works" className={`${section} ${wrap} py-[clamp(48px,6vw,64px)] pb-[clamp(64px,7vw,96px)]`}>
        {works.length > 0 ? (
          <ArtistWorks works={works} sized={sized} />
        ) : (
          <>
            <h2 className={heading}>Works</h2>
            <p className="font-text mt-6 text-[17px] text-stone">
              No works by {artist.name} are listed yet.
            </p>
          </>
        )}
      </section>

      {hasBiography && (
        <section
          id="biography"
          className={`${section} border-t border-rule bg-white py-[clamp(56px,7vw,100px)]`}
        >
          <div className={`${wrap} grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] md:gap-[clamp(48px,9vw,130px)]`}>
            <div>
              <h2 className={heading}>Biography</h2>
              <div className="font-text mt-7 grid max-w-[40em] gap-5 text-[clamp(16px,1.25vw,18px)] leading-[1.72] text-[#333]">
                {artist.bio.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            {hasFacts && (
              <div className="grid content-start gap-9 md:pt-3">
                <FactList title="Education" items={artist.education} />
                <FactList title="Honours" items={artist.honours} />
                <FactList title="Collections" items={artist.collections} />
              </div>
            )}
          </div>
        </section>
      )}

      {leadQuote && (
        <section
          id="words"
          className={`${section} bg-[#1b211d] py-[clamp(64px,7vw,88px)] text-[#f2f2f2]`}
        >
          <div className={`${wrap} grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-[clamp(48px,8vw,110px)]`}>
            <figure>
              <p className="text-[14px] text-white/70">In the artist&rsquo;s words</p>
              <blockquote className="font-display mt-5 text-[clamp(30px,3.5vw,50px)] leading-[1.18]">
                &ldquo;{leadQuote.text}&rdquo;
              </blockquote>
              <figcaption className="mt-7 text-[13px]">
                <a
                  href={leadQuote.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-light underline underline-offset-4 hover:text-white"
                >
                  {leadQuote.source}
                </a>
              </figcaption>
            </figure>
            {moreQuotes.length > 0 && (
              <div className="grid content-start gap-10 md:pt-12">
                {moreQuotes.map((q) => (
                  <figure key={q.text} className="border-t border-white/20 pt-7">
                    <blockquote className="font-text text-[clamp(18px,1.45vw,21px)] italic leading-[1.5]">
                      &ldquo;{q.text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-3 text-[13px]">
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-light underline underline-offset-4 hover:text-white"
                      >
                        {q.source}
                      </a>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {shows.length > 0 && (
        <section
          id="exhibitions"
          className={`${section} py-[clamp(56px,7vw,96px)]`}
        >
          <div className={wrap}>
            <h2 className={heading}>Exhibitions</h2>
            <ul className="mt-[clamp(28px,3vw,40px)]">
              {shows.map((e) => (
                <li
                  key={e.slug}
                  className="grid gap-x-8 gap-y-2 border-t border-rule py-7 md:grid-cols-[minmax(0,0.33fr)_minmax(0,1fr)_auto]"
                >
                  <p className="text-[14px] text-accent">{e.dates}</p>
                  <div>
                    <p className="font-text text-[clamp(22px,2vw,28px)] italic leading-[1.25]">
                      {e.title}
                    </p>
                    <p className="mt-1.5 text-[14px] text-[#333]">
                      {[e.kind, e.venue].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <Link
                    href="/events"
                    className="justify-self-start text-[14px] text-accent underline underline-offset-4 hover:text-ink"
                  >
                    Details
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section
          id="writing"
          className={`${section} border-t border-rule bg-white py-[clamp(56px,7vw,96px)]`}
        >
          <div className={wrap}>
            <div className="flex items-baseline justify-between gap-6">
              <h2 className={heading}>Writing</h2>
              <Link
                href="/blog"
                className="text-[14px] text-accent underline underline-offset-4 hover:text-ink"
              >
                All articles
              </Link>
            </div>
            <ul className="mt-[clamp(28px,3vw,40px)] grid gap-10 md:grid-cols-2 md:gap-6">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group grid grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] gap-6"
                  >
                    <span className="relative aspect-square overflow-hidden bg-plate">
                      <Image
                        src={p.image.src}
                        alt={p.image.alt}
                        fill
                        sizes="220px"
                        className="object-contain p-2"
                      />
                    </span>
                    <span className="grid content-start gap-1.5">
                      <span className="text-[13px] text-stone">{p.category}</span>
                      <span className="font-display text-[clamp(21px,1.8vw,26px)] leading-[1.2] transition-colors group-hover:text-accent">
                        {p.title}
                      </span>
                      <span className="font-text line-clamp-4 text-[15px] leading-[1.6] text-[#333]">
                        {p.description}
                      </span>
                      <span className="text-[13px] text-stone">
                        <time dateTime={p.published}>{formatDate(p.published)}</time>
                        , {readingMinutes(p)} min read
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
