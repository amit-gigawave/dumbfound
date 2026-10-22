import Link from "next/link";
import Image from "next/image";
import { isPast, pastEvents, upcomingEvents } from "@/lib/events";
import { artists, getArtist, publishedArtists } from "@/lib/artists";
import { getFeaturedWorks, getSculpture } from "@/lib/sculptures";
import HeroScroll, { type HeroWork } from "@/components/HeroScroll";
import ArtistTile from "@/components/gallery/ArtistTile";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import PlinthRow from "@/components/home/PlinthRow";
import { HOME_HEADING, HOME_INTRO } from "@/lib/about";

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

/** Copy with its **highlight** markers removed. */
const plain = (text: string) => text.replace(/\*\*/g, "");

/** Home section heading in sentence case, with an optional link to the rest. */
const Heading = ({
  title,
  link,
}: {
  title: string;
  link?: { label: string; href: string };
}) => (
  <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
    <h2 className="home-h2">{title}</h2>
    {link && (
      <Link href={link.href} className="home-link">
        {link.label}
      </Link>
    )}
  </div>
);

/** The sculpture in the hero (needs a 3D model). */
const HERO_WORK = "dancing-shiva";

const heroWorkFor = (slug: string): HeroWork | undefined => {
  const w = getSculpture(slug);
  if (!w?.modelUrl) return undefined;
  return {
    slug: w.slug,
    title: w.title,
    subtitle: w.subtitle,
    description: w.description,
    artist: artists.find((a) => a.slug === w.artistSlug)?.name ?? "",
    meta: [w.year, w.material].filter(Boolean).join(" · "),
    modelUrl: w.modelUrl,
    facing: w.facing,
  };
};

/** Painted scans for "In the Round": one row, in colour. */
const EXPLORE = [
  "meditating",
  "khanna-patinder-rawat-trumpet-walae",
  "head-e",
  "female-with-green-saree",
];

// Upcoming and past events are worked out from today's date, so rebuild hourly.
export const revalidate = 3600;

export default function Home() {
  const live = publishedArtists();
  const featured = getFeaturedWorks();
  const explore = EXPLORE.flatMap((slug) => getSculpture(slug) ?? []).filter(
    (w) => w.modelUrl,
  );
  // Ten portraits fill two rows of five; the rest are a click away.
  const homeArtists = live.filter((a) => a.portrait).slice(0, 10);
  const quoted = live.find((a) => a.quotes.length > 0 && a.portrait);
  const quote = quoted?.quotes[0];
  const homeEvents = [...upcomingEvents(), ...pastEvents()].slice(0, 2);
  const heroWork = heroWorkFor(HERO_WORK);

  return (
    <main>
      {/* Hero: intro left, a featured sculpture right; on scroll the
          sculpture slides left and its details appear (HeroScroll). */}
      {heroWork && <HeroScroll work={heroWork} />}

      {/* About: what Sculpted India stands for, set as plain text. */}
      <section id="about" className="py-[clamp(88px,12vw,168px)]">
        <div
          className={`${wrap} grid gap-[clamp(28px,5vw,80px)] md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-end`}
        >
          <h2 className="font-display max-w-[16ch] text-[clamp(34px,4.8vw,64px)] leading-[1.1] tracking-[0.005em]">
            {plain(HOME_HEADING)}
          </h2>
          <div className="grid justify-items-start gap-6">
            <p className="font-text max-w-[46ch] text-[18px] leading-[1.8] text-stone">
              {plain(HOME_INTRO)}
            </p>
            <Link href="/about" className="home-link">
              Read our story
            </Link>
          </div>
        </div>
      </section>

      <section className={`${wrap} pb-[clamp(72px,9vw,120px)]`}>
        <Heading
          title="Artists"
          link={{ label: `All ${live.length} artists`, href: "/artists" }}
        />
        <div
          data-spotlight
          className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {homeArtists.map((artist) => (
            <ArtistTile key={artist.slug} artist={artist} compact />
          ))}
        </div>
      </section>

      {/* Featured works stand on plinths; the section's lower edge is the floor. */}
      {featured.length > 0 && (
        <section
          id="featured"
          className="border-y border-rule bg-plate pt-[clamp(64px,8vw,110px)]"
        >
          <div className={wrap}>
            <Heading
              title="Featured works"
              link={{ label: "All artworks", href: "/artworks" }}
            />
            <PlinthRow
              works={featured.map((w) => ({
                slug: w.slug,
                title: w.title,
                thumbnail: w.thumbnail,
                artist: getArtist(w.artistSlug)?.name ?? "",
                details: [w.year, w.material].filter(Boolean).join(", "),
              }))}
            />
          </div>
        </section>
      )}

      {explore.length > 0 && (
        <section className="bg-[#edf1ee] py-[clamp(64px,8vw,110px)]">
          <div className={wrap}>
            <Heading
              title="The Artist’s Hand"
              link={{ label: "All artworks", href: "/artworks" }}
            />
            <p className="font-text -mt-4 mb-10 max-w-[56ch] text-[17px] leading-relaxed text-stone">
              Sculpture is made to be seen from every side. Open a work to walk
              around it, or see it in your own space.
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {explore.map((work) => (
                <ArtworkTile
                  key={work.slug}
                  work={work}
                  showcase
                  ambient
                  backdrop
                  bare
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {quote && quoted && (
        <section className="deep">
          <div className={`${wrap} py-[clamp(72px,10vw,140px)]`}>
            <figure className="mx-auto grid max-w-[900px] gap-9 text-center">
              <blockquote className="font-display text-[clamp(28px,4.4vw,56px)] leading-[1.22] tracking-[0.01em]">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <figcaption className="flex items-center justify-center gap-4 text-left">
                <Link
                  href={`/artists/${quoted.slug}`}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-plate"
                >
                  <Image
                    src={quoted.portrait!}
                    alt={quoted.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </Link>
                <span className="grid gap-1">
                  <Link
                    href={`/artists/${quoted.slug}`}
                    className="font-display text-[20px] tracking-[0.02em] transition-colors hover:text-accent"
                  >
                    {quoted.name}
                  </Link>
                  <a
                    href={quote.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-text text-[14px] italic text-deep-muted transition-colors hover:text-accent"
                  >
                    {quote.source}
                  </a>
                </span>
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      {/* Events as a plain listing: dates, then title, kind and venue. */}
      {homeEvents.length > 0 && (
        <section className="py-[clamp(64px,8vw,110px)]">
          <div className={wrap}>
            <Heading
              title="Events"
              link={{ label: "All events", href: "/events" }}
            />
            <ul className="border-t border-rule">
              {homeEvents.map((e) => (
                <li key={e.slug} className="border-b border-rule">
                  <Link
                    href="/events"
                    className="group grid gap-2 py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10"
                  >
                    <span className="font-text text-[16px] leading-relaxed text-stone">
                      {e.dates}
                      {isPast(e) && <span className="block">Ended</span>}
                    </span>
                    <span className="grid gap-1.5">
                      <span className="font-display text-[clamp(24px,2.6vw,32px)] leading-tight transition-colors group-hover:text-accent">
                        {e.title}
                      </span>
                      <span className="text-[14px] text-stone">
                        {e.kind}, {e.venue}
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
