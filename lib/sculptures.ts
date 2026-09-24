/*
 * Artwork catalogue — single source of truth for the home page, artworks grid,
 * artist pages, artwork pages, search and AR. Artists live in lib/artists.ts.
 *
 * Easiest way to add a work:  npm run add-work
 * Step-by-step guide:         docs/adding-artworks.md
 */

export interface Sculpture {
  // ---- Required ----
  /** Lowercase words with hyphens; becomes the address, e.g. /artworks/<slug>. */
  slug: string;
  title: string;
  /** One or two sentences shown on the artwork page and in search. */
  description: string;
  /** Slug of the artist in lib/artists.ts. */
  artistSlug: string;
  /** Main image: a photograph in /public/artworks, or a render made by `npm run thumbnails`. */
  thumbnail: string;
  /** e.g. "Patinated bronze", "Oil on canvas". */
  material: string;
  year: string;

  // ---- Optional ----
  /** Show in "Featured works" on the home page. */
  featured?: boolean;
  /**
   * 3D model (Draco-compressed GLB). Works that have one get "View in the round"
   * and "See it in your space"; paintings, photographs etc. simply omit it.
   */
  modelUrl?: string;
  /** Prebuilt USDZ for iPhone AR. Without it, one is generated from the GLB in the browser. */
  usdzUrl?: string;
  /** A short line, e.g. "The iconic muse". Searchable. */
  subtitle?: string;
  /** Extra paragraph shown under the description. */
  longDescription?: string;
  /** Shown in the details list when present, e.g. "60 × 25 × 20 cm". */
  dimensions?: string;
  edition?: string;
  /** Collection or gallery. */
  location?: string;
  /** Searchable keywords. */
  tags?: string[];
  /** Tint for the AR dialog; defaults to the site accent. */
  accent?: string;
}

export const sculptures: Sculpture[] = [
  {
    slug: "telangana-woman",
    title: "Telangana Woman",
    subtitle: "The iconic muse",
    description:
      "The iconic subject of Vaikuntam's world — a rural woman adorned with vermilion bindi, almond eyes, and traditional jewellery, capturing the dignity and sensuality of Telangana heritage in three dimensions.",
    modelUrl: "/sculptures/Lady.glb",
    thumbnail: "/thumbnails/telangana-woman.webp",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "Patinated bronze",
    year: "2019",
    tags: ["bronze", "portrait", "telangana", "folk"],
  },
  {
    slug: "lord-krishna",
    title: "Lord Krishna",
    subtitle: "Celestial grace",
    description:
      "Rooted in the village life that shaped him, Vaikuntam brings celestial grace and folk intimacy together — poise, peace and primary colour meeting bronze.",
    modelUrl: "/sculptures/LordKrishna.glb",
    thumbnail: "/thumbnails/lord-krishna.webp",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "Painted bronze",
    year: "2020",
    tags: ["bronze", "mythology", "krishna", "painted"],
  },
  {
    slug: "sacred-gaze",
    title: "Sacred Gaze",
    subtitle: "Dravidian dignity",
    description:
      "From Vaikuntam's series of sculptural heads in patinated bronze — almond eyes and ornate adornment, the calm, dignified faces of his Telangana people rendered in the round.",
    modelUrl: "/sculptures/Pandit.glb",
    thumbnail: "/thumbnails/sacred-gaze.webp",
    artistSlug: "thota-vaikuntam",
    featured: false,
    material: "Patinated bronze",
    year: "2018",
    tags: ["bronze", "head", "portrait"],
  },
  {
    slug: "dancing-shiva",
    title: "Dancing Shiva",
    subtitle: "Nataraja in motion",
    description:
      "The cosmic dancer caught mid-stride — Vaikuntam's Nataraja fuses the rhythm of South Indian temple iconography with his unmistakable folk sensibility, rendered in flowing, gilded bronze.",
    modelUrl: "/sculptures/DancingShiva.glb",
    thumbnail: "/thumbnails/dancing-shiva.webp",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "Gilded bronze",
    year: "2021",
    tags: ["bronze", "mythology", "nataraja", "dance"],
  },
];

export const getSculpture = (slug: string): Sculpture | undefined =>
  sculptures.find((s) => s.slug === slug);

export const getWorksByArtist = (artistSlug: string) =>
  sculptures.filter((s) => s.artistSlug === artistSlug);

export const getFeaturedWorks = () => sculptures.filter((s) => s.featured);

/** True for placeholder copy ("TODO: …") that should stay hidden. */
export const isTodo = (value: string) => value.startsWith("TODO");

/** A value worth showing: present and not a TODO placeholder. */
export const hasValue = (value?: string): value is string =>
  !!value && !isTodo(value);
