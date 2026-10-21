import Link from "next/link";
import { site } from "@/lib/site";

const col = "grid content-start gap-3 text-[14px]";
const head = "mb-1 text-[11px] uppercase tracking-[0.2em] text-deep-muted";
const link = "text-[#d0d0d0] transition-colors hover:text-accent-light";

/** Closing band: name and tagline, the pages, contact, copyright. */
export default function Footer() {
  return (
    <footer className="deep">
      <div className="mx-auto grid max-w-[1200px] gap-x-10 gap-y-12 px-[clamp(16px,4vw,40px)] pb-14 pt-[clamp(64px,8vw,104px)] md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="grid content-start gap-5">
          <Link
            href="/"
            className="font-display text-[clamp(30px,3.6vw,44px)] leading-none tracking-[0.02em] text-[#f2f2f2]"
          >
            {site.name}
          </Link>
          <p className="font-text max-w-[40ch] text-[16px] leading-[1.7] text-[#bdbdbd]">
            {site.tagline}
          </p>
        </div>

        <nav aria-label="Footer" className={col}>
          <span className={head}>Explore</span>
          {site.nav
            .filter((n) => n.href !== "/")
            .map((n) => (
              <Link key={n.href} href={n.href} className={link}>
                {n.label}
              </Link>
            ))}
        </nav>

        <div className={col}>
          <span className={head}>Contact</span>
          <a href={`mailto:${site.email}`} className={link}>
            {site.email}
          </a>
          {site.contacts
            .filter((c) => c.phone)
            .map((c) => (
              <a key={c.name} href={`tel:${c.phone.replace(/\s/g, "")}`} className={link}>
                {c.phone} <span className="text-deep-muted">· {c.name}</span>
              </a>
            ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 border-t border-white/10 px-[clamp(16px,4vw,40px)] py-6 text-[11px] uppercase tracking-[0.16em] text-deep-muted">
        <span>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </span>
        <Link href="/about#privacy" className="transition-colors hover:text-accent-light">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
