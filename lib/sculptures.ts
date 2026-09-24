/*
 * Sculpture catalogue — single source of truth for the hero, home cards,
 * gallery grid, detail pages and AR.
 *
 * CONTENT TODO: every value starting with "TODO:" is a placeholder and must be
 * replaced with verified information before launch (dimensions, edition,
 * location/collection, long descriptions, artist bio). `stats` are measured
 * from the GLB files — re-run `npm run thumbnails` after swapping a model and
 * paste the printed numbers back in here.
 */

export interface Artist {
  name: string;
  slug: string;
  /** Optional portrait under /public; initials are shown when absent. */
  avatar?: string;
  role: string;
  bio: string;
}

export interface Sculpture {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  modelUrl: string;
  /** Pre-rendered WebP shown in the grid and as the viewer placeholder. */
  thumbnail: string;
  /**
   * Optional USDZ model used by iOS AR Quick Look. Drop a `<slug>.usdz` next to
   * the GLB under /public/sculptures and point this at it to enable AR on iPhone.
   */
  usdzUrl?: string;
  artist: Artist;
  accent: string;
  offsetX: number;
  offsetY: number;
  defaultZoom: number;
  material: string;
  year: string;
  dimensions: string;
  edition: string;
  location: string;
  tags: string[];
  stats: { triangles: number; fileSizeKB: number };
}

export const THOTA_VAIKUNTAM: Artist = {
  name: "Thota Vaikuntam",
  slug: "thota-vaikuntam",
  role: "Indian contemporary artist & sculptor",
  bio: "TODO: short verified artist bio (2–3 sentences) — born in Boorugupalli, Telangana; known for bold primary colours, almond eyes and vermilion bindis.",
};

export const sculptures: Sculpture[] = [
  {
    slug: "telangana-woman",
    title: "Telangana Woman",
    subtitle: "The iconic muse",
    description:
      "The iconic subject of Vaikuntam's world — a rural woman adorned with vermilion bindi, almond eyes, and traditional jewellery, capturing the dignity and sensuality of Telangana heritage in three dimensions.",
    longDescription:
      "TODO: extended description — context of the piece, technique, exhibition history.",
    modelUrl: "/sculptures/Lady.glb",
    thumbnail: "/thumbnails/telangana-woman.webp",
    artist: THOTA_VAIKUNTAM,
    accent: "#d4a574",
    offsetX: 0,
    offsetY: -0.1,
    defaultZoom: 2.2,
    material: "Patinated bronze",
    year: "2019",
    dimensions: "TODO: H × W × D cm",
    edition: "TODO: e.g. 1 of 8",
    location: "TODO: collection / gallery",
    tags: ["bronze", "portrait", "telangana", "folk"],
    stats: { triangles: 40000, fileSizeKB: 428 },
  },
  {
    slug: "lord-krishna",
    title: "Lord Krishna",
    subtitle: "Celestial grace",
    description:
      "Rooted in the mythology that shaped his childhood village theatre, Vaikuntam brings celestial grace and folk intimacy together — poise, peace, and primary colours meeting bronze patina.",
    longDescription:
      "TODO: extended description — context of the piece, technique, exhibition history.",
    modelUrl: "/sculptures/LordKrishna.glb",
    thumbnail: "/thumbnails/lord-krishna.webp",
    artist: THOTA_VAIKUNTAM,
    accent: "#e67e22",
    offsetX: 0,
    offsetY: 0,
    defaultZoom: 3,
    material: "Painted bronze",
    year: "2020",
    dimensions: "TODO: H × W × D cm",
    edition: "TODO: e.g. 1 of 8",
    location: "TODO: collection / gallery",
    tags: ["bronze", "mythology", "krishna", "painted"],
    stats: { triangles: 39999, fileSizeKB: 342 },
  },
  {
    slug: "sacred-gaze",
    title: "Sacred Gaze",
    subtitle: "Dravidian dignity",
    description:
      "From Vaikuntam's celebrated series of sculptural heads in patinated bronze — almond eyes and ornate adornments embodying what curator Uma Nair calls 'Dravidian dignity in tone and tenor.'",
    longDescription:
      "TODO: extended description — context of the piece, technique, exhibition history.",
    modelUrl: "/sculptures/Pandit.glb",
    thumbnail: "/thumbnails/sacred-gaze.webp",
    artist: THOTA_VAIKUNTAM,
    accent: "#8b6914",
    offsetX: 0,
    offsetY: 0,
    defaultZoom: 2.2,
    material: "Patinated bronze",
    year: "2018",
    dimensions: "TODO: H × W × D cm",
    edition: "TODO: e.g. 1 of 8",
    location: "TODO: collection / gallery",
    tags: ["bronze", "head", "portrait"],
    stats: { triangles: 39999, fileSizeKB: 481 },
  },
  {
    slug: "dancing-shiva",
    title: "Dancing Shiva",
    subtitle: "Nataraja in motion",
    description:
      "The cosmic dancer caught mid-stride — Vaikuntam's Nataraja fuses the rhythm of South Indian temple iconography with his unmistakable folk sensibility, rendered in flowing, gilded bronze.",
    longDescription:
      "TODO: extended description — context of the piece, technique, exhibition history.",
    modelUrl: "/sculptures/DancingShiva.glb",
    thumbnail: "/thumbnails/dancing-shiva.webp",
    artist: THOTA_VAIKUNTAM,
    accent: "#b8860b",
    offsetX: 0,
    offsetY: 0,
    defaultZoom: 2.4,
    material: "Gilded bronze",
    year: "2021",
    dimensions: "TODO: H × W × D cm",
    edition: "TODO: e.g. 1 of 8",
    location: "TODO: collection / gallery",
    tags: ["bronze", "mythology", "nataraja", "dance"],
    stats: { triangles: 70000, fileSizeKB: 713 },
  },
];

export const getSculpture = (slug: string): Sculpture | undefined =>
  sculptures.find((s) => s.slug === slug);

export const getOtherSculptures = (slug: string): Sculpture[] =>
  sculptures.filter((s) => s.slug !== slug);

/** True for placeholder copy that still needs real content. */
export const isTodo = (value: string) => value.startsWith("TODO");
