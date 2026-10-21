/*
 * Site-wide settings. The platform name is still a placeholder — change
 * `name` here and it updates the header, footer, page titles and menus.
 */
export const site = {
  name: "Sculpted India",
  tagline:
    "A pioneering public art initiative advancing modern and contemporary Indian sculpture — at its fullest scale, ambition, and impact.",
  description:
    "Sculpted India is a pioneering public art initiative and dedicated platform committed to advancing modern and contemporary Indian sculpture.",

  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Artists", href: "/artists" },
    { label: "Artworks", href: "/artworks" },
    { label: "Events", href: "/events" },
    { label: "Enquiry", href: "/contact" },
  ],

  email: "info@sculptedindia.com",
  phone: "+91 98716 63259",
  contacts: [
    { name: "General", email: "info@sculptedindia.com", phone: "" },
    { name: "Raj", email: "", phone: "+91 99490 74234" },
    { name: "Sanya", email: "", phone: "+91 98716 63259" },
  ],
  social: [] as { label: string; href: string }[],
} as const;

/**
 * Public address of the site, for absolute links (sitemap, link previews).
 * On Vercel this is the production domain; locally NEXT_PUBLIC_SITE_URL
 * (the ngrok tunnel) or localhost.
 */
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

/** Link-preview fields every page shares. A page that sets its own `openGraph`
 * replaces the layout's, so it spreads these in too. */
export const openGraphDefaults = {
  siteName: site.name,
  type: "website",
  locale: "en_IN",
} as const;
