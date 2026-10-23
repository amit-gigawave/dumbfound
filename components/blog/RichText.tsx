import Link from "next/link";

/**
 * Blog text with [label](/path) links. Paths inside the site use
 * next/link; full URLs open in a new tab.
 */
export default function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!m) return part;
        const [, label, href] = m;
        return href.startsWith("/") ? (
          <Link key={i} href={href} className="text-link">
            {label}
          </Link>
        ) : (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            {label}
          </a>
        );
      })}
    </>
  );
}
