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
import ArtworkTile from "@/components/gallery/ArtworkTile";
import SectionHeader from "@/components/gallery/SectionHeader";
import ReadMore from "@/components/gallery/ReadMore";

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

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
  return { title: artist.name, description: artist.summary };
}

const FactList = ({ title, items }: { title: string; items: Fact[] }) =>
  items.length === 0 ? null : (
    <div>
      <h3 className="label mb-3.5">{title}</h3>
      <ul className="grid gap-2.5 text-sm">
        {items.map((f) => (
          <li key={f.what} className="flex gap-3">
            {f.when && (
              <span className="w-[76px] shrink-0 text-stone">{f.when}</span>
            )}
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

  const works = getWorksByArtist(artist.slug);
  const [leadQuote, ...moreQuotes] = artist.quotes;

  return (
    <main>
      <div className={wrap}>
        <p className="pt-8 text-xs tracking-[0.04em] text-stone">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/artists" className="hover:text-ink">
            Artists
          </Link>{" "}
          / {artist.name}
        </p>

        <div className="grid items-start gap-12 border-b border-rule pb-14 pt-7 md:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <h1 className="text-[clamp(40px,5.5vw,68px)] leading-[1.05] text-accent">
              {artist.name}
            </h1>
            <p className="mt-2.5 text-sm tracking-[0.02em] text-stone">
              {artist.born}, {artist.place} · {artist.role}
            </p>

            <nav
              aria-label="Artist sections"
              className="mt-7 flex gap-7 border-b border-rule text-[13px] uppercase tracking-[0.08em]"
            >
              <a
                href="#profile"
                className="-mb-px border-b-2 border-ink pb-2.5"
              >
                Profile
              </a>
              <a
                href="#works"
                className="-mb-px border-b-2 border-transparent pb-2.5 text-stone hover:text-ink"
              >
                Works
              </a>
            </nav>

            <div
              id="profile"
              className="font-text mt-6 max-w-[62ch] text-lg leading-[1.75]"
            >
              <p>{artist.summary}</p>
              <ReadMore paragraphs={artist.bio} />
            </div>
          </div>

          <div className="relative order-first grid aspect-[4/5] w-full max-w-[220px] place-items-center overflow-hidden border border-rule bg-plate md:order-none md:max-w-none">
            {artist.portrait ? (
              <Image
                src={artist.portrait}
                alt={artist.name}
                fill
                sizes="240px"
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="font-display text-[56px] text-[#b6afa3]"
              >
                {initials(artist.name)}
              </span>
            )}
          </div>
        </div>
      </div>

      {leadQuote && (
        <div className={wrap}>
          <figure className="border-b border-rule py-[clamp(56px,7vw,88px)] text-center">
            <blockquote className="mx-auto max-w-[24ch] font-display text-[clamp(28px,3.6vw,44px)] italic leading-[1.2]">
              “{leadQuote.text}”
            </blockquote>
            <figcaption className="mt-5 text-[11px] uppercase tracking-[0.16em] text-stone">
              <a
                href={leadQuote.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                {leadQuote.source}
              </a>
            </figcaption>
          </figure>
        </div>
      )}

      <div className={wrap}>
        <div className="grid gap-10 border-b border-rule py-14 md:grid-cols-3">
          <FactList title="Education" items={artist.education} />
          <FactList title="Honours" items={artist.honours} />
          <FactList title="Collections" items={artist.collections} />
        </div>

        {moreQuotes.length > 0 && (
          <div className="grid gap-10 border-b border-rule py-14 md:grid-cols-2">
            {moreQuotes.map((q) => (
              <figure key={q.text}>
                <blockquote className="font-display text-2xl italic leading-snug">
                  “{q.text}”
                </blockquote>
                <figcaption className="mt-3 text-[11px] uppercase tracking-[0.16em] text-stone">
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink"
                  >
                    {q.source}
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <section id="works" className="scroll-mt-28 py-[clamp(64px,8vw,104px)]">
          <SectionHeader title="Works" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {works.map((work) => (
              <ArtworkTile
                key={work.slug}
                work={work}
                showArtist={false}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
