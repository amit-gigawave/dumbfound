import type { BlogPost } from "../blog";
import { thumb } from "./images";

// Facts: Kashmir Life, "Papier mache: an introduction" (stages, history,
// motifs); the Kashmir Paper Machie GI-1 application (TAHAFUZ); Wikipedia,
// "Papier-mâché" (the Hamadani account, Shah Hamdan mosque, Ladakh).
// Contemporary artists and works: lib/artists.ts and lib/sculptures.ts.
// Disputed and left out: which community does which stage, the GI
// registration number and date, pulp recipes, other states' traditions.
const post: BlogPost = {
  slug: "papier-mache-india",
  title: "Papier-mâché in India: from Kashmir's pen cases to sculpture",
  description:
    "How Kashmiri papier-mâché is made in two stages, sakhtasazi and naqashi, where the craft came from, and how contemporary Indian sculptors use paper today.",
  published: "2026-10-23",
  category: "Art explained",
  tags: ["Papier-mâché", "Kashmir", "Indian crafts", "Contemporary Indian sculpture"],
  image: thumb("meditating", "Levitation, a papier-mâché sculpture by Meena Sansanwal"),
  workSlugs: ["meditating", "head-e"],
  artistSlugs: ["meena-sansanwal", "subba-ghosh"],
  sources: [
    { label: "Kashmir Life: Papier mache, an introduction", url: "https://kashmirlife.net/papier-mache-an-introduction-vol-15-issue-51-346737/" },
    { label: "Geographical Indication application: Kashmir Paper Machie", url: "https://origin-gi.com/wp-content/uploads/2017/01/139-kashmir-paper-machie.pdf" },
    { label: "Wikipedia: Papier-mâché", url: "https://en.wikipedia.org/wiki/Papier-m%C3%A2ch%C3%A9" },
    { label: "Saffronart: Meena Sansanwal", url: "https://www.saffronart.com/artists/meena--sansanwal" },
  ],
  body: [
    {
      type: "p",
      text: "Papier-mâché, sculpture made from paper, has been made in Kashmir for centuries, into painted boxes, bowls, trays, vases and lamps. Today the same humble material, paper pulp, also turns up in the work of contemporary Indian sculptors.",
    },
    { type: "h2", id: "kashmiri-papier-mache", text: "How Kashmiri papier-mâché is made" },
    {
      type: "p",
      text: "The craft has two stages.",
    },
    {
      type: "ul",
      items: [
        "Sakhtasazi makes the object itself. Scraps of paper, often waste from printing presses, are softened in water, shaped over moulds, dried, cut and glued.",
        "Naqashi is the painting and decoration, done freehand, sometimes with gold or silver.",
      ],
    },
    {
      type: "p",
      text: "Classic Kashmiri motifs include Hazara, a thousand flowers, and Gul-i-Ander-Gul, a flower within a flower.",
    },
    { type: "h2", id: "history", text: "Where Kashmiri papier-mâché came from" },
    {
      type: "p",
      text: "There are two accounts of how the craft reached Kashmir. Historians cited by Kashmir Life link it to Sultan Zain-ul-Abidin in the 15th century, who brought craftsmen from Samarkand. Another account credits the Sufi Mir Sayyid Ali Hamadani, who is said to have brought it in the 14th century. The finest early pieces were pen cases, kalamdan, which is why the craft was called kar-i-kalamdan.",
    },
    {
      type: "p",
      text: "It flourished under Mughal rule, and in the 18th century Kashmiri shawls were sent to France packed in papier-mâché boxes. The Shah Hamdan mosque in Srinagar is known for its papier-mâché ceilings and walls.",
    },
    { type: "h2", id: "geographical-indication", text: "A protected name" },
    {
      type: "p",
      text: "Kashmir Paper Machie is a registered Geographical Indication, protected under India's GI Act of 1999. The application was filed by TAHAFUZ, a society of Srinagar artisans, and describes a base of paper pulp, paper board or light wood, smoothed and then hand-painted with Kashmiri motifs.",
    },
    { type: "h2", id: "ladakh", text: "Beyond Kashmir" },
    {
      type: "p",
      text: "In Ladakh, paper pulp mixed with clay, cotton, flour and glue is used to make masks and statues for the monasteries.",
    },
    { type: "h2", id: "contemporary-sculpture", text: "Papier-mâché in contemporary Indian sculpture" },
    {
      type: "p",
      text: "Some contemporary sculptors have taken up the material. [Meena Sansanwal](/artists/meena-sansanwal), whose work centres on feminine divinity, has worked in papier-mâché since 2016; her [Levitation](/artworks/meditating) combines papier-mâché, marble and acrylic paint. [Subba Ghosh](/artists/subba-ghosh)'s untitled head in the collection mixes papier-mâché with fibreglass, resin, and oil and acrylic paint. You can read more about both in [Contemporary Indian sculpture: three artists to know](/blog/contemporary-indian-sculptors).",
    },
    { type: "work", slug: "meditating" },
    { type: "work", slug: "head-e" },
    {
      type: "faq",
      items: [
        {
          q: "How is Kashmiri papier-mâché made?",
          a: "In two stages: sakhtasazi, in which softened paper is shaped over moulds, dried, cut and glued, and naqashi, the freehand painting and decoration.",
        },
        {
          q: "Who brought papier-mâché to Kashmir?",
          a: "Accounts differ. One links it to Sultan Zain-ul-Abidin in the 15th century, who brought craftsmen from Samarkand; another credits the Sufi Mir Sayyid Ali Hamadani in the 14th century.",
        },
        {
          q: "Does Kashmiri papier-mâché have a GI tag?",
          a: "Yes. Kashmir Paper Machie is a registered Geographical Indication under India's GI Act of 1999.",
        },
        {
          q: "Do contemporary artists use papier-mâché?",
          a: "Yes. Meena Sansanwal has worked in papier-mâché since 2016, and Subba Ghosh combines it with fibreglass and resin.",
        },
      ],
    },
  ],
};

export default post;
