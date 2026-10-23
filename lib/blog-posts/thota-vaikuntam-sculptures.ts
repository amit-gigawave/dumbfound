import type { BlogPost } from "../blog";
import { thumb } from "./images";

// Facts: lib/artists.ts (thota-vaikuntam) and its sources: Saffronart, DAG,
// AstaGuru, Open (2022), Deccan Chronicle (2026), Wikipedia (36th National
// Film Awards). Design Democracy: lib/events.ts.
const post: BlogPost = {
  slug: "thota-vaikuntam-sculptures",
  title: "Thota Vaikuntam's sculptures of Telangana village life",
  description:
    "Thota Vaikuntam is known for painting the women and men of rural Telangana. See how he carries them into sculpture, with four works from the collection.",
  published: "2026-10-23",
  category: "Artists",
  tags: ["Thota Vaikuntam", "Telangana", "Indian sculpture", "Contemporary Indian art"],
  image: thumb("dancing-shiva", "Dancing Shiva, a sculpture by Thota Vaikuntam"),
  workSlugs: ["telangana-woman", "lord-krishna", "sacred-gaze", "dancing-shiva"],
  artistSlugs: ["thota-vaikuntam"],
  sources: [
    { label: "DAG: Thota Vaikuntam", url: "https://dagworld.com/thota-vaikuntam.html" },
    {
      label: "Deccan Chronicle (2026): Thota Vaikuntam on turning Telangana's everyday lives into an enduring visual language",
      url: "https://www.deccanchronicle.com/lifestyle/thota-vaikuntam-on-turning-telanganas-everyday-lives-into-an-enduring-visual-language-1988502",
    },
    { label: "Open (2022): Rural reveries", url: "https://openthemagazine.com/art-culture/thota-vaikuntam-rural-reveries" },
    { label: "Wikipedia: 36th National Film Awards", url: "https://en.wikipedia.org/wiki/36th_National_Film_Awards" },
  ],
  body: [
    {
      type: "p",
      text: "[Thota Vaikuntam](/artists/thota-vaikuntam), born in 1942, has spent six decades painting the women and men of rural Telangana in bold colour. In recent years he has given the same figures form in sculpture. Four of his sculptures are in the Sculpted India [collection](/artworks), and this article looks at where they come from.",
    },
    { type: "h2", id: "who-is-thota-vaikuntam", text: "Who is Thota Vaikuntam?" },
    {
      type: "p",
      text: "Vaikuntam grew up in Burugupalli, a village in the Karimnagar district of Telangana. As a child he was fascinated by the travelling theatre troupes that came through the village, in which men played the women's roles.",
    },
    {
      type: "p",
      text: "He trained at the College of Fine Arts and Architecture in Hyderabad (1965–70) and then at M.S. University, Baroda, under K.G. Subramanyan (1971–72). His first solo show was at Kala Bhavan, Hyderabad, in 1973. For many years he taught children at Hyderabad's Bal Bhavan.",
    },
    {
      type: "p",
      text: "He was also art director for the films Maa Bhoomi and Daasi, and Daasi won him the National Film Award for Best Art Direction in 1989. He received the National Award for Painting in 1993. His work is in the National Gallery of Modern Art, New Delhi, the Peabody Essex Museum in Salem and the Salar Jung Museum, Hyderabad.",
    },
    { type: "h2", id: "village-life-telangana", text: "The women and men of rural Telangana" },
    {
      type: "p",
      text: "His people are unmistakable: women in bright saris with large vermilion bindis and almond eyes, men carrying toddy pots, and the rituals and fields of village life. He draws them with a strong black line and fills them with bold reds, saffrons and oranges.",
    },
    {
      type: "quote",
      text: "Life in the village is a daily celebration.",
      cite: "Thota Vaikuntam, Open, 2022",
      url: "https://openthemagazine.com/art-culture/thota-vaikuntam-rural-reveries",
    },
    { type: "h2", id: "from-painting-to-sculpture", text: "From painting to sculpture" },
    {
      type: "p",
      text: "In recent years Vaikuntam has turned these subjects into sculpture, carrying his figures off the canvas and into the round. He has described the change as a way of seeing the same subject anew.",
    },
    {
      type: "quote",
      text: "An artist must keep searching. My sculptures are an example. The subject is the same, but the medium gives me a new way of seeing.",
      cite: "Thota Vaikuntam, Deccan Chronicle, 2026",
      url: "https://www.deccanchronicle.com/lifestyle/thota-vaikuntam-on-turning-telanganas-everyday-lives-into-an-enduring-visual-language-1988502",
    },
    { type: "h2", id: "sculptures-in-the-collection", text: "Thota Vaikuntam sculptures in the collection" },
    {
      type: "p",
      text: "The four works below are in the Sculpted India collection. Sculpted India also showed his work at [Design Democracy 2026](/events) in Hyderabad.",
    },
    { type: "work", slug: "telangana-woman" },
    { type: "work", slug: "lord-krishna" },
    { type: "work", slug: "sacred-gaze" },
    { type: "work", slug: "dancing-shiva" },
    {
      type: "quote",
      text: "Art history can teach technique, but my village taught me identity.",
      cite: "Thota Vaikuntam, Deccan Chronicle, 2026",
      url: "https://www.deccanchronicle.com/lifestyle/thota-vaikuntam-on-turning-telanganas-everyday-lives-into-an-enduring-visual-language-1988502",
    },
    {
      type: "faq",
      items: [
        {
          q: "Who is Thota Vaikuntam?",
          a: "Thota Vaikuntam is an Indian painter and sculptor, born in 1942 in Burugupalli, Telangana. He is known for bold, colourful pictures of the women and men of rural Telangana.",
        },
        {
          q: "Does Thota Vaikuntam make sculptures?",
          a: "Yes. In recent years he has turned the subjects of his paintings into sculpture. Four of his sculptures are in the Sculpted India collection: Untitled (Lady), Untitled (Lord Krishna), Untitled (Pandit) and Dancing Shiva.",
        },
        {
          q: "Where did Thota Vaikuntam study?",
          a: "At the College of Fine Arts and Architecture, Hyderabad (1965–70), and at M.S. University, Baroda, under K.G. Subramanyan (1971–72).",
        },
        {
          q: "Which museums hold Thota Vaikuntam's work?",
          a: "His work is in the National Gallery of Modern Art, New Delhi, the Peabody Essex Museum, Salem, and the Salar Jung Museum, Hyderabad.",
        },
      ],
    },
  ],
};

export default post;
