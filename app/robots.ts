import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /artworks/thumb/* only exists for rendering thumbnails.
    rules: { userAgent: "*", allow: "/", disallow: "/artworks/thumb/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
