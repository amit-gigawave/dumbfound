import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import JsonLd from "@/components/blog/JsonLd";
import {
  BLOG_CATEGORIES,
  blogPosts,
  formatDate,
  readingMinutes,
  type BlogPost,
} from "@/lib/blog";
import { absUrl, breadcrumbs, organization } from "@/lib/jsonLd";
import { openGraphDefaults, site } from "@/lib/site";

const description =
  "Stories about Indian artists' lives and the art they make: what the images mean, how sculpture is made, and the works in the Sculpted India collection.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
  openGraph: {
    ...openGraphDefaults,
    title: `Blog | ${site.name}`,
    description,
    url: "/blog",
  },
};

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

const PostCard = ({ p }: { p: BlogPost }) => (
  <article className="group grid gap-7 rounded-[18px] border border-rule bg-white p-[clamp(20px,3.4vw,40px)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.3,.7,.3,1)] hover:-translate-y-1 hover:border-[#d6d6d6] hover:shadow-[0_24px_50px_-34px_rgba(0,0,0,.4)] md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
    <div className="grid gap-4">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-stone">
        <time dateTime={p.published}>{formatDate(p.published)}</time>
        <span aria-hidden>·</span>
        <span>{readingMinutes(p)} min read</span>
      </p>
      <h3 className="font-display text-[clamp(26px,3vw,38px)] leading-tight tracking-[0.01em] transition-colors group-hover:text-accent">
        <Link href={`/blog/${p.slug}`}>{p.title}</Link>
      </h3>
      <p className="font-text max-w-[62ch] text-[16px] leading-[1.75] text-[#333]">
        {p.description}
      </p>
      <Link
        href={`/blog/${p.slug}`}
        className="text-link w-fit text-[14px]"
        aria-label={`Read “${p.title}”`}
      >
        Read the article <span className="nudge">→</span>
      </Link>
    </div>
    <Link
      href={`/blog/${p.slug}`}
      tabIndex={-1}
      aria-hidden
      className="relative hidden aspect-[4/5] overflow-hidden rounded-[14px] bg-plate md:block"
    >
      <Image
        src={p.image.src}
        alt=""
        fill
        sizes="220px"
        // Portraits fill the tile; works stand in it, like the artwork grid.
        className={`transition-transform duration-700 ease-out group-hover:scale-[1.035] ${
          p.image.credit ? "object-cover" : "object-contain p-[6%]"
        }`}
      />
    </Link>
  </article>
);

export default function BlogPage() {
  const posts = blogPosts();

  return (
    <main className="pb-[clamp(56px,8vw,96px)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${site.name} Blog`,
          description,
          url: absUrl("/blog"),
          inLanguage: "en-IN",
          publisher: organization,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            description: p.description,
            url: absUrl(`/blog/${p.slug}`),
            datePublished: p.published,
            dateModified: p.updated ?? p.published,
            image: absUrl(p.image.src),
            author: organization,
          })),
        }}
      />
      <JsonLd
        data={breadcrumbs([
          ["Home", "/"],
          ["Blog", "/blog"],
        ])}
      />

      <PageHeader
        label="Blog"
        title="Blog"
        line="Stories about Indian artists' lives and the art they make: what the images mean, how sculpture is made, and the works in the collection."
      />

      {BLOG_CATEGORIES.map((category) => {
        const inCategory = posts.filter((p) => p.category === category);
        if (inCategory.length === 0) return null;
        return (
          <section
            key={category}
            className={`${wrap} pt-[clamp(48px,7vw,88px)]`}
          >
            <h2 className="font-display mb-8 text-[clamp(28px,3.4vw,40px)] tracking-[0.01em]">
              {category}
            </h2>
            <div data-reveal-stagger className="grid gap-8">
              {inCategory.map((p) => (
                <PostCard key={p.slug} p={p} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
