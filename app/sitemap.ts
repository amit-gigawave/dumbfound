import type { MetadataRoute } from "next";
import { publishedArtists } from "@/lib/artists";
import { blogPosts } from "@/lib/blog";
import { sculptures } from "@/lib/sculptures";
import { site, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...site.nav.map((n) => n.href),
    ...publishedArtists().map((a) => `/artists/${a.slug}`),
    ...sculptures.map((s) => `/artworks/${s.slug}`),
  ];
  return [
    ...paths.map((p) => ({ url: `${siteUrl}${p === "/" ? "" : p}` })),
    // Blog posts carry their own dates.
    ...blogPosts().map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: p.updated ?? p.published,
    })),
  ];
}
