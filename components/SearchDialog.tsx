"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { search, suggestions, type SearchResult } from "@/lib/search";

/**
 * Full-width search panel. ↑/↓ move through results, Enter opens the
 * highlighted one, Esc closes. Mounted only while open, so every opening
 * starts with an empty query.
 */
export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const results = useMemo(
    () => (query.trim() ? search(query) : suggestions()),
    [query],
  );
  const groups = (["artist", "artwork"] as const)
    .map((kind) => ({ kind, items: results.filter((r) => r.kind === kind) }))
    .filter((g) => g.items.length > 0);
  // Flat order that matches what's on screen, for keyboard navigation.
  const ordered = groups.flatMap((g) => g.items);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const go = (r: SearchResult | undefined) => {
    if (!r) return;
    onClose();
    router.push(r.href);
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
      className="fixed inset-0 z-[70] bg-ink/25 backdrop-blur-[2px] motion-safe:animate-[page-in_0.25s_ease-out]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="border-b border-rule bg-paper shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
        <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-8 pt-6">
          <div className="flex items-center gap-4 border-b border-ink pb-3">
            <SearchIcon className="h-5 w-5 shrink-0 text-stone" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search artists and artworks"
              aria-label="Search artists and artworks"
              role="combobox"
              aria-expanded={ordered.length > 0}
              aria-controls={listId}
              aria-activedescendant={
                ordered[active] ? `${listId}-${active}` : undefined
              }
              className="min-w-0 flex-1 bg-transparent font-display text-[clamp(22px,3vw,32px)] outline-none focus-visible:outline-none placeholder:text-stone/60 [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-[12px] uppercase tracking-[0.12em] text-stone hover:text-accent"
            >
              Close
            </button>
          </div>

          <div id={listId} role="listbox" aria-label="Results" className="mt-6">
            {ordered.length === 0 ? (
              <p className="font-text text-[17px] text-stone">
                Nothing matches “{query.trim()}”. Try an artist&apos;s name, a
                title or a material.
              </p>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {!query.trim() && (
                  <p className="label -mb-4 md:col-span-2">Suggestions</p>
                )}
                {groups.map((g) => (
                  <div key={g.kind}>
                    <p className="label mb-3">
                      {g.kind === "artist" ? "Artists" : "Artworks"}
                    </p>
                    <ul className="grid gap-1">
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
                              onMouseEnter={() => setActive(i)}
                              className={`flex w-full items-center gap-4 p-2 text-left transition-colors ${
                                isActive ? "bg-plate" : ""
                              }`}
                            >
                              <span
                                className={`relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden border border-rule bg-plate ${
                                  r.kind === "artist" ? "rounded-full" : ""
                                }`}
                              >
                                {r.image && (
                                  <Image
                                    src={r.image}
                                    alt=""
                                    fill
                                    sizes="56px"
                                    className={
                                      r.kind === "artist"
                                        ? "object-cover"
                                        : "object-contain p-1"
                                    }
                                  />
                                )}
                              </span>
                              <span className="min-w-0">
                                <span
                                  className={`block truncate font-display text-lg tracking-[0.02em] ${
                                    isActive ? "text-accent" : ""
                                  }`}
                                >
                                  {r.title}
                                </span>
                                <span className="block truncate text-[13px] text-stone">
                                  {r.subtitle}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
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
