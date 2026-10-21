import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedWorks } from "@/lib/sculptures";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import SectionHeader from "@/components/gallery/SectionHeader";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  const works = getFeaturedWorks().slice(0, 3);

  return (
    <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(56px,9vw,120px)]">
      <div data-reveal-stagger className="max-w-[640px]">
        <span className="label">Error 404</span>
        <h1 className="heading-caps mt-5 text-[clamp(34px,5vw,60px)] leading-[1.1] tracking-[0.05em]">
          Page not found
        </h1>
        <p className="font-text mt-6 max-w-[44ch] text-lg leading-[1.75] text-stone">
          The page you were looking for has moved or no longer exists. The
          artworks and artists are all still here.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-6">
          <Link href="/artworks" className="btn">
            View the artworks <span className="nudge">→</span>
          </Link>
          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </div>

      {works.length > 0 && (
        <section className="mt-[clamp(72px,9vw,120px)]">
          <SectionHeader title="Featured works" />
          <div
            data-reveal-stagger
            className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3"
          >
            {works.map((work) => (
              <ArtworkTile
                key={work.slug}
                work={work}
                sizes="(min-width: 640px) 33vw, 100vw"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
