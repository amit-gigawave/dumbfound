import type { BlogPost } from "../blog";
import { portrait } from "./images";

// Facts: DAG's Madhvi Parekh page; Scroll (2017); Business Standard (2017).
// Disputed and left out: her age at marriage (15 or 16), the year of her first
// solo show, the dates of Through the Looking Glass, and when she first saw
// The Last Supper.
const post: BlogPost = {
  slug: "madhvi-parekh-life",
  title: "Madhvi Parekh: the self-taught painter of village memory",
  description:
    "Madhvi Parekh began painting in 1964 with no training, turning memories of her Gujarat village into art. Her story, from Klee exercises to a DAG retrospective.",
  published: "2026-10-23",
  category: "Artists' lives",
  tags: ["Madhvi Parekh", "Self-taught artists", "Indian women artists", "Folk art"],
  image: portrait("madhvi-parekh", "Madhvi Parekh, Indian painter", {
    text: "Photo: Ministry of Culture / PIB, 2007, GODL-India, via Wikimedia Commons",
    url: "https://commons.wikimedia.org/wiki/File:Madhavi_Parekh.jpg",
  }),
  artistSlugs: ["madhvi-parekh"],
  sources: [
    { label: "DAG: Madhvi Parekh", url: "https://dagworld.com/madhviparekh.html" },
    { label: "Scroll (2017): Madhvi Parekh", url: "https://scroll.in/magazine/851557/scroll_in" },
    { label: "Business Standard (2017): The journey of self-taught artist Madhvi Parekh", url: "https://www.business-standard.com/article/current-affairs/the-journey-of-self-taught-artist-madhvi-parekh-117102000808_1.html" },
  ],
  body: [
    {
      type: "p",
      text: "[Madhvi Parekh](/artists/madhvi-parekh) was born in 1942 in Sanjaya, a village in Gujarat. She never went to art school. She began painting in her twenties, encouraged by her husband, the painter Manu Parekh, and built a career of more than five decades out of the stories, animals and festivals of the village she grew up in.",
    },
    { type: "h2", id: "early-life", text: "A village childhood and an early marriage" },
    {
      type: "p",
      text: "She was engaged to Manu Parekh at the age of nine and married him as a teenager, though the couple did not live together for the first five years. Manu remembers visiting her village and finding a tomboy who wouldn't come out to wave him goodbye. Her family's rangoli floor designs, folk stories and village life kept art in her mind from childhood.",
    },
    { type: "h2", id: "first-paintings", text: "Circles, triangles and squares" },
    {
      type: "p",
      text: "While she was expecting their first daughter, Manisha, Manu gave her drawing exercises based on Paul Klee: circles, triangles and squares. Within days she was doing them her own way. As Manu tells it, the square became a face and the triangle a body, then she added a tail and whiskers and made an animal. The day after Manisha was born, she showed him her work. She began painting in 1964.",
    },
    {
      type: "quote",
      text: "You can't eat dal-chawal every day, can you?",
      cite: "Madhvi Parekh on outgrowing the Klee exercises, Scroll",
      url: "https://scroll.in/magazine/851557/scroll_in",
    },
    { type: "h2", id: "village-memory", text: "Memory like a film reel" },
    {
      type: "p",
      text: "She says her ideas come from her village childhood, playing back like a film reel: cows calving, dogs having pups. She often borrows the layout of Kalamkari and Pichwai textiles, with a main figure in the centre and smaller ones filling the borders, and from a distance the dense dots and dashes of her early paintings can look like Kantha embroidery.",
    },
    {
      type: "p",
      text: "Other artists passed on tricks. Bhupen Khakhar taught her to paint white over a mistake and start again, which made her colours brighter. Nalini Malani taught her reverse painting, which she used for almost all of her Last Supper series, painted on large acrylic sheets.",
    },
    { type: "h2", id: "recognition", text: "Recognition" },
    {
      type: "p",
      text: "She won the Lalit Kala Akademi's National Award in 1979. With Nalini Malani, Arpita Singh and Nilima Sheikh she took part in the touring exhibition Through the Looking Glass, and the four artists travelled across India by train with it. In 2017 DAG opened a retrospective, The Curious Seeker, in New Delhi, with about seventy works from five decades; it went on to Mumbai in 2018 and New York in 2019. A 1992 documentary by Suraj Purohit, Dwitya, is about Madhvi and Manu Parekh.",
    },
    {
      type: "faq",
      items: [
        {
          q: "Is Madhvi Parekh self-taught?",
          a: "Yes. She never trained at an art school and began painting in 1964, encouraged by her husband, the painter Manu Parekh.",
        },
        {
          q: "Where is Madhvi Parekh from?",
          a: "She was born in 1942 in Sanjaya, a village in Gujarat, and her paintings draw on memories of village life there.",
        },
        {
          q: "What influences Madhvi Parekh's art?",
          a: "Her village childhood, her family's rangoli designs and folk stories, and the layouts of Kalamkari and Pichwai textiles.",
        },
        {
          q: "What is Madhvi Parekh's Last Supper series?",
          a: "A series of reverse paintings on acrylic sheets, a technique she learned from Nalini Malani.",
        },
      ],
    },
  ],
};

export default post;
