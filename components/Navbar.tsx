"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <nav className="navbar fixed top-0 left-0 w-full z-50 pt-2! pointer-events-none">

        <div className="logo-container pointer-events-auto">
          <div className="logo-placeholder">
            <div className="logo-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="4" fill="white" fillOpacity="0.8" />
                <circle cx="16" cy="8" r="4" fill="white" fillOpacity="0.8" />
                <circle cx="8" cy="16" r="4" fill="white" fillOpacity="0.8" />
                <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.8" />
              </svg>
            </div>
            <span className="brand-name">
              <a href="#home">Dumbfound</a>
            </span>
          </div>
        </div>


        <div className="nav-main glass pill hidden md:flex pointer-events-auto ">
          <div className="nav-links">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link text-black!"
              >
                {link.label}
              </a>
            ))}
          </div>

        </div>


        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-white transition-colors hover:bg-white/20"
        >
          <Menu size={22} />
        </button>
      </nav>


      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        navLinks={navLinks}
      />
    </>
  );
}
