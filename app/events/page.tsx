import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import { upcomingEvents, pastEvents, type GalleryEvent } from "@/lib/events";
import { artists, type Artist } from "@/lib/artists";
import { getWorksByArtist } from "@/lib/sculptures";
import SectionHeader from "@/components/gallery/SectionHeader";
import EventStatus from "@/components/events/EventStatus";
import CalendarButton from "@/components/events/CalendarButton";
import DateTile from "@/components/events/DateTile";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Exhibitions, fairs and showcases where our artists' work is on view.",
};

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

const shownArtists = (e: GalleryEvent) =>
  e.artistSlugs
    .map((slug) => artists.find((a) => a.slug === slug))
    .filter((a): a is Artist => !!a);

/** Venue without booth numbers etc., for a maps search. */
const mapsUrl = (venue: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.split("—")[0].trim())}`;

/* ------------------------------------------------------------------ */

/** Overlapping portrait circles that spread apart when the card is hovered. */
const Avatars = ({ people, ring }: { people: Artist[]; ring: string }) => (
  <div className="flex">
    {people.map((a, i) => (
      <Link
        key={a.slug}
        href={`/artists/${a.slug}`}
        title={a.name}
        className={`relative h-11 w-11 overflow-hidden rounded-full bg-plate ring-2 ${ring} transition-[margin,transform] duration-500 ease-[cubic-bezier(.3,.7,.3,1)] hover:z-10 hover:scale-110 ${
          i === 0 ? "" : "-ml-3 group-hover:ml-1"
        }`}
      >
        {a.portrait ? (
          <Image
            src={a.portrait}
            alt={a.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <span className="grid h-full place-items-center text-[11px] text-stone">
            {a.name[0]}
          </span>
        )}
      </Link>
    ))}
  </div>
);

const NameList = ({ people }: { people: Artist[] }) => (
  <>
    {people.map((a, i) => (
      <span key={a.slug}>
        <Link
          href={`/artists/${a.slug}`}
          className="transition-colors hover:text-accent"
        >
          {a.name}
        </Link>
        {i < people.length - 2 ? ", " : i === people.length - 2 ? " and " : ""}
      </span>
    ))}
  </>
);

/* ------------------------------------------------------------------ */

const Featured = ({ e }: { e: GalleryEvent }) => {
  const people = shownArtists(e);
  const pill =
    "inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white hover:text-ink";
  return (
    <section className="deep">
      <div
        className={`${wrap} grid items-center gap-[clamp(36px,5vw,72px)] py-[clamp(56px,8vw,104px)] md:grid-cols-[1.2fr_1fr]`}
      >
        <div data-reveal-stagger className="grid gap-7">
          <div className="flex flex-wrap items-center gap-3">
            {e.start && e.end ? (
              <EventStatus
                start={e.start}
                end={e.end}
                fallback="Upcoming"
                dark
              />
            ) : null}
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#bdbdbd]">
              {e.kind}
            </span>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <DateTile e={e} dark />
            <div className="min-w-[16ch] flex-1">
              <h2 className="heading-caps text-[clamp(28px,4vw,52px)] leading-[1.08] tracking-[0.04em]">
                {e.title}
              </h2>
              <p className="mt-3 flex items-center gap-1.5 text-[14px] text-[#bdbdbd]">
                <MapPin size={14} /> {e.venue}
              </p>
            </div>
          </div>
          <p className="font-text max-w-[56ch] text-[17px] leading-[1.75] text-[#d0d0d0]">
            {e.description}
          </p>
          <p className="text-[13px] text-[#bdbdbd]">{e.dates}</p>

          {people.length > 0 && (
            <div className="group flex flex-wrap items-center gap-4">
              <Avatars people={people} ring="ring-[#111]" />
              <p className="text-[13px] text-[#d0d0d0]">
                Featuring <NameList people={people} />
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {e.start && e.end && (
              <CalendarButton
                slug={e.slug}
                title={e.title}
                start={e.start}
                end={e.end}
                location={e.venue}
                description={`${e.description}\n\n${e.dates}. ${e.organiser}.`}
                url={e.sourceUrl}
                className={pill}
              />
            )}
            <a
              href={mapsUrl(e.venue)}
              target="_blank"
              rel="noopener noreferrer"
              className={pill}
            >
              <MapPin size={15} strokeWidth={1.7} /> Directions
            </a>
            <a
              href={e.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={pill}
            >
              Full details <ArrowUpRight size={15} strokeWidth={1.7} />
            </a>
          </div>
          <p className="text-[12px] text-[#9a9a9a]">
            Organised by {e.organiser}.
          </p>
        </div>

        {/* Portraits of the artists shown — one large, or a grid of up to four. */}
        <div
          data-reveal
          className={`grid gap-3 ${people.length > 1 ? "grid-cols-2" : ""}`}
        >
          {people.slice(0, 4).map((a) => (
            <Link
              key={a.slug}
              href={`/artists/${a.slug}`}
              className={`group relative overflow-hidden rounded-[14px] bg-[#1d1d1d] ${
                people.length > 1 ? "aspect-square" : "aspect-[4/5]"
              }`}
            >
              {a.portrait && (
                <Image
                  src={a.portrait}
                  alt={a.name}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover grayscale-[0.5] transition-[transform,filter] duration-[1600ms] ease-[cubic-bezier(.45,0,.2,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
                />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-[13px] tracking-[0.04em] text-white">
                {a.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */

const EventCard = ({ e }: { e: GalleryEvent }) => {
  const people = shownArtists(e);
  const works = people.flatMap((a) => getWorksByArtist(a.slug)).slice(0, 6);
  return (
    <div data-reveal>
      <article className="group grid gap-7 rounded-[18px] border border-rule bg-white p-[clamp(20px,3.4vw,40px)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.3,.7,.3,1)] hover:-translate-y-1 hover:border-[#d6d6d6] hover:shadow-[0_24px_50px_-34px_rgba(0,0,0,.4)] md:grid-cols-[auto_1fr]">
        <DateTile e={e} />
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="label">{e.kind}</span>
            {e.start && e.end && (
              <EventStatus
                start={e.start}
                end={e.end}
                fallback={e.past ? "Ended" : "Upcoming"}
              />
            )}
          </div>
          <h3 className="heading-caps text-[clamp(24px,3vw,36px)] leading-tight tracking-[0.04em] transition-colors group-hover:text-accent">
            {e.title}
          </h3>
          <p className="flex items-center gap-1.5 text-[14px] text-stone">
            <MapPin size={14} /> {e.venue}
          </p>
          <p className="font-text max-w-[62ch] text-[16px] leading-[1.75] text-[#333]">
            {e.description}
          </p>

          {people.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              <Avatars people={people} ring="ring-white" />
              <p className="max-w-[52ch] text-[13px] leading-relaxed text-stone">
                With <NameList people={people} />
              </p>
            </div>
          )}

          {works.length > 0 && (
            <div>
              <span className="label">From the collection</span>
              <div className="mt-3 flex flex-wrap gap-3">
                {works.map((w) => (
                  <Link
                    key={w.slug}
                    href={`/artworks/${w.slug}`}
                    title={w.title}
                    className="relative h-20 w-16 overflow-hidden rounded-[10px] border border-rule bg-plate transition-transform duration-300 hover:-translate-y-1"
                  >
                    <Image
                      src={w.thumbnail}
                      alt={w.title}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p className="text-[12px] text-stone">
            Organised by {e.organiser}.{" "}
            <a
              href={e.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Full details ↗
            </a>
          </p>
        </div>
      </article>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export default function EventsPage() {
  const upcoming = upcomingEvents();
  const past = pastEvents();
  const [featured, ...moreUpcoming] = upcoming;

  return (
    <main>
      <section
        data-reveal-stagger
        className={`${wrap} pb-[clamp(40px,6vw,72px)] pt-[clamp(48px,7vw,88px)]`}
      >
        <span className="label">Exhibitions</span>
        <h1 className="heading-caps mt-4 max-w-[18ch] text-[clamp(34px,5.2vw,64px)] leading-[1.1] tracking-[0.04em]">
          Events
        </h1>
        <p className="font-text mt-5 max-w-[56ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
          Exhibitions, fairs and showcases where our artists&apos; work is on
          view — our own and those of our partners. Every entry credits its
          organiser and links through to the full listing.
        </p>
      </section>

      {featured && <Featured e={featured} />}

      {moreUpcoming.length > 0 && (
        <section className={`${wrap} pt-[clamp(56px,8vw,96px)]`}>
          <SectionHeader title="Also coming up" />
          <div className="grid gap-8">
            {moreUpcoming.map((e) => (
              <EventCard key={e.slug} e={e} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className={`${wrap} pt-[clamp(56px,8vw,96px)]`}>
          <SectionHeader title="Past exhibitions" />
          <div className="grid gap-8">
            {past.map((e) => (
              <EventCard key={e.slug} e={e} />
            ))}
          </div>
        </section>
      )}

      <section
        className={`${wrap} grid gap-5 py-[clamp(56px,8vw,96px)] md:grid-cols-2`}
      >
        {[
          {
            title: "Seen our artists elsewhere?",
            line: "An artist we show, or a work of ours, in an exhibition we haven't listed? Let us know and we'll add it here.",
            cta: "Let us know",
          },
          {
            title: "Host or collaborate",
            line: "Planning an exhibition, a fair or a public installation? We would be glad to talk about bringing sculpture to it.",
            cta: "Write to us",
          },
        ].map((c) => (
          <Link
            key={c.title}
            href="/contact"
            className="group rounded-[18px] border border-rule p-7 transition-[border-color,background-color] duration-500 hover:border-accent/50 hover:bg-white"
          >
            <p className="font-display text-[24px] tracking-[0.02em] transition-colors group-hover:text-accent">
              {c.title}
            </p>
            <p className="mt-2 max-w-[44ch] text-[14px] leading-relaxed text-stone">
              {c.line}
            </p>
            <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.16em] text-accent">
              {c.cta} <span className="nudge">→</span>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
