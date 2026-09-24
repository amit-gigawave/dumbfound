import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getSculpture } from "@/lib/sculptures";
import { getArtist } from "@/lib/artists";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: `Write to ${site.name} about a work, an artist or showing your work.`,
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ work?: string }>;
}) {
  const { work: workSlug } = await searchParams;
  const work = workSlug ? getSculpture(workSlug) : undefined;
  const artist = work ? getArtist(work.artistSlug) : undefined;
  const workTitle = work ? `${work.title}${artist ? `, ${artist.name}` : ""}` : undefined;

  return (
    <main className="mx-auto grid max-w-[1200px] gap-[clamp(40px,6vw,96px)] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(56px,9vw,120px)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div>
        <span className="label">Contact</span>
        <h1 className="mt-5 text-[clamp(36px,5vw,60px)] leading-[1.06]">Write to us</h1>
        <p className="font-text mt-6 max-w-[40ch] text-lg leading-[1.75] text-stone">
          About a work, an artist, or showing your own work — we read every message and
          reply personally.
        </p>
        <dl className="mt-10 grid gap-5 text-sm">
          <div>
            <dt className="label">Email</dt>
            <dd className="mt-1.5">{site.email}</dd>
          </div>
          <div>
            <dt className="label">Follow</dt>
            <dd className="mt-1.5 flex gap-5">
              {site.social.map((s) => (
                <a key={s.label} href={s.href} className="hover:text-accent">
                  {s.label}
                </a>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <Contact workTitle={workTitle} />
    </main>
  );
}
