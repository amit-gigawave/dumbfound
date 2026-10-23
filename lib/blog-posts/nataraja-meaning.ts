import type { BlogPost } from "../blog";
import { thumb } from "./images";

// Facts: Cleveland Museum of Art (1930.331); V&A (O62323); UCLA Center for
// India and South Asia, "Nataraja"; Wikipedia, "Nataraja" (prabha mandala,
// ananda tandava); CERN video records 782057 (2004 unveiling) and 2297661
// (gift, plaque).
// Disputed and left out: who first linked the dance to particle physics, the
// exact donor of the CERN statue, and whether the bronze form began under the
// Pallavas or the Cholas.
const post: BlogPost = {
  slug: "nataraja-meaning",
  title: "Nataraja meaning: Shiva's dance of creation explained",
  description:
    "The ring of fire, the drum, the raised foot and the dwarf: what each part of Shiva as Nataraja, Lord of the Dance, means, from Chola bronzes to CERN.",
  published: "2026-10-23",
  category: "Art explained",
  tags: ["Nataraja", "Shiva", "Chola bronzes", "Hindu iconography", "Indian sculpture"],
  image: thumb("dancing-shiva", "Dancing Shiva, a sculpture by Thota Vaikuntam"),
  workSlugs: ["dancing-shiva"],
  artistSlugs: ["thota-vaikuntam"],
  sources: [
    { label: "Cleveland Museum of Art: Shiva as Lord of the Dance (Nataraja)", url: "https://www.clevelandart.org/art/1930.331" },
    { label: "V&A: Shiva Nataraja", url: "https://collections.vam.ac.uk/item/O62323/shiva-nataraja-figure-unknown/" },
    { label: "UCLA Center for India and South Asia: Nataraja", url: "https://southasia.ucla.edu/religions/avatars-divinities/nataraja" },
    { label: "Wikipedia: Nataraja", url: "https://en.wikipedia.org/wiki/Nataraja" },
    { label: "CERN (2004): unveiling of the statue of Shiva", url: "https://videos.cern.ch/record/782057" },
    { label: "CERN: the Shiva statue", url: "https://videos.cern.ch/record/2297661" },
  ],
  body: [
    {
      type: "p",
      text: "Nataraja is Shiva as Lord of the Dance. In a single figure the image shows the god dancing the universe into being, keeping it going and destroying it, over and over. Here is what each part of the image means, and where it comes from.",
    },
    { type: "h2", id: "the-dance", text: "The dance of bliss" },
    {
      type: "p",
      text: "The dance is called the ananda tandava, the dance of bliss. Through it Shiva creates, maintains and destroys the universe in endless cycles. It is also read as the five divine acts: creation, preservation, destruction, illusion and release.",
    },
    { type: "h2", id: "what-each-part-means", text: "What each part of the Nataraja means" },
    {
      type: "ul",
      items: [
        "The ring of fire around him, the prabha mandala, is the cosmic fire that creates and consumes everything.",
        "The drum in his upper right hand beats out the rhythm of time.",
        "The flame in his upper left hand stands for destruction.",
        "His lower right hand, raised with the palm outward, is the abhaya mudra: it tells devotees not to be afraid.",
        "His lower left hand points to his raised left foot, which offers release and liberation to those who worship him.",
        "Under his other foot is a dwarf, Apasmara, who stands for ignorance. Shiva dances on him.",
        "His locks of hair fly out to either side with the energy of the dance. Among them sit a cobra, a skull and the small figure of the river goddess Ganga.",
      ],
    },
    { type: "h2", id: "chidambaram-and-the-cholas", text: "Chidambaram and the Chola bronzes" },
    {
      type: "p",
      text: "Nataraja is the central deity of the great temple at Chidambaram in Tamil Nadu. The finest Nataraja images are bronzes made under the Chola dynasty of south India. One in the Cleveland Museum of Art, dated to the 1000s, is 113 cm high. In some, like one in the V&A in London, the flying locks of hair were cast separately and riveted on. Bronzes like these were made by [lost-wax casting](/blog/lost-wax-casting-india).",
    },
    { type: "h2", id: "nataraja-at-cern", text: "Nataraja at CERN" },
    {
      type: "p",
      text: "A two-metre statue of Shiva as Nataraja stands at CERN, the European particle physics laboratory near Geneva. It was unveiled on 18 June 2004 by CERN's Director-General Robert Aymar, India's ambassador K.M. Chandrasekhar and Anil Kakodkar of India's Atomic Energy Commission. CERN describes it as a gift from India marking an association that began in the 1960s, and a plaque beside it explains the belief that Shiva danced the universe into existence and will one day bring it to an end.",
    },
    { type: "h2", id: "dancing-shiva-today", text: "Dancing Shiva today" },
    {
      type: "p",
      text: "Artists still take up the subject. In the Sculpted India collection, [Thota Vaikuntam](/artists/thota-vaikuntam), better known for painting the village life of Telangana, has made his own [Dancing Shiva](/artworks/dancing-shiva).",
    },
    { type: "work", slug: "dancing-shiva" },
    {
      type: "faq",
      items: [
        {
          q: "What does Nataraja mean?",
          a: "Nataraja is Shiva as Lord of the Dance. The image shows him dancing the universe into being, sustaining it and destroying it in endless cycles.",
        },
        {
          q: "What does the ring of fire around Nataraja mean?",
          a: "The ring of fire, or prabha mandala, is the cosmic fire that creates and consumes everything.",
        },
        {
          q: "Who is the dwarf under Nataraja's foot?",
          a: "Apasmara, who stands for ignorance. Shiva dances on him.",
        },
        {
          q: "Where is Nataraja worshipped?",
          a: "Nataraja is the central deity of the temple at Chidambaram in Tamil Nadu.",
        },
        {
          q: "Why is there a Nataraja statue at CERN?",
          a: "A two-metre statue of Shiva as Nataraja was unveiled at CERN in 2004. CERN describes it as a gift from India marking an association that began in the 1960s.",
        },
      ],
    },
  ],
};

export default post;
