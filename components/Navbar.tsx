"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { motion } from "motion/react";
import clsx from "clsx";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { label: "Home", href: "/#home", section: "home" },
  { label: "Sculptures", href: "/#collection", section: "collection" },
  { label: "The Artist", href: "/#about", section: "about" },
  { label: "Gallery", href: "/gallery", section: null },
  { label: "Contact", href: "/#contact", section: "contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("home");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-spy: highlight the section currently in view (home page only)
  useEffect(() => {
    if (pathname !== "/") return;
    const sections = navLinks
      .map((l) => l.section)
      .filter((s): s is string => Boolean(s))
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // Which link the highlight pill rests on
  const activeLabel = pathname?.startsWith("/gallery")
    ? "Gallery"
    : (navLinks.find((l) => l.section === activeSection)?.label ?? "Home");

  const highlighted = hovered ?? activeLabel;

  return (
    <>
      <nav
        className={clsx(
          "fixed top-0 left-0 w-full z-50 transition-all duration-700 pointer-events-none flex justify-center",
          isScrolled ? "pt-3 md:pt-4" : "pt-6 md:pt-8",
        )}
      >
        <div className="flex items-center justify-between w-full max-w-[1400px] px-6 md:px-12 pointer-events-auto">
          {/* Logo */}
          <Link
            href="/#home"
            className="group flex items-center gap-3.5 transition-transform duration-300 hover:scale-[1.01]"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-foreground text-background font-serif text-[13px] font-medium tracking-[0.12em] shadow-[0_10px_24px_rgba(21,20,21,0.20)] ring-1 ring-white/15 overflow-hidden">
              <span className="relative z-10">TV</span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
              <span className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(255,158,109,0.45),transparent_60%)]" />
            </div>
            <span className="font-serif text-xl font-medium tracking-tight text-foreground hidden sm:block transition-opacity duration-300 group-hover:opacity-80">
              Thota Vaikuntam
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div
            onMouseLeave={() => setHovered(null)}
            className={clsx(
              "hidden md:flex items-center p-1.5 rounded-full transition-all duration-500",
              isScrolled
                ? "bg-white/65 backdrop-blur-2xl border border-white/70 shadow-[0_10px_40px_rgba(21,20,21,0.10)]"
                : "bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(21,20,21,0.05)]",
            )}
          >
            {navLinks.map((link) => {
              const isHighlighted = highlighted === link.label;
              const isActive = activeLabel === link.label;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onMouseEnter={() => setHovered(link.label)}
                  className="relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300"
                >
                  {isHighlighted && (
                    <motion.span
                      layoutId="nav-highlight"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(21,20,21,0.08)] ring-1 ring-black/[0.03]"
                      transition={{
                        type: "spring",
                        bounce: 0.18,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <span
                    className={clsx(
                      "relative z-10 transition-colors duration-300",
                      isHighlighted ? "text-foreground" : "text-foreground/65",
                    )}
                  >
                    {link.label}
                  </span>
                  {/* active accent dot */}
                  <span
                    className={clsx(
                      "absolute left-1/2 -bottom-0.5 z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-[#f2741f] transition-opacity duration-300",
                      isActive && !hovered ? "opacity-100" : "opacity-0",
                    )}
                  />
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className={clsx(
              "md:hidden flex h-12 w-12 items-center justify-center rounded-full text-foreground transition-all duration-300 hover:scale-105 active:scale-95",
              isScrolled
                ? "bg-white/65 backdrop-blur-2xl border border-white/70 shadow-[0_10px_40px_rgba(21,20,21,0.10)]"
                : "bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(21,20,21,0.05)]",
            )}
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={2.25} />
          </button>
        </div>
      </nav>

      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        navLinks={navLinks}
      />
    </>
  );
}
