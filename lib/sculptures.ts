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

  // ---- Namtech Fine Art private view ("To be Scanned works") ----
  // Photographs only; add modelUrl once each work is scanned. Comments give
  // Namtech's stock numbers. Blank year / description are hidden on the page.
  // SUJ-0012
  {
    slug: "bajaj-ganesha",
    title: "Ganesha",
    description: "",
    artistSlug: "sujata-bajaj",
    thumbnail: "/artworks/bajaj-ganesha.webp",
    material: "Acrylic on fiberglass",
    year: "",
    dimensions: "72 × 38 × 38 inches",
  },
  // PNC-0022
  {
    slug: "chaturvedi-dvirayatan-3",
    title: "Dvirayatan-3",
    description: "",
    artistSlug: "phaneendra-nath-chaturvedi",
    thumbnail: "/artworks/chaturvedi-dvirayatan-3.webp",
    material: "Corrosion Resistance High Grade Stainless Steel with Corrosion Resistance Transparent Color",
    year: "2023",
    dimensions: "7 × 8 × 4 inches",
  },
  // PNC-0116
  {
    slug: "chaturvedi-chaturayatan",
    title: "Chaturayatan",
    description: "",
    artistSlug: "phaneendra-nath-chaturvedi",
    thumbnail: "/artworks/chaturvedi-chaturayatan.webp",
    material: "Corrosion Resistance High Grade Stainless Steel with Corrosion Resistance Transparent Colour",
    year: "2022",
    dimensions: "16 × 22 × 22 inches",
  },
  // PNC-0077
  {
    slug: "chaturvedi-vessel-wings-that-turns-dreams-into-journeys",
    title: "Vessel Wings That Turns Dreams Into Journeys",
    description: "",
    artistSlug: "phaneendra-nath-chaturvedi",
    thumbnail: "/artworks/chaturvedi-vessel-wings-that-turns-dreams-into-journeys.webp",
    material: "Fibreglass",
    year: "2023",
    dimensions: "112 × 78 × 32 inches",
  },
  // PNC-0129
  {
    slug: "chaturvedi-the-totem",
    title: "The Totem",
    description: "",
    artistSlug: "phaneendra-nath-chaturvedi",
    thumbnail: "/artworks/chaturvedi-the-totem.webp",
    material: "Fiberglass",
    year: "2019",
    dimensions: "76 × 83 × 34 inches",
  },
  // JC-0002
  {
    slug: "chowdhury-couple",
    title: "Couple",
    description: "",
    artistSlug: "jogen-chowdhury",
    thumbnail: "/artworks/chowdhury-couple.webp",
    material: "Bronze",
    year: "",
    dimensions: "11 × 13 × 9 inches",
    edition: "5 of 9",
  },
  // GD-0012
  {
    slug: "das-mother-and-child-2",
    title: "Mother and child 2",
    description: "",
    artistSlug: "gaurab-das",
    thumbnail: "/artworks/das-mother-and-child-2.webp",
    material: "Bronze",
    year: "",
    dimensions: "16 × 14 × 14 inches",
  },
  // GD-0038
  {
    slug: "das-couple-1",
    title: "Couple 1",
    description: "",
    artistSlug: "gaurab-das",
    thumbnail: "/artworks/das-couple-1.webp",
    material: "Bronze",
    year: "",
    dimensions: "14 × 11 × 6 inches",
  },
  // SG-0029
  {
    slug: "ghosh-untitled-sg-0029",
    title: "Untitled",
    description: "",
    artistSlug: "subba-ghosh",
    thumbnail: "/artworks/ghosh-untitled-sg-0029.webp",
    material: "Fibreglass, Resin, Paper Mache, Oil and Acrylic Paint",
    year: "",
    dimensions: "17 × 11 × 16 inches",
  },
  // no stock no.
  {
    slug: "parekh-horse",
    title: "Horse",
    description: "",
    artistSlug: "madhvi-parekh",
    thumbnail: "/artworks/parekh-horse.webp",
    material: "",
    year: "",
    edition: "3 of 9",
  },
  // no stock no.
  {
    slug: "khanna-shyam-pratap-bhompu-walae",
    title: "Shyam Pratap Bhompu Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-shyam-pratap-bhompu-walae.webp",
    material: "Bronze",
    year: "",
    dimensions: "12 × 8 × 8 inches",
    edition: "3 of 9",
  },
  // no stock no.
  {
    slug: "khanna-retd-captain-ramesh-kumar-accordian-walae",
    title: "Retd Captain Ramesh Kumar Accordian Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-retd-captain-ramesh-kumar-accordian-walae.webp",
    material: "Bronze",
    year: "",
    dimensions: "12 × 8 × 12 inches",
    edition: "2 of 9",
  },
  // no stock no.
  {
    slug: "khanna-davinder-raj-tutu-walae",
    title: "Davinder Raj Tutu Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-davinder-raj-tutu-walae.webp",
    material: "Bronze",
    year: "",
    dimensions: "10 × 6 × 10 inches",
    edition: "3 of 9",
  },
  // no stock no.
  {
    slug: "khanna-rajinder-kaka-horn-walae",
    title: "Rajinder Kaka Horn Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-rajinder-kaka-horn-walae.webp",
    material: "Bronze",
    year: "",
    dimensions: "12 × 7 × 6 inches",
    edition: "3 of 9",
  },
  // no stock no.
  {
    slug: "khanna-gulratan-bhon-bhon-walae",
    title: "Gulratan Bhon Bhon Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-gulratan-bhon-bhon-walae.webp",
    material: "Bronze",
    year: "",
    dimensions: "12 × 6 × 4 inches",
    edition: "3 of 9",
  },
  // no stock no.
  {
    slug: "khanna-satwant-sher-singh-cymbal-walae",
    title: "Satwant Sher Singh Cymbal Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-satwant-sher-singh-cymbal-walae.webp",
    material: "Bronze",
    year: "",
    dimensions: "14 × 5 × 6 inches",
    edition: "3 of 9",
  },
  // no stock no.
  {
    slug: "khanna-adhikari-dada-drum-walae",
    title: "Adhikari Dada Drum Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-adhikari-dada-drum-walae.webp",
    material: "Bronze",
    year: "",
    dimensions: "12 × 5 × 5 inches",
    edition: "3 of 9",
  },
  // no stock no.
  {
    slug: "khanna-patinder-rawat-trumpet-walae",
    title: "Patinder Rawat Trumpet Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-patinder-rawat-trumpet-walae.webp",
    material: "Bronze",
    year: "",
    dimensions: "12 × 5 × 5 inches",
    edition: "3 of 9",
  },
  // no stock no.
  {
    slug: "khanna-kc-the-bandmaster",
    title: "KC The Bandmaster",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-kc-the-bandmaster.webp",
    material: "Bronze",
    year: "",
    dimensions: "13 × 12 × 8 inches",
    edition: "3 of 9",
  },
  // KK-0001
  {
    slug: "khanna-untitled-kk-0001",
    title: "Untitled",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-untitled-kk-0001.webp",
    material: "Bronze Sculpture",
    year: "",
    dimensions: "33 × 25 × 25 inches",
    edition: "3 of 9",
  },
  // KK-0002
  {
    slug: "khanna-pieta",
    title: "Pieta",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-pieta.webp",
    material: "Bronze",
    year: "2018",
    dimensions: "15 × 20 × 16 inches",
    edition: "4 of 9",
  },
  // KK-0003
  {
    slug: "khanna-breaking-bread",
    title: "Breaking Bread",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-breaking-bread.webp",
    material: "Bronze Sculpture",
    year: "",
    dimensions: "15 × 13 × 12 inches",
    edition: "Artist's proof 1/1",
  },
  // KK-0005
  {
    slug: "khanna-man-and-bird-ii",
    title: "Man and Bird II",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-man-and-bird-ii.webp",
    material: "Bronze Sculpture",
    year: "",
    dimensions: "18 × 19 × 8 inches",
    edition: "5 of 9",
  },
  // KK-0006
  {
    slug: "khanna-man-and-bird-i",
    title: "Man and Bird I",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-man-and-bird-i.webp",
    material: "Bronze Sculpture",
    year: "",
    dimensions: "13 × 15 × 7 inches",
    edition: "3 of 9",
  },
  // KK-0305
  {
    slug: "khanna-untitled-kk-0305",
    title: "Untitled",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-untitled-kk-0305.webp",
    material: "Bronze",
    year: "",
    dimensions: "30 × 30 × 32 inches",
  },
  // KKA/Apr2025/001
  {
    slug: "khanna-raja-ram-tuba-wale",
    title: "Raja Ram Tuba Wale",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-raja-ram-tuba-wale.webp",
    material: "Resinated Fibreglass with Automotive Paint",
    year: "",
    dimensions: "82 × 64 × 47 inches",
  },
  // KKA/Aug2025/005
  {
    slug: "khanna-jitendra-singh-bhopu-waale",
    title: "Jitendra Singh Bhopu Waale",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-jitendra-singh-bhopu-waale.webp",
    material: "Resinated Fibreglass with Automotive Paint",
    year: "",
    dimensions: "80 × 52 × 68 inches",
  },
  // KKA/Mar2025/006
  {
    slug: "khanna-shyam-pratap-bhompu-wale",
    title: "Shyam Pratap Bhompu Wale",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-shyam-pratap-bhompu-wale.webp",
    material: "Resinated Fibreglass with Automotive Paint",
    year: "",
    dimensions: "83 × 55 × 46 inches",
  },
  // KKA/May2025/004
  {
    slug: "khanna-prakash-chander-haran-wale",
    title: "Prakash Chander Haran Wale",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-prakash-chander-haran-wale.webp",
    material: "Resinated Fibreglass with Automotive Paint",
    year: "",
    dimensions: "75 × 53 × 73 inches",
  },
  // KKA/YF/Nov2026/050
  {
    slug: "khanna-rajpal-ringodi-tuba-walae",
    title: "Rajpal Ringodi Tuba Walae",
    description: "",
    artistSlug: "krishen-khanna",
    thumbnail: "/artworks/khanna-rajpal-ringodi-tuba-walae.webp",
    material: "Bronze",
    year: "",
    dimensions: "12 × 6 × 12 inches",
    edition: "2 of 9",
  },
  // no stock no.
  {
    slug: "parekh-bronze-2-1",
    title: "Bronze 2 - 1",
    description: "",
    artistSlug: "madhvi-parekh",
    thumbnail: "/artworks/parekh-bronze-2-1.webp",
    material: "Bronze",
    year: "2006",
    dimensions: "31 × 26 × 16 inches",
    edition: "2 of 7",
    longDescription: "Inscribed in Devnagari and dated in English (front right corner).",
  },
  // MS-0095
  {
    slug: "sansanwal-levitation",
    title: "Levitation",
    description: "",
    artistSlug: "meena-sansanwal",
    thumbnail: "/artworks/sansanwal-levitation.webp",
    material: "Papermache, Marble And Acrylic Paint",
    year: "",
    dimensions: "24 × 22 × 14 inches",
  },
  // MS-0096
  {
    slug: "sansanwal-horse-of-the-mind",
    title: "Horse Of The Mind",
    description: "",
    artistSlug: "meena-sansanwal",
    thumbnail: "/artworks/sansanwal-horse-of-the-mind.webp",
    material: "Papermache And Acrylic Paint",
    year: "",
    dimensions: "20 × 12 × 12 inches",
  },
  // HM-0406
  {
    slug: "shah-tirthankar",
    title: "Tirthankar",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/artworks/shah-tirthankar.webp",
    material: "Bronze",
    year: "",
    dimensions: "48 × 26 × 20 inches",
    edition: "Artist's proof 1/1",
  },
  // HS-0191
  {
    slug: "shah-untitled-hs-0191",
    title: "Untitled",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/artworks/shah-untitled-hs-0191.webp",
    material: "Bronze",
    year: "2017",
    dimensions: "122 × 75 × 36 inches",
  },
  // HS-0196
  {
    slug: "shah-untitled-hs-0196",
    title: "Untitled",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/artworks/shah-untitled-hs-0196.webp",
    material: "Teak Sandstone, Eyes - Red Sandstone",
    year: "",
    dimensions: "72 × 23 × 24 inches",
  },
  // HS-0420
  {
    slug: "shah-untitled-hs-0420",
    title: "Untitled",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/artworks/shah-untitled-hs-0420.webp",
    material: "Bronze",
    year: "",
    dimensions: "42 × 27 × 37 inches",
  },
  // HS-0421
  {
    slug: "shah-untitled-hs-0421",
    title: "Untitled",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/artworks/shah-untitled-hs-0421.webp",
    material: "Bronze",
    year: "",
    dimensions: "50 × 28 × 31 inches",
  },
  // HS-0428
  {
    slug: "shah-untitled-hs-0428",
    title: "Untitled",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/artworks/shah-untitled-hs-0428.webp",
    material: "Bronze",
    year: "",
    dimensions: "49 × 27 × 31 inches",
  },
  // HS-0429
  {
    slug: "shah-untitled-hs-0429",
    title: "Untitled",
    description: "",
    artistSlug: "himmat-shah",
    thumbnail: "/artworks/shah-untitled-hs-0429.webp",
    material: "Bronze",
    year: "",
    dimensions: "52 × 19 × 26 inches",
  },
  // DS-0004
  {
    slug: "singh-i-am-within-you",
    title: "I Am Within You",
    description: "",
    artistSlug: "dhananjay-singh",
    thumbnail: "/artworks/singh-i-am-within-you.webp",
    material: "Stainless Steel and Copper Wire",
    year: "2020",
    dimensions: "69 × 41 × 31 inches",
  },
  // DS-0006
  {
    slug: "singh-i-am-within-you-9",
    title: "I Am Within You - 9",
    description: "",
    artistSlug: "dhananjay-singh",
    thumbnail: "/artworks/singh-i-am-within-you-9.webp",
    material: "Stainless Steel Wire",
    year: "2023",
    dimensions: "64 × 36 × 37 inches",
  },
  // DS-0008
  {
    slug: "singh-the-last-tree-ii",
    title: "The Last Tree- II",
    description: "",
    artistSlug: "dhananjay-singh",
    thumbnail: "/artworks/singh-the-last-tree-ii.webp",
    material: "Stainless steel, Copper & Bronze",
    year: "2017-18",
    dimensions: "106 × 64 × 57 inches",
  },
  // DS-0009
  {
    slug: "singh-inverted-tree",
    title: "Inverted Tree",
    description: "",
    artistSlug: "dhananjay-singh",
    thumbnail: "/artworks/singh-inverted-tree.webp",
    material: "Stainless steel wire",
    year: "2021",
    dimensions: "103 × 40 × 35 inches",
  },
  // DS-0012
  {
    slug: "singh-jungle",
    title: "Jungle",
    description: "",
    artistSlug: "dhananjay-singh",
    thumbnail: "/artworks/singh-jungle.webp",
    material: "Stainless steel wire",
    year: "2023",
    dimensions: "107 × 53 × 49 inches",
  },
  // DS-0042
  {
    slug: "singh-still-life-1",
    title: "Still Life - 1",
    description: "",
    artistSlug: "dhananjay-singh",
    thumbnail: "/artworks/singh-still-life-1.webp",
    material: "Stainless Steel Wire",
    year: "2025",
    dimensions: "86 × 48 × 36 inches",
  },
  // DS-0043
  {
    slug: "singh-still-life-2",
    title: "Still Life - 2",
    description: "",
    artistSlug: "dhananjay-singh",
    thumbnail: "/artworks/singh-still-life-2.webp",
    material: "Stainless Steel Wire",
    year: "2025",
    dimensions: "42 × 24 × 12 inches",
  },
  // DS-0052
  {
    slug: "singh-the-tree",
    title: "The Tree",
    description: "",
    artistSlug: "dhananjay-singh",
    thumbnail: "/artworks/singh-the-tree.webp",
    material: "Stainless Steel Wire",
    year: "",
    dimensions: "65 × 45 × 35 inches",
  },
  // DS-0053
  {
    slug: "singh-i-am-within-you-2",
    title: "I Am Within You",
    description: "",
    artistSlug: "dhananjay-singh",
    thumbnail: "/artworks/singh-i-am-within-you-2.webp",
    material: "Stainless Steel Wire",
    year: "",
    dimensions: "44 × 25 × 20 inches",
  },
  // YS-0060
  {
    slug: "sugandh-matar",
    title: "Matar",
    description: "",
    artistSlug: "yashika-sugandh",
    thumbnail: "/artworks/sugandh-matar.webp",
    material: "Acrylic On Fiber Resin And Nylon",
    year: "2024",
    dimensions: "102 × 30 × 25 inches",
  },
  // YS-0101
  {
    slug: "sugandh-meri-patang",
    title: "Meri Patang",
    description: "",
    artistSlug: "yashika-sugandh",
    thumbnail: "/artworks/sugandh-meri-patang.webp",
    material: "Acrylic on PETG and Fiber Resin",
    year: "2026",
    dimensions: "71 × 50 × 30 inches",
  },
  // TV-0009
  {
    slug: "vaikuntam-untitled-tv-0009",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tv-0009.webp",
    material: "Bronze Sculpture",
    year: "",
    dimensions: "11 × 10 × 6 inches",
    edition: "1 of 9",
  },
  // TV-0070
  {
    slug: "vaikuntam-untitled-tv-0070",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tv-0070.webp",
    material: "Bronze",
    year: "",
    dimensions: "58 × 58 × 47 inches",
  },
  // TVA/Dec2025/001
  {
    slug: "vaikuntam-untitled-tva-dec2025-001",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tva-dec2025-001.webp",
    material: "Resinated Fibreglass with Automotive Paint",
    year: "",
    dimensions: "99 × 85 × 53 inches",
  },
  // TVA/Dec2025/006
  {
    slug: "vaikuntam-untitled-tva-dec2025-006",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tva-dec2025-006.webp",
    material: "Fiberglass",
    year: "2025",
    dimensions: "98 × 94 × 60 inches",
  },
  // TVA/Feb2025/007
  {
    slug: "vaikuntam-untitled-tva-feb2025-007",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tva-feb2025-007.webp",
    material: "Resinated Fibreglass with Automotive Paint / Pedestal: Painted Stainless Steel",
    year: "",
    dimensions: "88 × 58 × 81 inches; pedestal 18 × 56 × 48 inches; overall height 106 inches",
  },
  // TVA/Feb2026/002
  {
    slug: "vaikuntam-untitled-tva-feb2026-002",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tva-feb2026-002.webp",
    material: "Resinated Fibreglass with Automotive Paint",
    year: "",
    dimensions: "103 × 48 × 33 inches",
  },
  // TVA/Jan2025/003
  {
    slug: "vaikuntam-untitled-tva-jan2025-003",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tva-jan2025-003.webp",
    material: "Resinated Fibreglass with Automotive Paint / Pedestal: Painted Stainless Steel",
    year: "",
    dimensions: "93 × 70 × 57 inches; pedestal 12 × 56 × 48 inches; overall height 105 inches",
  },
  // TVA/Jul2025/005
  {
    slug: "vaikuntam-untitled-tva-jul2025-005",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tva-jul2025-005.webp",
    material: "Resinated Fiberglass with Automotive Paint",
    year: "2025",
    dimensions: "94 × 58 × 69 inches",
  },
  // TVA/Mar2025/001
  {
    slug: "vaikuntam-untitled-tva-mar2025-001",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tva-mar2025-001.webp",
    material: "Resinated Fibreglass with Automotive Paint / Pedestal: Painted Stainless Steel",
    year: "",
    dimensions: "92 × 71 × 80 inches; pedestal 12 × 54 × 48 inches; overall height 102 inches",
  },
  // TVA/Sep2025/005
  {
    slug: "vaikuntam-untitled-tva-sep2025-005",
    title: "Untitled",
    description: "",
    artistSlug: "thota-vaikuntam",
    thumbnail: "/artworks/vaikuntam-untitled-tva-sep2025-005.webp",
    material: "Fibreglass",
    year: "2025",
    dimensions: "97 × 50 × 72 inches",
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
