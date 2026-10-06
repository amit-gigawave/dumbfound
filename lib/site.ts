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
    { label: "About", href: "/about" },
    { label: "Artists", href: "/artists" },
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
  social: [
    { label: "Instagram", href: "#" },
  ],
} as const;
