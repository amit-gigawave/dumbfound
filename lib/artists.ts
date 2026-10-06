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
    portrait: "/artists/thota-vaikuntam.webp",
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

  {
    slug: "sujata-bajaj",
    name: "Sujata Bajaj",
    // Wikipedia (en.wikipedia.org/wiki/Sujata_Bajaj)
    born: "b. 1958",
    place: "Jaipur; lives in Paris",
    medium: "Painting, mixed media",
    role: "Painter",
    // Portrait: sujata-bajaj.com (published by Discover Artiana) — rights unconfirmed
    portrait: "/artists/sujata-bajaj.webp",
    summary:
      "Sujata Bajaj is an Indian painter whose abstract work draws on the tribal art of India. Born in Jaipur, she studied fine arts in Pune, writing her thesis on tribal art, and has lived and worked in Paris since 1988.",
    bio: [
      // sujata-bajaj.com, quoting Michel Waldberg's 2009 monograph
      "A French Government scholarship took her to the École des Beaux-Arts in Paris, where she entered the atelier of Claude Viseux.",
      // Indian Express — indianexpress.com/article/lifestyle/art-and-culture/many-forms-of-the-elephant-god/
      "Ganesha has been a recurring subject for her, in painting and in painted sculpture.",
    ],
    education: [
      // sujata-bajaj.com
      { what: "Fine arts, Pune, with a thesis on Indian tribal art" },
      // Wikipedia, sujata-bajaj.com
      { what: "École des Beaux-Arts, Paris" },
    ],
    honours: [
      // Wikipedia, sujata-bajaj.com
      { when: "1988–89", what: "French Government Scholarship" },
    ],
    collections: [],
    quotes: [],
  },
  {
    slug: "phaneendra-nath-chaturvedi",
    name: "Phaneendra Nath Chaturvedi",
    born: "b. 1981",
    place: "Varanasi, Uttar Pradesh",
    medium: "Sculpture, painting",
    role: "Sculptor and painter",
    // Portrait: thepnc.in/biography — © the artist
    portrait: "/artists/phaneendra-nath-chaturvedi.webp",
    summary:
      "Phaneendra Nath Chaturvedi is a painter, sculptor and multimedia artist whose anthropomorphic figures draw on mythology and transformation. He works in drawing and painting, and in sculpture in fibreglass, wood and stainless steel.",
    bio: [
      // thepnc.in/biography
      "Alongside the figures run parallel series of butterflies, bougainvillaea, wings and coins. In 2025 he held a mid-career retrospective at Bikaner House, New Delhi.",
    ],
    education: [
      // thepnc.in/biography
      { when: "2003", what: "B.F.A. (Painting), College of Arts & Crafts, University of Lucknow" },
      { when: "2005", what: "M.F.A. (Painting), College of Arts & Crafts, University of Lucknow" },
    ],
    honours: [
      // thepnc.in/biography
      { when: "2021", what: "Critics' Choice Award, World University of Design" },
      { when: "2006", what: "All India Award, South Central Zone Cultural Centre, Nagpur" },
      { when: "2004", what: "All India AIFACS Award, New Delhi" },
    ],
    collections: [],
    quotes: [],
  },
  {
    slug: "jogen-chowdhury",
    name: "Jogen Chowdhury",
    // Wikipedia (en.wikipedia.org/wiki/Jogen_Chowdhury)
    born: "b. 1939",
    place: "Faridpur, now Bangladesh",
    medium: "Ink, pastel, oil",
    role: "Painter",
    // Portrait: Biswarup Ganguly, CC BY-SA 3.0 — commons.wikimedia.org/wiki/File:Jogen_Chowdhury_4202.JPG
    portrait: "/artists/jogen-chowdhury.webp",
    summary:
      "Jogen Chowdhury is an Indian painter whose line-driven figures bring together Bengali imagery and modern painting. Born in Faridpur in present-day Bangladesh, he trained in Kolkata and Paris, and in 1987 joined Kala Bhavana, Santiniketan, as professor of painting.",
    bio: [
      // Wikipedia
      "He works in ink, watercolour, pastel and oil, and served as a member of the Rajya Sabha from West Bengal from 2014 to 2020.",
    ],
    education: [
      // Wikipedia
      { when: "1960", what: "Government College of Art & Craft, Kolkata" },
      { when: "1967", what: "École nationale supérieure des Beaux-Arts, Paris" },
      { what: "Atelier 17, Paris, under S.W. Hayter" },
    ],
    honours: [
      // Wikipedia, DAG (dagworld.com/jogenchowdhury.html)
      { when: "2012", what: "Banga Bibhushan" },
      { when: "2001", what: "Kalidas Samman, Madhya Pradesh" },
      { when: "1966", what: "Prix le France de la Jeune Peinture, Paris" },
    ],
    collections: [
      // DAG
      { what: "National Gallery of Modern Art, New Delhi" },
      { what: "Peabody Essex Museum, Salem" },
      { what: "Glenbarra Art Museum, Himeji" },
    ],
    quotes: [],
  },
  {
    slug: "gaurab-das",
    name: "Gaurab Das",
    // Black Cube Gallery (blackcube.in/artists/47-gaurab-das/overview/)
    born: "b. 1992",
    place: "Bagerhat, Bangladesh; lives in Santiniketan",
    medium: "Bronze, wood, stone",
    role: "Sculptor",
    // No portrait found — initials are shown.
    summary:
      "Gaurab Das is a Santiniketan-based sculptor working in bronze, wood and stone. His fluid, semi-abstract forms keep returning to connection: mother and child, buffalo and land, body and nature.",
    bio: [
      // The Patriot — thepatriot.in/listicle/echoes-of-the-hand-a-solo-exhibition-by-gaurab-das-80937
      "He was shaped early by his father, a commercial artist, and by the idol makers of his village. After Khulna Art College he moved to India in 2012 to study at Kala Bhavana, Santiniketan. His solo exhibition Echoes of the Hand was held at Black Cube Gallery in 2026.",
    ],
    education: [
      // Black Cube, The Patriot
      { what: "Khulna Art College" },
      { when: "2016", what: "DFA, Kala Bhavana, Santiniketan" },
      { when: "2018", what: "ADFA in Sculpture, Kala Bhavana, Santiniketan" },
    ],
    honours: [
      // The Patriot
      { when: "2019", what: "Elizabeth Greenshields Foundation Grant" },
    ],
    collections: [],
    quotes: [],
  },
  {
    slug: "subba-ghosh",
    name: "Subba Ghosh",
    // Black Cube Gallery (blackcube.in/artists/40-subba-ghosh/biography/); same text on Saffronart
    born: "b. 1964",
    place: "New Delhi",
    medium: "Sculpture, mixed media",
    role: "Artist",
    // Portrait: Black Cube Gallery — © gallery / the artist
    portrait: "/artists/subba-ghosh.webp",
    summary:
      "Subba Ghosh is a New Delhi-born artist who trained in Delhi, at the Surikov Institute in Moscow and at the Slade in London. He lives and works in New Delhi.",
    bio: [
      // Black Cube Gallery
      "Beyond fine art he has trained in puppet fabrication, web design and 3D animation. His solo exhibitions include Talwar Gallery, New York (2002) and Anant Art Gallery, New Delhi (2009).",
    ],
    education: [
      // Black Cube Gallery
      { when: "1984", what: "BFA, College of Art, New Delhi" },
      { what: "Surikov Institute of Fine Art, Moscow" },
      { when: "1990", what: "MFA, College of Art, New Delhi" },
      { when: "1996", what: "Slade School of Art, London" },
    ],
    honours: [
      // Black Cube Gallery
      { when: "1999", what: "Junior Fellowship, Ministry of Culture" },
      { when: "1994", what: "National Award, Lalit Kala Akademi" },
    ],
    collections: [
      // Black Cube Gallery
      { what: "National Gallery of Modern Art" },
      { what: "Lalit Kala Akademi" },
      { what: "Museum of Ostrów Wielkopolski, Poland" },
    ],
    quotes: [],
  },
  {
    slug: "madhvi-parekh",
    name: "Madhvi Parekh",
    // Wikipedia (en.wikipedia.org/wiki/Madhvi_Parekh), DAG (dagworld.com/madhviparekh.html)
    born: "b. 1942",
    place: "Sanjaya, Gujarat; lives in New Delhi",
    medium: "Painting",
    role: "Painter",
    // Portrait: Ministry of Culture / PIB, 2007, GODL-India — Wikimedia Commons
    portrait: "/artists/madhvi-parekh.webp",
    summary:
      "Madhvi Parekh is a self-taught Indian artist whose work draws on childhood memory, women's craft, folk art and Indian myth, rendered in a contemporary idiom. She began painting in 1964 with Paul Klee's Pedagogical Sketchbook as her guide.",
    bio: [
      // Wikipedia
      "Born in a village near Ahmedabad, she works in oil and acrylic on canvas and watercolour on paper. She lives in New Delhi and is married to the painter Manu Parekh.",
    ],
    education: [
      // DAG, Wikipedia
      { what: "Self-taught" },
      { when: "1970–72", what: "French Government Scholarship, Paris" },
    ],
    honours: [
      // DAG
      { when: "2017", what: "Kailash Lalit Kala Award" },
      // DAG, Wikipedia
      { when: "1979", what: "National Award, Lalit Kala Akademi" },
    ],
    collections: [
      // DAG
      { what: "National Gallery of Modern Art, New Delhi" },
      { what: "Kiran Nadar Museum of Art" },
      { what: "Jehangir Nicholson Art Foundation" },
    ],
    quotes: [],
  },
  {
    slug: "krishen-khanna",
    name: "Krishen Khanna",
    // Wikipedia (en.wikipedia.org/wiki/Krishen_Khanna)
    born: "b. 1925",
    place: "Lyallpur, now Faisalabad",
    medium: "Painting, bronze",
    role: "Painter",
    // Portrait: Ministry of Culture / PIB, 2011, GODL-India — Wikimedia Commons
    portrait: "/artists/krishen-khanna.webp",
    summary:
      "Krishen Khanna is one of India's senior modern painters, known for abstracted figurative work including the Truckwallahs and Bandwallahs series. Associated with the Progressive Artists' Group, he left his job at Grindlays Bank in 1961 to paint full-time.",
    bio: [],
    education: [
      // DAG (dagworld.com/krishenkhanna.html)
      { when: "1938–42", what: "Imperial Service College, Windsor" },
      { what: "BA, Government College, Lahore" },
      { what: "Mayo School of Art, Lahore (evening classes)" },
    ],
    honours: [
      // Wikipedia, DAG
      { when: "2011", what: "Padma Bhushan" },
      { when: "1990", what: "Padma Shri" },
      // DAG: first Indian artist to receive it
      { when: "1962", what: "Rockefeller III Fund Fellowship" },
    ],
    collections: [
      // DAG, Wikipedia
      { what: "National Gallery of Modern Art, New Delhi" },
      { what: "Kiran Nadar Museum of Art" },
      { what: "Jehangir Nicholson Art Foundation" },
    ],
    quotes: [],
  },
  {
    slug: "meena-sansanwal",
    name: "Meena Sansanwal",
    // Saffronart (saffronart.com/artists/meena--sansanwal)
    born: "b. 1971",
    place: "New Delhi",
    medium: "Painting, papier-mâché",
    role: "Painter and sculptor",
    // Portrait: Outlook Luxe / Black Cube Gallery — © press photo
    portrait: "/artists/meena-sansanwal.webp",
    summary:
      "Meena Sansanwal is a New Delhi-trained painter and sculptor whose work centres on feminine divinity and cosmology — forms of Shakti, Durga and Ardhanarishvara. She has worked in papier-mâché since 2016.",
    bio: [
      // Outlook Luxe — luxe.outlookindia.com/art-design/art/interview-meena-sansanwal-on-her-inner-cosmology-feminine-divinity-and-the-trance-of-creation
      "Her solo exhibition Divine Manifestation was held at Black Cube Gallery, New Delhi, in January 2026.",
    ],
    education: [
      // Saffronart, Black Cube
      { when: "1990–94", what: "BFA Painting, College of Art, New Delhi" },
      { when: "1995–97", what: "MFA Painting, College of Art, New Delhi" },
    ],
    honours: [
      // Saffronart
      { when: "1994", what: "Gold Medal, final-year BFA, College of Art, New Delhi" },
    ],
    collections: [],
    quotes: [],
  },
  {
    slug: "himmat-shah",
    name: "Himmat Shah",
    // Wikipedia (en.wikipedia.org/wiki/Himmat_Shah); ArtAsiaPacific obituary
    born: "1933–2025",
    place: "Lothal, Gujarat",
    medium: "Terracotta, bronze",
    role: "Sculptor",
    // Portrait: Black Cube Gallery — © gallery
    portrait: "/artists/himmat-shah.webp",
    summary:
      "Himmat Shah was an Indian sculptor, best known for his terracotta and bronze heads, and a founding member of Group 1890 in 1962. He lived and worked in Jaipur until his death in 2025.",
    bio: [],
    education: [
      // Wikipedia
      { what: "J.J. School of Art, Mumbai" },
      { when: "1956", what: "Faculty of Fine Arts, M.S. University of Baroda" },
      { when: "1966", what: "Atelier 17, Paris" },
    ],
    honours: [
      // Wikipedia, Black Cube Gallery
      { when: "2021", what: "Lalit Kala Akademi Fellowship" },
      { when: "2003", what: "Kalidas Samman, Madhya Pradesh" },
      { when: "1956, 1962", what: "National Award, Lalit Kala Akademi" },
    ],
    collections: [],
    quotes: [],
  },
  {
    slug: "dhananjay-singh",
    name: "Dhananjay Singh",
    // Bespoke Gallery (bespokegallery.com/artists/79-dhananjay-singh/biography/)
    born: "b. 1977",
    place: "Hajipur, Bihar",
    medium: "Wire sculpture, bronze",
    role: "Sculptor",
    // Portrait: Bespoke Art Gallery — © gallery
    portrait: "/artists/dhananjay-singh.webp",
    summary:
      "Dhananjay Singh builds human and tree-like forms from finely twisted stainless steel, copper and bronze wire. His central theme is that people and nature cannot be separated, with the tree of life as his core motif.",
    bio: [],
    education: [
      // Bespoke Gallery
      { what: "BFA Sculpture, Banaras Hindu University" },
      { what: "MFA, M.S. University, Baroda" },
      { when: "2006", what: "Residency, Monash University, Australia" },
    ],
    honours: [
      // Bespoke Gallery
      { when: "2005", what: "INLAKS Fine Art Award" },
      { when: "2002", what: "National Award, Lalit Kala Akademi" },
      { when: "2000", what: "Gold Medal, Banaras Hindu University" },
    ],
    collections: [],
    quotes: [],
  },
  {
    slug: "yashika-sugandh",
    name: "Yashika Sugandh",
    // Black Cube Gallery (blackcube.in/artists/34-yashika-sugandh/biography/)
    born: "b. 1993",
    place: "Kolkata; lives in Noida",
    medium: "Watercolour, kinetic sculpture",
    role: "Artist",
    // Portrait: Black Cube Gallery — © gallery
    portrait: "/artists/yashika-sugandh.webp",
    summary:
      "Yashika Sugandh makes playful, miniature-influenced paintings and kinetic sculptures that imagine flora and fauna reclaiming space from the city. Her solo show Vartaman was held at Bikaner House and Black Cube Gallery in 2025.",
    bio: [],
    education: [
      // Black Cube Gallery
      { what: "BFA and MFA Painting, Amity University, Noida" },
    ],
    honours: [
      // SheThePeople, 2025
      { when: "2024", what: "Hermès Mumbai store-window commission" },
      // Black Cube Gallery
      { when: "2021", what: "All-India Merit Grant, Prafulla Dahanukar Art Foundation" },
      { when: "2017", what: "City Award for Delhi, Kalanand Art" },
    ],
    collections: [],
    quotes: [],
  },
  {
    slug: "mf-husain",
    name: "M.F. Husain",
    born: "1915–2011",
    place: "Pandharpur, Maharashtra",
    medium: "Painting, sculpture",
    role: "Painter and sculptor",
    summary:
      "Maqbool Fida Husain was one of the most celebrated and internationally recognised Indian artists of the twentieth century, often referred to as the Picasso of India.",
    bio: [],
    education: [],
    honours: [
      { when: "1991", what: "Padma Bhushan" },
      { when: "1966", what: "Padma Shri" },
    ],
    collections: [
      { what: "National Gallery of Modern Art, New Delhi" },
      { what: "Tate Modern, London" },
    ],
    quotes: [],
  },
  {
    slug: "jagannath-panda",
    name: "Jagannath Panda",
    born: "b. 1970",
    place: "Bhubaneswar, Odisha",
    medium: "Painting, sculpture, mixed media",
    role: "Artist",
    summary:
      "Jagannath Panda is a contemporary Indian artist whose work explores the tension between urbanisation and nature, tradition and modernity.",
    bio: [],
    education: [
      { what: "BFA, B.K. College of Art, Bhubaneswar" },
      { what: "MFA, M.S. University, Baroda" },
    ],
    honours: [],
    collections: [],
    quotes: [],
  },
  {
    slug: "biman-das",
    name: "Biman Das",
    born: "b. 1943",
    place: "Kolkata, West Bengal",
    medium: "Sculpture",
    role: "Sculptor",
    summary:
      "Biman Das is a senior Indian sculptor based in Kolkata, known for his expressive figurative work in bronze and mixed media.",
    bio: [],
    education: [],
    honours: [],
    collections: [],
    quotes: [],
  },
  {
    slug: "yusuf",
    name: "Yusuf",
    born: "b. 1952",
    place: "India",
    medium: "Sculpture",
    role: "Sculptor",
    summary:
      "Yusuf is an Indian sculptor whose work is part of the Sculpted India roster of modern and contemporary artists.",
    bio: [],
    education: [],
    honours: [],
    collections: [],
    quotes: [],
  },
  {
    slug: "dileep-sharma",
    name: "Dileep Sharma",
    born: "b. 1974",
    place: "India",
    medium: "Sculpture",
    role: "Sculptor",
    summary:
      "Dileep Sharma is an Indian sculptor whose work explores form and materiality through contemporary sculptural practice.",
    bio: [],
    education: [],
    honours: [],
    collections: [],
    quotes: [],
  },
  {
    slug: "ompal-sansanwal",
    name: "Ompal Sansanwal",
    born: "b. 1964",
    place: "India",
    medium: "Sculpture",
    role: "Sculptor",
    summary:
      "Ompal Sansanwal is an Indian sculptor whose work is featured in the Sculpted India initiative for modern and contemporary Indian sculpture.",
    bio: [],
    education: [],
    honours: [],
    collections: [],
    quotes: [],
  },
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
