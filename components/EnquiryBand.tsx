"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
} from "lucide-react";
import { site } from "@/lib/site";

const WHATSAPP_TEXT =
  "Hello, I'm interested in an artwork on Sculpted India and would like to know more.";
const EMAIL_SUBJECT = "Enquiry about an artwork";

const option =
  "flex w-full items-center gap-2.5 px-4 py-3 text-left text-[15px] text-ink transition-colors hover:bg-plate hover:text-accent";

/**
 * "Email us" with a choice of how: a plain mailto: link does nothing on
 * computers without an email app set up, so Gmail and copying the address
 * are offered alongside it.
 */
function EmailMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const subject = encodeURIComponent(EMAIL_SUBJECT);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the address is shown in the menu to copy by hand.
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-[3px] border border-ink/25 px-6 py-3.5 text-[15px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
      >
        <Mail size={17} aria-hidden />
        Email us
        <ChevronDown
          size={15}
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-[min(280px,calc(100vw-32px))] overflow-hidden rounded-[6px] border border-rule bg-white shadow-[0_16px_36px_-20px_rgba(0,0,0,.35)] max-sm:left-0 max-sm:w-full"
        >
          <a
            role="menuitem"
            href={`mailto:${site.email}?subject=${subject}`}
            className={option}
          >
            <Mail size={16} aria-hidden /> Open your email app
          </a>
          <a
            role="menuitem"
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(site.email)}&su=${subject}`}
            target="_blank"
            rel="noopener noreferrer"
            className={option}
          >
            <ExternalLink size={16} aria-hidden /> Write in Gmail
          </a>
          <button role="menuitem" type="button" onClick={copy} className={option}>
            {copied ? (
              <Check size={16} aria-hidden className="text-accent" />
            ) : (
              <Copy size={16} aria-hidden />
            )}
            <span aria-live="polite">
              {copied ? "Copied" : "Copy address"}
            </span>
          </button>
          <p className="border-t border-rule px-4 py-3 text-[14px] text-stone">
            {site.email}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Band above the footer inviting visitors to ask about a work, on WhatsApp or
 * by email. Not shown on the Enquiry page (it has the full form) or on the
 * internal thumbnail render route.
 */
export default function EnquiryBand() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/contact") || pathname.startsWith("/artworks/thumb"))
    return null;

  const whatsapp = `https://wa.me/${site.phone.replace(/\D/g, "")}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  return (
    <section className="border-t border-rule bg-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-[clamp(16px,4vw,40px)] py-[clamp(56px,7vw,88px)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-16">
        <div>
          <h2 className="font-display text-[clamp(28px,3.2vw,40px)] leading-[1.15]">
            Interested in a work?
          </h2>
          <p className="font-text mt-4 max-w-[52ch] text-[17px] leading-[1.75] text-stone">
            If an artwork catches your eye, get in touch. Message us on
            WhatsApp or send an email, and we&apos;ll tell you more about it.
          </p>
        </div>
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-[3px] border border-accent bg-accent px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-[#2c4c37] hover:bg-[#2c4c37]"
          >
            <MessageCircle size={17} aria-hidden />
            WhatsApp us
          </a>
          <EmailMenu />
        </div>
      </div>
    </section>
  );
}
