import Link from "next/link";
import { GalleryVerticalEnd, LayoutGrid, Ruler } from "lucide-react";

export const VIEWS = [
  { id: "cards", label: "Artworks", Icon: LayoutGrid },
  { id: "spotlight", label: "Spotlight", Icon: GalleryVerticalEnd },
  { id: "scale", label: "True scale", Icon: Ruler },
] as const;
export type ViewId = (typeof VIEWS)[number]["id"];

export const parseView = (v: string | undefined): ViewId =>
  VIEWS.find((x) => x.id === v)?.id ?? "cards";

/** Height of the bar (px), for views that fill the screen below it. */
export const VIEW_BAR_PX = 52;

/**
 * The ways of browsing the collection, in a slim bar that stays just under
 * the site header as the page scrolls (the address keeps the choice: ?view=).
 * Render it before <main>, so it sticks for the whole page. The three choices
 * share the width on a phone, so none is cut off.
 */
export default function ViewSwitch({ current }: { current: ViewId }) {
  return (
    <nav
      aria-label="How to browse the works"
      className="sticky top-[85px] z-40 flex items-center justify-center border-b border-rule bg-paper/95 px-4 backdrop-blur-sm"
      style={{ height: VIEW_BAR_PX }}
    >
      <div className="flex w-full max-w-[420px] gap-1 rounded-full bg-[#ecebe6] p-1">
        {VIEWS.map(({ id, label, Icon }) => {
          const on = id === current;
          return (
            <Link
              key={id}
              href={id === "cards" ? "/artworks" : `/artworks?view=${id}`}
              aria-current={on ? "page" : undefined}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                on
                  ? "bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                  : "text-stone hover:text-ink"
              }`}
            >
              <Icon size={14} strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
