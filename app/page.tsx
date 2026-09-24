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

  return (
    <main>
      {/* Hero — words only, like a gallery's opening wall text */}
      <section
        data-reveal-stagger
        className={`${wrap} pb-[clamp(48px,7vw,90px)] pt-[clamp(72px,12vw,150px)]`}
      >
        <span className="label">Contemporary art</span>
        <h1 className="mt-5 max-w-[14ch] text-[clamp(40px,6.4vw,84px)] leading-[1.04] tracking-[-0.015em]">
          Art, and the hands <em className="text-accent">that made it.</em>
        </h1>
        <p className="font-text mt-7 max-w-[52ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-stone">
          A gallery of artists and their works — established names and new
          voices, across every medium — each presented with the care of a museum
          catalogue: who made it, what it is, and the story it carries.
        </p>
        <div className="mt-9 flex flex-wrap gap-8">
          <Link href="/artworks" className="text-link">
            View the artworks <span className="nudge">→</span>
          </Link>
          <Link href="/artists" className="text-link">
            Meet the artists <span className="nudge">→</span>
          </Link>
        </div>
      </section>

      <div className="border-y border-rule">
        <p
          className={`${wrap} flex flex-wrap gap-x-7 gap-y-2 py-4 text-[13px] text-stone`}
        >
          <span>Now showing</span>
          <span className="font-medium text-ink">
            {live.length} {live.length === 1 ? "artist" : "artists"}
          </span>
          <span className="font-medium text-ink">
            {sculptures.length} {sculptures.length === 1 ? "work" : "works"}
          </span>
        </p>
      </div>

      <section className={`${wrap} py-[clamp(64px,8vw,104px)]`}>
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

      <section id="featured" className={`${wrap} pb-[clamp(64px,8vw,104px)]`}>
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
    </main>
  );
}
