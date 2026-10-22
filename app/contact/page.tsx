import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { getSculpture, sculptures } from "@/lib/sculptures";
import { getArtist } from "@/lib/artists";
import { upcomingEvents } from "@/lib/events";
import Contact from "@/components/Contact";
import ContactCards from "@/components/contact/ContactCards";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/gallery/SectionHeader";

export const metadata: Metadata = {
  title: "Enquiry",
  description: `For exhibitions, artworks, collaborations, and patronage — write to ${site.name}.`,
};

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ work?: string }>;
}) {
  const { work: workSlug } = await searchParams;
  const work = workSlug ? getSculpture(workSlug) : undefined;
  const artist = work ? getArtist(work.artistSlug) : undefined;
  const next = upcomingEvents()[0];

  const works = sculptures.map((s) => ({
    slug: s.slug,
    label: [s.title, getArtist(s.artistSlug)?.name].filter(Boolean).join(" — "),
  }));

  return (
    <main>
      <PageHeader
        label="Get in touch"
        title="Enquiry"
        line="For exhibitions, artworks, collaborations, and patronage — write to us and we will respond promptly."
      />

      <section className={`${wrap} pt-[clamp(40px,6vw,72px)]`}>
        <SectionHeader title="Contact details" />
        <div data-reveal-stagger className="grid gap-6">
          <ContactCards
            email={site.email}
            people={site.contacts.filter((c) => c.phone)}
          />

          {next && (
            <Link
              href="/events"
              className="group block rounded-[14px] border border-rule bg-white p-6 md:max-w-md transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,.45)]"
            >
              <span className="label">Meet us at</span>
              <p className="font-display mt-3 text-[22px] leading-snug tracking-[0.02em] transition-colors group-hover:text-accent">
                {next.title}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-stone">
                {next.kind} · {next.dates}
                <br />
                {next.venue}
              </p>
              <span className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] text-accent">
                All events <span className="nudge">→</span>
              </span>
            </Link>
          )}
        </div>
      </section>

      <section
        className={`${wrap} pb-[clamp(64px,8vw,104px)] pt-[clamp(56px,8vw,96px)]`}
      >
        <SectionHeader title="Send an enquiry" />
        <div data-reveal className="grid gap-6">
          {work && (
            <div className="flex items-center gap-5 rounded-[14px] border border-rule bg-white p-4 pr-6">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[10px] bg-plate">
                <Image
                  src={work.thumbnail}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1.5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="label">You&apos;re enquiring about</span>
                <p className="font-display mt-1.5 truncate text-[21px] tracking-[0.02em]">
                  {work.title}
                </p>
                <p className="text-[13px] text-stone">
                  {[artist?.name, work.year, work.material]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <Link
                href="/contact"
                scroll={false}
                className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-stone transition-colors hover:text-accent"
              >
                Change
              </Link>
            </div>
          )}

          <div className="rounded-[18px] border border-rule bg-white p-[clamp(22px,4vw,44px)]">
            <Contact
              key={work?.slug ?? "general"}
              email={site.email}
              whatsapp={site.phone}
              works={works}
              workSlug={work?.slug}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
