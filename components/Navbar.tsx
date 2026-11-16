"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import MobileMenu from "./MobileMenu";
import SearchDialog, { SearchIcon } from "./SearchDialog";

/** Catalogue header: wordmark left, page links in normal case, search right. */
export default function Navbar() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // "/" or Ctrl/⌘+K opens search from anywhere (except while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest(
        "input, textarea, select, [contenteditable]",
      );
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !typing)
      ) {
        e.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSearch = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[84px] max-w-[1200px] items-center justify-between gap-5 px-[clamp(16px,4vw,40px)]">
          <Link href="/" className="shrink-0" aria-label={`${site.name}, home`}>
            <Image
              src="/logos/sculpted-india-wordmark.png"
              alt={site.name}
              width={480}
              height={71}
              priority
              className="h-auto w-[clamp(150px,16vw,203px)]"
            />
          </Link>

          {/* Three groups — wordmark · links · search — spread evenly by justify-between. */}
          <nav
            aria-label="Main"
            className="hidden gap-5 md:flex lg:gap-6 xl:gap-8"
          >
            {site.nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`nav-link py-1.5 text-[15px] ${
                  isActive(link.href)
                    ? "text-accent"
                    : "text-ink/75 hover:text-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search artists and artworks"
              title="Search ( / )"
              className="group flex items-center gap-2.5 rounded-full border border-rule bg-white/70 p-2 text-ink/75 transition-[border-color,color,box-shadow] duration-300 hover:border-accent/50 hover:text-accent hover:shadow-[0_6px_18px_-10px_rgba(0,0,0,.35)] lg:py-2 lg:pl-3.5 lg:pr-2 xl:w-[230px]"
            >
              <SearchIcon className="h-4 w-4 shrink-0" />
              <span className="hidden flex-1 text-left text-[12px] tracking-[0.02em] text-stone transition-colors group-hover:text-accent lg:inline">
                Search
                <span className="hidden xl:inline"> artists &amp; works</span>
              </span>
              <kbd className="hidden rounded-[6px] border border-rule bg-paper px-1.5 font-sans text-[11px] leading-5 text-stone lg:inline">
                /
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="text-[15px] md:hidden"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop blur would otherwise trap these
          fixed overlays inside the header's box. */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isActive={isActive}
      />
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </>
  );
}
