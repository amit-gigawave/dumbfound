import type { BlogPost } from "../blog";
import { portrait } from "./images";

// Facts: DAG's Jogen Chowdhury page; The Daily Star interview; President of
// India press release, August 2014 (Keeper (Art), artist in residence);
// Deccan Herald, February 2014 (Rajya Sabha).
// Disputed and left out: his birth date (15 or 19 February), the name of the
// Delhi gallery he co-founded, and his family's route out of Faridpur.
const post: BlogPost = {
  slug: "jogen-chowdhury-life",
  title: "Jogen Chowdhury: from Faridpur to Rashtrapati Bhavan",
  description:
    "Jogen Chowdhury's life, from a village in Bengal through Partition, Paris and fifteen years looking after the art at Rashtrapati Bhavan, and his cross-hatched line.",
  published: "2026-10-23",
  category: "Artists' lives",
  tags: ["Jogen Chowdhury", "Santiniketan", "Indian modern art", "Bengal"],
  image: portrait("jogen-chowdhury", "Jogen Chowdhury, Indian painter", {
    text: "Photo: Biswarup Ganguly, CC BY-SA 3.0, via Wikimedia Commons",
    url: "https://commons.wikimedia.org/wiki/File:Jogen_Chowdhury_4202.JPG",
  }),
  artistSlugs: ["jogen-chowdhury"],
  sources: [
    { label: "DAG: Jogen Chowdhury", url: "https://dagworld.com/jogenchowdhury.html" },
    { label: "The Daily Star: interview with Jogen Chowdhury", url: "https://www.thedailystar.net/arts-entertainment/interview/appreciation-art-inherent-person-1344451" },
    { label: "President of India (2014): Shri Jogen Chowdhary to be first artist in residence at Rashtrapati Bhavan", url: "https://presidentofindia.nic.in/pranab-mukherjee/press_releases/shri-jogen-chowdhary-be-first-artist-residence-rashtrapati-bhavan" },
    { label: "Deccan Herald (2014): Mithun, Jogen elected to Rajya Sabha", url: "https://www.deccanherald.com/india/mithun-jogen-elected-rajya-sabha-2175624" },
  ],
  body: [
    {
      type: "p",
      text: "[Jogen Chowdhury](/artists/jogen-chowdhury) was born in 1939 in Daharpara, a village in the Faridpur district of Bengal, now in Bangladesh. He went on to study in Paris, look after the art collection of the President of India for fifteen years, teach at Santiniketan and sit in Parliament, and through all of it he kept drawing in the dense, cross-hatched ink line his work is known for.",
    },
    { type: "h2", id: "faridpur-and-partition", text: "Faridpur and Partition" },
    {
      type: "p",
      text: "After Partition his family moved to Calcutta, and in 1951 they settled in Dhakuria. Chowdhury has said that Partition left deep feelings in him as a child, and that the water, the landscape and the culture of Faridpur shaped him. That memory fed a series of thirty paintings, Reminiscence of a Dream.",
    },
    { type: "h2", id: "calcutta-and-paris", text: "From art college in Calcutta to Paris" },
    {
      type: "p",
      text: "At the Government College of Art & Craft in Calcutta (1955–60) he became a keen follower of world cinema, and in 1959 he won a gold medal for watercolour. From 1965 to 1967 he studied in Paris, at the École des Beaux-Arts and in S.W. Hayter's Atelier 17, and in 1966 he won the Prix de la Jeune Peinture. Back in India he worked as a textile designer in Madras from 1968 to 1972, and in 1970 he published a book of poems, Hridoy Train Beje Othey.",
    },
    { type: "h2", id: "rashtrapati-bhavan", text: "Keeper of the President's art" },
    {
      type: "p",
      text: "From 1972 to 1987 Chowdhury looked after the art at Rashtrapati Bhavan in New Delhi; his official title was Keeper (Art). He painted late into the night after work. During the Emergency of 1975–77 he painted Tiger in the Moonlight as a protest; it is now in the National Gallery of Modern Art, New Delhi.",
    },
    {
      type: "p",
      text: "In August 2014 he returned to Rashtrapati Bhavan as its first artist in residence, for a fourteen-day stay.",
    },
    { type: "h2", id: "the-line", text: "The cross-hatched line" },
    {
      type: "p",
      text: "His style rests on dense, cross-hatched lines of ink that suggest body hair and webs of veins, roughening the smooth body of classical art.",
    },
    {
      type: "quote",
      text: "There is no fun in direct statements; the fun is in suggestion.",
      cite: "Jogen Chowdhury, The Daily Star",
      url: "https://www.thedailystar.net/arts-entertainment/interview/appreciation-art-inherent-person-1344451",
    },
    { type: "h2", id: "santiniketan-and-parliament", text: "Santiniketan and Parliament" },
    {
      type: "p",
      text: "In 1987 he joined Kala Bhavana at Santiniketan as professor of painting, and he is now Professor Emeritus of Visva-Bharati. In 2014 he was elected to the Rajya Sabha from West Bengal. In 2019 he opened Charubasona, a five-storey Jogen Chowdhury Centre for Arts in Kolkata. His honours include the Kalidas Samman (2001).",
    },
    {
      type: "faq",
      items: [
        {
          q: "Who is Jogen Chowdhury?",
          a: "An Indian painter born in 1939 in Faridpur, now in Bangladesh, known for his dense, cross-hatched ink drawings and paintings of the human figure.",
        },
        {
          q: "What did Jogen Chowdhury do at Rashtrapati Bhavan?",
          a: "From 1972 to 1987 he looked after its art collection as Keeper (Art). In 2014 he was its first artist in residence.",
        },
        {
          q: "Where did Jogen Chowdhury study?",
          a: "At the Government College of Art & Craft, Calcutta (1955–60), and in Paris at the École des Beaux-Arts and Atelier 17 (1965–67).",
        },
        {
          q: "Was Jogen Chowdhury a member of Parliament?",
          a: "Yes. He was elected to the Rajya Sabha from West Bengal in 2014.",
        },
      ],
    },
  ],
};

export default post;
