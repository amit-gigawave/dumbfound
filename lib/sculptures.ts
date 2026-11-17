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
  /**
   * Per-work surface and light tuning for the 3D views (viewer, thumbnail,
   * hover preview). Scans often come out shinier than the real work; this
   * tones them down. Re-run `npm run thumbnails -- <slug>` after changing it.
   */
  look?: ArtworkLook;
}

/** Every value multiplies the model's own setting; 1 (or leaving it out) keeps it. */
export interface ArtworkLook {
  /** How metallic the surface is: 0 turns metal into paint, 0.5 halves it. */
  metalness?: number;
  /** Roughness: above 1 makes the surface more matte (capped at fully matte). */
  roughness?: number;
  /** Strength of the studio reflections on the surface. */
  reflections?: number;
  /** Strength of the lights. */
  light?: number;
  /**
   * Extra lights from the viewer's left and right at face height (0 = none,
   * 1 = as strong as the key). For dark works whose form front light can't show.
   */
  sideLights?: number;
  /**
   * Sets (not multiplies) the paint's surface sheen, 0–1. Some scans export it
   * as 0, which leaves dark paint flat whatever the light; 1 is ordinary paint.
   */
  specular?: number;
}

/** AR height for works whose real height (`heightCm`) isn't known yet. */
export const AR_DEFAULT_CM = 50;

/** The AR copy of a work's model, built by `npm run ar-models`. */
export const arModelUrl = (work: Sculpture) => `/ar/${work.slug}.glb`;

