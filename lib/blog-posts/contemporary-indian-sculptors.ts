import type { BlogPost } from "../blog";
import { thumb } from "./images";

// Facts: lib/artists.ts (meena-sansanwal, subba-ghosh, yashika-sugandh) and
// their sources: Saffronart, Outlook Luxe, Black Cube Gallery, Esquire India.
// Titles, years and materials: lib/sculptures.ts.
const post: BlogPost = {
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
};

export default post;
