"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import MobileMenu from "./MobileMenu";
import SearchDialog, { SearchIcon } from "./SearchDialog";

/** Catalogue header: wordmark left, small uppercase links and search right. */
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
          <Link
            href="/"
            className="font-display text-[26px] leading-none tracking-[0.01em]"
          >
            {site.name}
          </Link>

          <div className="flex items-center gap-8">
            <nav aria-label="Main" className="hidden gap-8 md:flex">
              {site.nav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`nav-link py-1.5 text-[11px] uppercase tracking-[0.22em] ${
                    isActive(link.href)
                      ? "text-accent"
                      : "text-ink/75 hover:text-accent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={openSearch}
              aria-label="Search artists and artworks"
              title="Search ( / )"
              className="flex items-center gap-2 text-ink/75 transition-colors hover:text-accent"
            >
              <SearchIcon className="h-[18px] w-[18px]" />
              <span className="hidden text-[11px] uppercase tracking-[0.22em] lg:inline">
                Search
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="text-[11px] uppercase tracking-[0.22em] md:hidden"
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
