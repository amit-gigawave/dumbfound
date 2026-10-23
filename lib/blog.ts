/*
 * The blog: articles on artists' lives and on art itself (subjects, materials,
 * techniques), linked to the collection wherever it fits. Each post is a file
 * in lib/blog-posts/, listed below, and rendered by app/blog/[slug]/page.tsx.
 *
 * Same rule as the rest of the site: every fact needs a source. List the
 * sources in `sources` (they are shown at the end of the post) and leave a
 * claim out rather than guess. Most facts here come from lib/artists.ts and
 * lib/sculptures.ts, which carry their own source comments.
 *
 * For search: put the main keyword (usually the artist's name) in the slug,
 * the title, the description and the first paragraph; phrase h2s and FAQ
 * questions the way people search; link every named work and artist into the
 * site with [label](/path).
 */

import krishen_khanna_life from "./blog-posts/krishen-khanna-life";
import mf_husain_life from "./blog-posts/mf-husain-life";
import nataraja_meaning from "./blog-posts/nataraja-meaning";
import jogen_chowdhury_life from "./blog-posts/jogen-chowdhury-life";
import lost_wax_casting_india from "./blog-posts/lost-wax-casting-india";
import madhvi_parekh_life from "./blog-posts/madhvi-parekh-life";
import himmat_shah_heads from "./blog-posts/himmat-shah-heads";
import papier_mache_india from "./blog-posts/papier-mache-india";
import india_wedding_brass_bands from "./blog-posts/india-wedding-brass-bands";
import thota_vaikuntam_sculptures from "./blog-posts/thota-vaikuntam-sculptures";
import krishen_khanna_sculptures from "./blog-posts/krishen-khanna-sculptures";
import contemporary_indian_sculptors from "./blog-posts/contemporary-indian-sculptors";

export type BlogBlock =
  | { type: "h2"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  /** A work from lib/sculptures.ts, shown with its thumbnail and a link. */
  | { type: "work"; slug: string; caption?: string }
  | { type: "quote"; text: string; cite: string; url?: string }
  /** Questions and answers, shown under "Frequently asked questions". */
  | { type: "faq"; items: { q: string; a: string }[] };

export interface BlogPost {
  slug: string;
  /** The headline (h1). Keep it under about 65 characters for search results. */
  title: string;
  /** Meta description and list-page summary: one or two sentences, under 160 characters. */
  description: string;
  /** ISO dates (YYYY-MM-DD). */
  published: string;
  updated?: string;
  /** Shown above the title, used as the article section and to group the blog page. */
  category: BlogCategory;
  tags: string[];
  /** Share image, from public/: a work's thumbnail or a credited portrait (see blog-posts/images.ts). */
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** Photo credit, shown under the photo; set for portraits. */
    credit?: { text: string; url: string };
  };
  /** Works and artists the post is about. */
  workSlugs?: string[];
  artistSlugs?: string[];
  /** Published sources for the facts in the post. */
  sources: { label: string; url: string }[];
  body: BlogBlock[];
}

/** Blog sections, in the order the blog page shows them. */
export const BLOG_CATEGORIES = [
  "Artists' lives",
  "Art explained",
  "In the collection",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const FAQ_ID = "faq";

export const blog: BlogPost[] = [
  krishen_khanna_life,
  mf_husain_life,
  nataraja_meaning,
  jogen_chowdhury_life,
  lost_wax_casting_india,
  madhvi_parekh_life,
  himmat_shah_heads,
  papier_mache_india,
  india_wedding_brass_bands,
  thota_vaikuntam_sculptures,
  krishen_khanna_sculptures,
  contemporary_indian_sculptors,
];

/** Newest first; posts from the same day keep their order above. */
export const blogPosts = () =>
  blog
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p.published.localeCompare(a.p.published) || a.i - b.i)
    .map(({ p }) => p);

export const getPost = (slug: string) => blog.find((p) => p.slug === slug);

/** Posts about an artist, for links from their page. */
export const postsAboutArtist = (slug: string) =>
  blogPosts().filter((p) => p.artistSlugs?.includes(slug));

/** Text with the [label](/path) links reduced to their labels. */
export const plainText = (text: string) =>
  text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

const blockText = (b: BlogBlock): string => {
  switch (b.type) {
    case "ul":
    case "ol":
      return b.items.join(" ");
    case "work":
      return b.caption ?? "";
    case "faq":
      return b.items.map((f) => `${f.q} ${f.a}`).join(" ");
    default:
      return b.text;
  }
};

export const wordCount = (post: BlogPost) =>
  post.body
    .map((b) => plainText(blockText(b)))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

/** Minutes to read, at about 220 words a minute. */
export const readingMinutes = (post: BlogPost) =>
  Math.max(1, Math.round(wordCount(post) / 220));

/** "23 October 2026" */
export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
