import type { BlogPost } from "../blog";
import { thumb } from "./images";

// Facts: Dallas Museum of Art blog (the steps, why each bronze is unique, why
// the Cholas cast); Wikipedia: Lost-wax casting, Dancing Girl, Chola art,
// Swamimalai Bronze Icons, Dhokra; The Federal (Swamimalai today).
// Disputed and left out: the Dancing Girl's date, the number of Swamimalai
// artisans, the Swamimalai wax recipe and alloy percentages.
const post: BlogPost = {
  slug: "lost-wax-casting-india",
  title: "Lost-wax casting: how India's bronze sculptures are made",
  description:
    "From the Mohenjo-daro Dancing Girl to Chola bronzes and Swamimalai today: how lost-wax casting works, step by step, and why every cast bronze is unique.",
  published: "2026-10-23",
  category: "Art explained",
  tags: ["Lost-wax casting", "Bronze sculpture", "Chola bronzes", "Swamimalai", "Dhokra"],
  image: thumb(
    "khanna-satwant-sher-singh-cymbal-walae",
    "Satwant Sher Singh Cymbal Walae, a bronze sculpture by Krishen Khanna",
  ),
  workSlugs: ["khanna-satwant-sher-singh-cymbal-walae", "khanna-patinder-rawat-trumpet-walae"],
  artistSlugs: ["krishen-khanna"],
  sources: [
    { label: "Dallas Museum of Art: the lost-wax process", url: "https://blog.dma.org/?p=16387" },
    { label: "Wikipedia: Lost-wax casting", url: "https://en.wikipedia.org/wiki/Lost-wax_casting" },
    { label: "Wikipedia: Dancing Girl", url: "https://en.wikipedia.org/wiki/Dancing_Girl_(prehistoric_sculpture)" },
    { label: "Wikipedia: Chola art", url: "https://en.wikipedia.org/wiki/Chola_art" },
    { label: "Wikipedia: Swamimalai Bronze Icons", url: "https://en.wikipedia.org/wiki/Swamimalai_Bronze_Icons" },
    { label: "The Federal: the lost-wax artisans of Swamimalai", url: "https://thefederal.com/category/the-eighth-column/lost-wax-casting-technique-tamil-nadu-swamimalai-artisans-cholas-sculptures-197896" },
    { label: "Wikipedia: Dhokra", url: "https://en.wikipedia.org/wiki/Dhokra" },
  ],
  body: [
    {
      type: "p",
      text: "Lost-wax casting, called cire perdue in French and investment casting in industry, is one of the oldest ways of making sculpture in India, behind bronzes from a tiny figure found at Mohenjo-daro to the Chola Natarajas and the bronzes still made in Tamil Nadu today. The idea is simple: make the sculpture in wax, wrap it in clay, melt the wax out and pour metal in where it was.",
    },
    { type: "h2", id: "step-by-step", text: "How lost-wax casting works, step by step" },
    {
      type: "ol",
      items: [
        "The sculptor models the figure in a mix of beeswax and resin, softening it with heat and hardening it in cold water.",
        "Wax channels, called sprues, are added so that the molten metal can flow in later.",
        "The wax figure is covered in layers of clay, leaving an opening.",
        "Once the clay is dry it is fired. The heat hardens the mould and melts and burns away the wax: this is the wax that is lost.",
        "Molten metal, an alloy of copper, lead and tin, sometimes with a little gold or silver, is poured into the empty mould.",
        "When the metal has cooled, the clay is broken away.",
        "The sprues are cut off and the bronze is sanded, polished and waxed.",
      ],
    },
    { type: "h2", id: "every-bronze-unique", text: "Why every lost-wax bronze is unique" },
    {
      type: "p",
      text: "The clay mould has to be broken to get the bronze out, so it can never be used again. Every bronze made this way is the only one of its kind.",
    },
    { type: "h2", id: "dancing-girl", text: "The Dancing Girl of Mohenjo-daro" },
    {
      type: "p",
      text: "An early example is the Dancing Girl, a bronze figure just 10.5 cm tall from the Indus Valley city of Mohenjo-daro, cast by the lost-wax method. The archaeologist Ernest Mackay excavated it in 1926. When the finds from Mohenjo-daro were divided between India and Pakistan, the Priest-King went to Pakistan and India kept the Dancing Girl, which is now in the National Museum, New Delhi.",
    },
    { type: "h2", id: "chola-bronzes", text: "Chola bronzes" },
    {
      type: "p",
      text: "The Chola dynasty ruled much of south India from about 850 to 1250 CE. Around the 10th century temples needed images of the gods that could be carried out in procession, and many Chola bronzes have lugs and holes in their bases for carrying poles. Among them are the Chola images of Shiva as [Nataraja, Lord of the Dance](/blog/nataraja-meaning).",
    },
    { type: "h2", id: "swamimalai", text: "Swamimalai: a living tradition" },
    {
      type: "p",
      text: "In Swamimalai, in Tamil Nadu, bronze icons are still cast by lost wax, and Swamimalai Bronze Icons are a registered Geographical Indication. The craftsmen, called sthapathis, trace their descent to the sculptors the Chola king Raja Raja I commissioned for the Brihadisvara temple at Thanjavur. For the fine inner layer of the mould they use alluvial soil from the bed of the Kaveri river, mixed with charred rice husk and cow dung. The mould is cured in the sun for about a week and fired with cow-dung cakes and firewood, the metal is poured into the warmed mould, and the finished bronze is given a patina with materials such as tamarind.",
    },
    { type: "h2", id: "dhokra", text: "Dhokra" },
    {
      type: "p",
      text: "Dhokra is another lost-wax tradition, in non-ferrous metal, mostly in central and eastern India. It takes its name from the Dhokra Damar tribes of Odisha and West Bengal. Dhokra pieces are usually cast hollow around a clay core, and typical subjects are horses, elephants, owls and deities. Bengal Dokra and Adilabad Dokra from Telangana received Geographical Indication tags in 2018.",
    },
    { type: "h2", id: "bronze-in-the-collection", text: "Bronze in the collection" },
    {
      type: "p",
      text: "Bronze is still a sculptor's material. In the Sculpted India collection, [Krishen Khanna](/blog/krishen-khanna-life)'s musicians Satwant Sher Singh Cymbal Walae and Patinder Rawat Trumpet Walae are both in bronze.",
    },
    { type: "work", slug: "khanna-satwant-sher-singh-cymbal-walae" },
    { type: "work", slug: "khanna-patinder-rawat-trumpet-walae" },
    {
      type: "faq",
      items: [
        {
          q: "What is lost-wax casting?",
          a: "A way of casting metal sculpture: the figure is modelled in wax and covered in clay, the wax is melted out, and molten metal is poured into the space it leaves.",
        },
        {
          q: "Why is every lost-wax bronze unique?",
          a: "Because the clay mould has to be broken to free the bronze, so it can never be reused.",
        },
        {
          q: "Where in India are bronzes still made by lost-wax casting?",
          a: "Swamimalai in Tamil Nadu is a well-known centre, and Dhokra lost-wax casting is practised mostly in central and eastern India.",
        },
        {
          q: "What is the Dancing Girl of Mohenjo-daro?",
          a: "A 10.5 cm bronze figure from the Indus Valley city of Mohenjo-daro, made by lost-wax casting and excavated in 1926. It is in the National Museum, New Delhi.",
        },
      ],
    },
  ],
};

export default post;
