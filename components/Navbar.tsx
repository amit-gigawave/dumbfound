"use client";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import clsx from "clsx";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "The Artist", href: "#about" },
    { label: "Sculptures", href: "#collection" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <nav
        className={clsx(
          "fixed top-0 left-0 w-full z-50 transition-all duration-700 pointer-events-none flex justify-center",
          isScrolled ? "pt-4 md:pt-6" : "pt-6 md:pt-8",
        )}
      >
        <div className="flex items-center justify-between w-full max-w-[1400px] px-6 md:px-12 pointer-events-auto">
          {/* Logo */}
          <a
            href="#home"
            className="group flex items-center gap-4 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-foreground text-background font-bold tracking-widest text-sm shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:rotate-[360deg]">
              TV
            </div>
            <span className="font-serif text-xl font-medium tracking-tight text-foreground hidden sm:block transition-opacity duration-300 group-hover:opacity-80">
              Thota Vaikuntam
            </span>
          </a>

          {/* Desktop Navigation */}
          <div
            className={clsx(
              "hidden md:flex items-center transition-all duration-700",
              "bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
              "p-1.5 rounded-full",
            )}
          >
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative px-6 py-2.5 rounded-full text-sm font-medium text-foreground/80 transition-all duration-300 hover:text-foreground hover:bg-white/60 hover:shadow-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden flex h-12 w-12 items-center justify-center rounded-full bg-white/40 backdrop-blur-xl border border-white/40 text-foreground shadow-sm transition-all duration-300 hover:bg-white/60 hover:scale-105 active:scale-95"
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={2.5} />
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
