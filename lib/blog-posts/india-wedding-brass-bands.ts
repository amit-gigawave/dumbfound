import type { BlogPost } from "../blog";
import { thumb } from "./images";

// Facts: Norient, "A day out with the bandsmen" (origins, the record-master,
// repertoire, pay, the Gregory Booth caution); The Christian Science Monitor,
// 1999 (Calcutta bands); AP, 2014, via The National (Delhi bands, contracts,
// wedding days, DJs). Khanna's Bandwallahs: Grosvenor Gallery catalogue (2015).
const post: BlogPost = {
  slug: "india-wedding-brass-bands",
  title: "Band baaja: the story of India's wedding brass bands",
  description:
    "How British military bands became the brass bands of Indian weddings: their uniforms, their Bollywood tunes, the bandwallahs who play them, and the art they inspired.",
  published: "2026-10-23",
  category: "Art explained",
  tags: ["Brass bands", "Indian weddings", "Bandwallahs", "Krishen Khanna"],
  image: thumb(
    "khanna-patinder-rawat-trumpet-walae",
    "Patinder Rawat Trumpet Walae, a bronze bandsman by Krishen Khanna",
  ),
  workSlugs: [
    "khanna-patinder-rawat-trumpet-walae",
    "khanna-satwant-sher-singh-cymbal-walae",
    "khanna-untitled-horn-player",
  ],
  artistSlugs: ["krishen-khanna"],
  sources: [
    { label: "Norient: A day out with the bandsmen", url: "https://norient.com/abhishek-mathur/day-out-bandsmen" },
    { label: "The Christian Science Monitor (1999): Calcutta's wedding bands", url: "https://www.csmonitor.com/1999/0527/p8s2.html" },
    { label: "The National (AP, 2014): India's brass bands struggle as wedding fashions change", url: "https://www.thenationalnews.com/world/india-s-brass-bands-struggle-as-wedding-fashions-change-1.653994" },
    { label: "Grosvenor Gallery: Krishen Khanna catalogue (2015)", url: "https://www.grosvenorgallery.com/usr/admin/records/documents.catalogues/e-catalogue-krishen-khanna.pdf" },
  ],
  body: [
    {
      type: "p",
      text: "At Indian weddings, brass bands in military-style uniforms play the latest film songs. The band baaja has a history that goes back to the colonial army, and it found its way into Indian art through the painter [Krishen Khanna](/blog/krishen-khanna-life).",
    },
    { type: "h2", id: "military-origins", text: "From military bands to weddings" },
    {
      type: "p",
      text: "Brass band music came to India with British military bands. Indian musicians trained on European instruments, and later Indian royalty kept bands of their own. The scholar Gregory Booth warns against telling it as one simple story,. In Calcutta, band musicians once played marches and waltzes for the British; after independence they moved to weddings and learned film songs, often from cassettes.",
    },
    { type: "h2", id: "what-they-play", text: "What the bands play" },
    {
      type: "p",
      text: "Since 1947 Hindi and regional film songs have been the heart of the repertoire. In Delhi a band's record-master arranges the tunes and leads the playing, and the trumpet has largely replaced the clarinet as the lead instrument.",
    },
    { type: "h2", id: "the-trade", text: "The bandwallahs and their trade" },
    {
      type: "ul",
      items: [
        "Bands wear faded military-style uniforms, or silk tunics and turbans. A Calcutta band in 1999 might have 15 to 40 players in red-and-blue parade uniforms and coloured turbans.",
        "In 2014 there were about 100 bands around Delhi, and many of the players were related men from villages in Uttar Pradesh.",
        "Players were typically hired for the wedding season, roughly September to May, and many worked other jobs the rest of the year.",
        "Hindu weddings fall on about 90 auspicious days a year, mostly in winter.",
        "Younger couples increasingly hire DJs instead, and the bands have felt it.",
      ],
    },
    { type: "h2", id: "khanna-bandwallahs", text: "The bandwallahs in art" },
    {
      type: "p",
      text: "Krishen Khanna made the bandsmen the subject of one of the series he is known for, the Bandwallahs, known for its bandsmen in crimson uniforms. According to his gallery it began when a wedding band blocked his car as he drove out of his Delhi studio. He has also made bandsmen in bronze, and three of his musicians are in the Sculpted India collection.",
    },
    { type: "work", slug: "khanna-patinder-rawat-trumpet-walae" },
    { type: "work", slug: "khanna-satwant-sher-singh-cymbal-walae" },
    { type: "work", slug: "khanna-untitled-horn-player" },
    {
      type: "faq",
      items: [
        {
          q: "Where do Indian wedding brass bands come from?",
          a: "Brass band music came to India with British military bands. After independence many band musicians moved to playing at weddings.",
        },
        {
          q: "What do wedding bands in India play?",
          a: "Mostly Hindi and regional film songs. In Delhi the trumpet has largely replaced the clarinet as the lead instrument.",
        },
        {
          q: "What is a bandwallah?",
          a: "A musician in one of the brass bands hired for Indian weddings and processions. The painter Krishen Khanna made them the subject of his Bandwallahs series.",
        },
      ],
    },
  ],
};

export default post;
