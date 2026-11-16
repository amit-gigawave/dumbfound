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
  // no stock no. Model from the colour scan "RedCymbalsGuy.usdz" (2026-11-16); it replaced
  // an untextured low-poly mesh.
  {
    slug: "khanna-satwant-sher-singh-cymbal-walae",
    title: "Satwant Sher Singh Cymbal Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-satwant-sher-singh-cymbal-walae.webp",
    modelUrl: "/sculptures/Red_Cymbals_Guy_LPoly.glb?v=2",
    facing: 30,
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
  // Scan "12 - Krishan Khanna 03". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "12 - Krishan Khanna - 03": KK-0305.
  {
    slug: "khanna-untitled-seated-man",
    title: "Untitled (Seated Bandsman with Horn)",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-untitled-seated-man.webp",
    modelUrl: "/sculptures/khanna-untitled-seated-man.glb?v=2",
    material: "Bronze",
    year: "",
    dimensions: "30 × 30 × 32 inches",
    edition: "3 of 9",
  },
  // Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "29 - Yashika Sugandh Meri Patang, 2026". (The Artlogic view lists a 71 × 50 × 30 inch version, YS-0101.)
  {
    slug: "sugandh-elephant-kite",
    title: "Meri Patang",
    description: "",
    artistSlug: "yashika-sugandh",
    thumbnail: "/thumbnails/sugandh-elephant-kite.webp",
    modelUrl: "/sculptures/ElephantKite_LOWPOLY.glb",
    material: "Acrylic on Nylon",
    year: "2026",
    dimensions: "12 × 9 × 5 inches",
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
  // Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "19 - Himmat Shah Bronze": HS-0420, which this scan matches by photo in the Artlogic view.
  {
    slug: "head-c",
    title: "Untitled (Head)",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/head-c.webp",
    modelUrl: "/sculptures/head-c.glb",
    facing: 90,
    material: "Bronze",
    year: "",
    dimensions: "42 × 27 × 37 inches",
    edition: "Edition of 5 + AP",
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
  // Scan "04 - Female with blue saree". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "4 - Thotta - Female with blue saree": TV-0014. Year not given there.
  {
    slug: "female-with-blue-saree",
    title: "Blue Saree",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/female-with-blue-saree.webp",
    modelUrl: "/sculptures/female-with-blue-saree.glb?v=4",
    material: "Bronze",
    year: "",
    dimensions: "23 × 9 × 7 inches",
  },
  // First scanned as "05 - Female Head"; the model is now the more detailed rescan
  // "37 - Thotta - Female Head - 09.glb" (original in .glb-backup/web/), the same sculpture.
  // Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // rows "5 - Thotta - Female Head - 02" and "37 - Thotta - Female Head - 09": TV-0106 (edition cast).
  {
    slug: "female-head",
    title: "Yellow Saree Lady",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/female-head.webp",
    modelUrl: "/sculptures/female-head.glb?v=3",
    material: "Bronze",
    year: "2026",
    dimensions: "24 × 16 × 24 inches",
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
  // Scan "03 - Female with green Saree" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "3 - Thotta - Female with green Saree": TV-0171. Year not given there.
  {
    slug: "female-with-green-saree",
    title: "Female in Dotted Saree",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/female-with-green-saree.webp",
    modelUrl: "/sculptures/female-with-green-saree.glb?v=3",
    material: "Bronze",
    year: "",
    dimensions: "23 × 7 × 6 inches",
  },
  // Scan "14 - Thotta - Man with Mridangam.glb". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "14 - Thotta - Man with Mridangam". Year not given there.
  {
    slug: "thota-man-with-mridangam",
    title: "Man with Mridangam",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-man-with-mridangam.webp",
    modelUrl: "/sculptures/thota-man-with-mridangam.glb",
    material: "Bronze",
    year: "",
    dimensions: "59 × 24 × 23 inches",
  },
  // Scan "18 - Sujata Bajaj - Ganesha.glb". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // SUJ-0012, matched by photo. Year not given there.
  {
    slug: "bajaj-ganesha",
    title: "Ganesha",
    description: "",
    artistSlug: "sujata-bajaj",
    thumbnail: "/thumbnails/bajaj-ganesha.webp",
    modelUrl: "/sculptures/bajaj-ganesha.glb",
    material: "Acrylic on fiberglass",
    year: "",
    dimensions: "72 × 38 × 38 inches",
  },
  // Scan "27 - Krishan Khanna - 04 - 2nd.glb". Artist from the file name. A horn
  // player in a grey uniform on an oval base; no title came with the scan and no
  // work in the Artlogic view matches it by photo, so title, medium, year and
  // size are unknown. TODO: confirm details.
  {
    slug: "khanna-untitled-bandsman",
    title: "Untitled (Bandsman)",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-untitled-bandsman.webp",
    modelUrl: "/sculptures/khanna-untitled-bandsman.glb",
    facing: 310,
    material: "",
    year: "",
  },
  // Scan "27 - Krishan Khanna - 05.glb" (original in .glb-backup/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "32 - Krishan Khanna - 05" (KKA/YF/Nov2025/001–010), matched by the name "Krishan Khanna - 05";
  // the "27" in the file name is the sheet number of "Krishan Khanna - 04". No photo to check against.
  {
    slug: "khanna-untitled-trumpeter",
    title: "Patinder Ji Haran Walla",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-untitled-trumpeter.webp",
    modelUrl: "/sculptures/khanna-untitled-trumpeter.glb",
    facing: 270,
    material: "Bronze",
    year: "2025",
    dimensions: "56 × 32 × 18 inches",
    edition: "Edition of 9 + AP",
  },
  // Scan "COUPLE.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // JC-0002, matched by photo. Year not given there.
  {
    slug: "chowdhury-couple",
    title: "Couple",
    description: "",
    artistSlug: "jogen-chowdhury",
    thumbnail: "/thumbnails/chowdhury-couple.webp",
    modelUrl: "/sculptures/chowdhury-couple.glb",
    facing: 180,
    material: "Bronze",
    year: "",
    dimensions: "11 × 13 × 9 inches",
    edition: "5 of 9",
  },
  // Scan "MadhaviParekh_Sculpture.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // no stock no., matched by photo. Also noted there: inscribed in Devnagari and dated in English (front right corner).
  {
    slug: "parekh-bronze-2-1",
    title: "Bronze 2 - 1",
    description: "",
    artistSlug: "madhvi-parekh",
    thumbnail: "/thumbnails/parekh-bronze-2-1.webp",
    modelUrl: "/sculptures/parekh-bronze-2-1.glb",
    facing: 180,
    material: "Bronze",
    year: "2006",
    dimensions: "31 × 26 × 16 inches",
    edition: "2 of 7",
  },
  // Scan "RedBandGuy.usdz". A bandsman in a maroon uniform and cap playing a horn,
  // with no base. No title or artist came with the scan and no work in the Artlogic
  // view matches it by photo, so title, artist, medium, year and size are unknown.
  // TODO: confirm details.
  {
    slug: "untitled-bandsman-in-red",
    title: "Untitled (Bandsman in Red)",
    description: "",
    artistSlug: "",
    thumbnail: "/thumbnails/untitled-bandsman-in-red.webp",
    modelUrl: "/sculptures/untitled-bandsman-in-red.glb",
    facing: 200,
    material: "",
    year: "",
  },
  // Scan "DRONE05.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "53 - Drone 05", and the Artlogic view (matched by photo): TVA/Dec2025/001. Year not given.
  {
    slug: "thota-untitled-head-polka-dot",
    title: "Untitled (Female Head, polka-dot collar)",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-untitled-head-polka-dot.webp",
    modelUrl: "/sculptures/thota-untitled-head-polka-dot.glb",
    facing: 180,
    material: "Resinated Fibre Glass with Automotive Paint",
    year: "",
    dimensions: "99 × 85 × 53 inches",
  },
  // Scan "38 - Thotta - Female Head - 10 .glb" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "38 - Thotta - Female Head - 10": TV-0105 (edition cast).
  {
    slug: "thota-female-head-10",
    title: "Ruby Saree Lady",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-head-10.webp",
    modelUrl: "/sculptures/thota-female-head-10.glb",
    material: "Bronze",
    year: "2026",
    dimensions: "24 × 16 × 24 inches",
  },
  // Scan "Drone_07.glb" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "55 - Drone 07": TVA/Sep2025/005.
  {
    slug: "thota-untitled-head-with-turban",
    title: "Untitled (Male Head, blue turban, moustache)",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-untitled-head-with-turban.webp",
    modelUrl: "/sculptures/thota-untitled-head-with-turban.glb",
    material: "Fiberglass",
    year: "2025",
    dimensions: "97 × 50 × 72 inches",
  },
  // Scan "Drone06_FINAL.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "54 - Drone 06", and the Artlogic view (matched by photo): TV-0070. Year not given.
  // thota-female-head-05 is the same form in another finish.
  {
    slug: "thota-untitled-head-with-nose-ring",
    title: "Untitled (Female Head, bronze with long hair)",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-untitled-head-with-nose-ring.webp",
    modelUrl: "/sculptures/thota-untitled-head-with-nose-ring.glb",
    material: "Bronze",
    year: "",
    dimensions: "58 × 58 × 47 inches",
  },
  // Scan "Female_Head_7.usdz" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "35 - Thotta - Female Head - 07": TVA-0018.
  {
    slug: "thota-female-head-07",
    title: "Untitled (Female Head, nose ring, red collar)",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-head-07.webp",
    modelUrl: "/sculptures/thota-female-head-07.glb",
    facing: 260,
    material: "Bronze",
    year: "2025",
    dimensions: "26 × 17 × 24 inches",
    edition: "Edition of 9 + AP",
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
