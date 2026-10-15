import Link from "next/link";

/**
 * Capital-letter section title with an optional "view all" link, or any other
 * control (e.g. a filter) set at the right end.
 */
const SectionHeader = ({
  title,
  number,
  link,
  action,
  as: Tag = "h2",
}: {
  title: string;
  /** Catalogue-style section number shown above the title, e.g. "01". */
  number?: string;
  link?: { label: string; href: string };
  action?: React.ReactNode;
  as?: "h1" | "h2";
}) => (
  <div
    data-reveal
    className={`mb-9 flex justify-between gap-4 ${
      // Above the grid below, so an opened menu isn't covered by the tiles.
      action ? "relative z-20 flex-wrap items-center" : number ? "items-end" : "items-baseline"
    }`}
  >
    <div>
      {number && (
        <span className="label mb-3 flex items-center gap-3">
          {number}
          <span aria-hidden className="h-px w-10 bg-current opacity-60" />
        </span>
      )}
      <Tag className="heading-caps text-[clamp(24px,2.8vw,34px)] leading-tight tracking-[0.1em]">
        {title}
      </Tag>
    </div>
    {link && (
      <Link
        href={link.href}
        className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-accent transition-colors hover:text-ink"
      >
        {link.label} <span className="nudge">→</span>
      </Link>
    )}
    {action}
  </div>
);

export default SectionHeader;
