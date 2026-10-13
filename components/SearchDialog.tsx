"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  quickSearches,
  search,
  suggestions,
  type SearchResult,
} from "@/lib/search";

type Filter = "all" | "artist" | "artwork";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "artist", label: "Artists" },
  { id: "artwork", label: "Artworks" },
];
/** Rows per group in the "All" view; the tabs show everything. */
const PER_GROUP = 5;

/** Wraps the parts of `text` that match a query word in a soft highlight. */
const highlight = (text: string, query: string) => {
  const words = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return text;
  const re = new RegExp(`(${words.join("|")})`, "gi");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark
        key={i}
        className="rounded-[3px] bg-accent/15 px-[1px] text-inherit"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-[5px] border border-rule bg-white px-1.5 font-sans text-[10px] leading-[18px] text-stone">
    {children}
  </kbd>
);

/**
 * Search palette: a centred card with filter tabs, highlighted matches and
 * keyboard hints. ↑/↓ move, Enter opens, Esc closes. Mounted only while open,
 * so every opening starts with an empty query.
 */
export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(false);
  const listId = useId();
  const q = query.trim();

  const all = useMemo(() => (q ? search(q, 60) : suggestions()), [q]);
  const counts = {
    all: all.length,
    artist: all.filter((r) => r.kind === "artist").length,
    artwork: all.filter((r) => r.kind === "artwork").length,
  };
  const groups = (["artist", "artwork"] as const)
    .filter((kind) => filter === "all" || filter === kind)
    .map((kind) => {
      const items = all.filter((r) => r.kind === kind);
      return {
        kind,
        items: filter === "all" ? items.slice(0, PER_GROUP) : items,
        more: items.length,
      };
    })
    .filter((g) => g.items.length > 0);
  // Flat order that matches what's on screen, for keyboard navigation.
  const ordered = groups.flatMap((g) => g.items);
  const quick = useMemo(() => quickSearches(), []);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = "";
    };
  }, []);

  // Keep the highlighted row in view while moving with the keyboard.
  useEffect(() => {
    document
      .getElementById(`${listId}-${active}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const go = (r: SearchResult | undefined) => {
    if (!r) return;
    onClose();
    router.push(r.href);
  };

  const type = (value: string) => {
    setQuery(value);
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, ordered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(ordered[active]);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className={`fixed inset-0 z-[70] flex items-start justify-center bg-ink/30 px-3 pt-[clamp(16px,10vh,96px)] backdrop-blur-[3px] transition-opacity duration-300 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex max-h-[min(78vh,680px)] w-full max-w-[680px] flex-col overflow-hidden rounded-[20px] border border-rule bg-paper shadow-[0_40px_100px_-30px_rgba(0,0,0,.5)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(.3,.7,.3,1)] ${
          shown
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-2 scale-[.97] opacity-0"
        }`}
      >
        {/* Search field */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-rule px-5">
          <SearchIcon className="h-5 w-5 shrink-0 text-accent" />
          <div className="relative flex min-w-0 flex-1 items-center">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => type(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search artists, works, materials…"
              aria-label="Search artists and artworks"
              role="combobox"
              aria-expanded={ordered.length > 0}
              aria-controls={listId}
              aria-activedescendant={
                ordered[active] ? `${listId}-${active}` : undefined
              }
              className="peer min-w-0 flex-1 bg-transparent pl-2 caret-accent font-display text-[clamp(19px,2.4vw,23px)] outline-none placeholder:text-stone/55 placeholder-shown:caret-transparent focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {/* While the field is empty, a bolder pulsing cursor marks where typing starts;
              the native (accent) caret takes over as soon as there's text. */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-1/2 hidden h-[1.15em] w-[2px] -translate-y-1/2 rounded-full bg-accent font-display text-[clamp(19px,2.4vw,23px)] motion-safe:animate-pulse peer-placeholder-shown:peer-focus:block"
            />
          </div>
          {query && (
            <button
              type="button"
              onClick={() => {
                type("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-stone transition-colors hover:bg-plate hover:text-ink"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                <path
                  d="M2 2l8 8M10 2l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-[6px] border border-rule bg-white px-2 py-0.5 text-[11px] text-stone transition-colors hover:border-accent hover:text-accent"
          >
            esc
          </button>
        </div>

        {/* Filter tabs (once something is typed) */}
        {q && (
          <div
            className="flex shrink-0 gap-1.5 border-b border-rule px-4 py-2.5"
            role="tablist"
            aria-label="Filter results"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => {
                  setFilter(f.id);
                  setActive(0);
                  inputRef.current?.focus();
                }}
                className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                  filter === f.id
                    ? "bg-ink text-paper"
                    : "text-stone hover:bg-plate hover:text-ink"
                }`}
              >
                {f.label}
                <span
                  className={`ml-1.5 text-[11px] ${filter === f.id ? "text-paper/70" : "text-stone/70"}`}
                >
                  {counts[f.id]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div
          id={listId}
          role="listbox"
          aria-label="Results"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
        >
          {!q && quick.length > 0 && (
            <div className="px-2 pb-4 pt-1">
              <p className="label">Quick search</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quick.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      type(t);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full border border-rule bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {ordered.length === 0 ? (
            <div className="grid justify-items-center gap-3 px-6 py-12 text-center">
              <SearchIcon className="h-8 w-8 text-rule" />
              <p className="font-display text-[22px]">Nothing for “{q}”</p>
              <p className="max-w-[40ch] text-[14px] text-stone">
                Try an artist&apos;s name, a title or a material — or browse
                everything.
              </p>
              <div className="mt-2 flex gap-5 text-[11px] uppercase tracking-[0.16em]">
                <Link href="/artists" onClick={onClose} className="text-link">
                  All artists
                </Link>
                <Link href="/artworks" onClick={onClose} className="text-link">
                  All artworks
                </Link>
              </div>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.kind} className="mb-2 last:mb-0">
                <p className="label flex items-baseline justify-between px-2 pb-1.5 pt-2">
                  {!q
                    ? g.kind === "artist"
                      ? "Suggested artists"
                      : "Suggested works"
                    : g.kind === "artist"
                      ? "Artists"
                      : "Artworks"}
                  {q && filter === "all" && g.more > PER_GROUP && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilter(g.kind);
                        setActive(0);
                      }}
                      className="normal-case tracking-normal text-[12px] text-stone hover:text-accent"
                    >
                      See all {g.more} →
                    </button>
                  )}
                </p>
                <ul className="grid gap-0.5">
                  {g.items.map((r) => {
                    const i = ordered.indexOf(r);
                    const isActive = i === active;
                    return (
                      <li
                        key={r.href}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={isActive}
                      >
                        <button
                          type="button"
                          onClick={() => go(r)}
                          onMouseMove={() => setActive(i)}
                          className={`relative flex w-full items-center gap-4 rounded-[12px] px-3 py-2.5 text-left transition-[background-color,box-shadow] duration-200 ${
                            isActive
                              ? "bg-white shadow-[0_6px_20px_-12px_rgba(0,0,0,.3)]"
                              : ""
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`absolute bottom-3 left-0 top-3 w-[2px] rounded bg-accent transition-transform duration-200 ${
                              isActive ? "scale-y-100" : "scale-y-0"
                            }`}
                          />
                          <span
                            className={`relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden border border-rule bg-plate ${
                              r.kind === "artist"
                                ? "rounded-full"
                                : "rounded-[8px]"
                            }`}
                          >
                            {r.image && (
                              <Image
                                src={r.image}
                                alt=""
                                fill
                                sizes="48px"
                                className={
                                  r.kind === "artist"
                                    ? "object-cover"
                                    : "object-contain p-1"
                                }
                              />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate font-display text-[18px] tracking-[0.02em] transition-colors ${
                                isActive ? "text-accent" : ""
                              }`}
                            >
                              {highlight(r.title, q)}
                            </span>
                            <span className="block truncate text-[13px] text-stone">
                              {highlight(r.subtitle, q)}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                              isActive ? "text-accent" : "text-stone/60"
                            }`}
                          >
                            {isActive
                              ? "Open ↵"
                              : r.kind === "artist"
                                ? "Artist"
                                : "Artwork"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Keyboard hints */}
        <div className="hidden shrink-0 items-center gap-5 border-t border-rule bg-white/60 px-5 py-2.5 text-[11px] text-stone sm:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> Move
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> Open
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>esc</Kbd> Close
          </span>
          {q && <span className="ml-auto">{counts.all} results</span>}
        </div>
      </div>
    </div>
  );
}

export const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="m16 16 4.5 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
