import Link from "next/link";

export const VIEWS = [
  { id: "cards", label: "Artworks" },
  { id: "spotlight", label: "Spotlight" },
  { id: "scale", label: "True scale" },
] as const;
export type ViewId = (typeof VIEWS)[number]["id"];

export const parseView = (v: string | undefined): ViewId =>
  VIEWS.find((x) => x.id === v)?.id ?? "cards";

/** Pill switch between the ways of browsing the collection (the address keeps the choice: ?view=). */
export default function ViewSwitch({ current }: { current: ViewId }) {
  return (
    <nav
      aria-label="How to browse the works"
      className="fixed bottom-4 left-1/2 z-[60] flex max-w-[calc(100vw-32px)] -translate-x-1/2 gap-1 overflow-x-auto rounded-full bg-white/85 p-1 shadow-[0_6px_24px_-8px_rgba(0,0,0,0.3)] backdrop-blur [scrollbar-width:none]"
    >
      {VIEWS.map((v) => (
        <Link
          key={v.id}
          href={v.id === "cards" ? "/artworks" : `/artworks?view=${v.id}`}
          aria-current={v.id === current ? "page" : undefined}
          className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
            v.id === current ? "bg-ink text-paper" : "text-stone hover:text-ink"
          }`}
        >
          {v.label}
        </Link>
      ))}
    </nav>
  );
}
