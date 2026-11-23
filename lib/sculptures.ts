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
  /**
   * What the work shows, for grouping the artworks grid: "head" (a head or
   * bust), "figure" (a whole body; the default when left out) or "other" (an
   * animal or object). Read from the work itself; it is never shown as text.
   */
  form?: "head" | "figure" | "other";
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
  /**
   * Use another light rig instead of the shared one (components/three/lighting.ts):
   * "previous" is the earlier filmic studio light.
   */
  rig?: "previous";
  /**
   * Extra light multiplier on the catalogue card only (thumbnail and hover
   * preview), not the artwork page's viewer, where a dark backdrop makes a
   * light-coloured work look dimmer.
   */
  cardLight?: number;
  /**
   * false: the artwork page's viewer drops the shadows the work casts on
   * itself, so it looks like its thumbnail (which has none).
   */
  selfShadow?: boolean;
  /**
   * Card framing (thumbnail and hover preview): `cardZoom` enlarges the work
   * (1.2 = 20% bigger), `cardShift` moves it sideways by a fraction of the
   * card's width (+ = right) and `cardLift` up by a fraction of its height.
   * For works whose auto-framing leaves them small or off-centre, e.g. long
   * parts sticking out.
   */
  cardZoom?: number;
  cardShift?: number;
  cardLift?: number;
  /**
   * Per-part surface, by the part's material name in the model file. Sets (not
   * multiplies) metalness and roughness, 0–1, for that part in place of the
   * whole-work values above; a part whose own metalness is 0 can only be
   * changed this way. Set in the look tweaker (/lab/look).
   */
  parts?: Record<string, { metalness?: number; roughness?: number }>;
}

/** AR height for works whose real height (`heightCm`) isn't known yet. */
export const AR_DEFAULT_CM = 50;

/** The AR copy of a work's model, built by `npm run ar-models`. */
export const arModelUrl = (work: Sculpture) => `/ar/${work.slug}.glb`;

/**
 * The light copy the artwork cards turn in 3D (1024 px textures), built by
 * `npm run preview-models`. It carries the full model's ?v=, so replacing a
 * model (which bumps that) also refreshes the card's copy.
 */
export const previewModelUrl = (work: Sculpture) =>
  work.modelUrl
    ? `/previews/${work.slug}.glb${work.modelUrl.match(/\?v=\d+/)?.[0] ?? ""}`
    : undefined;

