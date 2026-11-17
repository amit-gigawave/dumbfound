import Image from "next/image";
import Link from "next/link";
import type { ArtistOption } from "./ArtistFilter";

/**
 * Artist filter for the artworks grid as a row of selection pills: "All
 * artists", then each artist who has works listed (portrait or initials, name,
 * count). The current choice is filled. Each pill is a plain link (?artist=),
 * so a filtered view can be shared, and choosing one keeps the scroll place.
 * Wraps on wider screens; on phones the row scrolls sideways.
 */
export default function ArtistPills({
  options,
  selected,
  total,
}: {
  options: ArtistOption[];
  selected?: string;
  total: number;
}) {
  const pills = [
    { slug: undefined, name: "All artists", count: total, option: undefined },
    ...options.map((o) => ({
      slug: o.slug,
      name: o.name,
      count: o.count,
      option: o,
    })),
  ];
  return (
    <ul className="-mx-[clamp(16px,4vw,40px)] flex gap-2 overflow-x-auto px-[clamp(16px,4vw,40px)] pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {pills.map((p) => {
        const on = p.slug === selected;
        return (
          <li key={p.slug ?? "all"} className="shrink-0">
            <Link
              href={p.slug ? `/artworks?artist=${p.slug}` : "/artworks"}
              scroll={false}
              aria-current={on ? "page" : undefined}
              className={`group inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                on
                  ? "border-ink bg-ink text-paper"
                  : "border-rule bg-white text-ink hover:border-ink/40"
              } ${p.option ? "" : "pl-3.5"}`}
            >
              {p.option && (
                <span
                  className={`relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full text-[9px] tracking-wide ${
                    on ? "bg-paper/15 text-paper" : "bg-plate text-stone"
                  }`}
                >
                  {p.option.portrait ? (
                    <Image
                      src={p.option.portrait}
                      alt=""
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  ) : (
                    p.option.initials
                  )}
                </span>
              )}
              <span className="whitespace-nowrap">{p.name}</span>
              <span
                className={`tabular-nums ${on ? "text-paper/60" : "text-stone"}`}
              >
                {p.count}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
