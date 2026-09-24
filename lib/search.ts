import { artists } from "./artists";
import { sculptures } from "./sculptures";

export interface SearchResult {
  kind: "artist" | "artwork";
  title: string;
  subtitle: string;
  href: string;
  image?: string;
}

interface Entry extends SearchResult {
  /** Normalised title, for ranking. */
  key: string;
  /** Everything searchable, normalised. */
  haystack: string;
}

/** Lower-case and strip accents so "Ramkinkar" matches "Rāmkiṅkar". */
const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const index: Entry[] = [
  ...artists
    .filter((a) => !a.placeholder)
    .map((a) => ({
      kind: "artist" as const,
      title: a.name,
      subtitle: `${a.born} · ${a.medium}`,
      href: `/artists/${a.slug}`,
      image: a.portrait,
      key: normalise(a.name),
      haystack: normalise([a.name, a.place, a.medium, a.role].join(" ")),
    })),
  ...sculptures.map((w) => {
    const artist = artists.find((a) => a.slug === w.artistSlug);
    return {
      kind: "artwork" as const,
      title: w.title,
      subtitle: [artist?.name, w.year, w.material].filter(Boolean).join(" · "),
      href: `/artworks/${w.slug}`,
      image: w.thumbnail,
      key: normalise(w.title),
      haystack: normalise(
        [
          w.title,
          w.subtitle,
          artist?.name,
          w.year,
          w.material,
          w.description,
          ...(w.tags ?? []),
        ].join(" "),
      ),
    };
  }),
];

/**
 * Every word of the query must appear somewhere in the entry. Titles that
 * start with the query rank first, then titles containing it, then the rest.
 */
export function search(query: string, limit = 8): SearchResult[] {
  const q = normalise(query.trim());
  if (!q) return [];
  const words = q.split(/\s+/);

  return index
    .filter((e) => words.every((w) => e.haystack.includes(w)))
    .map((e) => ({
      e,
      score: e.key.startsWith(q) ? 0 : e.key.includes(q) ? 1 : 2,
    }))
    .sort((a, b) => a.score - b.score || a.e.title.localeCompare(b.e.title))
    .slice(0, limit)
    .map(({ e }) => ({
      kind: e.kind,
      title: e.title,
      subtitle: e.subtitle,
      href: e.href,
      image: e.image,
    }));
}

/** A few suggestions to show before anything is typed. */
export const suggestions = (): SearchResult[] =>
  index.slice(0, 4).map(({ kind, title, subtitle, href, image }) => ({
    kind,
    title,
    subtitle,
    href,
    image,
  }));
