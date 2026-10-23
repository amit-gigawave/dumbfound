import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/blog/JsonLd";
import RichText from "@/components/blog/RichText";
import ArtworkTile from "@/components/gallery/ArtworkTile";
import {
  FAQ_ID,
  formatDate,
  getPost,
  blog,
  blogPosts,
  plainText,
  readingMinutes,
  wordCount,
  type BlogBlock,
} from "@/lib/blog";
import { getSculpture } from "@/lib/sculptures";
import { getArtist } from "@/lib/artists";
import { absUrl, breadcrumbs, organization } from "@/lib/jsonLd";
import { openGraphDefaults, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return blog.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };

  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: path,
      types: { "application/rss+xml": "/blog/feed.xml" },
    },
    authors: [{ name: site.name, url: "/" }],
    openGraph: {
      ...openGraphDefaults,
      type: "article",
      title: post.title,
      description: post.description,
      url: path,
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: [site.name],
      section: post.category,
      tags: post.tags,
      images: [{ ...post.image, url: post.image.src }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image.src],
    },
  };
}

const Block = ({ b }: { b: BlogBlock }) => {
  switch (b.type) {
    case "h2":
      return (
        <h2
          id={b.id}
          className="font-display mt-12 scroll-mt-28 text-[clamp(26px,3vw,34px)] leading-tight tracking-[0.01em]"
        >
          {b.text}
        </h2>
      );
    case "p":
      return (
        <p className="mt-5">
          <RichText text={b.text} />
        </p>
      );
    case "ul":
    case "ol": {
      const List = b.type;
      return (
        <List
          className={`mt-5 grid gap-3 pl-6 ${b.type === "ol" ? "list-decimal" : "list-disc"} marker:text-accent`}
        >
          {b.items.map((item, i) => (
            <li key={i} className="pl-1">
              <RichText text={item} />
            </li>
          ))}
        </List>
      );
    }
    case "work":
      return (
        <div className="mt-10">
          <WorkFigure b={b} wide />
        </div>
      );
    case "quote":
      return (
        <figure className="my-10 border-l-2 border-accent pl-6">
          <blockquote
            cite={b.url}
            className="font-display text-[clamp(22px,2.6vw,28px)] leading-snug text-ink"
          >
            <p>“{b.text}”</p>
          </blockquote>
          <figcaption className="mt-3 text-[14px] text-stone">
            {b.url ? (
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                {b.cite}
              </a>
            ) : (
              b.cite
            )}
          </figcaption>
        </figure>
      );
    case "faq":
      return (
        <section aria-labelledby={FAQ_ID}>
          <h2
            id={FAQ_ID}
            className="font-display mt-14 scroll-mt-28 text-[clamp(26px,3vw,34px)] leading-tight tracking-[0.01em]"
          >
            Frequently asked questions
          </h2>
          <div className="mt-4 divide-y divide-rule border-y border-rule">
            {b.items.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="font-display text-[21px] leading-snug text-ink">
                  {f.q}
                </h3>
                <p className="mt-2">
                  <RichText text={f.a} />
                </p>
              </div>
            ))}
          </div>
        </section>
      );
  }
};

type WorkBlock = Extract<BlogBlock, { type: "work" }>;

/** A work's thumbnail and caption, linking to its page. */
const WorkFigure = ({ b, wide = false }: { b: WorkBlock; wide?: boolean }) => {
  const work = getSculpture(b.slug);
  if (!work) return null;
  const artist = getArtist(work.artistSlug);
  return (
    <figure>
      <Link
        href={`/artworks/${work.slug}`}
        className={`group relative block overflow-hidden rounded-[18px] border border-rule bg-plate ${
          wide ? "aspect-[4/3]" : "aspect-[4/5]"
        }`}
      >
        <Image
          src={work.thumbnail}
          alt={`${work.title}${artist ? `, a sculpture by ${artist.name}` : ""}`}
          fill
          sizes={wide ? "(min-width: 768px) 720px, 100vw" : "(min-width: 768px) 360px, 50vw"}
          className="object-contain p-[6%] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        />
      </Link>
      <figcaption className="mt-3 text-[14px] leading-relaxed text-stone">
        {b.caption ? (
          <RichText text={b.caption} />
        ) : (
          <>
            <Link href={`/artworks/${work.slug}`} className="text-link">
              {work.title}
            </Link>
            {artist && <>, {artist.name}</>}
            {work.material && <>. {work.material}</>}
          </>
        )}
      </figcaption>
    </figure>
  );
};

