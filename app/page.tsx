import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { events, isPast, pastEvents, upcomingEvents } from "@/lib/events";
import DateTile from "@/components/events/DateTile";
import EventStatus from "@/components/events/EventStatus";
import { artists, publishedArtists } from "@/lib/artists";
import { getFeaturedWorks, getSculpture, sculptures } from "@/lib/sculptures";
import HeroScroll, { type HeroWork } from "@/components/HeroScroll";
import ArtistTile from "@/components/gallery/ArtistTile";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import SectionHeader from "@/components/gallery/SectionHeader";
import Magnetic from "@/components/Magnetic";
import Manifesto from "@/components/about/Manifesto";
import { HOME_HEADING, HOME_INTRO } from "@/lib/about";
import StaggerStory from "@/components/about/StaggerStory";

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

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
  const stats: [number, string][] = [
    [live.length, "Artists"],
    [sculptures.length, "Works"],
    [events.length, "Events"],
  ];
  const quoted = live.find((a) => a.quotes.length > 0 && a.portrait);
  const quote = quoted?.quotes[0];
  const homeEvents = [...upcomingEvents(), ...pastEvents()].slice(0, 2);
  const heroWork = heroWorkFor(HERO_WORK);

  return (
    <main>
      {/* Hero: intro left, a featured sculpture right; on scroll the
          sculpture slides left and its details appear (HeroScroll). */}
      {heroWork && <HeroScroll work={heroWork} />}

      {/* About: what Sculpted India stands for, in one line. The artists
          follow in the next section, so no portraits here. */}
      <section id="about" className="py-[clamp(96px,13vw,180px)]">
        <div data-reveal-stagger className={`${wrap} grid justify-items-center gap-[clamp(28px,3.5vw,44px)] text-center`}>
          <span className="label flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-current opacity-60" />
            About Sculpted India
            <span aria-hidden className="h-px w-10 bg-current opacity-60" />
          </span>
          <Manifesto
            as="h2"
            text={HOME_HEADING}
            className="font-display max-w-[18ch] text-[clamp(32px,5vw,68px)] leading-[1.14] tracking-[0.01em]"
          />
          <StaggerStory paragraphs={[HOME_INTRO]} />
          <Magnetic>
            <Link href="/about" className="btn mt-[clamp(8px,1.5vw,16px)]">
              Our story <span className="nudge">→</span>
            </Link>
          </Magnetic>
        </div>
      </section>

      {/* The collection in three figures. */}
      <div className="border-y border-rule bg-white">
        <dl
          data-reveal-stagger
          className={`${wrap} grid grid-cols-3 divide-x divide-rule py-[clamp(28px,4vw,48px)] text-center`}
        >
          {stats.map(([n, label]) => (
            <div key={label} className="grid gap-1.5 px-2">
              <dt className="order-2 text-[10px] uppercase tracking-[0.2em] text-stone sm:text-[11px]">
                {label}
              </dt>
              <dd className="font-display text-[clamp(34px,5vw,60px)] leading-none tracking-[0.02em] text-accent">
                {n}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <section className={`${wrap} py-[clamp(64px,8vw,110px)]`}>
        <SectionHeader
          title="Artists"
          number="02"
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
            number="03"
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
              />
            ))}
          </div>
        </div>
      </section>

      {explore.length > 0 && (
        <section className="bg-[#edf1ee] py-[clamp(64px,8vw,110px)]">
          <div className={wrap}>
            <SectionHeader
              title="The Artist’s Hand"
              number="04"
              link={{ label: "All artworks", href: "/artworks" }}
            />
            <p
              data-reveal
              className="font-text -mt-4 mb-10 max-w-[56ch] text-[17px] leading-relaxed text-stone"
            >
              Sculpture is made to be seen from every side. Open a work to walk
              around it, or see it in your own space.
            </p>
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
                  backdrop
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
              <span className="label flex items-center justify-center gap-3">
                05
                <span aria-hidden className="h-px w-10 bg-current opacity-60" />
                In the artist&rsquo;s words
              </span>
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
                    {quote.source} ↗
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
              title="Events"
              number="06"
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
                      {e.start && e.end && (
                        <EventStatus
                          start={e.start}
                          end={e.end}
                          fallback={isPast(e) ? "Ended" : "Upcoming"}
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
                      Details <span className="nudge">→</span>
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
