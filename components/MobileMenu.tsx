"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { site } from "@/lib/site";

/** Full-screen menu for small screens: the same links, large and serif. */
export default function MobileMenu({
  open,
  onClose,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[60] flex flex-col bg-paper px-[clamp(16px,4vw,40px)] md:hidden"
    >
      <div className="flex h-[84px] items-center justify-between border-b border-rule">
        <Image
          src="/logos/sculpted-india-wordmark.png"
          alt={site.name}
          width={480}
          height={71}
          className="h-auto w-[clamp(150px,16vw,203px)]"
        />
        <button
          type="button"
          onClick={onClose}
          className="text-[15px]"
        >
          Close
        </button>
      </div>

      <nav aria-label="Main" className="mt-10 grid gap-2">
        {site.nav.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={`font-display text-3xl leading-snug tracking-[0.01em] ${isActive(link.href) ? "text-accent" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-rule py-6 text-[13px] text-stone">
        <p>{site.email}</p>
        <p className="mt-2 flex gap-5">
          {site.social.map((s) => (
            <a key={s.label} href={s.href} className="hover:text-accent">
              {s.label}
            </a>
          ))}
        </p>
      </div>
    </div>
  );
}
