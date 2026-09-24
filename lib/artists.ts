/*
 * Artists on the platform.
 *
 * Facts about real artists must be sourced — keep the source URL next to each
 * claim. Entries with `placeholder: true` are layout stand-ins: they appear in
 * lists as "Coming soon", never get a page, and can simply be deleted.
 */

export interface Quote {
  text: string;
  source: string;
  url: string;
}

export interface Fact {
  /** Year or period, e.g. "1993" or "1965–70". Optional for undated items. */
  when?: string;
  what: string;
}

export interface Artist {
  slug: string;
  name: string;
  /** e.g. "b. 1942" */
  born: string;
  place: string;
  medium: string;
  role: string;
  /** Portrait under /public; initials are shown until one is added. */
  portrait?: string;
  /** One paragraph shown first on the artist page. */
  summary: string;
  /** Further paragraphs revealed by "Read more". */
  bio: string[];
  education: Fact[];
  honours: Fact[];
  collections: Fact[];
  quotes: Quote[];
  placeholder?: boolean;
}

export const artists: Artist[] = [
  {
    slug: "thota-vaikuntam",
    name: "Thota Vaikuntam",
    born: "b. 1942",
    // Burugupalli, Karimnagar district — Saffronart, Open (2022)
    place: "Burugupalli, Telangana",
    medium: "Painting, bronze",
    role: "Painter and sculptor",
    summary:
      "Thota Vaikuntam grew up in Burugupalli, a village in Telangana, where the travelling theatre troupes of his childhood — men playing the women's roles — first fascinated him. Trained in Hyderabad and at Baroda under K.G. Subramanyan, he has spent six decades painting the women and men of rural Telangana in bold colour, and has lately given them form in bronze.",
    bio: [
      // Themes and palette — AstaGuru, official site thotavaikuntam.in
      "His people are unmistakable: women in bright saris with large vermilion bindis and almond eyes, men carrying toddy pots, the rituals and fields of village life — drawn with a strong black line and filled with bold reds, saffrons and oranges.",
      // Bal Bhavan — Saffronart, Laasya; first solo 1973 — Saffronart
      "For many years he taught children at Hyderabad's Bal Bhavan, and he has exhibited since his first solo show at Kala Bhavan, Hyderabad, in 1973. He was also art director for the films Maa Bhoomi and Daasi, the latter winning him a National Film Award.",
      // Sculpture as recent focus — Open (2022), Deccan Chronicle (2026)
      "In recent years he has turned the same subjects into sculpture — patinated and painted bronzes that carry his figures off the canvas and into the round.",
    ],
    education: [
      // Saffronart, DAG (dagworld.com/thota-vaikuntam.html)
      { when: "1965–70", what: "College of Fine Arts and Architecture, Hyderabad" },
      { when: "1971–72", what: "M.S. University, Baroda, under K.G. Subramanyan" },
    ],
    honours: [
      // Saffronart, Aleph, Dhoomimal
      { when: "1993", what: "National Award for Painting" },
      // 36th National Film Awards — Wikipedia, Saffronart
      { when: "1989", what: "National Film Award, Best Art Direction, Daasi" },
      // Saffronart, Dhoomimal
      { when: "1988–89", what: "Bharat Bhavan Biennale Award, Bhopal" },
    ],
    collections: [
      // DAG; NGMA and Peabody Essex also named by Sanchit Art
      { what: "National Gallery of Modern Art, New Delhi" },
      { what: "Peabody Essex Museum, Salem" },
      { what: "Salar Jung Museum, Hyderabad" },
    ],
    quotes: [
      {
        text: "Art history can teach technique, but my village taught me identity.",
        source: "Deccan Chronicle, 2026",
        url: "https://www.deccanchronicle.com/lifestyle/thota-vaikuntam-on-turning-telanganas-everyday-lives-into-an-enduring-visual-language-1988502",
      },
      {
        text: "An artist must keep searching. My sculptures are an example. The subject is the same, but the medium gives me a new way of seeing.",
        source: "Deccan Chronicle, 2026",
        url: "https://www.deccanchronicle.com/lifestyle/thota-vaikuntam-on-turning-telanganas-everyday-lives-into-an-enduring-visual-language-1988502",
      },
      {
        text: "Life in the village is a daily celebration.",
        source: "Open, 2022",
        url: "https://openthemagazine.com/art-culture/thota-vaikuntam-rural-reveries",
      },
    ],
  },

  // ---- Placeholders (layout only) ----
  ...(["Painting", "Photography", "Sculpture", "Textile"] as const).map(
    (medium, i): Artist => ({
      slug: `artist-${i + 2}`,
      name: "Artist Name",
      born: "b. 19XX",
      place: "City",
      medium,
      role: "Artist",
      summary: "",
      bio: [],
      education: [],
      honours: [],
      collections: [],
      quotes: [],
      placeholder: true,
    }),
  ),
];

export const getArtist = (slug: string) => artists.find((a) => a.slug === slug);

/** Artists with a real page (placeholders excluded). */
export const publishedArtists = () => artists.filter((a) => !a.placeholder);

export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
