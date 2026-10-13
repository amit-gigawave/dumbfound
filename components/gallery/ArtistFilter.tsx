"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface ArtistOption {
  slug: string;
  name: string;
  initials: string;
  portrait?: string;
  count: number;
}

const Avatar = ({ option }: { option?: ArtistOption }) => (
  <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-plate text-[10px] tracking-wide text-stone">
    {option?.portrait ? (
      <Image
        src={option.portrait}
        alt=""
        fill
        sizes="28px"
        className="object-cover"
      />
    ) : (
      (option?.initials ?? "All")
    )}
  </span>
);

/**
 * Artist filter for the artworks grid: one button showing the current choice,
 * opening a menu of the artists who have works listed (portrait, name, count).
 * On larger screens the menu drops down under the button; on phones it is a
 * bottom sheet over a dimmed page. Closes on Escape, on an outside tap, or
 * once a choice is made.
 */
export default function ArtistFilter({
  options,
  selected,
  total,
}: {
  options: ArtistOption[];
  selected?: string;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  // The phone sheet is mounted on first open (it lives in <body>, outside the
  // page's transformed <main>, so `fixed` is relative to the screen).
  const [sheetMounted, setSheetMounted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = options.find((o) => o.slug === selected);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!root.current?.contains(t) && !sheet.current?.contains(t))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = (
    href: string,
    label: string,
    count: number,
    active: boolean,
    option?: ArtistOption,
  ) => (
    <li key={href}>
      <Link
        href={href}
        scroll={false}
        aria-current={active ? "page" : undefined}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 rounded-[10px] px-2.5 py-3 text-[15px] transition-colors hover:bg-plate sm:py-2 sm:text-[14px] ${
          active ? "text-ink" : "text-ink/80"
        }`}
      >
        <Avatar option={option} />
        <span className="flex-1 truncate">{label}</span>
        <span className="text-[12px] tabular-nums text-stone">{count}</span>
        <Check
          size={14}
          strokeWidth={2}
          aria-hidden
          className={active ? "text-accent" : "invisible"}
        />
      </Link>
    </li>
  );

  const list = (
    <ul>
      {item("/artworks", "All artists", total, !current)}
      {options.map((o) =>
        item(
          `/artworks?artist=${o.slug}`,
          o.name,
          o.count,
          o.slug === current?.slug,
          o,
        ),
      )}
    </ul>
  );

  return (
    <div ref={root} className="relative w-full sm:inline-block sm:w-auto">
      <button
        ref={button}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="artist-filter-menu"
        onClick={() => {
          if (sheetMounted) return setOpen((o) => !o);
          // First open: mount the sheet closed, then open it so it slides in.
          setSheetMounted(true);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setOpen(true)),
          );
        }}
        className={`flex h-12 w-full items-center gap-2.5 rounded-full border bg-white pl-1.5 pr-4 text-[14px] transition-colors sm:inline-flex sm:h-11 sm:w-auto ${
          open ? "border-ink" : "border-rule hover:border-ink/40"
        }`}
      >
        <Avatar option={current} />
        <span className="text-stone">Artist</span>
        <span className="flex-1 truncate text-left text-ink">
          {current?.name ?? "All artists"}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={1.8}
          aria-hidden
          className={`text-stone transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Larger screens: dropdown under the button, aligned to its right edge. */}
      <div
        id="artist-filter-menu"
        inert={!open}
        className={`absolute right-0 top-[calc(100%+8px)] z-30 hidden w-[300px] origin-top-right rounded-[14px] border border-rule bg-white p-1.5 shadow-[0_22px_48px_-24px_rgba(0,0,0,.35)] transition-[opacity,transform] duration-200 ease-out sm:block ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-[.98] opacity-0"
        }`}
      >
        {list}
      </div>

      {/* Phones: bottom sheet over a dimmed page. */}
      {sheetMounted &&
        createPortal(
          <div className="sm:hidden">
            <div
              aria-hidden
              onClick={() => setOpen(false)}
              className={`fixed inset-0 z-[70] bg-ink/35 transition-opacity duration-300 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
            <div
              ref={sheet}
              role="dialog"
              aria-label="Filter by artist"
              inert={!open}
              className={`fixed inset-x-0 bottom-0 z-[71] rounded-t-[22px] bg-white px-3 pb-[max(16px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_40px_-20px_rgba(0,0,0,.35)] transition-transform duration-300 ease-[cubic-bezier(.3,.7,.3,1)] ${
                open ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <span
                aria-hidden
                className="mx-auto mb-3 block h-1 w-10 rounded-full bg-rule"
              />
              <p className="label px-2.5 pb-2">Filter by artist</p>
              {list}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
