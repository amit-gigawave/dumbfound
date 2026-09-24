"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";
import MobileMenu from "./MobileMenu";

/** Catalogue header: wordmark left, small uppercase links right, hairline rule below. */
export default function Navbar() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between gap-5 px-[clamp(16px,4vw,40px)]">
        <Link href="/" className="font-display text-[26px] leading-none tracking-[0.01em]">
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden gap-8 md:flex">
          {site.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`border-b py-1.5 text-[13px] uppercase tracking-[0.06em] transition-colors ${
                isActive(link.href)
                  ? "border-ink text-ink"
                  : "border-transparent text-stone hover:border-ink hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="text-[13px] uppercase tracking-[0.08em] md:hidden"
        >
          Menu
        </button>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} isActive={isActive} />
    </header>
  );
}
