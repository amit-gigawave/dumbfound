"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Mail, Share2 } from "lucide-react";

/**
 * Shares an artwork's page. On a phone or tablet it opens the device's own
 * share sheet (WhatsApp, Messages, …); with a mouse it opens a small menu:
 * WhatsApp, Copy link and Email. The page's link preview (title, text and a
 * picture of the work) comes from the page's metadata and opengraph-image.
 */
export default function ShareButton({
  url,
  title,
  text,
}: {
  /** The page's full public address. */
  url: string;
  title: string;
  /** One line to send with the link. */
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Close the menu on a click elsewhere, or Escape.
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const share = async () => {
    const touch = matchMedia("(hover: none)").matches;
    if (touch && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Cancelled, or the share sheet failed: nothing else to do.
      }
      return;
    }
    setOpen((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const message = `${text} ${url}`;
  const item =
    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] text-ink hover:bg-[#f3f2ee] focus-visible:bg-[#f3f2ee] focus-visible:outline-none";

  return (
    <div ref={root} className="relative inline-block">
      <button
        type="button"
        onClick={share}
        aria-haspopup="menu"
        aria-expanded={open}
        // The hollow style the site uses for a second action beside a solid
        // button; !gap restores the icon's spacing, which .btn sets to 0.
        className="btn btn-hollow !gap-2"
      >
        <Share2 size={15} strokeWidth={1.75} aria-hidden />
        Share
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-[12px] border border-rule bg-white py-1 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)]"
        >
          <a
            role="menuitem"
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={item}
          >
            <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="#25D366">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4.1-4.8-4.3-.1-.2-1.2-1.6-1.2-3s.7-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" />
            </svg>
            WhatsApp
          </a>
          <button type="button" role="menuitem" onClick={copy} className={item}>
            {copied ? <Check size={16} className="text-accent" aria-hidden /> : <Link2 size={16} aria-hidden />}
            {copied ? "Link copied" : "Copy link"}
          </button>
          <a
            role="menuitem"
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`}
            onClick={() => setOpen(false)}
            className={item}
          >
            <Mail size={16} aria-hidden />
            Email
          </a>
        </div>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
