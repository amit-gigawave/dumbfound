import { blogPosts } from "@/lib/blog";
import { absUrl } from "@/lib/jsonLd";
import { site } from "@/lib/site";

// RSS 2.0 feed of the blog, built with the site.
export const dynamic = "force-static";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString();

export function GET() {
  const posts = blogPosts();
  const items = posts
    .map((p) => {
      const url = absUrl(`/blog/${p.slug}`);
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.description)}</description>
      <category>${esc(p.category)}</category>
      <pubDate>${rfc822(p.published)}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${site.name} Blog`)}</title>
    <link>${absUrl("/blog")}</link>
    <description>${esc("Stories about Indian artists and the art they make.")}</description>
    <language>en-in</language>
    <atom:link href="${absUrl("/blog/feed.xml")}" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${rfc822(posts[0].updated ?? posts[0].published)}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
