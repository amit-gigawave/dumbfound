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
   * 3D model (Draco-compressed GLB). Works that have one open in 3D and get
   * "View in AR"; paintings, photographs etc. simply omit it.
   */
  modelUrl?: string;
  /**
   * Degrees to turn the model (anticlockwise, seen from above) so it faces the
   * viewer straight on — for scans saved facing sideways. Used by the thumbnail,
   * hover preview, viewer and AR; re-run `npm run thumbnails -- <slug>` and
   * `npm run ar-models -- <slug>` after changing it.
   */
  facing?: number;
  /**
   * Real height in centimetres: the size the work appears at in AR. Unknown
   * heights use AR_DEFAULT_CM. Re-run `npm run ar-models -- <slug>` after changing it.
   */
  heightCm?: number;
  /** Prebuilt USDZ for iPhone AR. Without it, one is generated from the GLB in the browser. */
  usdzUrl?: string;
  /** A short line, e.g. "From the Nayika series". Searchable. */
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

/** AR height for works whose real height (`heightCm`) isn't known yet. */
export const AR_DEFAULT_CM = 50;

/** The AR copy of a work's model, built by `npm run ar-models`. */
export const arModelUrl = (work: Sculpture) => `/ar/${work.slug}.glb`;

export const sculptures: Sculpture[] = [
  // Thota Vaikuntam's works. Their earlier titles, years, materials and
  // descriptions had no source and were removed (2026-10-15). Titles are named
  // after the model files until the real ones are known. TODO: confirm details.
  {
    slug: "telangana-woman",
    title: "Untitled (Lady)",
    description: "",
    modelUrl: "/sculptures/Lady.glb",
    thumbnail: "/thumbnails/telangana-woman.webp",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "",
    year: "",
  },
  {
    slug: "lord-krishna",
    title: "Untitled (Lord Krishna)",
    description: "",
    modelUrl: "/sculptures/LordKrishna.glb",
    thumbnail: "/thumbnails/lord-krishna.webp",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "",
    year: "",
  },
  {
    slug: "sacred-gaze",
    title: "Untitled (Pandit)",
    description: "",
    modelUrl: "/sculptures/Pandit.glb",
    thumbnail: "/thumbnails/sacred-gaze.webp",
    artistSlug: "thota-vaikuntam",
    featured: false,
    material: "",
    year: "",
  },
  // Title from sculptedindia.com ("Dancing Shiva—a contemporary sculpture by Thota Vaikuntam").
  {
    slug: "dancing-shiva",
    title: "Dancing Shiva",
    description: "A contemporary sculpture by Thota Vaikuntam.",
    modelUrl: "/sculptures/DancingShiva.glb",
    thumbnail: "/thumbnails/dancing-shiva.webp",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "",
    year: "",
  },

  // ---- Scanned works with a 3D model (integrated via the USDZ/GLB pipeline) ----
  // no stock no.
  {
    slug: "khanna-satwant-sher-singh-cymbal-walae",
    title: "Satwant Sher Singh Cymbal Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-satwant-sher-singh-cymbal-walae.webp",
    modelUrl: "/sculptures/Red_Cymbals_Guy_LPoly.glb",
    material: "Bronze",
    year: "",
    dimensions: "14 × 5 × 6 inches",
    edition: "3 of 9",
  },
  // no stock no.
  {
    slug: "khanna-patinder-rawat-trumpet-walae",
    title: "Patinder Rawat Trumpet Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-patinder-rawat-trumpet-walae.webp",
    modelUrl: "/sculptures/Trumpet_Musician_Orange_LPoly.glb",
    facing: 190,
    material: "Bronze",
    year: "",
    dimensions: "12 × 5 × 5 inches",
    edition: "3 of 9",
  },
  // Scan "12 - Krishan Khanna 03" (original in .glb-backup/). Title to be
  // confirmed: the pose resembles Untitled (KK-0305), but the scan is unpainted
  // and has no trumpet beside him.
  {
    slug: "khanna-untitled-seated-man",
    title: "Untitled (Seated Man)",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-untitled-seated-man.webp",
    modelUrl: "/sculptures/khanna-untitled-seated-man.glb?v=2",
    material: "",
    year: "",
  },
  // Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/), YS-0101.
  {
    slug: "sugandh-elephant-kite",
    title: "Meri Patang",
    description: "",
    artistSlug: "yashika-sugandh",
    thumbnail: "/thumbnails/sugandh-elephant-kite.webp",
    modelUrl: "/sculptures/ElephantKite_LOWPOLY.glb",
    material: "Acrylic on PETG and Fiber Resin",
    year: "2026",
    dimensions: "71 × 50 × 30 inches",
  },

  // ---- Newly scanned heads (USDZ → GLB). Artist/title to be confirmed. ----
  {
    slug: "head-a",
    title: "Untitled (Head A)",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/head-a.webp",
    modelUrl: "/sculptures/head-a.glb?v=2",
    material: "",
    year: "",
  },
  {
    slug: "head-c",
    title: "Untitled (Head C)",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/head-c.webp",
    modelUrl: "/sculptures/head-c.glb",
    facing: 90,
    material: "",
    year: "",
  },
  // Subba Ghosh, not Himmat Shah: details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // SG-0029 (untitled there).
  {
    slug: "head-e",
    title: "Untitled",
    description: "",
    artistSlug: "subba-ghosh",
    thumbnail: "/thumbnails/head-e.webp",
    modelUrl: "/sculptures/head-e.glb",
    material: "Fibreglass, Resin, Paper Mache, Oil and Acrylic Paint",
    year: "",
    dimensions: "17 × 11 × 16 inches",
  },
  {
    slug: "head-g",
    title: "Untitled (Head G)",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/head-g.webp",
    modelUrl: "/sculptures/head-g.glb?v=2",
    facing: 180,
    material: "",
    year: "",
  },
  // Scan "04 - Female with blue saree". TODO: artist, year and medium not known yet.
  {
    slug: "female-with-blue-saree",
    title: "Female with Blue Saree",
    description: "",
    artistSlug: "",
    thumbnail: "/thumbnails/female-with-blue-saree.webp",
    modelUrl: "/sculptures/female-with-blue-saree.glb?v=4",
    material: "",
    year: "",
  },
  // Scan "05 - Female Head" (original in .glb-backup/web/). TODO: artist, year and medium not known yet.
  {
    slug: "female-head",
    title: "Female Head",
    description: "",
    artistSlug: "",
    thumbnail: "/thumbnails/female-head.webp",
    modelUrl: "/sculptures/female-head.glb?v=2",
    facing: 180,
    material: "",
    year: "",
  },
  // Scan "meditating.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // MS-0095. Year not given there.
  {
    slug: "meditating",
    title: "Levitation",
    description: "",
    artistSlug: "meena-sansanwal",
    thumbnail: "/thumbnails/meditating.webp",
    modelUrl: "/sculptures/meditating.glb?v=2",
    facing: 180,
    material: "Papermache, Marble And Acrylic Paint",
    year: "",
    dimensions: "24 × 22 × 14 inches",
  },
  // Scan "03 - Female with green Saree" (original in .glb-backup/web/). TODO: artist, year and medium not known yet.
  {
    slug: "female-with-green-saree",
    title: "Female with Green Saree",
    description: "",
    artistSlug: "",
    thumbnail: "/thumbnails/female-with-green-saree.webp",
    modelUrl: "/sculptures/female-with-green-saree.glb?v=3",
    material: "",
    year: "",
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
