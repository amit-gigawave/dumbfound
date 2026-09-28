import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import { upcomingEvents, pastEvents, type GalleryEvent } from "@/lib/events";
import { artists } from "@/lib/artists";
import { getSculpture } from "@/lib/sculptures";
import SectionHeader from "@/components/gallery/SectionHeader";

export const metadata: Metadata = {
  title: "Events",
  description: "Exhibitions where our artists' work is on view.",
};

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

const EventCard = ({ event }: { event: GalleryEvent }) => {
  const work = event.workSlug ? getSculpture(event.workSlug) : undefined;
  const shown = event.artistSlugs
    .map((slug) => artists.find((a) => a.slug === slug))
    .filter((a): a is (typeof artists)[number] => !!a);

  return (
    <article
      data-reveal
      className="grid gap-8 border-b border-rule pb-[clamp(40px,6vw,64px)] last:border-0 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
    >
      {work ? (
        <Link
          href={`/artworks/${work.slug}`}
          className="group relative isolate grid aspect-[4/5] place-items-center overflow-hidden rounded-[14px] border border-rule bg-plate"
        >
          <Image
            src={work.thumbnail}
            alt={work.title}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-contain p-[6%] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        </Link>
      ) : (
        <div className="grid aspect-[4/5] place-items-center rounded-[14px] border border-rule bg-plate">
          <span className="heading-caps px-6 text-center text-[clamp(20px,2.4vw,28px)] leading-tight tracking-[0.08em] text-stone">
            {event.title}
          </span>
        </div>
      )}

      <div>
        <span className="label">
          {event.kind}
          {shown.length === 1 ? ` · ${shown[0].name}` : ""}
        </span>
        <h3 className="heading-caps mt-3 text-[clamp(24px,3vw,36px)] leading-tight tracking-[0.04em]">
          {event.title}
        </h3>
        <div className="font-text mt-3 grid gap-1 text-sm text-stone">
          <span>{event.dates}</span>
          <span>{event.venue}</span>
        </div>
        <p className="font-text mt-5 max-w-[60ch] text-[16px] leading-[1.75] text-[#333333]">
          {event.description}
        </p>

        {shown.length > 1 && (
          <p className="font-text mt-4 text-sm text-stone">
            With our artists:{" "}
            {shown.map((a, i) => (
              <span key={a.slug}>
                <Link href={`/artists/${a.slug}`} className="text-link">
                  {a.name}
                </Link>
                {i < shown.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        )}

        <p className="mt-5 text-xs text-stone">
          Organised by {event.organiser}.{" "}
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Full details ↗
          </a>
        </p>
      </div>
    </article>
  );
};

export default function EventsPage() {
  const upcoming = upcomingEvents();
  const past = pastEvents();

  return (
    <main className={`${wrap} pb-[clamp(64px,8vw,104px)] pt-[clamp(48px,7vw,88px)]`}>
      <span className="label">Exhibitions</span>
      <h1 className="heading-caps mt-4 max-w-[18ch] text-[clamp(34px,5.2vw,64px)] leading-[1.1] tracking-[0.04em]">
        Events
      </h1>
      <p className="font-text mb-14 mt-5 max-w-[56ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
        Beyond the gallery, our artists' work is shown at exhibitions and fairs
        run by others. Each entry here is organised, curated and hosted by the
        credited organiser — not by us — with a link through to their own page
        for the full listing.
      </p>

      {upcoming.length > 0 && (
        <section className="mb-16">
          <SectionHeader title="Upcoming" />
          <div className="grid gap-14">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <SectionHeader title="Past exhibitions" />
          <div className="grid gap-14">
            {past.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-16 max-w-[56ch] text-sm text-stone">
        An artist we show, or a work of ours, included in an exhibition
        elsewhere? <Link href="/contact" className="text-link">Let us know</Link>{" "}
        and we'll add it here.
      </p>
    </main>
  );
}
