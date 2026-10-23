import { site, siteUrl } from "./site";

/** Absolute URL for a site path, for structured data and feeds. */
export const absUrl = (path: string) =>
  `${siteUrl}${path === "/" ? "" : path}`;

/** Sculpted India as the author and publisher of its own pages. */
export const organization = {
  "@type": "Organization",
  name: site.name,
  url: absUrl("/"),
  logo: {
    "@type": "ImageObject",
    url: absUrl("/logos/sculpted-india-wordmark.png"),
  },
};

/** Breadcrumb trail, e.g. [["Home", "/"], ["Blog", "/blog"]]. */
export const breadcrumbs = (trail: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: absUrl(path),
  })),
});
