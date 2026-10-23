import type { BlogPost } from "../blog";
import { thumb } from "./images";

// Facts: lib/artists.ts (krishen-khanna) and its sources: Wikipedia and DAG.
// Materials: lib/sculptures.ts.
const post: BlogPost = {
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
};

export default post;
