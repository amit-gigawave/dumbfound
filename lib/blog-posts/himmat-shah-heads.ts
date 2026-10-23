import type { BlogPost } from "../blog";
import { thumb } from "./images";

// Facts: lib/artists.ts (himmat-shah) and its sources: Wikipedia, the
// ArtAsiaPacific obituary and Black Cube Gallery.
const post: BlogPost = {
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
};

export default post;