/** Runs of two or more works in a row become a gallery grid. */
const groupBlocks = (body: BlogBlock[]) => {
  const out: (BlogBlock | { type: "gallery"; works: WorkBlock[] })[] = [];
  for (const b of body) {
    const last = out[out.length - 1];
    if (b.type === "work" && last?.type === "gallery") last.works.push(b);
    else if (b.type === "work" && last?.type === "work")
      out[out.length - 1] = { type: "gallery", works: [last, b] };
    else out.push(b);
  }
  return out;
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const toc = post.body.flatMap((b) =>
    b.type === "h2"
      ? [{ id: b.id, text: b.text }]
      : b.type === "faq"
        ? [{ id: FAQ_ID, text: "Frequently asked questions" }]
        : [],
  );
  const faq = post.body.flatMap((b) => (b.type === "faq" ? b.items : []));
  const works = (post.workSlugs ?? [])
    .map(getSculpture)
    .filter((w) => w !== undefined);
  // Works not already pictured in the text get a tile at the end.
  const shown = new Set(
    post.body.flatMap((b) => (b.type === "work" ? [b.slug] : [])),
  );
  const tiles = works.filter((w) => !shown.has(w.slug));
  const people = (post.artistSlugs ?? [])
    .map(getArtist)
    .filter((a) => a !== undefined);
  const more = blogPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);
  const firstPara = post.body.find((b) => b.type === "p");

  return (
    <main className="pb-[clamp(56px,8vw,96px)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          image: [absUrl(post.image.src)],
          datePublished: post.published,
          dateModified: post.updated ?? post.published,
          author: organization,
          publisher: organization,
          mainEntityOfPage: { "@type": "WebPage", "@id": absUrl(path) },
          url: absUrl(path),
          inLanguage: "en-IN",
          articleSection: post.category,
          keywords: post.tags.join(", "),
          wordCount: wordCount(post),
          ...(firstPara?.type === "p" && {
            abstract: plainText(firstPara.text),
          }),
          about: [
            ...works.map((w) => {
              const by = getArtist(w.artistSlug);
              return {
                "@type": "Sculpture",
                name: w.title,
                url: absUrl(`/artworks/${w.slug}`),
                image: absUrl(w.thumbnail),
                ...(w.material && { material: w.material }),
                ...(by && {
                  creator: {
                    "@type": "Person",
                    name: by.name,
                    url: absUrl(`/artists/${by.slug}`),
                  },
                }),
              };
            }),
            ...people.map((a) => ({
              "@type": "Person",
              name: a.name,
              url: absUrl(`/artists/${a.slug}`),
            })),
          ],
        }}
      />
      <JsonLd
        data={breadcrumbs([
          ["Home", "/"],
          ["Blog", "/blog"],
          [post.title, path],
        ])}
      />
      {faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
            })),
          }}
        />
      )}

      <article>
        <header className="bg-[#1b211d]">
          <div className="mx-auto max-w-[820px] px-[clamp(16px,4vw,40px)] pb-[clamp(40px,5vw,64px)] pt-[clamp(32px,5vw,56px)]">
            <nav aria-label="Breadcrumb" className="text-[13px] text-[#9fa8a2]">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href="/blog"
                    className="transition-colors hover:text-white"
                  >
                    Blog
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="line-clamp-1 text-[#c9cfcb]">
                  {post.title}
                </li>
              </ol>
            </nav>
            <p className="mt-[clamp(28px,4vw,48px)] text-[14px] text-accent-light">
              {post.category}
            </p>
            <h1 className="font-display mt-3 text-[clamp(36px,5vw,60px)] leading-[1.08] tracking-[0.005em] text-[#f4f4f2]">
              {post.title}
            </h1>
            <p className="font-text mt-5 max-w-[56ch] text-[18px] leading-[1.75] text-[#c9cfcb]">
              {post.description}
            </p>
            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#9fa8a2]">
              <span>By {site.name}</span>
              <span aria-hidden>·</span>
              <time dateTime={post.published}>{formatDate(post.published)}</time>
              {post.updated && post.updated !== post.published && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    Updated{" "}
                    <time dateTime={post.updated}>
                      {formatDate(post.updated)}
                    </time>
                  </span>
                </>
              )}
              <span aria-hidden>·</span>
              <span>{readingMinutes(post)} min read</span>
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-[820px] px-[clamp(16px,4vw,40px)] pt-[clamp(36px,5vw,56px)]">
          {toc.length > 1 && (
            <nav
              aria-label="In this article"
              className="rounded-[14px] border border-rule bg-white p-6"
            >
              <p className="label">In this article</p>
              <ol className="mt-3 grid gap-2 text-[15px]">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-link">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="font-text text-[18px] leading-[1.8] text-[#2a2a2a]">
            {groupBlocks(post.body).map((b, i) =>
              b.type === "gallery" ? (
                <div key={i} className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8">
                  {b.works.map((w) => (
                    <WorkFigure key={w.slug} b={w} />
                  ))}
                </div>
              ) : (
                <Block key={i} b={b} />
              ),
            )}
          </div>

          {post.sources.length > 0 && (
            <section className="mt-12 border-t border-rule pt-6">
              <h2 className="label">Sources</h2>
              <ul className="mt-3 grid gap-2 text-[14px] text-stone">
                {post.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {people.length > 0 && (
            <p className="mt-12 border-t border-rule pt-6 text-[15px] text-stone">
              More about{" "}
              {people.map((a, i) => (
                <span key={a.slug}>
                  {i > 0 && (i === people.length - 1 ? " and " : ", ")}
                  <Link href={`/artists/${a.slug}`} className="text-link">
                    {a.name}
                  </Link>
                </span>
              ))}
              , or browse <Link href="/artworks" className="text-link">all artworks</Link>.
            </p>
          )}
        </div>
      </article>

      {tiles.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-[clamp(56px,8vw,96px)]">
          <h2 className="font-display mb-9 text-[clamp(26px,3vw,34px)] tracking-[0.01em]">
            Works in this article
          </h2>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((w) => (
              <ArtworkTile key={w.slug} work={w} showcase quiet />
            ))}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-[clamp(56px,8vw,96px)]">
          <h2 className="font-display mb-9 text-[clamp(26px,3vw,34px)] tracking-[0.01em]">
            More from the blog
          </h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {more.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group block h-full rounded-[18px] border border-rule bg-white p-6 transition-colors hover:border-accent/50"
                >
                  <time dateTime={p.published} className="text-[13px] text-stone">
                    {formatDate(p.published)}
                  </time>
                  <p className="font-display mt-2 text-[22px] leading-snug transition-colors group-hover:text-accent">
                    {p.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
