import Link from "next/link";

/** Serif section title with an optional "view all" link, over a hairline rule. */
const SectionHeader = ({
  title,
  link,
  as: Tag = "h2",
}: {
  title: string;
  link?: { label: string; href: string };
  as?: "h1" | "h2";
}) => (
  <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-rule pb-3.5">
    <Tag className="text-[clamp(26px,3vw,34px)] leading-tight">{title}</Tag>
    {link && (
      <Link
        href={link.href}
        className="shrink-0 text-[13px] text-stone transition-colors hover:text-ink"
      >
        {link.label} →
      </Link>
    )}
  </div>
);

export default SectionHeader;
