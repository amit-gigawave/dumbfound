import Link from "next/link";
import { site } from "@/lib/site";

/** Minimal footer: name, the main links, copyright. */
export default function Footer() {
  return (
    <footer className="border-t border-rule bg-plate">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-3.5 px-[clamp(16px,4vw,40px)] py-9 text-[11px] uppercase tracking-[0.16em] text-stone">
        <Link
          href="/"
          className="font-display text-[22px] normal-case tracking-[0.02em] text-ink"
        >
          {site.name}
        </Link>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-[26px] gap-y-2"
        >
          {site.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
