import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

/**
 * Closing band: the wordmark (in white), the site's pages and the email
 * address, then the copyright year.
 */
export default function Footer() {
  return (
    <footer className="deep">
      <div className="mx-auto grid max-w-[1200px] gap-[clamp(28px,4vw,40px)] px-[clamp(16px,4vw,40px)] py-[clamp(40px,5vw,56px)]">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          <Link href="/" aria-label={`${site.name}, home`} className="shrink-0">
            <Image
              src="/logos/sculpted-india-wordmark.png"
              alt={site.name}
              width={480}
              height={71}
              className="h-auto w-[clamp(160px,16vw,210px)] brightness-0 invert"
            />
          </Link>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-3 text-[15px]">
              {site.nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#d0d0d0] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 text-[14px] text-deep-muted">
          <a
            href={`mailto:${site.email}`}
            className="transition-colors hover:text-white"
          >
            {site.email}
          </a>
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
        </div>
      </div>
    </footer>
  );
}
