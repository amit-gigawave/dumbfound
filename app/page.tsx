import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { isPast, pastEvents, upcomingEvents } from "@/lib/events";
import DateTile from "@/components/events/DateTile";
import EventStatus from "@/components/events/EventStatus";
import { artists, publishedArtists } from "@/lib/artists";
import { getFeaturedWorks, getSculpture } from "@/lib/sculptures";
import HeroScroll, { type HeroWork } from "@/components/HeroScroll";
import ArtistTile from "@/components/gallery/ArtistTile";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import SectionHeader from "@/components/gallery/SectionHeader";
import { HOME_HEADING, HOME_INTRO } from "@/lib/about";
import { conceptWorks } from "@/lib/concept-works";
import ToScaleShelf from "@/components/home/ToScaleShelf";

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

/** Copy with its **highlight** markers removed. */
const plain = (text: string) => text.replaceAll("**", "");

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
  "sansanwal-levitation",
  "khanna-patinder-rawat-trumpet-walae",
  "ghosh-head-in-fragments",
  "thota-female-in-dotted-saree",
];

/**
 * The works on the home page's "to scale" shelf, left to right: tall and
 * small mixed so each height reads against its neighbours. The heading names
 * how many there are, so keep it in step when changing the list.
 */
const TO_SCALE = [
  "khanna-trumpeter",
  "thota-man-with-mridangam",
  "thota-female-in-dotted-saree",
  "bajaj-ganesha",
  "khanna-davinder-raj-tutu-walae",
  "thota-bronze-female-head-with-long-hair",
  "gaurab-das-couple-1",
  "khanna-patinder-ji-haran-walla",
  "sansanwal-levitation",
  "shah-tirthankar",
  "khanna-satwant-sher-singh-cymbal-walae",
  "parekh-bronze-2-1",
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
  const upcoming = upcomingEvents();
  const homeEvents = [...upcoming, ...pastEvents()].slice(0, 2);
  const heroWork = heroWorkFor(HERO_WORK);
  const all = conceptWorks();
  const toScale = TO_SCALE.flatMap(
    (slug) => all.find((w) => w.slug === slug && w.heightCm) ?? [],
  );

  return (
    <main className="home">
      {/* Hero: intro left, a featured sculpture right; on scroll the
          sculpture slides left and its details appear (HeroScroll). */}
      {heroWork && (
        <HeroScroll work={heroWork} />
      )}

      {/* About: what Sculpted India stands for, set as plain text. */}
      {/* On large screens it rises into the empty foot of the hero's pinned
          panel (whose content is centred on the screen), so the gap stays small. */}
      <section id="about" className="relative pb-[clamp(8px,2vw,24px)] pt-[clamp(40px,5vw,64px)] lg:-mt-[14vh] motion-reduce:lg:mt-0">
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

      {/* To scale: a shelf of works at their real heights, the way into True scale. */}
      {toScale.length > 1 && (
        <section className="mt-[clamp(56px,7vw,96px)] border-y border-rule bg-white pb-[clamp(56px,6vw,72px)] pt-[clamp(48px,6vw,88px)]">
          <div className={wrap}>
            <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-5">
              <div className="grid gap-3">
                <h2 className="font-display text-[clamp(32px,3.1vw,44px)] leading-[1.18]">
                  Twelve works at their real heights
                </h2>
                <p className="font-text max-w-[36em] text-[clamp(16px,1.25vw,18px)] leading-[1.6] text-[#333]">
                  Each work stands at the height given in its listed
                  dimensions, from a 25 cm bandsman to a 183 cm Ganesha.
                  <span className="md:hidden"> Swipe along the shelf.</span>
                </p>
              </div>
              <Link
                href="/artworks?view=scale"
                className="hidden rounded-[2px] border border-ink bg-white px-5 py-3 text-[14px] text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:inline-block"
              >
                Open True scale
              </Link>
            </div>
            <div className="mt-10 md:mt-[clamp(150px,13vw,190px)]">
              <ToScaleShelf works={toScale} />
            </div>
            <Link
              href="/artworks?view=scale"
              className="mt-6 inline-block text-[15px] text-accent underline underline-offset-4 md:hidden"
            >
              Open True scale
            </Link>
          </div>
        </section>
      )}

      <section className={`${wrap} py-[clamp(64px,8vw,110px)]`}>
        <SectionHeader
          title="Artists"
                    link={{ label: `All ${live.length} artists`, href: "/artists" }}
        />
        <div
          data-reveal-stagger
          data-spotlight
          className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {homeArtists.map((artist) => (
            <ArtistTile key={artist.slug} artist={artist} compact />
          ))}
        </div>
      </section>

      {/* Section grounds alternate (paper, white, patina tint, black) so each
          section reads as its own chapter. */}
      <section id="featured" className="border-y border-rule bg-white py-[clamp(64px,8vw,110px)]">
        <div className={wrap}>
          <SectionHeader
            title="Featured works"
                        link={{ label: "All artworks", href: "/artworks" }}
          />
          <div
            data-reveal-stagger
            className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featured.map((work, i) => (
              <ArtworkTile
                key={work.slug}
                work={work}
                priority={i < 3}
                showcase
                quiet
              />
            ))}
          </div>
        </div>
      </section>

      {explore.length > 0 && (
        <section className="py-[clamp(64px,8vw,110px)]">
          <div className={wrap}>
            <SectionHeader
              title="More from the collection"
                            link={{ label: "All artworks", href: "/artworks" }}
            />
            <div
              data-reveal-stagger
              className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4"
            >
              {explore.map((work) => (
                <ArtworkTile
                  key={work.slug}
                  work={work}
                  showcase
                  ambient
                  quiet
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
            <figure data-reveal-stagger className="mx-auto grid max-w-[900px] gap-9 text-center">
              <span className="label">In the artist&rsquo;s words</span>
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
                    className="text-[11px] uppercase tracking-[0.16em] text-deep-muted transition-colors hover:text-accent"
                  >
                    {quote.source}
                  </a>
                </span>
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      {homeEvents.length > 0 && (
        <section className="py-[clamp(64px,8vw,110px)]">
          <div className={wrap}>
            <SectionHeader
              title={upcoming.length ? "Events" : "Recent exhibitions"}
                            link={{ label: "All events", href: "/events" }}
            />
            <div data-reveal-stagger className="grid gap-6 md:grid-cols-2">
              {homeEvents.map((e) => (
                <Link
                  key={e.slug}
                  href="/events"
                  className="group grid content-start gap-5 rounded-[18px] border border-rule bg-white p-[clamp(20px,3vw,32px)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.3,.7,.3,1)] hover:-translate-y-1 hover:border-[#d6d6d6] hover:shadow-[0_24px_50px_-34px_rgba(0,0,0,.4)] sm:grid-cols-[auto_1fr]"
                >
                  <DateTile e={e} />
                  <div className="grid gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="label">{e.kind}</span>
                      {e.start && e.end && !isPast(e) && (
                        <EventStatus
                          start={e.start}
                          end={e.end}
                          fallback="Upcoming"
                        />
                      )}
                    </div>
                    <h3 className="heading-caps text-[clamp(22px,2.4vw,30px)] leading-tight tracking-[0.04em] transition-colors group-hover:text-accent">
                      {e.title}
                    </h3>
                    <p className="flex items-center gap-1.5 text-[14px] text-stone">
                      <MapPin size={14} className="shrink-0" /> {e.venue}
                    </p>
                    <p className="font-text line-clamp-3 text-[16px] leading-[1.7] text-[#333]">
                      {e.description}
                    </p>
                    <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-accent">
                      Details
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