export const sculptures: Sculpture[] = [
  // Thota Vaikuntam's works. Their earlier titles, years, materials and
  // descriptions had no source and were removed (2026-10-15). Titles are named
  // after the model files until the real ones are known. TODO: confirm details.
  // Titled "Untitled (Lady)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "thota-lady",
    title: "Lady",
    description: "",
    modelUrl: "/sculptures/Lady.glb",
    look: { light: 1.8, reflections: 2.5, sideLights: 1 },
    thumbnail: "/thumbnails/thota-lady.webp?v=3",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "",
    year: "",
  },
  // Titled "Untitled (Lord Krishna)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "lord-krishna",
    title: "Lord Krishna",
    description: "",
    modelUrl: "/sculptures/LordKrishna.glb",
    look: { metalness: 0.5, roughness: 1.3 },
    thumbnail: "/thumbnails/lord-krishna.webp?v=3",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "",
    year: "",
  },
  // Titled "Untitled (Pandit)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "thota-pandit",
    title: "Pandit",
    description: "",
    modelUrl: "/sculptures/Pandit.glb",
    thumbnail: "/thumbnails/thota-pandit.webp?v=2",
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
    look: { metalness: 0.5, roughness: 1.3 },
    facing: 290,
    thumbnail: "/thumbnails/dancing-shiva.webp?v=3",
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
    thumbnail: "/thumbnails/khanna-satwant-sher-singh-cymbal-walae.webp?v=4",
    modelUrl: "/sculptures/Red_Cymbals_Guy_LPoly.glb?v=2",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 30,
    material: "Bronze",
    year: "",
    dimensions: "14 × 5 × 6 inches",
    edition: "3 of 9",
    heightCm: 36,
  },
  // Low-poly model "Trumpet_Musician_Orange_LPoly". Matched by photo (orange jacket, horn) to Gulratan Bhon Bhon
  // Walae in the Artlogic view; details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F, row "41 - Krishan Khanna - 07".
  // It was listed as Patinder Rawat Trumpet Walae until 2026-11-16; the address (slug) was kept.
  {
    slug: "khanna-gulratan-bhon-bhon-walae",
    title: "Gulratan Bhon Bhon Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-gulratan-bhon-bhon-walae.webp?v=3",
    modelUrl: "/sculptures/Trumpet_Musician_Orange_LPoly.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 190,
    material: "Bronze",
    year: "",
    dimensions: "12 × 6 × 4 inches",
    edition: "3 of 9",
    heightCm: 30,
  },
  // Scan "12 - Krishan Khanna 03". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "12 - Krishan Khanna - 03": KK-0305.
  // Titled "Untitled (Seated Bandsman with Horn)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "khanna-seated-bandsman-with-horn",
    title: "Seated Bandsman with Horn",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-seated-bandsman-with-horn.webp?v=2",
    modelUrl: "/sculptures/khanna-untitled-seated-man.glb?v=2",
    material: "Bronze",
    year: "",
    dimensions: "30 × 30 × 32 inches",
    edition: "3 of 9",
    heightCm: 76,
  },
  // Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "29 - Yashika Sugandh Meri Patang, 2026". (The Artlogic view lists a 71 × 50 × 30 inch version, YS-0101.)
  // Model from the colour scan "ElephantKite.usdz" (2026-11-16); it replaced an untextured low-poly mesh.
  {
    slug: "sugandh-meri-patang",
    title: "Meri Patang",
    description: "",
    artistSlug: "yashika-sugandh",
    thumbnail: "/thumbnails/sugandh-meri-patang.webp?v=4",
    modelUrl: "/sculptures/ElephantKite_LOWPOLY.glb?v=2",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 270,
    material: "Acrylic on Nylon",
    year: "2026",
    dimensions: "12 × 9 × 5 inches",
    heightCm: 30,
  },

  // ---- Newly scanned heads (USDZ → GLB). Artist/title to be confirmed. ----
  // Scan "headA.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "18 - Himmat Shah Bronze": HS-0426, matched by the photo in that row.
  // Titled "Untitled (Head)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "shah-head-with-bared-teeth",
    title: "Head with Bared Teeth",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-head-with-bared-teeth.webp?v=3",
    modelUrl: "/sculptures/head-a.glb?v=2",
    look: { metalness: 0.5, roughness: 1.3 },
    material: "Bronze",
    year: "",
    dimensions: "49 × 29 × 35 inches",
    edition: "Edition of 5 + AP",
    heightCm: 124,
  },
  // Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "19 - Himmat Shah Bronze": HS-0420, which this scan matches by photo in the Artlogic view.
  // Titled "Untitled (Head)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "shah-head-with-pinpoint-eyes",
    title: "Head with Pinpoint Eyes",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-head-with-pinpoint-eyes.webp?v=3",
    modelUrl: "/sculptures/head-c.glb",
    look: { metalness: 0.5, roughness: 1.3 },
    facing: 90,
    material: "Bronze",
    year: "",
    dimensions: "42 × 27 × 37 inches",
    edition: "Edition of 5 + AP",
    heightCm: 107,
  },
  // Subba Ghosh, not Himmat Shah: details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // SG-0029 (untitled there).
  // Titled "Untitled" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "ghosh-head-in-fragments",
    title: "Head in Fragments",
    description: "",
    artistSlug: "subba-ghosh",
    thumbnail: "/thumbnails/ghosh-head-in-fragments.webp?v=3",
    modelUrl: "/sculptures/head-e.glb",
    look: { roughness: 2, reflections: 0.6 },
    material: "Fibreglass, Resin, Paper Mache, Oil and Acrylic Paint",
    year: "",
    dimensions: "17 × 11 × 16 inches",
    heightCm: 43,
  },
  // Scan "headG.usdz". Matched by the photo in row "13 - Thotta - Female Head - 04" of the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F.
  // That row is marked "[TO CONFIRM]": TV-0107, "3D scan shows no collar colour; alt. TVA-0015". It was listed as Himmat Shah until 2026-11-16.
  {
    slug: "thota-dark-green-saree-lady",
    title: "Dark Green Saree Lady",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-dark-green-saree-lady.webp?v=4",
    modelUrl: "/sculptures/head-g.glb?v=2",
    look: { metalness: 0, roughness: 2, reflections: 0.5, light: 0.65 },
    facing: 180,
    material: "Bronze",
    year: "2026",
    dimensions: "24 × 16 × 24 inches",
    heightCm: 61,
  },
  // Scan "04 - Female with blue saree". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "4 - Thotta - Female with blue saree": TV-0014. Year not given there.
  {
    slug: "thota-blue-saree",
    title: "Blue Saree",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-blue-saree.webp?v=5",
    modelUrl: "/sculptures/female-with-blue-saree.glb?v=4",
    look: { metalness: 0.2, roughness: 1.6, reflections: 1.2, light: 1.6 },
    material: "Bronze",
    year: "",
    dimensions: "23 × 9 × 7 inches",
    heightCm: 58,
  },
  // First scanned as "05 - Female Head"; the model is now the more detailed rescan
  // "37 - Thotta - Female Head - 09.glb" (original in .glb-backup/web/), the same sculpture.
  // Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // rows "5 - Thotta - Female Head - 02" and "37 - Thotta - Female Head - 09": TV-0106 (edition cast).
  {
    slug: "thota-yellow-saree-lady",
    title: "Yellow Saree Lady",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-yellow-saree-lady.webp?v=4",
    modelUrl: "/sculptures/female-head.glb?v=3",
    look: { metalness: 0, roughness: 2, reflections: 0.5, light: 0.65 },
    material: "Bronze",
    year: "2026",
    dimensions: "24 × 16 × 24 inches",
    heightCm: 61,
  },
  // Scan "meditating.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // MS-0095. Year not given there.
  {
    slug: "sansanwal-levitation",
    title: "Levitation",
    description: "",
    artistSlug: "meena-sansanwal",
    thumbnail: "/thumbnails/sansanwal-levitation.webp?v=3",
    modelUrl: "/sculptures/meditating.glb?v=2",
    look: { metalness: 0.5, roughness: 1.3 },
    facing: 180,
    material: "Papermache, Marble And Acrylic Paint",
    year: "",
    dimensions: "24 × 22 × 14 inches",
    heightCm: 61,
  },
  // Scan "03 - Female with green Saree" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "3 - Thotta - Female with green Saree": TV-0171. Year not given there.
  {
    slug: "thota-female-in-dotted-saree",
    title: "Female in Dotted Saree",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-in-dotted-saree.webp?v=5",
    modelUrl: "/sculptures/female-with-green-saree.glb?v=3",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6, light: 1.3 },
    material: "Bronze",
    year: "",
    dimensions: "23 × 7 × 6 inches",
    heightCm: 58,
  },
  // Scan "11 - Krishna Khanna 02" (original in .glb-backup/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "11 - Krishan Khanna - 02": KK-0165. Year not given there.
  {
    slug: "khanna-trumpeter",
    title: "Trumpeter",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-trumpeter.webp?v=3",
    modelUrl: "/sculptures/khanna-untitled-horn-player.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    material: "Bronze",
    year: "",
    dimensions: "17 × 9 × 8 inches",
    heightCm: 43,
  },
  // Scan "SculptureA.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // HM-0406. Year not given there.
  {
    slug: "shah-tirthankar",
    title: "Tirthankar",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-tirthankar.webp?v=3",
    modelUrl: "/sculptures/shah-tirthankar.glb",
    look: { metalness: 0.5, roughness: 1.3 },
    facing: 150,
    material: "Bronze",
    year: "",
    dimensions: "48 × 26 × 20 inches",
    edition: "AP 1/1",
    heightCm: 122,
  },
  // Scan "sculptureB.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // no stock no. Year not given there.
  {
    slug: "khanna-retd-captain-ramesh-kumar-accordian-walae",
    title: "Retd Captain Ramesh Kumar Accordian Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-retd-captain-ramesh-kumar-accordian-walae.webp?v=3",
    modelUrl: "/sculptures/khanna-retd-captain-ramesh-kumar-accordian-walae.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 65,
    material: "Bronze",
    year: "",
    dimensions: "12 × 8 × 12 inches",
    edition: "2 of 9",
    heightCm: 30,
  },
  // Scan "sculptureD.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // no stock no. Year not given there.
  {
    slug: "khanna-rajinder-kaka-horn-walae",
    title: "Rajinder Kaka Horn Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-rajinder-kaka-horn-walae.webp?v=3",
    modelUrl: "/sculptures/khanna-rajinder-kaka-horn-walae.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 250,
    material: "Bronze",
    year: "",
    dimensions: "12 × 7 × 6 inches",
    edition: "3 of 9",
    heightCm: 30,
  },
  // Scan "sculptureE.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // no stock no. Year not given there.
  {
    slug: "khanna-davinder-raj-tutu-walae",
    title: "Davinder Raj Tutu Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-davinder-raj-tutu-walae.webp?v=3",
    modelUrl: "/sculptures/khanna-davinder-raj-tutu-walae.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 330,
    material: "Bronze",
    year: "",
    dimensions: "10 × 6 × 10 inches",
    edition: "3 of 9",
    heightCm: 25,
  },
  // Scan "muscianbeatingdrums.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // no stock no. Year not given there.
  {
    slug: "khanna-adhikari-dada-drum-walae",
    title: "Adhikari Dada Drum Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-adhikari-dada-drum-walae.webp?v=3",
    modelUrl: "/sculptures/khanna-adhikari-dada-drum-walae.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 300,
    material: "Bronze",
    year: "",
    dimensions: "12 × 5 × 5 inches",
    edition: "3 of 9",
    heightCm: 30,
  },
  // Scan "eggshellwithBeans.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "39 - Yashika Sugandh Matar, 2024": YS-0205. (The Artlogic view lists a 102 × 30 × 25 inch version, YS-0060.)
  {
    slug: "sugandh-matar",
    title: "Matar",
    description: "",
    artistSlug: "yashika-sugandh",
    thumbnail: "/thumbnails/sugandh-matar.webp?v=3",
    modelUrl: "/sculptures/sugandh-matar.glb",
    look: { roughness: 1.8, reflections: 0.7 },
    facing: 110,
    material: "Acrylic on Fiber Resin and Nylon",
    year: "2024",
    dimensions: "11 × 2 × 2 inches",
  },
  // Scan "tailor.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // Yusuf-0547 (untitled there). Year not given there.
  // Titled "Untitled" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "yusuf-the-tailor",
    title: "The Tailor",
    description: "",
    artistSlug: "yusuf",
    thumbnail: "/thumbnails/yusuf-the-tailor.webp?v=2",
    modelUrl: "/sculptures/yusuf-untitled-sewing-machine.glb",
    facing: 150,
    material: "Bronze",
    year: "",
    dimensions: "18 × 28 × 18 inches",
  },
  // Scan "POLKADOTCAT.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // Yusuf-0548 (untitled there). Year not given there.
  // Titled "Untitled" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "yusuf-polka-dot-cat",
    title: "Polka Dot Cat",
    description: "",
    artistSlug: "yusuf",
    thumbnail: "/thumbnails/yusuf-polka-dot-cat.webp?v=2",
    modelUrl: "/sculptures/yusuf-untitled-cat.glb",
    facing: 280,
    material: "Bronze",
    year: "",
    dimensions: "20 × 10 × 11 inches",
    heightCm: 51,
  },
  // Scan "14 - Thotta - Man with Mridangam.glb". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "14 - Thotta - Man with Mridangam". Year not given there.
  {
    slug: "thota-man-with-mridangam",
    title: "Man with Mridangam",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-man-with-mridangam.webp?v=5",
    modelUrl: "/sculptures/thota-man-with-mridangam.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6, light: 1.3 },
    material: "Bronze",
    year: "",
    dimensions: "59 × 24 × 23 inches",
    heightCm: 150,
  },
  // Scan "18 - Sujata Bajaj - Ganesha.glb". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // SUJ-0012, matched by photo. Year not given there.
  {
    slug: "bajaj-ganesha",
    title: "Ganesha",
    description: "",
    artistSlug: "sujata-bajaj",
    thumbnail: "/thumbnails/bajaj-ganesha.webp?v=3",
    modelUrl: "/sculptures/bajaj-ganesha.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    material: "Acrylic on fiberglass",
    year: "",
    dimensions: "72 × 38 × 38 inches",
    heightCm: 183,
  },
  // Scan "27 - Krishan Khanna - 04 - 2nd.glb". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "27 - Krishan Khanna - 04"; it also matches Patinder Rawat Trumpet Walae in the Artlogic view by photo
  // (grey jacket, tuba, oval base). Year not given there.
  {
    slug: "khanna-patinder-rawat-trumpet-walae",
    title: "Patinder Rawat Trumpet Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-patinder-rawat-trumpet-walae.webp?v=4",
    modelUrl: "/sculptures/khanna-untitled-bandsman.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 310,
    material: "Bronze",
    year: "",
    dimensions: "12 × 5 × 5 inches",
    edition: "3 of 9",
    heightCm: 30,
  },
  // Scan "27 - Krishan Khanna - 05.glb" (original in .glb-backup/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "32 - Krishan Khanna - 05" (KKA/YF/Nov2025/001–010), matched by the name "Krishan Khanna - 05";
  // the "27" in the file name is the sheet number of "Krishan Khanna - 04". No photo to check against.
  {
    slug: "khanna-patinder-ji-haran-walla",
    title: "Patinder Ji Haran Walla",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-patinder-ji-haran-walla.webp?v=3",
    modelUrl: "/sculptures/khanna-untitled-trumpeter.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 270,
    material: "Bronze",
    year: "2025",
    dimensions: "56 × 32 × 18 inches",
    edition: "Edition of 9 + AP",
    heightCm: 142,
  },
  // Scan "31.glb" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "31", marked there "[TO CONFIRM CAST]": a small edition series whose exact cast/patina
  // can't be identified from the photo. TODO: confirm the cast.
  {
    slug: "shah-man-from-moon",
    title: "Man from Moon",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-man-from-moon.webp?v=2",
    modelUrl: "/sculptures/untitled-figure-with-spear.glb?v=2",
    facing: 270,
    material: "Bronze",
    year: "",
    dimensions: "7 × 9 × 4 inches",
  },
  // Scan "33 - Thotta - Female Head - 05.glb" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "33 - Thotta - Female Head - 05": TVA-0016.
  // Titled "Untitled (Female Head, side braid, green collar)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "thota-female-head-with-side-braid",
    title: "Female Head with Side Braid and Green Collar",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-head-with-side-braid.webp?v=5",
    modelUrl: "/sculptures/thota-female-head-05.glb",
    look: { metalness: 0, roughness: 2, reflections: 0.5, light: 1.2 },
    material: "Bronze",
    year: "2025",
    dimensions: "25 × 17 × 24 inches",
    edition: "Edition of 9 + AP",
    heightCm: 64,
  },
  // Scan "COUPLE.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // JC-0002, matched by photo. Year not given there.
  {
    slug: "chowdhury-couple",
    title: "Couple",
    description: "",
    artistSlug: "jogen-chowdhury",
    thumbnail: "/thumbnails/chowdhury-couple.webp?v=3",
    modelUrl: "/sculptures/chowdhury-couple.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 180,
    material: "Bronze",
    year: "",
    dimensions: "11 × 13 × 9 inches",
    edition: "5 of 9",
    heightCm: 28,
  },
  // Scan "MadhaviParekh_Sculpture.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // no stock no., matched by photo. Also noted there: inscribed in Devnagari and dated in English (front right corner).
  {
    slug: "parekh-bronze-2-1",
    title: "Bronze 2 - 1",
    description: "",
    artistSlug: "madhvi-parekh",
    thumbnail: "/thumbnails/parekh-bronze-2-1.webp?v=3",
    modelUrl: "/sculptures/parekh-bronze-2-1.glb",
    look: { metalness: 0.5, roughness: 1.3 },
    facing: 180,
    material: "Bronze",
    year: "2006",
    dimensions: "31 × 26 × 16 inches",
    edition: "2 of 7",
    heightCm: 79,
  },
  // Scan "RedBandGuy.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "10 - Krishan Khanna - 01": KK-0302, matched by the photo in that row. Size and year not given there.
  {
    slug: "khanna-bandwalla",
    title: "Bandwalla",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-bandwalla.webp?v=3",
    modelUrl: "/sculptures/untitled-bandsman-in-red.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.6 },
    facing: 200,
    material: "Bronze",
    year: "",
    edition: "Edition of 9",
  },
  // Scan "DRONE05.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "53 - Drone 05", and the Artlogic view (matched by photo): TVA/Dec2025/001. Year not given.
  // Titled "Untitled (Female Head, polka-dot collar)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "thota-female-head-with-polka-dot-collar",
    title: "Female Head with Polka-dot Collar",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-head-with-polka-dot-collar.webp?v=3",
    modelUrl: "/sculptures/thota-untitled-head-polka-dot.glb",
    look: { metalness: 0, roughness: 2, reflections: 0.5, light: 0.9 },
    facing: 180,
    material: "Resinated Fibre Glass with Automotive Paint",
    year: "",
    dimensions: "99 × 85 × 53 inches",
    heightCm: 251,
  },
  // Scan "38 - Thotta - Female Head - 10 .glb" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "38 - Thotta - Female Head - 10": TV-0105 (edition cast).
  {
    slug: "thota-ruby-saree-lady",
    title: "Ruby Saree Lady",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-ruby-saree-lady.webp?v=3",
    modelUrl: "/sculptures/thota-female-head-10.glb",
    look: { metalness: 0, roughness: 2, reflections: 0.5, light: 0.9 },
    material: "Bronze",
    year: "2026",
    dimensions: "24 × 16 × 24 inches",
    heightCm: 61,
  },
  // Scan "Drone_07.glb" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "55 - Drone 07": TVA/Sep2025/005.
  // Titled "Untitled (Male Head, blue turban, moustache)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "thota-male-head-with-blue-turban",
    title: "Male Head with Blue Turban and Moustache",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-male-head-with-blue-turban.webp?v=5",
    modelUrl: "/sculptures/thota-untitled-head-with-turban.glb",
    look: { metalness: 0.15, roughness: 1.3, reflections: 1.2, light: 1.3, specular: 0.6, sideLights: 1 },
    material: "Fiberglass",
    year: "2025",
    dimensions: "97 × 50 × 72 inches",
    heightCm: 246,
  },
  // Scan "Drone06_FINAL.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "54 - Drone 06", and the Artlogic view (matched by photo): TV-0070. Year not given.
  // thota-female-head-05 is the same form in another finish.
  // Titled "Untitled (Female Head, bronze with long hair)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "thota-bronze-female-head-with-long-hair",
    title: "Bronze Female Head with Long Hair",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-bronze-female-head-with-long-hair.webp?v=4",
    modelUrl: "/sculptures/thota-untitled-head-with-nose-ring.glb",
    look: { metalness: 0.2, roughness: 1.8, reflections: 0.6 },
    material: "Bronze",
    year: "",
    dimensions: "58 × 58 × 47 inches",
    heightCm: 147,
  },
  // Scan "Female_Head_7.usdz" (original in .glb-backup/web/). Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "35 - Thotta - Female Head - 07": TVA-0018.
  // Titled "Untitled (Female Head, nose ring, red collar)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "thota-female-head-with-nose-ring",
    title: "Female Head with Nose Ring and Red Collar",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-head-with-nose-ring.webp?v=3",
    modelUrl: "/sculptures/thota-female-head-07.glb",
    look: { metalness: 0, roughness: 2, reflections: 0.5, light: 0.9 },
    facing: 260,
    material: "Bronze",
    year: "2025",
    dimensions: "26 × 17 × 24 inches",
    edition: "Edition of 9 + AP",
    heightCm: 66,
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