export const sculptures: Sculpture[] = [
  // Descriptions (2026-11-19, at the user's request) are written only from each
  // work's sourced details below: title, artist, medium, size, year, edition, and
  // the source's own title where it is "Untitled". Plain readings of a title (an
  // instrument, a Hindi word) are the only additions; nothing about meaning or history.
  // longDescription (150-200 words, shown on the artwork page in place of the
  // one-line description) adds only what is visible in the work itself, looked at
  // from its front image: pose, dress, objects, colour, surface. Where the artist's
  // sourced summary in lib/artists.ts names a matching subject (Khanna's
  // Bandwallahs series, Thota's women with vermilion bindis, Das's mother and
  // child) one clause says so. No meaning, history or value judgements (2026-11-19).
  // Thota Vaikuntam's works. Their earlier titles, years, materials and
  // descriptions had no source and were removed (2026-10-15). Titles are named
  // after the model files until the real ones are known. TODO: confirm details.
  // Titled "Untitled (Lady)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "thota-lady",
    title: "Lady",
    description: "A work by Thota Vaikuntam, listed in its source as Untitled (Lady).",
    longDescription:
      "A woman stands upright and square to the front, her bare feet set slightly apart on a low, rounded base. Her hair is drawn back from a centre parting, and a small raised mark sits in the middle of her forehead. The face is broad and flat, with large almond eyes, and a fine line runs down from the nose over the lips to the chin.\n\nBoth forearms are folded across her chest, and each is covered from wrist to elbow in close rings of bangles. One hand is lifted towards her chin, while the other lies across the body just below it. A saree wraps the figure: it passes over the shoulders, falls in long vertical pleats down the front and gathers at the ankles, where anklets show above the feet.\n\nThe surface is a dark reddish brown, broken by patches of green and turquoise that collect most thickly in the folds of the cloth, around the feet and on the base. Unlike the bright saris and vermilion bindis of Thota Vaikuntam's painted women, this figure is seen in a single dark tone. It is listed in its source as Untitled (Lady).",
    modelUrl: "/sculptures/Lady.glb",
    look: { light: 1.8, reflections: 2.5, sideLights: 1 },
    thumbnail: "/thumbnails/thota-lady.webp?v=5",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "",
    year: "",
  },
  // Titled "Untitled (Lord Krishna)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "lord-krishna",
    title: "Lord Krishna",
    description: "A work by Thota Vaikuntam, listed in its source as Untitled (Lord Krishna).",
    longDescription:
      "Holding a slender flute to his lips, the figure stands upright with both hands raised close to the face. The flute runs diagonally across the mouth towards the viewer's right, steadied by the fingers of one hand while the other hand is opened flat behind it. Thin bangles ring both wrists.\n\nHe wears a close-fitting cap and a long open coat that falls almost to the knees, its front edges and short sleeves outlined with a raised border. Beneath it, the chest and belly are bare and smoothly modelled, and a dhoti hangs in narrow vertical pleats between the legs, gathered at the calves. A U-shaped mark is drawn on the forehead above large, almond-shaped eyes, and the flute meets the lips. Bands circle the ankles, and the bare feet rest on a low oval base.\n\nThe whole surface is a polished golden brown, darker in the hollows and bright where light catches the shoulders, cheeks, knees and folds of cloth. The forms are simplified into smooth, broad planes, and the body reads as a tall, narrow column from cap to feet. It is listed in its source as Untitled (Lord Krishna).",
    modelUrl: "/sculptures/LordKrishna.glb",
    look: { rig: "previous" },
    thumbnail: "/thumbnails/lord-krishna.webp?v=6",
    artistSlug: "thota-vaikuntam",
    featured: true,
    material: "",
    year: "",
  },
  // Titled "Untitled (Pandit)" in its source; descriptive name used on the site at the user's request (2026-11-16).
  {
    slug: "thota-pandit",
    title: "Pandit",
    description: "A work by Thota Vaikuntam, listed in its source as Untitled (Pandit).",
    longDescription:
      "A bare-chested man stands facing forward, the index finger of his right hand raised beside his chest. In his left hand he holds a flat rectangular tablet, its face incised with zigzag lines. His head is smooth, round and hairless, with lines drawn down the forehead between the brows, and his eyes are large and almond-shaped.\n\nThe torso is soft and rounded, with a full belly and a deep navel. Beaded bands circle both upper arms, and bangles circle both wrists. A pale blue cloth, scattered with small dots, is draped over his left shoulder and hangs down his side. Around the waist and legs is a pale blue dhoti, falling in long pleats down the centre and gathered just above the ankles, with a fine white line marking its upper edge.\n\nThe skin is a smooth, even taupe-brown, set against the cool blue and white of the cloth. The figure stands with bare feet on a thin, irregular base, its proportions compact, with a large head, narrow shoulders and short legs. The title, Pandit, names the figure shown. It is listed in its source as Untitled (Pandit).",
    modelUrl: "/sculptures/Pandit.glb",
    look: { rig: "previous" },
    thumbnail: "/thumbnails/thota-pandit.webp?v=5",
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
    longDescription:
      "Caught in mid-movement, the dancing figure balances on one bent leg while the other swings out to the viewer's left, its bare foot lifted clear of the ground. One hand is raised beside the face with the palm turned outward; the other arm crosses in front of the body and points downward, the fingers loosely spread.\n\nThe skin is a cool grey. A tall golden-yellow crown with a ridged surface sits on the head, large gold hoops hang from the ears, and gold bands circle the upper arms, wrists and ankles, with a gold necklace at the throat. Behind the figure, a mass of dark grey, almost black, branching strands spreads outward on both sides, each one twisting and forking like a root or a branch.\n\nAround the hips and legs, a deep red garment breaks apart into similar branching strands that hang down and spread across the ground, several of them meeting the floor. Together these red and dark forms make up most of the sculpture's outline, so the grey body sits at the centre of a wide, open tangle. The title names the subject as Shiva, dancing.",
    modelUrl: "/sculptures/DancingShivaHero.glb?v=2",
    look: { metalness: 0.15, roughness: 0.6, reflections: 1, light: 1.6, sideLights: 0.7, specular: 1 },
    facing: 290,
    thumbnail: "/thumbnails/dancing-shiva.webp?v=7",
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
    description: "Satwant Sher Singh, the cymbal player of the title, in bronze by Krishen Khanna, 14 × 5 × 6 inches. Cast 3 of an edition of 9.",
    longDescription:
      "With both arms lifted high, the bandsman raises a pair of cymbals above his head, one held just in front of his face and the other higher, at the end of his outstretched right arm. His head tips back and his gaze follows them upward. The face and hands are a darker brown, the features lined and the cheeks hollow.\n\nHe wears an orange-red jacket with a row of round buttons down the front and a flared hem below the waist, a white belt with a buckle, and a matching orange-red cap edged with a white band. White trousers fold and crease over the knees, which are bent and turned outward, and one heel is raised off the ground. Brown laced shoes rest on a low, flat, brown base with a rounded outline.\n\nThe bronze stands 14 × 5 × 6 inches, about 36 cm tall, and this is cast 3 of an edition of 9. The title gives the player's name, Satwant Sher Singh, followed by \"Cymbal Walae\", roughly \"the one with the cymbals\", naming the instrument he holds. The figure is a bandsman of the kind found in Krishen Khanna's Bandwallahs series.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-satwant-sher-singh-cymbal-walae.webp?v=6",
    modelUrl: "/sculptures/Red_Cymbals_Guy_LPoly.glb?v=2",
    look: { metalness: 0.2, roughness: 1.65, reflections: 0.6 },
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
    description: "Gulratan Bhon Bhon Walae, a bronze by Krishen Khanna, 12 × 6 × 4 inches. Cast 3 of an edition of 9.",
    longDescription:
      "A bandsman plants his feet wide and blows into a large horn, its long tube curving from his mouth down across his body and back up over his right shoulder, where it opens into a wide bell behind his head. Both hands grip the tube at chest height, and his head tilts slightly upward.\n\nHe wears a bright yellow jacket with fringed epaulettes on the shoulders, a flared hem below the waist and a darker brown belt fastened with a buckle. The matching yellow cap sits low on his forehead. His trousers are a pale grey-brown, loose and creased, and his knees bend a little. On his feet are simple open sandals, standing on a low, flat brown base with an irregular, rounded edge. The modelling of the trousers and face is rough and lumpy rather than smooth.\n\nThe bronze measures 12 × 6 × 4 inches, about 30 cm tall, and is cast 3 of an edition of 9. In the title, \"Gulratan\" gives the musician's name and \"Walae\" means roughly \"the one with\"; the horn is the only instrument in view. He is one of the uniformed musicians of Krishen Khanna's Bandwallahs series.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-gulratan-bhon-bhon-walae.webp?v=5",
    modelUrl: "/sculptures/Trumpet_Musician_Orange_LPoly.glb",
    look: { metalness: 0.15, roughness: 0.59, reflections: 0.6 },
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
    description: "A seated bandsman with a horn, in bronze, by Krishen Khanna; listed in its source as Untitled (Seated Bandsman with Horn). 30 × 30 × 32 inches, cast 3 of an edition of 9.",
    longDescription:
      "A man sits on the ground with one knee drawn up, his right forearm resting across it and the hand hanging loosely over the edge, the fingers curled. His other leg lies folded flat in front of him, and his left hand is placed palm down on the ground beside his hip. His head is slightly lifted and his eyes appear nearly closed.\n\nHe wears a peaked cap with a band, a shirt buttoned to the collar, a loose open jacket with buttons down one side and a belt at the waist. His trousers are creased at the shin, and he wears heavy laced shoes, both placed at the front of the work. The clothing has a textured, slightly rough surface in a dark grey-violet tone, while the face, hands and a strip of bare ankle are a lighter golden brown.\n\nThis is a large bronze, 30 × 30 × 32 inches, about 76 cm high, and is cast 3 of an edition of 9. The title refers to a horn; from this front view the instrument is not visible. The seated figure is one of the bandsmen of Krishen Khanna's Bandwallahs series.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-seated-bandsman-with-horn.webp?v=5",
    modelUrl: "/sculptures/khanna-untitled-seated-man.glb?v=2",
    look: { light: 1.4, reflections: 1.5 },
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
    form: "other",
    title: "Meri Patang",
    description: "Meri Patang (2026) by Yashika Sugandh, in acrylic on nylon, 12 × 9 × 5 inches. Its title means “My Kite”.",
    longDescription:
      "A blue elephant rears up on one hind leg, its trunk raised high in a long curve and its pale tusks pointing upward. The body shades from light blue at the head and ears to a deep blue on the belly and legs, with small white toenails marked on the feet.\n\nOne front foot is lifted and balances a green ball, while the hind foot it stands on rests on another green ball, set on top of a long green pod that forms the base. More green spheres cluster on top of the elephant's head, between the ears. The tail is unusually long and thin: it sweeps out behind the body, curves upward and ends in a small diamond-shaped kite, orange with diagonal stripes, with a short tail of its own. The kite is the only warm colour in the work, set against the blues and greens of the rest.\n\nMade in 2026 in acrylic on nylon, the sculpture measures 12 × 9 × 5 inches, about 30 cm tall. Its title, Meri Patang, means \"My Kite\", naming the small orange shape at the end of the tail.",
    artistSlug: "yashika-sugandh",
    thumbnail: "/thumbnails/sugandh-meri-patang.webp?v=6",
    modelUrl: "/sculptures/ElephantKite_LOWPOLY.glb?v=2",
    look: { metalness: 0.18, roughness: 1.8, reflections: 0.6 },
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
    form: "head",
    title: "Head with Bared Teeth",
    description: "A bronze head by Himmat Shah, 49 × 29 × 35 inches, from an edition of 5 plus an artist's proof. Listed in its source as Untitled (Head).",
    longDescription:
      "A large head rises from a thick cylindrical neck, the whole form smooth in outline and slightly egg-shaped. On the face, two broad, light-coloured areas spread outward from the nose and down the cheeks, each pierced by a small round hole for an eye. Between them, the nose is long and heavy, widening at the tip.\n\nBelow, the lips are parted to show a single row of upper teeth, square and evenly spaced, with a dark gap near the centre. The lower lip is thick and pushed slightly forward. The chin is broad and rounded, and the jaw sweeps back into the neck without a break.\n\nThe surface of the darker areas is covered in fine vertical lines, closely spaced like combed grooves, running over the crown, down the cheeks and around the neck. A horizontal band of the same lines crosses the brow above the nose. Against this ridged, darker texture, the face, nose and lips are smooth and paler, so the features stand out clearly. The bronze measures 49 × 29 × 35 inches, about 124 cm high, and comes from an edition of 5 plus an artist's proof. It is listed in its source as Untitled (Head).",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-head-with-bared-teeth.webp?v=5",
    modelUrl: "/sculptures/head-a.glb?v=2",
    look: { metalness: 0.15, roughness: 1.49, reflections: 0.9, light: 1.25 },
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
    form: "head",
    title: "Head with Pinpoint Eyes",
    description: "A bronze head by Himmat Shah, 42 × 27 × 37 inches, from an edition of 5 plus an artist's proof. Listed in its source as Untitled (Head).",
    longDescription:
      "Seen from the front, this head is a tall, smooth oval that narrows towards the bottom, set on a short round neck. The face is reduced almost entirely to flat planes. A ridge of brow runs straight across, dipping slightly at the centre, and a single crease falls from there to the chin, dividing the face into two halves that meet at a shallow angle.\n\nThe eyes are two small raised knobs, set wide apart just below the brow. Halfway down the central crease sits a small rounded bump, and there are no other features: no mouth, no ears and no hair are shown on the front. Fine cracks and lines cross the lower part of the face, and the paler front is framed by a darker rim around its edge.\n\nOn the viewer's left, a rough, darker mass with an uneven surface projects from the side of the head, in contrast to the smoothness of the face. The bronze measures 42 × 27 × 37 inches, about 107 cm high, and comes from an edition of 5 plus an artist's proof. The title refers to its small, pinpoint eyes. It is listed in its source as Untitled (Head).",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-head-with-pinpoint-eyes.webp?v=5",
    modelUrl: "/sculptures/head-c.glb",
    look: { metalness: 0.15, roughness: 1.25, reflections: 0.6 },
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
    form: "head",
    title: "Head in Fragments",
    description: "A head by Subba Ghosh in fibreglass, resin, paper mache, oil and acrylic paint, 17 × 11 × 16 inches. Listed in its source as Untitled.",
    longDescription:
      "A man's face, lined and heavy-lidded, is partly covered by a large hand that rises from below. The hand's index finger presses up against the side of the face next to one eye, and the other fingers spread across the mouth and cheek. Below the wrist, the arm becomes a thick yellow trunk that stands on a flat, square yellow base.\n\nThe top of the head is formed as a separate, rounded piece, set at an angle above the face and turning grey-violet at its outer edge. An ear is visible on the viewer's left. Across the skin, hand and trunk are painted leaves in green and blue-grey on thin stems. Raised orange and tan leaf shapes are attached at several points: on the crown, the hand, the back of the wrist and around the foot of the trunk, where they curl outward on the base.\n\nThe work is made in fibreglass, resin, paper mache, and oil and acrylic paint, and measures 17 × 11 × 16 inches, about 43 cm high. The skin is a warm peach colour. It is listed in its source as Untitled.",
    artistSlug: "subba-ghosh",
    thumbnail: "/thumbnails/ghosh-head-in-fragments.webp?v=4",
    modelUrl: "/sculptures/head-e.glb",
    look: { roughness: 2, reflections: 0.6 },
    material: "Fibreglass, Resin, Paper Mache, Oil and Acrylic Paint",
    year: "",
    dimensions: "17 × 11 × 16 inches",
    heightCm: 43,
  },
  // Scan "headG.usdz". Matched by the photo in row "13 - Thotta - Female Head - 04" of the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F.
  // That row is marked "[TO CONFIRM]": TV-0107, "3D scan shows no collar colour; alt. TVA-0015". It was listed as Himmat Shah until 2026-11-16.
  // Title given by the user on 2026-11-17 (was "Dark Green Saree Lady"); the slug is kept.
  {
    slug: "thota-dark-green-saree-lady",
    form: "head",
    title: "Saree Lady Series (White)",
    description: "A bronze head from Thota Vaikuntam's Saree Lady series (2026), 24 × 16 × 24 inches.",
    longDescription:
      "A woman's head and neck are set on a short white collar, the face turned slightly to one side. Her hair is dark brown, drawn smoothly back from the face, with a small ring-shaped ornament on each side near the top. A broad yellow band crosses the forehead, and at its centre sits a large round orange bindi.\n\nThe face is a warm golden bronze. The eyes are long and almond-shaped beneath heavy lids, and the nose is straight and narrow, joined to the brow in a single line. Below the full lips, a yellow triangle runs down to the chin, echoing the yellow of the forehead. The ears are long and flat, standing out from the sides of the head. A thick ring circles the neck.\n\nThe collar at the base is pale white with a faint pink tint and is dotted with small holes. This bronze, made in 2026, measures 24 × 16 × 24 inches, about 61 cm high, and its title places it in a Saree Lady series. The large vermilion bindi and almond eyes recur in Thota Vaikuntam's painted women.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-dark-green-saree-lady.webp?v=6",
    modelUrl: "/sculptures/head-g.glb?v=2",
    look: { metalness: 0.3, roughness: 1.75, reflections: 0.6, light: 1.05, sideLights: 0.3 },
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
    description: "Blue Saree, a bronze by Thota Vaikuntam, 23 × 9 × 7 inches.",
    longDescription:
      "A woman stands facing forward with her feet together on a low oval base. She wears a blue saree and a short-sleeved blue blouse. The end of the saree is drawn up over her left shoulder and falls diagonally across the body, and the lower part gathers in front into a long fold between the legs, ending just below the knees.\n\nHer right arm hangs at her side, holding a small rounded pouch or pot by its neck. Her left hand rests at the waist. Both forearms are covered in close rings of bangles, and thick anklets circle the ankles above the bare feet. A small red bindi sits at the centre of her forehead. The head is large and round, the hair drawn smoothly back, and a fine line runs from the nose over the lips to the chin.\n\nThe skin and base are a dark grey-brown metal, while the clothing is a strong blue-violet, so the shape of the garment reads clearly against the body. The bronze measures 23 × 9 × 7 inches, about 58 cm tall. Her saree and red bindi follow the women in bright saris with vermilion bindis that Thota Vaikuntam paints.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-blue-saree.webp?v=7",
    modelUrl: "/sculptures/female-with-blue-saree.glb?v=4",
    look: { metalness: 0.5, roughness: 1.5, reflections: 1.8, light: 0.3, specular: 1 },
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
    form: "head",
    title: "Yellow Saree Lady",
    description: "Yellow Saree Lady (2026), a bronze head by Thota Vaikuntam, 24 × 16 × 24 inches.",
    longDescription:
      "Tilted slightly upward and to one side, this woman's head rests on a yellow collar dotted with small holes. A plain ring encircles the neck just above the collar. The face is a smooth, warm golden bronze, rounded at the cheeks and chin.\n\nHer dark brown hair is drawn back tightly, with a small oval ornament on either side near the crown. Across the forehead runs a broad yellow band, and in its centre a large round orange bindi. The eyes are long and almond-shaped under heavy lids, the nose is straight and joined to the brow line, and the lips are full. A narrow yellow triangle extends from the lower lip to the chin, repeating the yellow of the forehead and collar. The ears are long and flat, set close to the sides of the head.\n\nThe surfaces are smooth, and the features are reduced to clear edges and flat planes. Made in 2026, the bronze measures 24 × 16 × 24 inches, about 61 cm high. The large vermilion bindi and almond eyes are features Thota Vaikuntam gives the women in his paintings.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-yellow-saree-lady.webp?v=6",
    modelUrl: "/sculptures/female-head.glb?v=3",
    look: { metalness: 0.5, roughness: 1.2, reflections: 0.55, light: 0.8, sideLights: 0.4 },
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
    description: "Levitation by Meena Sansanwal, in papermache, marble and acrylic paint, 24 × 22 × 14 inches.",
    longDescription:
      "A figure sits cross-legged, its arms falling straight from rounded shoulders so that the hands rest on the knees. The proportions are simplified: a thin neck rises to an oval head that is hollowed out like a shallow bowl, and in the middle of that hollow sits a single almond-shaped form with a dark centre. The outer surface is rough and uneven, a mottled bronze-gold colour throughout.\n\nThe front of the torso is opened up into a deep cavity that runs from the collarbone down into the lap. Its inner walls are lined in blue-green flecked with gold, a contrast with the warmer outer skin. Near the top of this opening, at the level of the chest, a smooth yellow-gold sphere is set into the hollow. The title, Levitation, means rising or floating in the air.\n\nThe work is made in papermache, marble and acrylic paint, and measures 24 × 22 × 14 inches. Seen from the front, the arms and the sides of the torso leave two open gaps through which the background shows. The edges of the opening in the torso are thin and slightly rolled, like the lip of a shell.",
    artistSlug: "meena-sansanwal",
    thumbnail: "/thumbnails/sansanwal-levitation.webp?v=5",
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
    description: "Female in Dotted Saree, a bronze by Thota Vaikuntam, 23 × 7 × 6 inches.",
    longDescription:
      "Standing upright on a low oval base, a woman faces straight ahead in a pale green saree covered with small dark dots. The saree is wrapped close to the body and falls in long folds to her ankles, with the end drawn across the front of her body.\n\nHer right hand is raised to her chin, palm flat and fingers together. Her left forearm crosses in front of her waist, the hand open and the fingers pointing towards her right side. Both forearms are ringed with stacked bangles. Her face, arms and bare feet are left in the brown of the bronze, and her dark hair is drawn back from a broad forehead marked with a round red bindi. She wears a nose ring, bands around her neck and anklets above her feet. The figure is slender and tall in relation to its width.\n\nThe bronze measures 23 × 7 × 6 inches. The face is long, with narrow eyes under arched brows, and the dark hair forms a smooth cap over the head. Her feet stand side by side, turned slightly outwards on a flat, rounded base in the same brown as the skin.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-in-dotted-saree.webp?v=7",
    modelUrl: "/sculptures/female-with-green-saree.glb?v=3",
    look: { metalness: 0.23, roughness: 1.24, reflections: 0.6, light: 1.3 },
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
    description: "Trumpeter, a bronze by Krishen Khanna, 17 × 9 × 8 inches.",
    longDescription:
      "Feet planted apart in tall boots, a man in uniform stands with a brass horn raised to his lips. Both hands grip the instrument close to his face, partly hiding it, and the bell turns outwards to his left. A length of tubing loops down from the horn and across the front of his body, reaching past his belt before curving back up.\n\nHe is dressed in a uniform of deep blue, streaked with white in a marbled pattern: a peaked cap, a buttoned tunic, trousers and boots. The face, hands, belt and instrument are left in the brown and gold of the bronze, so these parts stand out against the blue. His elbows are lifted wide and his shoulders are hunched forward around the horn.\n\nThe bronze measures 17 × 9 × 8 inches. Khanna's figurative work includes the Bandwallahs series. The face that shows between his hands has a broad nose and heavy brows, and the cap is pulled low over the forehead. Small round buttons run down the front of the tunic and mark the pocket flaps, and the boots rise almost to the knee, wide at the top.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-trumpeter.webp?v=7",
    modelUrl: "/sculptures/khanna-untitled-horn-player.glb",
    look: { metalness: 0.29, roughness: 1.12, reflections: 1.35, light: 1.75, specular: 1 },
    material: "Bronze",
    year: "",
    dimensions: "17 × 9 × 8 inches",
    heightCm: 43,
  },
  // Scan "SculptureA.usdz". Details from the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/),
  // HM-0406. Year not given there.
  {
    slug: "shah-tirthankar",
    form: "head",
    title: "Tirthankar",
    description: "Tirthankar, a bronze by Himmat Shah, 48 × 26 × 20 inches. This cast is the artist's proof (AP 1/1).",
    longDescription:
      "Rising to 122 cm, this bronze is a tall, upright mass with a rounded top and softly sloping sides. Most of its surface is smooth and a warm golden brown, with gentle hollows and swellings rather than sharp detail. The outline is not symmetrical: each side steps inwards at a different height, and the lower part flares slightly where it meets the ground.\n\nTwo recessed shapes are set into the front. Near the top is a half-moon, its flat edge uppermost under a deep overhang. Lower down, a tall narrow panel holds two triangles that meet point to point, forming an hourglass shape framed by thin raised edges. Both recesses are filled with a dark grey surface crossed by a fine network of pale lines, like crackle, which contrasts with the smooth brown around it.\n\nThe title, Tirthankar, is the Jain term for a spiritual teacher. The bronze measures 48 × 26 × 20 inches, and this cast is the artist's proof, listed as AP 1/1. At the bottom, the hourglass panel reaches right down to the ground, and a small patch of the same dark crackled surface shows at the lower left corner.",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-tirthankar.webp?v=5",
    modelUrl: "/sculptures/shah-tirthankar.glb",
    look: { metalness: 0.16, roughness: 2.2, reflections: 0.6 },
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
    description: "Retd Captain Ramesh Kumar, the accordion player of the title, in bronze by Krishen Khanna, 12 × 8 × 12 inches. Cast 2 of an edition of 9.",
    longDescription:
      "Seated on a rough, rock-like mound, a bandsman plays an accordion held across his chest. His head is tilted back and turned slightly to one side, his eyes directed upwards. He has a thick moustache and beard and wears a cap with a red band. The accordion's pleated bellows run in vertical ridges between his two hands, and rows of small raised dots mark the buttons on the right-hand side.\n\nHis uniform is a strong orange-red, from the jacket with its epaulettes to the trousers, while his face, hands, the instrument and his shoes are left in the darker brown of the bronze. The knees are spread wide, and one foot is pushed forward over the edge of the mound with the sole turned slightly up.\n\nThe title names Retd (retired) Captain Ramesh Kumar, and \"Accordian Walae\" reads as \"the one with the accordion\". The bronze measures 12 × 8 × 12 inches and is cast 2 of an edition of 9. The epaulettes on his shoulders are textured with short, fringe-like strokes, a dark strap runs from each shoulder towards the instrument, and his cuffs are turned back above the wrists.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-retd-captain-ramesh-kumar-accordian-walae.webp?v=7",
    modelUrl: "/sculptures/khanna-retd-captain-ramesh-kumar-accordian-walae.glb",
    look: { metalness: 0.22, roughness: 1.19, reflections: 0.6, cardLight: 0.72 },
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
    description: "Rajinder Kaka, the horn player of the title, in bronze by Krishen Khanna, 12 × 7 × 6 inches. Cast 3 of an edition of 9.",
    longDescription:
      "The bandsman here stands on an oval base in mid-stride, one knee bent and the feet apart, holding a short horn to his mouth with both hands. The round bell of the instrument faces straight out, covering the lower part of his face.\n\nHe wears a pale grey cap, a blue jacket with buttons down the front and an epaulette on the shoulder, and a broad brown belt with a square buckle. Below the belt the trousers are off-white, loose and creased at the knees, ending in dark shoes. The horn and his hands are left in the gold-brown of the bronze. The modelling is loose and lumpy, with folds pressed into the jacket sleeves and trouser legs rather than smoothed away. The figure is tall and narrow, and the slight lean of the body follows the raised horn.\n\nThe title names Rajinder Kaka, and \"Horn Walae\" reads as \"the one with the horn\". The bronze measures 12 × 7 × 6 inches and is cast 3 of an edition of 9. The base is a flat oval slab, wider than his stance, with his left foot set nearer its front edge.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-rajinder-kaka-horn-walae.webp?v=7",
    modelUrl: "/sculptures/khanna-rajinder-kaka-horn-walae.glb",
    look: { metalness: 0.22, roughness: 1.19, reflections: 0.9, light: 1.25, specular: 1, cardLight: 0.72 },
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
    description: "Davinder Raj Tutu Walae, a bronze by Krishen Khanna, 10 × 6 × 10 inches. Cast 3 of an edition of 9.",
    longDescription:
      "Sitting on a tied sack, a bandsman plays a long, straight wind instrument that ends in a flared bell. He holds it upright in front of his chest with both hands, the mouthpiece at his lips and the bell resting near his lap. His legs are crossed at the shins, and his feet, in sandals, rest flat on the ground in front of the sack.\n\nThe uniform is an off-white cream: a cap with a bronze-coloured band, a jacket with a tall collar that rises up behind his head, round buttons down the front and epaulettes on both shoulders. The face, hands, cuffs, epaulettes, instrument and feet are left in the brown and gold of the bronze, as is the sack, which is gathered and knotted at its ends. His face is bearded, with a moustache.\n\nIn the title, \"Walae\" means roughly \"the one with\". The bronze measures 10 × 6 × 10 inches and is cast 3 of an edition of 9. Khanna's figurative work includes the Bandwallahs series. The sack beneath him spreads out to the left, its loose fabric bunched into deep creases.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-davinder-raj-tutu-walae.webp?v=7",
    modelUrl: "/sculptures/khanna-davinder-raj-tutu-walae.glb",
    look: { metalness: 0.24, roughness: 1.7, reflections: 0.9, light: 1.25, specular: 1, cardLight: 0.72 },
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
    description: "Adhikari Dada, the drummer of the title, in bronze by Krishen Khanna, 12 × 5 × 5 inches. Cast 3 of an edition of 9.",
    longDescription:
      "A drummer stands on a shaped, flat base, his head bowed towards the drum that hangs at his left hip. He holds a stick in each hand: one is raised, the other is held just above the pale drumhead. The drum itself is a deep cylinder in gold-brown, its side crossed by diagonal cords in a zigzag pattern.\n\nHe wears an orange-red cap and matching orange-red trousers, loose and creased down to the ankles. His jacket is a muted grey-green with epaulettes on both shoulders, a breast pocket, a row of buttons and a strap running diagonally across his chest to the drum. The bearded face, the hands, cuffs and shoes are left in the brown of the bronze. The modelling is rough and broken into small planes, especially across the jacket and the folds of the trousers.\n\nThe title names Adhikari Dada, and \"Drum Walae\" reads as \"the one with the drum\". The bronze measures 12 × 5 × 5 inches and is cast 3 of an edition of 9. The base is an irregular, rounded slab, wider on one side, and the trousers bunch above his shoes.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-adhikari-dada-drum-walae.webp?v=5",
    modelUrl: "/sculptures/khanna-adhikari-dada-drum-walae.glb",
    look: { metalness: 0.21, roughness: 1.19, reflections: 0.6 },
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
    form: "other",
    title: "Matar",
    description: "Matar (2024) by Yashika Sugandh, in acrylic on fibre resin and nylon, 11 × 2 × 2 inches. Its title is the Hindi word for peas.",
    longDescription:
      "Matar is the Hindi word for peas, and the work is built around a single green pea pod standing upright on its tip. The pod is split open along its front, showing a column of round green peas inside, and at the top a curling stem and small leaves spread outwards.\n\nAmong the peas are small figures and objects. Near the top, a monkey-like figure in a yellow garment sits on a pea, holding strings from which a small gold winged object hangs out beside the pod. Lower down, one section is a band of blue with white rings, and below it is a red and white section with radiating lines. Further down, a small yellow creature appears among the lowest peas. The pod's tip rests on a large white egg-shaped form scattered with blue spots of different sizes, which in turn sits on a round brown base.\n\nThe work dates from 2024 and is made in acrylic on fibre resin and nylon, measuring 11 × 2 × 2 inches. The peas are a lighter, yellowish green than the pod, and the two halves of the pod narrow to a point at the bottom.",
    artistSlug: "yashika-sugandh",
    thumbnail: "/thumbnails/sugandh-matar.webp?v=5",
    modelUrl: "/sculptures/sugandh-matar.glb",
    look: { roughness: 2.62, reflections: 0.7 },
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
    form: "head",
    title: "The Tailor",
    description: "A bronze by Yusuf, 18 × 28 × 18 inches. Listed in its source as Untitled.",
    longDescription:
      "Listed in its source as Untitled, this bronze by Yusuf shows a bald head on a long, column-like neck and body that rises from a rectangular base. The face looks straight ahead, with large ears, a straight nose, and eyes and lips picked out in orange. The surface is white, and over it runs a dense covering of grey and black markings: lines, patches and shapes that spread across the face, the scalp and down the length of the body.\n\nTwo long, thin orange rods cross behind the figure and spread outwards in a wide V, reaching well beyond its sides. Smaller white forms are attached at either side of the body: on the left a rounded shape with a short projecting piece, and on the right a curved, ring-like form. The figure stands on a brown box-shaped base with a white top surface and an arched opening cut into the front.\n\nThe bronze measures 18 × 28 × 18 inches, and its width comes largely from the spread of the two orange rods. The white top of the base is slightly uneven and stops short of its edges, leaving a brown rim on all visible sides.",
    artistSlug: "yusuf",
    thumbnail: "/thumbnails/yusuf-the-tailor.webp?v=7",
    modelUrl: "/sculptures/yusuf-untitled-sewing-machine.glb",
    look: { metalness: 2.86, roughness: 1.19, reflections: 0.6, cardZoom: 1.1, cardShift: 0.075, cardLift: 0.04 },
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
    form: "other",
    title: "Polka Dot Cat",
    description: "A bronze by Yusuf, 20 × 10 × 11 inches. Listed in its source as Untitled.",
    longDescription:
      "A cat sits upright on its haunches, front legs straight and close together, head raised and facing forward. The body is tall and narrow, about twice as high as it is wide, and the ears stand up in two points. The tail curls round at the base on the left side.\n\nThe whole surface is a pale cream, cut across by close horizontal ridges that wrap around the head, neck, body and legs like stacked bands. Over these ridges are scattered round dots in a dark brown, almost black, some large and some small, placed irregularly across the ears, face, chest and legs. The face is drawn with narrow, pale eyes, a small dark nose and lines of tiny dots on the muzzle where whiskers would grow. The front paws are blocky and flat, set squarely on the ground.\n\nListed in its source as Untitled, the work is a bronze by Yusuf measuring 20 × 10 × 11 inches, about 51 cm high. The ridges are deepest along the sides of the body and the back legs, and the gaps between the front legs show as dark vertical channels.",
    artistSlug: "yusuf",
    thumbnail: "/thumbnails/yusuf-polka-dot-cat.webp?v=5",
    modelUrl: "/sculptures/yusuf-untitled-cat.glb",
    look: { roughness: 0.92, reflections: 0.6 },
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
    description: "Man with Mridangam, a bronze by Thota Vaikuntam, 59 × 24 × 23 inches. The mridangam of the title is a South Indian barrel drum.",
    longDescription:
      "Standing about 150 cm tall on a dark maroon square plinth, a man faces forward holding a mridangam, the South Indian barrel drum named in the title. The drum lies horizontally across the front of his body at waist height, a smooth brown cylinder with lighter rims, and his hands rest at either end with the palms open and the fingers raised.\n\nHe wears a red turban, and his forehead is coloured yellow with a thin vertical mark at the centre. He has a dark moustache and a narrow face. His loose tunic is a green-blue, with wide sleeves that hang in broad folds from the arms, and a thin bronze-coloured line around the neck. Below it is a white dhoti, gathered and falling to just below the knees. His feet are bare, with anklets, and one foot is set slightly in front of the other. The skin is left in the brown of the bronze, and the colours are laid in flat, even areas.\n\nThe bronze measures 59 × 24 × 23 inches. The fingers of both hands are spread and curved slightly back, and a thin band shows at each wrist.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-man-with-mridangam.webp?v=9",
    modelUrl: "/sculptures/thota-man-with-mridangam.glb",
    look: { metalness: 0.2, roughness: 1.6, reflections: 0.9, light: 1.6, sideLights: 0.5 },
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
    description: "Ganesha by Sujata Bajaj, in acrylic on fiberglass, 72 × 38 × 38 inches.",
    longDescription:
      "At 183 cm high, this is a large, angular figure of Ganesha, the elephant-headed deity of the title, built from flat planes and bold curves. A long trunk rises from the centre of the body and curves up and over to the left, its tip turned outwards. Beside it stands a tall cylindrical form with a stepped top, and two flat ears project to either side like broad fans.\n\nBelow the head, the body narrows and widens again in sharp folds, ending in a broad base with legs folded at the front. Almost every surface is painted. Deep reds and crimsons dominate, crossed by orange and black lines, with olive-yellow along the edges of the trunk and the head. The ears and parts of the base carry rows of small dark marks resembling writing. A long curved band of thin orange lines hangs across the chest, and there are small touches of blue near the base.\n\nThe work is in acrylic on fiberglass and measures 72 × 38 × 38 inches. The stepped top of the cylinder is olive-yellow, and the inner curve of the trunk is the same colour, running down into the chest.",
    artistSlug: "sujata-bajaj",
    thumbnail: "/thumbnails/bajaj-ganesha.webp?v=4",
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
    description: "Patinder Rawat, the trumpeter of the title, in bronze by Krishen Khanna, 12 × 5 × 5 inches. Cast 3 of an edition of 9.",
    longDescription:
      "Balanced on one leg on an oval base, a bandsman crosses his other leg behind him, the knee bent and the toe of the boot touching down at the back. Both arms wrap around a large coiled brass instrument held against his chest. Its wide bell rises above his right shoulder, and a thin pipe runs up from the coils to his mouth.\n\nThe instrument is the brightest part of the work, a gold-brown that stands out against the greyish brown of the clothing. He wears a cap, a short jacket with a belt and buttons, close-fitting trousers and tall boots that reach almost to the knee. The surface of the clothing is rough and heavily worked, with pressed folds and uneven patches, while the coils of the instrument are smoother.\n\nThe title names Patinder Rawat, and \"Trumpet Walae\" reads as \"the one with the trumpet\". The bronze measures 12 × 5 × 5 inches and is cast 3 of an edition of 9. Khanna's figurative work includes the Bandwallahs series. The valves of the instrument show between his hands, and the lowest coil rests against his belt.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-patinder-rawat-trumpet-walae.webp?v=5",
    modelUrl: "/sculptures/khanna-untitled-bandsman.glb",
    look: { metalness: 0.97, roughness: 1.57, reflections: 0.9, light: 1.25, specular: 1 },
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
    description: "Patinder Ji Haran Walla (2025), a bronze by Krishen Khanna, 56 × 32 × 18 inches, from an edition of 9 plus an artist's proof.",
    longDescription:
      "A standing figure in uniform tips his head back and raises a long, straight horn high above him, both hands gripping it near the mouthpiece. The horn is a bright gold, widening into a broad bell whose inner surface is dimpled. His face and hands are a dark grey-brown, set against the coppery orange of his clothing.\n\nHe wears a long coat with a high collar and a line of buttons down the front, its skirt flaring out over the legs. A pale khaki belt with a square buckle crosses the waist, and a strap of the same colour runs diagonally from one shoulder to the opposite hip. One leg is bent at the knee and lifted from the ground, so the whole figure balances on a single shod foot set on a small, pale, irregular base.\n\nThe bronze is dated 2025 and measures 56 × 32 × 18 inches, about 1.4 metres tall, and belongs to an edition of 9 plus an artist's proof. In the title, \"Walla\" means roughly \"the one with\". Uniformed bandsmen are the subject of Krishen Khanna's Bandwallahs series.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-patinder-ji-haran-walla.webp?v=4",
    modelUrl: "/sculptures/khanna-untitled-trumpeter.glb",
    look: { metalness: 0.29, roughness: 2.12, reflections: 0.9, light: 1.25, specular: 1 },
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
    form: "head",
    title: "Man from Moon",
    description: "Man from Moon, a small bronze by Himmat Shah, 7 × 9 × 4 inches.",
    longDescription:
      "A rough, upright column rises from a dark red block, its surface broken into folds, ridges and hollows like crumpled material. At its top sits a flat, rounded disc, tilted forward and to one side, in an olive and golden tone that is smoother than the column below. A small raised point marks the face of the disc, a little off centre.\n\nA thin orange rod passes diagonally through the column, entering low on one side and leaving high on the other. Its lower end reaches down past the corner of the block, while its upper end extends well beyond the top of the disc, so the line of the rod is the longest element in the work.\n\nMan from Moon is a small bronze by Himmat Shah, measuring 7 × 9 × 4 inches. Its three elements are kept clearly separate: the textured column, the smooth disc and the straight rod. The column is widest at its foot, where it meets the top of the block in an uneven edge, and its creases run mostly upwards. The disc overhangs the column on the side away from the rod, and its rim is slightly irregular.",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-man-from-moon.webp?v=3",
    modelUrl: "/sculptures/untitled-figure-with-spear.glb?v=2",
    look: { roughness: 1.46, reflections: 0.6 },
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
    form: "head",
    title: "Female Head with Side Braid and Green Collar",
    description: "A bronze head by Thota Vaikuntam (2025), 25 × 17 × 24 inches, from an edition of 9 plus an artist's proof. Listed in its source as Untitled (Female Head, side braid, green collar).",
    longDescription:
      "Listed in its source as Untitled (Female Head, side braid, green collar), this bronze head by Thota Vaikuntam is dated 2025 and measures 25 × 17 × 24 inches, about 64 centimetres tall. It belongs to an edition of 9 plus an artist's proof.\n\nThe face is a full, rounded oval in brown bronze. A broad yellow band runs across the forehead, framed by dark hair parted at the centre. In the middle of the band sits a large round bindi in orange-red. Heavy, arched brows sit over almond-shaped eyes, and a long, straight nose leads down to full lips. A loop hangs from the centre of the nose to the upper lip, and round earrings hang from both ears. A pointed yellow triangle runs from the lower lip to the chin.\n\nA thin ring circles the neck, and a band of pale green forms the collar at the base. On one side, a long form runs from behind the ear down the length of the neck to the base, the side braid of the listed title. The bindi recalls the large vermilion bindis of the women in Thota's paintings.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-head-with-side-braid.webp?v=8",
    modelUrl: "/sculptures/thota-female-head-05.glb",
    look: { metalness: 0.26, roughness: 1.53, reflections: 0.9, light: 1.44, sideLights: 0.5, specular: 1 },
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
    description: "Couple, a bronze by Jogen Chowdhury, 11 × 13 × 9 inches. Cast 5 of an edition of 9.",
    longDescription:
      "Two figures sit side by side on the ground, knees drawn up, both barefoot, on a low rectangular base in reddish brown. The woman, on the left, has long grey hair falling past her shoulders. She wears a pale yellow-green top and loose green trousers gathered in deep ridged folds. One hand, with bangles at the wrist, rests on her raised knee, and her other arm reaches across towards the man.\n\nThe man, on the right, is bald beneath a small cream cap. He wears an orange long-sleeved shirt with buttons at the neck and cream trousers, also gathered in ridged folds. His arms cross over a rounded orange form at his waist, and his head bends down towards the woman, while a hand rests on his shoulder. Their faces are turned towards each other across the small gap between them, and their feet almost touch at the centre of the base.\n\nCouple is a bronze by Jogen Chowdhury, measuring 11 × 13 × 9 inches, cast 5 of an edition of 9. The clothing is the most strongly textured part, with deep horizontal ridges around the legs, while the base is plain.",
    artistSlug: "jogen-chowdhury",
    thumbnail: "/thumbnails/chowdhury-couple.webp?v=6",
    modelUrl: "/sculptures/chowdhury-couple.glb",
    look: { metalness: 0.16, roughness: 2.12, reflections: 0.6, light: 0.7 },
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
    description: "Bronze 2 - 1 (2006) by Madhvi Parekh, 31 × 26 × 16 inches. Cast 2 of an edition of 7.",
    longDescription:
      "A flat, oval face forms the centre of this dark brown bronze. It has two almond-shaped eyes, a long narrow nose and a small curved mouth, with a round boss above the nose and a smaller knob at the top of the oval. Below the face is a wide rounded form carrying two large circular shapes, and the surfaces of both are covered with a fine criss-cross texture like weaving.\n\nSix thin, branch-like limbs spread out from the body. Four of them, two reaching upwards and two held out to the sides, end in hands with spread fingers. The lower two curve outwards and down, their ends resting on the corners of a flat rectangular base with a low mound at the centre. Above the face, two upright stems hold a pointed conical cap, with a small knob at its tip.\n\nBronze 2 - 1 is dated 2006 and measures 31 × 26 × 16 inches, about 79 centimetres tall; this is cast 2 of an edition of 7, by Madhvi Parekh. The limbs are knobbly and uneven, thicker at the joints, in contrast with the flat, textured face and body.",
    artistSlug: "madhvi-parekh",
    thumbnail: "/thumbnails/parekh-bronze-2-1.webp?v=4",
    modelUrl: "/sculptures/parekh-bronze-2-1.glb",
    look: { metalness: 0.3, roughness: 1.45, reflections: 0.6 },
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
    description: "Bandwalla, a bronze by Krishen Khanna, from an edition of 9.",
    longDescription:
      "Dressed almost entirely in deep red, a bandsman stands with his feet apart and lifts a small horn to his lips. The instrument has a narrow curved tube and a flared bell in plain bronze, which he steadies with both hands just below his face. His face and hands are left in the dark brown of the bronze.\n\nHis uniform is a red peaked cap, a red jacket with a high collar and buttons down the front, red trousers and tall red boots that reach almost to the knee. A brown belt crosses his waist, and a brown strap runs diagonally across his chest from one shoulder.\n\nBandwalla is a bronze from an edition of 9. Its title joins \"band\" with \"walla\", roughly \"the one with\", so the name reads as \"the band man\", the subject of Krishen Khanna's Bandwallahs series. The face is broad, with heavy eyelids and a wide nose, framed by large ears below the cap. His elbows are held out from the body, one arm crossing in front of the chest, and the bell of the horn turns outwards to one side.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-bandwalla.webp?v=4",
    modelUrl: "/sculptures/untitled-bandsman-in-red.glb",
    look: { metalness: 0.19, roughness: 1.86, reflections: 0.9, light: 1.44, specular: 1, cardLight: 0.87, selfShadow: false },
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
    form: "head",
    title: "Female Head with Polka-dot Collar",
    description: "A head by Thota Vaikuntam in resinated fibreglass with automotive paint, 99 × 85 × 53 inches: about two and a half metres tall. Listed in its source as Untitled (Female Head, polka-dot collar).",
    longDescription:
      "At about two and a half metres tall, this head by Thota Vaikuntam is made in resinated fibreglass with automotive paint and measures 99 × 85 × 53 inches. It is listed in its source as Untitled (Female Head, polka-dot collar).\n\nThe face is a deep, glossy blue-black. A broad yellow band crosses the forehead below hair parted at the centre, and a large round bindi in pinkish red sits in the middle of it. The yellow continues as a narrow strip down the ridge of the nose. The eyes are long and almond-shaped, white with dark pupils, under heavy dark lids. Full red lips are set beneath a small white ornament hanging from the nose, and a long yellow triangle runs down from the lips to the chin. Yellow ornaments sit at the hairline on both sides, and long earrings hang from the ears, ending in yellow bell-shaped pendants patterned in red.\n\nA yellow-and-black neck carries a gold-coloured ring with a red line through it, and at the base a magenta collar is scattered with white polka dots. The bindi recalls the large vermilion bindis of the women in Thota's paintings.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-head-with-polka-dot-collar.webp?v=4",
    modelUrl: "/sculptures/thota-untitled-head-polka-dot.glb",
    look: { metalness: 0.17, roughness: 1.57, reflections: 0.6, light: 0.9 },
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
    form: "head",
    title: "Ruby Saree Lady",
    description: "Ruby Saree Lady (2026), a bronze head by Thota Vaikuntam, 24 × 16 × 24 inches.",
    longDescription:
      "Calm and symmetrical, this bronze head by Thota Vaikuntam is dated 2026 and measures 24 × 16 × 24 inches, about 61 centimetres tall. The face is a smooth, rounded oval in brown bronze, broad across the cheeks and narrowing towards the chin.\n\nA broad yellow band runs across the forehead beneath dark hair parted at the centre, and an oval bindi in orange sits in the middle of it. Small ornaments mark the hairline on each side. The brows form a strong, continuous line that drops into a long straight nose, and the almond-shaped eyes are set under heavy lids. The ears are flat and close to the head, without visible earrings. Below the closed lips, a pointed yellow triangle runs down to the chin.\n\nA thin ring circles the neck, and a vertical ridge runs down its front. At the base, the collar of the garment opens in a V, its two orange panels marked with small dots. Seen from the front, the head is almost perfectly balanced left to right, and the bindi recalls the large vermilion bindis of the women in Thota's paintings.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-ruby-saree-lady.webp?v=4",
    modelUrl: "/sculptures/thota-female-head-10.glb",
    look: { metalness: 0.16, roughness: 0.99, reflections: 0.6, light: 0.9 },
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
    form: "head",
    title: "Male Head with Blue Turban and Moustache",
    description: "A head by Thota Vaikuntam (2025) in fiberglass, 97 × 50 × 72 inches: about two and a half metres tall. Listed in its source as Untitled (Male Head, blue turban, moustache).",
    longDescription:
      "Listed in its source as Untitled (Male Head, blue turban, moustache), this fibreglass head by Thota Vaikuntam is dated 2025 and measures 97 × 50 × 72 inches, about two and a half metres tall.\n\nThe face is black. A light blue turban wraps the top of the head, and beneath it a white band on the forehead carries a narrow red vertical mark at the centre, with orange to either side. Thick black brows curve over wide almond-shaped eyes, white with dark pupils. Full red lips sit under a heavy black moustache whose ends curl down along the jaw on both sides, and an orange triangle runs from the lower lip to the chin. Large gold-coloured hoop earrings hang from the orange ears.\n\nThe neck is orange shading to dark, with a vertical line down its front, and strips of blue striped cloth show at either side of it. The orange of the nose, chin and neck forms a single vertical line down the centre of the face, crossed by the white forehead band and the red mouth, much like the bold reds, saffrons and oranges of Thota's paintings.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-male-head-with-blue-turban.webp?v=6",
    modelUrl: "/sculptures/thota-untitled-head-with-turban.glb",
    look: { metalness: 0.15, roughness: 2.29, reflections: 1.2, light: 1.3, sideLights: 1, specular: 0.6 },
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
    form: "head",
    title: "Bronze Female Head with Long Hair",
    description: "A bronze head by Thota Vaikuntam, 58 × 58 × 47 inches: almost one and a half metres tall. Listed in its source as Untitled (Female Head, bronze with long hair).",
    longDescription:
      "Long black hair falls down one side of this bronze head, sweeping past the neck to the base. Listed in its source as Untitled (Female Head, bronze with long hair), the work by Thota Vaikuntam measures 58 × 58 × 47 inches, almost one and a half metres tall.\n\nThe face is brown, smooth and broad. An orange-yellow band crosses the forehead beneath black hair parted at the centre, with small gold-coloured ornaments at the hairline on either side, and a round red bindi sits at its centre. The orange-yellow continues as a narrow strip down the ridge of the nose. The eyes are almond-shaped under heavy lids, and the full lips are a strong red. A gold-coloured nose ring hangs from one nostril, and long, thin gold-coloured earrings follow the line of the ears.\n\nAt the neck, a thick gold-coloured ring sits above a green collar marked with small dark dots. On the side where the hair falls, its black mass is marked with long flowing lines and widens as it reaches the base. The bindi recalls the large vermilion bindis of the women in Thota's paintings.",
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
    form: "head",
    title: "Female Head with Nose Ring and Red Collar",
    description: "A bronze head by Thota Vaikuntam (2025), 26 × 17 × 24 inches, from an edition of 9 plus an artist's proof. Listed in its source as Untitled (Female Head, nose ring, red collar).",
    longDescription:
      "Listed in its source as Untitled (Female Head, nose ring, red collar), this bronze head by Thota Vaikuntam is dated 2025 and measures 26 × 17 × 24 inches, about 66 centimetres tall. It belongs to an edition of 9 plus an artist's proof.\n\nThe face is a rounded oval in grey-brown bronze, with dark hair parted at the centre and small braided ornaments at the hairline on both sides. A broad yellow band crosses the forehead, and a large round bindi in orange-red sits at its centre. Heavy brows meet the long, straight nose, and the almond-shaped eyes look straight ahead. A ring hangs from one nostril, and a second, smaller ornament hangs from the centre of the nose just above the upper lip. Round earrings hang from both ears. Below the lips, a pointed yellow triangle runs down to the chin.\n\nA thin ring circles the neck, and a short vertical ridge marks its front. At the base, an orange-red collar opens in a shallow V. The bindi recalls the large vermilion bindis of the women in Thota's paintings.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-female-head-with-nose-ring.webp?v=5",
    modelUrl: "/sculptures/thota-female-head-07.glb",
    look: { metalness: 0.32, roughness: 1.49, reflections: 0.9, light: 1.08 },
    facing: 260,
    material: "Bronze",
    year: "2025",
    dimensions: "26 × 17 × 24 inches",
    edition: "Edition of 9 + AP",
    heightCm: 66,
  },
  // Scan "F_REDDRUMMER.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "42 - Krishan Khanna - 08", matched by the photo in that row. Year not given there.
  {
    slug: "khanna-kc-the-bandmaster",
    title: "KC The Bandmaster",
    description: "KC The Bandmaster, a bronze by Krishen Khanna, 13 × 12 × 8 inches. Cast 3 of an edition of 9.",
    longDescription:
      "Leaning back on bent knees, the bandmaster throws his arms wide. One hand holds a short stick raised out to the side, like a baton, while the other is open with the fingers spread. His head tips back under a small orange-red cap, and his face, in dark bronze, is turned upwards.\n\nHe wears an orange-red uniform jacket with shoulder pieces, a breast pocket and a row of buttons; it hangs open over a round stomach, with the shirt parting at the belly above a belt and buckle. His trousers are dark blue and loosely creased, and his brown shoes are planted wide apart. The surface throughout is uneven, worked with small dents and folds rather than smoothed, so the colour gathers darker in the creases of the jacket and trousers.\n\nKC The Bandmaster is a bronze measuring 13 × 12 × 8 inches, cast 3 of an edition of 9. \"Bandmaster\" in the title names the leader of a band, and uniformed bandsmen are the subject of Krishen Khanna's Bandwallahs series. His arms, held out at different heights, make a wide diagonal across the work.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-kc-the-bandmaster.webp",
    modelUrl: "/sculptures/khanna-kc-the-bandmaster.glb",
    look: { metalness: 0.17, roughness: 1.32, reflections: 0.6 },
    facing: 180,
    material: "Bronze",
    year: "",
    dimensions: "13 × 12 × 8 inches",
    edition: "3 of 9",
    heightCm: 33,
  },
  // Scan "SITMUSICIAN_RED.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "40 - Krishan Khanna - 06", matched by the photo in that row. Year not given there.
  {
    slug: "khanna-shyam-pratap-bhompu-walae",
    title: "Shyam Pratap Bhompu Walae",
    description: "Shyam Pratap Bhompu Walae, a bronze by Krishen Khanna, 12 × 8 × 8 inches. Cast 3 of an edition of 9.",
    longDescription:
      "Seated on a brown box with his knees apart, a barefoot bandsman plays a large horn. The bell of the instrument rises high to one side, wide and flared, and he holds it up with one hand. Its tubing coils in front of his chest, with the mouthpiece at his lips, and his other hand rests over the coil.\n\nHe wears a dark peaked cap with a red band, an orange-red jacket with shoulder pieces and a collar open at the neck, and a belt with a large buckle. His trousers are a deep purple-blue, ending above bare feet that rest flat on the ground. The horn is left in the plain golden brown of the bronze, as are his face, hands and feet.\n\nShyam Pratap Bhompu Walae is a bronze measuring 12 × 8 × 8 inches, cast 3 of an edition of 9. In the title, \"Walae\" means roughly \"the one with\"; uniformed bandsmen are the subject of Krishen Khanna's Bandwallahs series. The horn is the largest element, its bell reaching above the player's head, and the purple-blue legs spread wide below it.",
    artistSlug: "krishen-khanna",
    thumbnail: "/thumbnails/khanna-shyam-pratap-bhompu-walae.webp",
    modelUrl: "/sculptures/khanna-shyam-pratap-bhompu-walae.glb",
    look: { metalness: 0.19, roughness: 2.38, reflections: 0.6 },
    facing: 260,
    material: "Bronze",
    year: "",
    dimensions: "12 × 8 × 8 inches",
    edition: "3 of 9",
    heightCm: 30,
  },
  // Scan "GauravDas-MotherWDaughter.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "16 - Gaurav Das": GD-0012, matched by the photo in that row. Year and edition not given there.
  {
    slug: "gaurab-das-mother-and-child-2",
    title: "Mother and Child 2",
    description: "Mother and Child 2, a bronze by Gaurab Das, 16 × 14 × 14 inches.",
    longDescription:
      "A seated figure holds a small child within the curve of one long arm. The mother's head is a smooth, featureless oval with a small rounded knot on top, rising from a long neck that flows into broad, squared shoulders. Her arm sweeps out and around in a single loop, leaving open spaces between arm and body.\n\nThe child sits against her chest, a compact figure with one knee drawn up, its small head close to her shoulder. Below them, the mother's body spreads out into a wide, shallow, dish-like form with a raised rim, so that the lower half of the work forms a broad, curving base. The surfaces are smooth and rounded throughout, without sharp edges, and coloured in a mottled green, darker in the hollows and lighter on the raised areas.\n\nMother and Child 2 is a bronze measuring 16 × 14 × 14 inches, about 41 centimetres tall, by Gaurab Das, whose semi-abstract forms often return to the mother and child. The mother's upper body is a flat, squared block, her chest marked only by a shallow V, while her arm and the dish below it are curved and continuous.",
    artistSlug: "gaurab-das",
    thumbnail: "/thumbnails/gaurab-das-mother-and-child-2.webp",
    modelUrl: "/sculptures/gaurab-das-mother-and-child-2.glb",
    look: { metalness: 0.73, roughness: 1.92, reflections: 0.6 },
    material: "Bronze",
    year: "",
    dimensions: "16 × 14 × 14 inches",
    heightCm: 41,
  },
  // Scan "39.glb" (2026-11-19). Details from the Namtech Fine Art private view
  // (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/), GD-0038, matched by photo (the file name's 39 is
  // not the sheet's #39, which is Matar). Year and edition not given there. Height from the dimensions.
  {
    slug: "gaurab-das-couple-1",
    title: "Couple 1",
    description: "Couple 1, a bronze by Gaurab Das, 14 × 11 × 6 inches.",
    longDescription:
      "Two figures stand side by side, pressed together along one edge so that they read as a single block on four long legs. Each rises to a small rounded head on a narrow neck, the head tipped slightly forward to a blunt point.\n\nThe figure on the left opens out into a broad, flat shoulder that juts sideways like a shelf, with two small round forms set on its upper surface. Beneath it the body swells into a deep, rounded bowl with a raised rim. The figure on the right is narrower and straighter, and from its side a curved, hollow flap sweeps out and up like a folded wing. The legs are long, flat-sided and slightly splayed, each ending in a squared foot.\n\nCouple 1 is a semi-abstract bronze by Gaurab Das, measuring 14 × 11 × 6 inches, about 36 centimetres tall. Its surface is a mottled blue-green, broken by patches of warm brown that show most clearly on the two heads and along the edges of the flat planes.",
    artistSlug: "gaurab-das",
    thumbnail: "/thumbnails/gaurab-das-couple-1.webp",
    modelUrl: "/sculptures/gaurab-das-couple-1.glb",
    look: { metalness: 0.42, roughness: 1.59, reflections: 0.6 },
    material: "Bronze",
    year: "",
    dimensions: "14 × 11 × 6 inches",
    heightCm: 36,
  },
  // Scan "13 - Thotta Head 04.glb" (2026-11-19). Artist from the file name; the user confirmed it is a new
  // work, not the Saree Lady Series (White). The photo in row "13" of the Sheet "Sculpted India (Digital)"
  // shows this head, but that row's details are marked [TO CONFIRM] and belong to another work, so none
  // are used. No Artlogic match. Title is a description of the work; medium, year and size unknown.
  {
    slug: "thota-head-with-nose-ring-and-hair-ornaments",
    title: "Head with Nose Ring and Hair Ornaments",
    description: "A head by Thota Vaikuntam, with a nose ring, earrings and ornaments in its hair.",
    longDescription:
      "A woman's head faces straight ahead on a long, columnar neck. A broad yellow band runs across the forehead, and a large round orange bindi sits at its centre. Below it the brows sweep out in a single line, and the eyes are long and almond-shaped, each outlined with a raised rim and a small round pupil.\n\nThe face is a deep brown, smooth and full at the cheeks. A crescent-shaped ring hangs from one side of the nose, with a small drop beside it, and a narrow yellow stripe runs from beneath the lower lip down to the chin. The ears are long and flat, each with a round earring at the lobe. Dark hair is drawn back from the face, held at the sides by banded clips, and at the back of the head large round ornaments, ringed with fine patterned bands, are set into the hair.\n\nA raised ring circles the base of the neck, which rests on a pale grey collar. A short vertical groove marks the front of the throat. The large vermilion bindi and almond eyes recur in the women of Thota Vaikuntam's paintings.",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/thumbnails/thota-head-with-nose-ring-and-hair-ornaments.webp",
    modelUrl: "/sculptures/thota-head-with-nose-ring-and-hair-ornaments.glb",
    look: { metalness: 0.28, roughness: 1.58, reflections: 0.6 },
    material: "",
    year: "",
  },
  // Scan "56.glb". The Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U)
  // has only row "56 - Bronze Head", with no details. Details from the Namtech Fine Art private view
  // (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/, "To be Scanned works"): Himmat Shah, Bronze, 50 x 28 x 31 inches, HS-0421,
  // matched by photo (the smooth head with an X on the face); the scan's proportions match those dimensions.
  // No title in its source; descriptive name used on the site, as for the other Himmat Shah heads.
  {
    slug: "shah-head-with-a-cross",
    form: "head",
    title: "Head with a Cross",
    description: "A bronze head by Himmat Shah, 50 × 28 × 31 inches. Listed in its source without a title.",
    longDescription:
      "A tall, smooth head rises from a long cylindrical neck, its outline swelling from a narrow jaw to a broad, rounded crown, like an egg set on a column. The surface is plain and unbroken, with almost nothing to mark it as a face.\n\nThe features are reduced to a few small signs. High on the head, two tiny circles with dots at their centres sit where the eyes might be, set wide apart and slightly uneven in height. Lower down, where a mouth would be, two short cuts cross to form an X, pressed into the surface. A faint vertical ridge runs down the middle of the front from the crown to the chin, dividing the face into two halves.\n\nThe chin is rounded and pushed slightly forward, and the jaw turns back sharply into the neck, which stands straight and smooth down to its flat base. Seen from the side, the back of the skull bulges outward well beyond the neck. The bronze measures 50 × 28 × 31 inches, about 127 cm high.",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-head-with-a-cross.webp",
    modelUrl: "/sculptures/shah-head-with-a-cross.glb",
    look: { metalness: 0.05, roughness: 0.75, reflections: 0.6, light: 1.5, sideLights: 0.5 },
    material: "Bronze",
    year: "",
    dimensions: "50 × 28 × 31 inches",
    heightCm: 127,
  },
  // Scan "25.glb". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "25 - Himmat Shah Bronze": HS-0429; the same work (HS-0429) in the Namtech Fine Art private view
  // (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/), matched by photo.
  // Titled "Untitled (Head)" in its source; descriptive name used on the site, as for the other Himmat Shah heads.
  {
    slug: "shah-faceted-head",
    form: "head",
    title: "Faceted Head",
    description: "A bronze head by Himmat Shah, 52 × 19 × 26 inches, from an edition of 5 plus an artist's proof. Listed in its source as Untitled (Head).",
    longDescription:
      "A tall, narrow head stands on a block-like neck that widens into a squared base. Its outline is a long oval, but the surface is broken into flat, angled facets, as if the form had been cut and folded rather than smoothed, so that edges and ridges catch the light across the whole face.\n\nA thin, winding groove runs down the middle of the forehead from the crown. Below it, a small raised rectangle with a rounded hollow sits where the bridge of the nose would be. The lips are full and slightly parted, set above a short straight line that drops to the chin. The eyes are not shown as such: angled planes and shallow recesses on either side take their place.\n\nThe bronze is a warm brown, and patches of a paler, golden tone are scattered over the cheeks, brow and neck, with rough, mottled texture inside them. At the top, the crown is cut flat with a notch in the centre. The bronze measures 52 × 19 × 26 inches, about 132 cm high, and comes from an edition of 5 plus an artist's proof. It is listed in its source as Untitled (Head).",
    artistSlug: "himmat-shah",
    thumbnail: "/thumbnails/shah-faceted-head.webp?v=2",
    modelUrl: "/sculptures/shah-faceted-head.glb",
    look: { metalness: 0.3, roughness: 1.7, reflections: 0.6 },
    material: "Bronze",
    year: "",
    dimensions: "52 × 19 × 26 inches",
    edition: "Edition of 5 + AP",
    heightCm: 132,
  },
  // Scan "HORSE_HOW.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "30 - Madhvi Parekh Horse": Bronze, 3 of 9 (no size or year given); the same work in
  // the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/, "To be Scanned works"), matched by photo (the horse on wheels).
  {
    slug: "parekh-horse",
    form: "other",
    title: "Horse",
    description: "A bronze horse on wheels by Madhvi Parekh, number 3 from an edition of 9.",
    longDescription:
      "A horse strides forward on four bent legs, each hoof set on a small spoked wheel, so the whole animal stands like a toy that could be pulled along. Its head is long and lowered, the mouth open to show its teeth, with a strap running from the muzzle up behind the ear like a bridle.\n\nAlong the neck, the mane rises in a row of tall, pointed spikes. Towards the front, several of them end in small round knobs, like pins. The tail curls up and forward over the back and ends in a round, ball-shaped form, and from its base two fan-like sprays of thin rods spread out to either side.\n\nAcross the body hangs a saddle-cloth framed by a border of small signs. In its centre a smaller animal runs to the left in low relief, in the same direction as the horse. The whole work is cast in bronze with a warm, even golden-brown surface. It is number 3 from an edition of 9.",
    artistSlug: "madhvi-parekh",
    thumbnail: "/thumbnails/parekh-horse.webp",
    modelUrl: "/sculptures/parekh-horse.glb",
    look: { metalness: 0.33, roughness: 1.47, reflections: 0.6 },
    material: "Bronze",
    year: "",
    edition: "3 of 9",
  },
  // Scan "meditatingB.usdz". Details from the Sheet "Sculpted India (Digital)" (docs.google.com/spreadsheets/d/1weRYGv2Y6cV9bRKbX062EWXj-jcPaEIsdqSi6Cxi32U), column F,
  // row "24 - Meena Sansanwal Horse Of The Mind": MS-0096; the same work in
  // the Namtech Fine Art private view (privateviews.artlogic.net/2/a23b59e4e2638f8218bdb9/, "To be Scanned works"), matched by photo (the green seated figure with a gold ball). The scan's proportions match the size.
  {
    slug: "sansanwal-horse-of-the-mind",
    form: "figure",
    title: "Horse of the Mind",
    description: "Horse of the Mind, a seated figure by Meena Sansanwal in papermache and acrylic paint, 20 × 12 × 12 inches.",
    longDescription:
      "A figure sits cross-legged on a broad, low base, its hands brought together in the lap. The shoulders are rounded and the body is simplified into smooth, swelling forms, with the breasts and the curve of the belly lightly modelled. In the middle of the torso, just above the hands, a round hollow opens into the body.\n\nThe head is a narrow oval with a calm, simplified face: closed eyes, a long nose and a small mouth. Above it the form does not stop but rises in a tall, twisting column, layered and uneven like a flame or a stack of shapes, and at the very top a smooth golden sphere balances on its tip.\n\nThe whole figure is a bright green, mottled with darker and lighter patches that give the surface a worn, uneven look, and the gold of the sphere stands out against it. The work is made in papermache and acrylic paint and measures 20 × 12 × 12 inches, about 51 cm high.",
    artistSlug: "meena-sansanwal",
    thumbnail: "/thumbnails/sansanwal-horse-of-the-mind.webp",
    modelUrl: "/sculptures/sansanwal-horse-of-the-mind.glb",
    look: { roughness: 2.01, reflections: 0.6 },
    material: "Papermache and Acrylic Paint",
    year: "",
    dimensions: "20 × 12 × 12 inches",
    heightCm: 51,
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
