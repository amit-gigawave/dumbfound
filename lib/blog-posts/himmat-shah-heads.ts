import type { BlogPost } from "../blog";
import { thumb } from "./images";

// Facts: ArtAsiaPacific obituary (2025); DAG's Himmat Shah page (school,
// tools, the Lothal link, quote); Gulammohammed Sheikh in The Tribune (Baroda
// memories, the St Xavier's mural); Open, "Himmat Shah in soulful solitude"
// (Group 1890, Garhi, Jaipur, the London foundry, the KNMA retrospective);
// Wikipedia (honours).
// Disputed and left out: the years Group 1890 was founded (1962 or 1963) and
// he went to Paris (1966 or 1967).
const post: BlogPost = {
  slug: "himmat-shah-heads",
  title: "Himmat Shah: the sculptor of heads, from Lothal to Jaipur",
  description:
    "Himmat Shah (1933–2025) burned holes in paper with cigarettes, built his own tools and made the heads he is known for. His life, and three heads in the collection.",
  published: "2026-10-23",
  category: "Artists' lives",
  tags: ["Himmat Shah", "Group 1890", "Terracotta", "Indian sculpture"],
  image: thumb("head-g", "Untitled (Head G), a sculpted head by Himmat Shah"),
  workSlugs: ["head-a", "head-c", "head-g"],
  artistSlugs: ["himmat-shah"],
  sources: [
    { label: "ArtAsiaPacific (2025): Himmat Shah, 1933–2025", url: "https://artasiapacific.com/news/himmat-shah-1933-2025" },
    { label: "DAG: Himmat Shah", url: "https://dagworld.com/himmatshah.html" },
    { label: "The Tribune: Gulammohammed Sheikh on Himmat Shah", url: "https://www.tribuneindia.com/news/arts/at-home-with-terracotta-and-bronze-himmat-shah-mastered-every-medium-he-touched-writes-ghulam-mohammed-sheikh/" },
    { label: "Open: Himmat Shah in soulful solitude", url: "https://openthemagazine.com/art-culture/himmat-shah-in-soulful-solitude/" },
    { label: "Wikipedia: Himmat Shah", url: "https://en.wikipedia.org/wiki/Himmat_Shah" },
  ],
  body: [
    {
      type: "p",
      text: "[Himmat Shah](/artists/himmat-shah) was born in 1933 in Lothal, Gujarat, and died in Jaipur on 2 March 2025, aged 92. He worked in terracotta, plaster, ceramic, bronze, cement and burnt paper, but he is best known for one subject: the human head. Three of his heads are in the Sculpted India [collection](/artworks).",
    },
    { type: "h2", id: "lothal", text: "A childhood in Lothal" },
    {
      type: "p",
      text: "Lothal is an important site of the Harappan civilisation, and the gallery DAG links Shah's lifelong work in terracotta, and his heads in particular, to his birthplace. As a boy he went to the Gharshala school in Bhavnagar, where the artist and teacher Jagubhai Shah introduced him to art. Against the wishes of his Jain merchant family he went on to the J.J. School of Art in Mumbai and then to M.S. University, Baroda (1956–60).",
    },
    { type: "h2", id: "burnt-paper", text: "Burnt paper and Group 1890" },
    {
      type: "p",
      text: "The painter Gulammohammed Sheikh, who knew him at Baroda, remembers him as a star of the garba at Navratri, and as the student who burned holes in drawing paper with a lit cigarette and called them drawings. Nobody wanted to show the burnt-paper collages he made in the early 1960s until Group 1890, which he co-founded with J. Swaminathan, held its only exhibition in 1963. Through Swaminathan he met the poet Octavio Paz.",
    },
    {
      type: "p",
      text: "A French government scholarship took him to Paris to study etching at Atelier 17 under S.W. Hayter and Krishna Reddy. Back in India he designed murals in brick, cement and concrete, among them a large cast-cement mural at St Xavier's School in Ahmedabad.",
    },
    { type: "h2", id: "garhi-to-jaipur", text: "From Garhi to Jaipur" },
    {
      type: "p",
      text: "For years Shah worked from a studio at Garhi in Delhi, alongside [Krishen Khanna](/blog/krishen-khanna-life) and Sankho Chaudhuri. Asked why he left Delhi for Jaipur, he gave a one-word answer, politics, and added that he had reached a stage where he couldn't afford food.",
    },
    {
      type: "p",
      text: "Then in 2005 a client in Gurgaon commissioned a series of bronzes and lent him his kitchen and bedroom as a studio. With about Rs 50 lakh from the commission Shah bought a house in Jaipur, a city that appealed to him partly for its marble carvers and foundries. He lived there as a near-recluse, working day and night into his nineties.",
    },
    { type: "h2", id: "the-heads", text: "The heads" },
    {
      type: "p",
      text: "Shah designed his own tools for working terracotta. His heads appear in terracotta, plaster and ceramic, and later in bronze, some of them cast at a foundry in London. In 2016 the Kiran Nadar Museum of Art in Delhi gave him a retrospective, Hammer on the Square, with more than 300 works made between 1957 and 2015.",
    },
    {
      type: "quote",
      text: "The medium becomes your language and shows you the way.",
      cite: "Himmat Shah, quoted by DAG",
      url: "https://dagworld.com/himmatshah.html",
    },
    {
      type: "p",
      text: "The three heads in the collection are untitled and known by letter.",
    },
    { type: "work", slug: "head-a" },
    { type: "work", slug: "head-c" },
    { type: "work", slug: "head-g" },
    {
      type: "p",
      text: "He received the Lalit Kala Akademi's National Award in 1956 and 1962, the Kalidas Samman of Madhya Pradesh in 2003 and the Lalit Kala Akademi Fellowship in 2021.",
    },
    {
      type: "faq",
      items: [
        {
          q: "Who was Himmat Shah?",
          a: "An Indian sculptor (1933–2025) from Lothal, Gujarat, best known for his heads in terracotta, plaster, ceramic and bronze. He lived and worked in Jaipur.",
        },
        {
          q: "What was Group 1890?",
          a: "A group of Indian artists that Himmat Shah co-founded with J. Swaminathan. It held only one exhibition, in 1963.",
        },
        {
          q: "What are Himmat Shah's burnt-paper works?",
          a: "Collages he made in the early 1960s by burning paper. They were first shown in the Group 1890 exhibition of 1963.",
        },
        {
          q: "When did Himmat Shah die?",
          a: "On 2 March 2025, in Jaipur, aged 92.",
        },
      ],
    },
  ],
};

export default post;
