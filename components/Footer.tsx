import Link from "next/link";
import { site } from "@/lib/site";

/** Minimal footer: name, the main links, copyright. */
export default function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-[clamp(16px,4vw,40px)] py-8">
        <Link href="/" className="font-display text-[20px]">
          {site.name}
        </Link>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-7 gap-y-2 text-[13px] text-stone"
        >
          {site.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="w-full text-xs text-stone md:w-auto">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
