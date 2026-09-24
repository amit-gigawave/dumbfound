import Link from "next/link";

/** Capital-letter section title with an optional "view all" link. */
const SectionHeader = ({
  title,
  link,
  as: Tag = "h2",
}: {
  title: string;
  link?: { label: string; href: string };
  as?: "h1" | "h2";
}) => (
  <div data-reveal className="mb-9 flex items-baseline justify-between gap-4">
    <Tag className="heading-caps text-[clamp(24px,2.8vw,34px)] leading-tight tracking-[0.1em]">
      {title}
    </Tag>
    {link && (
      <Link
        href={link.href}
        className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-accent transition-colors hover:text-ink"
      >
        {link.label} <span className="nudge">→</span>
      </Link>
    )}
  </div>
);

export default SectionHeader;
