/*
 * The blog: articles about the artists and the works in the collection. Each
 * post is plain data rendered by app/blog/[slug]/page.tsx.
 *
 * Same rule as the rest of the site: every fact needs a source. List the
 * sources in `sources` (they are shown at the end of the post) and leave a
 * claim out rather than guess. Most facts here come from lib/artists.ts and
 * lib/sculptures.ts, which carry their own source comments.
 *
 * For search: put the main keyword (usually the artist's name) in the slug,
 * the title, the description and the first paragraph; phrase h2s and FAQ
 * questions the way people search; link every named work and artist into the
 * site with [label](/path).
 */

export type BlogBlock =
  | { type: "h2"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  /** A work from lib/sculptures.ts, shown with its thumbnail and a link. */
  | { type: "work"; slug: string; caption?: string }
  | { type: "quote"; text: string; cite: string; url?: string }
  /** Questions and answers, shown under "Frequently asked questions". */
  | { type: "faq"; items: { q: string; a: string }[] };

export interface BlogPost {
  slug: string;
  /** The headline (h1). Keep it under about 65 characters for search results. */
  title: string;
  /** Meta description and list-page summary: one or two sentences, under 160 characters. */
  description: string;
  /** ISO dates (YYYY-MM-DD). */
  published: string;
  updated?: string;
  /** Shown above the title and used as the article section. */
  category: string;
  tags: string[];
  /** Share image, from public/ (thumbnails are 800×1000). */
  image: { src: string; alt: string; width: number; height: number };
  /** Works and artists the post is about. */
  workSlugs?: string[];
  artistSlugs?: string[];
  /** Published sources for the facts in the post. */
  sources: { label: string; url: string }[];
  body: BlogBlock[];
}

const thumb = (slug: string, alt: string) => ({
  src: `/thumbnails/${slug}.webp`,
  alt,
  width: 800,
  height: 1000,
});

export const FAQ_ID = "faq";

export const blog: BlogPost[] = [
  // Facts: lib/artists.ts (thota-vaikuntam) and its sources: Saffronart, DAG,
  // AstaGuru, Open (2022), Deccan Chronicle (2026), Wikipedia (36th National
  // Film Awards). Design Democracy: lib/events.ts.
  {
    slug: "thota-vaikuntam-sculptures",
    title: "Thota Vaikuntam's sculptures of Telangana village life",
    description:
      "Thota Vaikuntam is known for painting the women and men of rural Telangana. See how he carries them into sculpture, with four works from the collection.",
    published: "2026-10-23",
    category: "Artists",
    tags: ["Thota Vaikuntam", "Telangana", "Indian sculpture", "Contemporary Indian art"],
    image: thumb("dancing-shiva", "Dancing Shiva, a sculpture by Thota Vaikuntam"),
    workSlugs: ["telangana-woman", "lord-krishna", "sacred-gaze", "dancing-shiva"],
    artistSlugs: ["thota-vaikuntam"],
    sources: [
      { label: "DAG: Thota Vaikuntam", url: "https://dagworld.com/thota-vaikuntam.html" },
      {
        label: "Deccan Chronicle (2026): Thota Vaikuntam on turning Telangana's everyday lives into an enduring visual language",
        url: "https://www.deccanchronicle.com/lifestyle/thota-vaikuntam-on-turning-telanganas-everyday-lives-into-an-enduring-visual-language-1988502",
      },
      { label: "Open (2022): Rural reveries", url: "https://openthemagazine.com/art-culture/thota-vaikuntam-rural-reveries" },
      { label: "Wikipedia: 36th National Film Awards", url: "https://en.wikipedia.org/wiki/36th_National_Film_Awards" },
    ],
    body: [
      {
        type: "p",
        text: "[Thota Vaikuntam](/artists/thota-vaikuntam), born in 1942, has spent six decades painting the women and men of rural Telangana in bold colour. In recent years he has given the same figures form in sculpture. Four of his sculptures are in the Sculpted India [collection](/artworks), and this article looks at where they come from.",
      },
      { type: "h2", id: "who-is-thota-vaikuntam", text: "Who is Thota Vaikuntam?" },
      {
        type: "p",
        text: "Vaikuntam grew up in Burugupalli, a village in the Karimnagar district of Telangana. As a child he was fascinated by the travelling theatre troupes that came through the village, in which men played the women's roles.",
      },
      {
        type: "p",
        text: "He trained at the College of Fine Arts and Architecture in Hyderabad (1965–70) and then at M.S. University, Baroda, under K.G. Subramanyan (1971–72). His first solo show was at Kala Bhavan, Hyderabad, in 1973. For many years he taught children at Hyderabad's Bal Bhavan.",
      },
      {
        type: "p",
        text: "He was also art director for the films Maa Bhoomi and Daasi, and Daasi won him the National Film Award for Best Art Direction in 1989. He received the National Award for Painting in 1993. His work is in the National Gallery of Modern Art, New Delhi, the Peabody Essex Museum in Salem and the Salar Jung Museum, Hyderabad.",
      },
      { type: "h2", id: "village-life-telangana", text: "The women and men of rural Telangana" },
      {
        type: "p",
        text: "His people are unmistakable: women in bright saris with large vermilion bindis and almond eyes, men carrying toddy pots, and the rituals and fields of village life. He draws them with a strong black line and fills them with bold reds, saffrons and oranges.",
      },
      {
        type: "quote",
        text: "Life in the village is a daily celebration.",
        cite: "Thota Vaikuntam, Open, 2022",
        url: "https://openthemagazine.com/art-culture/thota-vaikuntam-rural-reveries",
      },
      { type: "h2", id: "from-painting-to-sculpture", text: "From painting to sculpture" },
      {
        type: "p",
        text: "In recent years Vaikuntam has turned these subjects into sculpture, carrying his figures off the canvas and into the round. He has described the change as a way of seeing the same subject anew.",
      },
      {
        type: "quote",
        text: "An artist must keep searching. My sculptures are an example. The subject is the same, but the medium gives me a new way of seeing.",
        cite: "Thota Vaikuntam, Deccan Chronicle, 2026",
        url: "https://www.deccanchronicle.com/lifestyle/thota-vaikuntam-on-turning-telanganas-everyday-lives-into-an-enduring-visual-language-1988502",
      },
      { type: "h2", id: "sculptures-in-the-collection", text: "Thota Vaikuntam sculptures in the collection" },
      {
        type: "p",
        text: "The four works below are in the Sculpted India collection. Sculpted India also showed his work at [Design Democracy 2026](/events) in Hyderabad.",
      },
      { type: "work", slug: "telangana-woman" },
      { type: "work", slug: "lord-krishna" },
      { type: "work", slug: "sacred-gaze" },
      { type: "work", slug: "dancing-shiva" },
      {
        type: "quote",
        text: "Art history can teach technique, but my village taught me identity.",
        cite: "Thota Vaikuntam, Deccan Chronicle, 2026",
        url: "https://www.deccanchronicle.com/lifestyle/thota-vaikuntam-on-turning-telanganas-everyday-lives-into-an-enduring-visual-language-1988502",
      },
      {
        type: "faq",
        items: [
          {
            q: "Who is Thota Vaikuntam?",
            a: "Thota Vaikuntam is an Indian painter and sculptor, born in 1942 in Burugupalli, Telangana. He is known for bold, colourful pictures of the women and men of rural Telangana.",
          },
          {
            q: "Does Thota Vaikuntam make sculptures?",
            a: "Yes. In recent years he has turned the subjects of his paintings into sculpture. Four of his sculptures are in the Sculpted India collection: Untitled (Lady), Untitled (Lord Krishna), Untitled (Pandit) and Dancing Shiva.",
          },
          {
            q: "Where did Thota Vaikuntam study?",
            a: "At the College of Fine Arts and Architecture, Hyderabad (1965–70), and at M.S. University, Baroda, under K.G. Subramanyan (1971–72).",
          },
          {
            q: "Which museums hold Thota Vaikuntam's work?",
            a: "His work is in the National Gallery of Modern Art, New Delhi, the Peabody Essex Museum, Salem, and the Salar Jung Museum, Hyderabad.",
          },
        ],
      },
    ],
  },

  // Facts: lib/artists.ts (krishen-khanna) and its sources: Wikipedia and DAG.
  // Materials: lib/sculptures.ts.
  {
    slug: "krishen-khanna-sculptures",
    title: "Krishen Khanna's musicians: four sculptures in the collection",
    description:
      "Krishen Khanna, a senior Indian modernist known for his Bandwallahs, in four sculptures: a cymbal player, a trumpet player, a horn player and a seated man.",
    published: "2026-10-23",
    category: "Artists",
    tags: ["Krishen Khanna", "Bandwallahs", "Bronze sculpture", "Indian modern art"],
    image: thumb(
      "khanna-untitled-horn-player",
      "Untitled (Horn Player), a sculpture by Krishen Khanna",
    ),
    workSlugs: [
      "khanna-satwant-sher-singh-cymbal-walae",
      "khanna-patinder-rawat-trumpet-walae",
      "khanna-untitled-horn-player",
      "khanna-untitled-seated-man",
    ],
    artistSlugs: ["krishen-khanna"],
    sources: [
      { label: "Wikipedia: Krishen Khanna", url: "https://en.wikipedia.org/wiki/Krishen_Khanna" },
      { label: "DAG: Krishen Khanna", url: "https://dagworld.com/krishenkhanna.html" },
    ],
    body: [
      {
        type: "p",
        text: "[Krishen Khanna](/artists/krishen-khanna), born in 1925, is one of India's senior modern painters, known for abstracted figurative work including his Truckwallahs and Bandwallahs series. Four of his sculptures, three musicians and a seated man, are in the Sculpted India [collection](/artworks).",
      },
      { type: "h2", id: "who-is-krishen-khanna", text: "Who is Krishen Khanna?" },
      {
        type: "p",
        text: "Khanna was born in Lyallpur, now Faisalabad. He studied at the Imperial Service College in Windsor (1938–42), took a BA at Government College, Lahore, and went to evening classes at the Mayo School of Art in Lahore.",
      },
      {
        type: "p",
        text: "He worked at Grindlays Bank until 1961, when he left to paint full-time. He was associated with the Progressive Artists' Group. In 1962 he became the first Indian artist to receive a Rockefeller III Fund Fellowship.",
      },
      {
        type: "p",
        text: "He was awarded the Padma Shri in 1990 and the Padma Bhushan in 2011. His work is in the National Gallery of Modern Art, New Delhi, the Kiran Nadar Museum of Art and the Jehangir Nicholson Art Foundation.",
      },
      { type: "h2", id: "truckwallahs-and-bandwallahs", text: "Truckwallahs and Bandwallahs" },
      {
        type: "p",
        text: "Two of the series Khanna is known for are named after working people: the Truckwallahs, after truck drivers, and the Bandwallahs, after band musicians. Three of the four sculptures in the collection are musicians too.",
      },
      { type: "h2", id: "sculptures-in-the-collection", text: "Krishen Khanna sculptures in the collection" },
      {
        type: "p",
        text: "Alongside painting, Khanna works in bronze. Satwant Sher Singh Cymbal Walae and Patinder Rawat Trumpet Walae are both cast in bronze.",
      },
      { type: "work", slug: "khanna-satwant-sher-singh-cymbal-walae" },
      { type: "work", slug: "khanna-patinder-rawat-trumpet-walae" },
      { type: "work", slug: "khanna-untitled-horn-player" },
      { type: "work", slug: "khanna-untitled-seated-man" },
      {
        type: "faq",
        items: [
          {
            q: "Who is Krishen Khanna?",
            a: "Krishen Khanna is an Indian modern painter, born in 1925 in Lyallpur, now Faisalabad. He is known for abstracted figurative work, including the Truckwallahs and Bandwallahs series.",
          },
          {
            q: "Was Krishen Khanna part of the Progressive Artists' Group?",
            a: "He was associated with the Progressive Artists' Group. He left his job at Grindlays Bank in 1961 to paint full-time.",
          },
          {
            q: "What awards has Krishen Khanna received?",
            a: "The Padma Shri (1990) and the Padma Bhushan (2011). In 1962 he was the first Indian artist to receive a Rockefeller III Fund Fellowship.",
          },
          {
            q: "Does Krishen Khanna make sculpture?",
            a: "Yes, he works in bronze as well as paint. Four of his sculptures are in the Sculpted India collection, including Satwant Sher Singh Cymbal Walae and Patinder Rawat Trumpet Walae, both in bronze.",
          },
        ],
      },
    ],
  },

  // Facts: lib/artists.ts (himmat-shah) and its sources: Wikipedia, the
  // ArtAsiaPacific obituary and Black Cube Gallery.
  {
    slug: "himmat-shah-heads",
    title: "Himmat Shah's sculpted heads: three works in the collection",
    description:
      "Himmat Shah (1933–2025) was best known for his heads in terracotta, plaster and ceramic. Read about his life and see three of his heads in the collection.",
    published: "2026-10-23",
    category: "Artists",
    tags: ["Himmat Shah", "Group 1890", "Terracotta", "Indian sculpture"],
    image: thumb("head-g", "Untitled (Head G), a sculpted head by Himmat Shah"),
    workSlugs: ["head-a", "head-c", "head-g"],
    artistSlugs: ["himmat-shah"],
    sources: [
      { label: "Wikipedia: Himmat Shah", url: "https://en.wikipedia.org/wiki/Himmat_Shah" },
    ],
    body: [
      {
        type: "p",
        text: "[Himmat Shah](/artists/himmat-shah) (1933–2025) was an Indian sculptor best known for his heads in terracotta, plaster and ceramic. Three of his heads are in the Sculpted India [collection](/artworks).",
      },
      { type: "h2", id: "who-was-himmat-shah", text: "Who was Himmat Shah?" },
      {
        type: "p",
        text: "Shah was born in 1933 in Lothal, Gujarat. He studied at the J.J. School of Art in Mumbai and, from 1956, at the Faculty of Fine Arts of M.S. University, Baroda. In 1966 he worked at Atelier 17 in Paris.",
      },
      {
        type: "p",
        text: "In 1962 he was a founding member of Group 1890. He lived and worked in Jaipur until his death in 2025.",
      },
      {
        type: "p",
        text: "He received the Lalit Kala Akademi's National Award in 1956 and 1962, the Kalidas Samman of Madhya Pradesh in 2003 and the Lalit Kala Akademi Fellowship in 2021.",
      },
      { type: "h2", id: "the-heads", text: "The heads" },
      {
        type: "p",
        text: "The head is the subject Shah is best known for, worked in terracotta, plaster and ceramic. The three in the collection are untitled and are known by letter.",
      },
      { type: "work", slug: "head-a" },
      { type: "work", slug: "head-c" },
      { type: "work", slug: "head-g" },
      {
        type: "faq",
        items: [
          {
            q: "Who was Himmat Shah?",
            a: "Himmat Shah (1933–2025) was an Indian sculptor from Lothal, Gujarat, best known for his heads in terracotta, plaster and ceramic. He lived and worked in Jaipur.",
          },
          {
            q: "What was Group 1890?",
            a: "Group 1890 was a group of Indian artists formed in 1962. Himmat Shah was one of its founding members.",
          },
          {
            q: "Where did Himmat Shah study?",
            a: "At the J.J. School of Art, Mumbai, at the Faculty of Fine Arts, M.S. University, Baroda (from 1956), and at Atelier 17 in Paris (1966).",
          },
        ],
      },
    ],
  },

  // Facts: lib/artists.ts (meena-sansanwal, subba-ghosh, yashika-sugandh) and
  // their sources: Saffronart, Outlook Luxe, Black Cube Gallery, Esquire India.
  // Titles, years and materials: lib/sculptures.ts.
  {
    slug: "contemporary-indian-sculptors",
    title: "Contemporary Indian sculpture: three artists to know",
    description:
      "Meena Sansanwal, Subba Ghosh and Yashika Sugandh work in papier-mâché, fibreglass and resin. Meet three contemporary artists and their works in the collection.",
    published: "2026-10-23",
    category: "Artists",
    tags: [
      "Contemporary Indian sculpture",
      "Meena Sansanwal",
      "Subba Ghosh",
      "Yashika Sugandh",
      "Papier-mâché",
    ],
    image: thumb("meditating", "Levitation, a papier-mâché sculpture by Meena Sansanwal"),
    workSlugs: ["meditating", "head-e", "sugandh-elephant-kite"],
    artistSlugs: ["meena-sansanwal", "subba-ghosh", "yashika-sugandh"],
    sources: [
      { label: "Saffronart: Meena Sansanwal", url: "https://www.saffronart.com/artists/meena--sansanwal" },
      {
        label: "Outlook Luxe: Meena Sansanwal on her inner cosmology, feminine divinity and the trance of creation",
        url: "https://luxe.outlookindia.com/art-design/art/interview-meena-sansanwal-on-her-inner-cosmology-feminine-divinity-and-the-trance-of-creation",
      },
      { label: "Black Cube Gallery: Subba Ghosh", url: "https://blackcube.in/artists/40-subba-ghosh/biography/" },
      { label: "Black Cube Gallery: Yashika Sugandh", url: "https://blackcube.in/artists/34-yashika-sugandh/biography/" },
    ],
    body: [
      {
        type: "p",
        text: "Contemporary Indian sculpture is not only bronze and stone. The three artists here work in papier-mâché, fibreglass, resin and paint, and each has a work in the Sculpted India [collection](/artworks).",
      },
      { type: "h2", id: "meena-sansanwal", text: "Meena Sansanwal: feminine divinity in papier-mâché" },
      {
        type: "p",
        text: "[Meena Sansanwal](/artists/meena-sansanwal), born in 1971, is a painter and sculptor whose work centres on feminine divinity and cosmology: Shakti, Prakriti and Durga. She took her BFA (1990–94) and MFA (1995–97) in painting at the College of Art, New Delhi, winning the gold medal in her final BFA year. She has worked in papier-mâché since 2016, and her solo exhibition Divine Manifestation was held at Black Cube Gallery, New Delhi, in January 2026.",
      },
      {
        type: "work",
        slug: "meditating",
        caption: "[Levitation](/artworks/meditating), Meena Sansanwal. Papier-mâché, marble and acrylic paint.",
      },
      { type: "h2", id: "subba-ghosh", text: "Subba Ghosh: Delhi, Moscow and London" },
      {
        type: "p",
        text: "[Subba Ghosh](/artists/subba-ghosh) was born in New Delhi in 1964 and still lives and works there. He trained at the College of Art, New Delhi (BFA 1984, MFA 1990), at the Surikov Institute of Fine Art in Moscow and at the Slade School of Art in London (1996), and has also trained in puppet fabrication.",
      },
      {
        type: "p",
        text: "His solo exhibitions include Talwar Gallery, New York (2002) and Anant Art Gallery, New Delhi (2009). He received the Lalit Kala Akademi's National Award in 1994, and his work is in the National Gallery of Modern Art, the Lalit Kala Akademi and the Museum of Ostrów Wielkopolski in Poland.",
      },
      {
        type: "work",
        slug: "head-e",
        caption: "[Untitled](/artworks/head-e), Subba Ghosh. Fibreglass, resin, papier-mâché, oil and acrylic paint.",
      },
      { type: "h2", id: "yashika-sugandh", text: "Yashika Sugandh: nature reclaiming the city" },
      {
        type: "p",
        text: "[Yashika Sugandh](/artists/yashika-sugandh), born in Kolkata in 1993, makes playful, miniature-influenced paintings that imagine flora and fauna reclaiming space from the city. She studied painting at Amity University, Noida (BFA and MFA), and her solo show Vartaman was held at Bikaner House, New Delhi. Her awards include the City Award for Delhi from Kalanand Art (2017) and an All-India Merit Grant from the Prafulla Dahanukar Art Foundation (2021).",
      },
      {
        type: "work",
        slug: "sugandh-elephant-kite",
        caption: "[Meri Patang](/artworks/sugandh-elephant-kite), Yashika Sugandh, 2026. Acrylic on PETG and fibre resin.",
      },
      {
        type: "faq",
        items: [
          {
            q: "What materials do contemporary Indian sculptors use?",
            a: "Not only bronze and stone. The three works in this article are made of papier-mâché, marble, fibreglass, resin, PETG, and oil and acrylic paint.",
          },
          {
            q: "Who is Meena Sansanwal?",
            a: "A New Delhi-trained painter and sculptor, born in 1971, whose work centres on feminine divinity and cosmology. She has worked in papier-mâché since 2016.",
          },
          {
            q: "Who is Subba Ghosh?",
            a: "A New Delhi-born artist (b. 1964) who trained in Delhi, at the Surikov Institute in Moscow and at the Slade in London. His work is in the National Gallery of Modern Art.",
          },
          {
            q: "Who is Yashika Sugandh?",
            a: "A Kolkata-born artist (b. 1993) whose playful, miniature-influenced paintings imagine flora and fauna reclaiming space from the city.",
          },
        ],
      },
    ],
  },
];

/** Newest first; posts from the same day keep their order above. */
export const blogPosts = () =>
  blog
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p.published.localeCompare(a.p.published) || a.i - b.i)
    .map(({ p }) => p);

export const getPost = (slug: string) => blog.find((p) => p.slug === slug);

/** Posts about an artist, for links from their page. */
export const postsAboutArtist = (slug: string) =>
  blogPosts().filter((p) => p.artistSlugs?.includes(slug));

/** Text with the [label](/path) links reduced to their labels. */
export const plainText = (text: string) =>
  text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

const blockText = (b: BlogBlock): string => {
  switch (b.type) {
    case "ul":
    case "ol":
      return b.items.join(" ");
    case "work":
      return b.caption ?? "";
    case "faq":
      return b.items.map((f) => `${f.q} ${f.a}`).join(" ");
    default:
      return b.text;
  }
};

export const wordCount = (post: BlogPost) =>
  post.body
    .map((b) => plainText(blockText(b)))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

/** Minutes to read, at about 220 words a minute. */
export const readingMinutes = (post: BlogPost) =>
  Math.max(1, Math.round(wordCount(post) / 220));

/** "23 October 2026" */
export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
