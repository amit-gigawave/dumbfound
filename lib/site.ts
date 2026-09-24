/*
 * Site-wide settings. The platform name is still a placeholder — change
 * `name` here and it updates the header, footer, page titles and menus.
 */
export const site = {
  name: "The Gallery",
  tagline: "Artists and their work, presented with the care of a catalogue.",
  description:
    "A gallery of contemporary art — artists and their works, presented with the care of a museum catalogue.",

  nav: [
    { label: "Artists", href: "/artists" },
    { label: "Artworks", href: "/artworks" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  // TODO: real contact address and social profiles.
  email: "hello@example.com",
  social: [
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "X", href: "#" },
  ],

  newsletter: {
    title: "Receive news of new artists and works",
    note: "An occasional letter, never more than once a month.",
  },
} as const;
