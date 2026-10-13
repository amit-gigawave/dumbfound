import Link from "next/link";
import { artists, publishedArtists } from "@/lib/artists";
import { getFeaturedWorks, getSculpture, sculptures } from "@/lib/sculptures";
import HeroScroll, { type HeroWork } from "@/components/HeroScroll";
import ArtistTile from "@/components/gallery/ArtistTile";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import SectionHeader from "@/components/gallery/SectionHeader";
import Magnetic from "@/components/Magnetic";
import Manifesto from "@/components/about/Manifesto";
import PortraitFan from "@/components/gallery/PortraitFan";

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

// Portraits fanned out beside "Every work has a maker" (missing ones are skipped).
const FAN = [
  "mf-husain",
  "krishen-khanna",
  "thota-vaikuntam",
  "himmat-shah",
  "jogen-chowdhury",
];

export default function Home() {
  const live = publishedArtists();
  const featured = getFeaturedWorks();
  const heroWork = heroWorkFor(HERO_WORK);
  const fan = FAN.flatMap(
    (slug) => artists.find((a) => a.slug === slug && a.portrait) ?? [],
  );
  const count = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;

  return (
    <main>
      {/* Hero: intro left, a featured sculpture right; on scroll the
          sculpture slides left and its details appear (HeroScroll). */}
      {heroWork && <HeroScroll work={heroWork} />}

      <div className="border-y border-rule bg-white">
        <div
          className={`${wrap} flex flex-wrap items-baseline gap-x-[30px] gap-y-2 py-4 text-[11px] uppercase tracking-[0.16em] text-stone`}
        >
          <span>Now showing</span>
          <span className="font-display text-lg normal-case tracking-[0.06em] text-accent">
            {count(live.length, "artist", "artists")} ·{" "}
            {count(sculptures.length, "work", "works")}
          </span>
          <Link
            href="/artworks"
            className="ml-auto text-accent transition-colors hover:text-ink"
          >
            View the artworks <span className="nudge">→</span>
          </Link>
        </div>
      </div>

      <section className={`${wrap} py-[clamp(64px,8vw,110px)]`}>
        <SectionHeader
          title="Artists"
          link={{ label: "All artists", href: "/artists" }}
        />
        <div
          data-reveal-stagger
          data-focus-grid
          className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {artists.map((artist) => (
            <ArtistTile key={artist.slug} artist={artist} />
          ))}
        </div>
      </section>

      <section id="featured" className={`${wrap} pb-[clamp(64px,8vw,110px)]`}>
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
            />
          ))}
        </div>
      </section>

      {/* Deep contrast band */}
      <section className="deep overflow-hidden">
        <div
          className={`${wrap} grid items-center gap-[clamp(40px,6vw,80px)] py-[clamp(70px,9vw,120px)] md:grid-cols-[1.1fr_1fr]`}
        >
          <div data-reveal-stagger className="grid gap-[22px]">
            <span className="label">About the gallery</span>
            <Manifesto
              as="h2"
              dark
              text="Every work has a **maker,** and a **story.**"
              className="heading-caps max-w-[18ch] text-[clamp(28px,4vw,50px)] leading-[1.14] tracking-[0.06em]"
            />
            <p className="font-text max-w-[52ch] text-[17px] leading-[1.75] text-[#d0d0d0]">
              We bring together artists and their work, and present each piece
              with the care of a catalogue: who made it, what it is made of, and
              the story it carries.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-7">
              <Magnetic>
                <Link href="/about" className="btn">
                  About us <span className="nudge">→</span>
                </Link>
              </Magnetic>
              <Link href="/artists" className="text-link text-[#d0d0d0]">
                Meet all {count(live.length, "artist", "artists")}{" "}
                <span className="nudge">→</span>
              </Link>
            </div>
          </div>
          <div data-reveal>
            <PortraitFan artists={fan} />
          </div>
        </div>
      </section>
    </main>
  );
}
