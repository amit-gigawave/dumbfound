import Link from "next/link";
import { artists, publishedArtists } from "@/lib/artists";
import { getFeaturedWorks, sculptures } from "@/lib/sculptures";
import ArtistTile from "@/components/gallery/ArtistTile";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import SectionHeader from "@/components/gallery/SectionHeader";

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

export default function Home() {
  const live = publishedArtists();
  const featured = getFeaturedWorks();
  const count = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;

  return (
    <main>
      {/* Hero: words only, like a gallery's opening wall text */}
      <section
        data-reveal-stagger
        className={`${wrap} pb-[clamp(56px,8vw,100px)] pt-[clamp(70px,11vw,140px)]`}
      >
        <span className="label">Contemporary art</span>
        <h1 className="heading-caps mt-[22px] max-w-[15ch] text-[clamp(38px,6vw,80px)] leading-[1.06] tracking-[0.03em]">
          Art, and the hands that made it.
        </h1>
        <p className="font-text mt-[26px] max-w-[52ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
          A gallery of artists and their works, established names and new
          voices, across every medium, each presented with the care of a museum
          catalogue.
        </p>
        <div className="mt-[34px] flex flex-wrap items-center gap-[30px]">
          <Link href="/artworks" className="btn">
            View the artworks
          </Link>
          <Link href="/artists" className="text-link">
            Meet the artists
          </Link>
        </div>
      </section>

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
            <ArtworkTile key={work.slug} work={work} priority={i < 3} />
          ))}
        </div>
      </section>

      {/* Deep contrast band */}
      <section className="deep">
        <div
          data-reveal-stagger
          className={`${wrap} grid gap-[22px] py-[clamp(70px,9vw,120px)]`}
        >
          <span className="label">About the gallery</span>
          <h2 className="heading-caps max-w-[18ch] text-[clamp(28px,4vw,50px)] leading-[1.14] tracking-[0.06em]">
            Every work has a maker, and a story.
          </h2>
          <p className="font-text max-w-[52ch] text-[17px] leading-[1.75] text-[#d0d0d0]">
            We bring together artists and their work, and present each piece
            with the care of a catalogue: who made it, what it is made of, and
            the story it carries.
          </p>
          <div>
            <Link href="/about" className="btn mt-2.5">
              About us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
