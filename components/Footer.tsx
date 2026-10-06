import Link from "next/link";
import { site } from "@/lib/site";

/** Minimal footer: name, contact, copyright. */
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

        <div className="flex flex-col items-end gap-1 normal-case tracking-normal text-[13px]">
          <a href={`mailto:${site.email}`} className="transition-colors hover:text-accent">
            {site.email}
          </a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-accent">
            {site.phone}
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] border-t border-rule px-[clamp(16px,4vw,40px)] py-5 text-[11px] uppercase tracking-[0.16em] text-stone">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
