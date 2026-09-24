import Link from "next/link";
import { site } from "@/lib/site";
import { publishedArtists } from "@/lib/artists";
import NewsletterForm from "./NewsletterForm";

const columns = () => [
  {
    title: "The Gallery",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Enquiries", href: "/contact" },
    ],
  },
  {
    title: "Artists",
    links: [
      ...publishedArtists()
        .slice(0, 4)
        .map((a) => ({ label: a.name, href: `/artists/${a.slug}` })),
      { label: "All artists", href: "/artists" },
    ],
  },
  {
    title: "Artworks",
    links: [
      { label: "Featured", href: "/#featured" },
      { label: "All works", href: "/artworks" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Viewing a work", href: "/about#viewing" },
      { label: "Privacy", href: "/about#privacy" },
    ],
  },
];

/** Saffronart-style footer: newsletter band, link columns, bottom bar. */
export default function Footer() {
  return (
    <footer>
      <section className="border-t border-rule bg-plate">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-5 px-[clamp(16px,4vw,40px)] py-9">
          <div>
            <h2 className="text-2xl">{site.newsletter.title}</h2>
            <p className="mt-1 text-sm text-stone">{site.newsletter.note}</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <div className="border-t border-rule">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-[clamp(16px,4vw,40px)] pb-12 pt-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-[22px]">
              {site.name}
            </Link>
            <p className="font-text mt-2.5 max-w-[32ch] text-[15px] text-stone">{site.tagline}</p>
          </div>
          {columns().map((col) => (
            <div key={col.title}>
              <h3 className="label mb-3.5">{col.title}</h3>
              <ul className="grid gap-2 text-sm text-stone">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-[clamp(16px,4vw,40px)] py-[18px] text-xs text-stone">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span className="flex gap-[18px]">
            {site.social.map((s) => (
              <a key={s.label} href={s.href} className="hover:text-ink">
                {s.label}
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
