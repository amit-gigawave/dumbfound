import type { BlogPost } from "../blog";
import { portrait } from "./images";

// Facts: Wikipedia; Open, "Krishen Khanna: the underrated modernist"; ICCR
// (Truckwallahs); Grosvenor Gallery catalogue, 2015 (the Bandwallahs story);
// The Week / PTI, July 2025 (turning 100); Saffronart's reprint of a January
// 2010 press interview (the bank interview, "refugee" quote, Husain's joke).
// Disputed and left out: when the Bandwallahs began (1970s or 1980s).
const post: BlogPost = {
  slug: "krishen-khanna-life",
  title: "Krishen Khanna at 100: from bank officer to painter",
  description:
    "Krishen Khanna turned 100 in 2025. The story of the Partition refugee who painted at night while working at a bank, and the Truckwallahs and Bandwallahs.",
  published: "2026-10-23",
  category: "Artists' lives",
  tags: ["Krishen Khanna", "Progressive Artists' Group", "Indian modern art", "Partition"],
  image: portrait("krishen-khanna", "Krishen Khanna, Indian painter, in 2011", {
    text: "Photo: Ministry of Culture / PIB, 2011, GODL-India, via Wikimedia Commons",
    url: "https://commons.wikimedia.org/wiki/File:Krishen_Khanna.jpg",
  }),
  workSlugs: ["khanna-satwant-sher-singh-cymbal-walae", "khanna-patinder-rawat-trumpet-walae"],
  artistSlugs: ["krishen-khanna"],
  sources: [
    { label: "Wikipedia: Krishen Khanna", url: "https://en.wikipedia.org/wiki/Krishen_Khanna" },
    { label: "Open: Krishen Khanna, the underrated modernist", url: "https://openthemagazine.com/art-culture/krishen-khanna-the-underrated-modernist/" },
    { label: "ICCR: Krishen Khanna", url: "https://iccr.gov.in/node/96207" },
    { label: "Grosvenor Gallery: Krishen Khanna catalogue (2015)", url: "https://www.grosvenorgallery.com/usr/admin/records/documents.catalogues/e-catalogue-krishen-khanna.pdf" },
    { label: "The Week (PTI), July 2025: Krishen Khanna at 100", url: "https://www.theweek.in/wire-updates/national/2025/07/10/lst3-art-krishen-khanna-advise.html" },
    { label: "Saffronart: press interview with Krishen Khanna (2010)", url: "https://www.saffronart.com/sitepages/newsdetails.aspx?newsid=214" },
  ],
  body: [
    {
      type: "p",
      text: "[Krishen Khanna](/artists/krishen-khanna) was born on 5 July 1925 in Lyallpur, now Faisalabad in Pakistan, and turned 100 in July 2025. He is the last surviving member of the Progressive Artists' Group, and at 100 he still draws and paints at home in Gurugram. His life runs through Partition, fourteen years in a bank, and the Truckwallahs and Bandwallahs.",
    },
    { type: "h2", id: "school-in-england", text: "A schoolboy in England" },
    {
      type: "p",
      text: "In 1938, aged 13, Khanna won a Rudyard Kipling Scholarship to the Imperial Service College in England. It was there that he studied art for the first time.",
    },
    { type: "h2", id: "partition", text: "Partition" },
    {
      type: "p",
      text: "On 12 August 1947, days before independence, his family left Lahore during the riots and settled in Shimla. Partition became a theme he returned to again and again in his painting.",
    },
    {
      type: "quote",
      text: "I've been a refugee forever.",
      cite: "Krishen Khanna, interviewed in 2010 (reprinted by Saffronart)",
      url: "https://www.saffronart.com/sitepages/newsdetails.aspx?newsid=214",
    },
    { type: "h2", id: "grindlays-bank", text: "Fourteen years at Grindlays Bank" },
    {
      type: "p",
      text: "In 1948 Khanna became an officer at Grindlays Bank in Bombay, and in 1953 he was transferred to Madras. He later said he owed the job partly to someone recognising his school tie. For fourteen years he could only paint at night: in Madras he worked in one long sitting from 9 in the evening to 3 in the morning, straight onto the canvas, without preliminary sketches.",
    },
    {
      type: "p",
      text: "He was already selling. His first sale, Spring Nude, went to the physicist Homi Bhabha for Rs 225. An early painting, News of Gandhi's Death (about 1950), shows people reading the news on a Delhi traffic island, and it made his name.",
    },
    { type: "h2", id: "leaving-the-bank", text: "Walking out of the bank" },
    {
      type: "p",
      text: "In 1961 he quit the bank to paint full-time, with about Rs 25,000 in savings. As he walked out on his last day, the filmmaker Bal Chhabda took off Khanna's tie and told him he wouldn't need it any more. His friend M.F. Husain joked that when Khanna turned painter, they lost an important collector.",
    },
    {
      type: "p",
      text: "A Rockefeller Fellowship took him to the United States in 1962–64, and his work became more figurative after that time.",
    },
    { type: "h2", id: "truckwallahs-and-bandwallahs", text: "The Truckwallahs and the Bandwallahs" },
    {
      type: "p",
      text: "The Truckwallahs, painted in the early 1970s, grew out of the street life of a fast-growing Delhi. Khanna painted them almost entirely in greys, and explained that the labourers riding in the backs of trucks took on the colour of the cargo they carried.",
    },
    {
      type: "p",
      text: "The Bandwallahs, known for bandsmen in crimson uniforms, began with a traffic jam: according to his gallery, a wedding procession's brass band blocked his car as he drove out of his Delhi studio. He has also made Bandwallah figures in bronze. Two of them, a cymbal player and a trumpet player, are in the Sculpted India collection (see [Krishen Khanna's musicians](/blog/krishen-khanna-sculptures)), and the bands themselves have [a story of their own](/blog/india-wedding-brass-bands).",
    },
    { type: "work", slug: "khanna-satwant-sher-singh-cymbal-walae" },
    { type: "work", slug: "khanna-patinder-rawat-trumpet-walae" },
    { type: "h2", id: "the-great-procession", text: "The Great Procession" },
    {
      type: "p",
      text: "In New Delhi, The Great Procession is a mural covering the 3,000 sq ft ceiling dome in the lobby of the ITC Maurya hotel in New Delhi. It took him more than two years to paint.",
    },
    { type: "h2", id: "honours", text: "Honours" },
    {
      type: "p",
      text: "Khanna received the Padma Shri in 1990, the Lalit Kala Ratna in 2004 and the Padma Bhushan in 2011. In July 2025 the Raza Foundation marked his hundredth birthday with a tribute at the India International Centre in New Delhi.",
    },
    {
      type: "faq",
      items: [
        {
          q: "How old is Krishen Khanna?",
          a: "Krishen Khanna was born on 5 July 1925, so he turned 100 in July 2025.",
        },
        {
          q: "Was Krishen Khanna a member of the Progressive Artists' Group?",
          a: "He joined the group after it was founded, and he is now its last surviving member.",
        },
        {
          q: "Why did Krishen Khanna work at a bank?",
          a: "He worked at Grindlays Bank from 1948, painting at night, until 1961, when he left to paint full-time.",
        },
        {
          q: "What are Krishen Khanna's Bandwallahs?",
          a: "A series of paintings, and later bronzes, of the brass-band musicians who play at Indian weddings. His gallery says it began when a wedding band blocked his car outside his Delhi studio.",
        },
      ],
    },
  ],
};

export default post;
