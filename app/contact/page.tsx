import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getSculpture } from "@/lib/sculptures";
import { getArtist } from "@/lib/artists";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Enquiry",
  description: `For exhibitions, artworks, collaborations, and patronage — write to ${site.name}.`,
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ work?: string }>;
}) {
  const { work: workSlug } = await searchParams;
  const work = workSlug ? getSculpture(workSlug) : undefined;
  const artist = work ? getArtist(work.artistSlug) : undefined;
  const workTitle = work
    ? `${work.title}${artist ? `, ${artist.name}` : ""}`
    : undefined;

  return (
    <main
      data-reveal-stagger
      className="mx-auto grid max-w-[1200px] gap-[clamp(40px,6vw,96px)] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(56px,9vw,120px)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]"
    >
      <div>
        <span className="label">Get in touch</span>
        <h1 className="heading-caps mt-5 text-[clamp(34px,5vw,60px)] leading-[1.1] tracking-[0.05em]">
          Enquiry
        </h1>
        <p className="font-text mt-6 max-w-[40ch] text-lg leading-[1.75] text-stone">
          For exhibitions, artworks, collaborations, and patronage — write to
          us and we will respond promptly.
        </p>
        <dl className="mt-10 grid gap-5 text-sm">
          <div>
            <dt className="label">General</dt>
            <dd className="mt-1.5">
              <a href={`mailto:${site.email}`} className="hover:text-accent">
                {site.email}
              </a>
            </dd>
          </div>
          {site.contacts
            .filter((c) => c.phone !== "")
            .map((c) => (
              <div key={c.name}>
                <dt className="label">{c.name}</dt>
                <dd className="mt-1.5">
                  <a
                    href={`tel:${c.phone.replace(/\s/g, "")}`}
                    className="hover:text-accent"
                  >
                    {c.phone}
                  </a>
                </dd>
              </div>
            ))}
        </dl>
      </div>

      <Contact workTitle={workTitle} />
    </main>
  );
}
