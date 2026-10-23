import type { BlogPost } from "../blog";
import { portrait } from "./images";

// Facts: DAG's M.F. Husain page (timeline, anecdotes, quote); Wikipedia;
// Al Jazeera, December 2025 (exile, Qatar, the Calcutta Club, passport quote);
// AP obituary via the Philadelphia Inquirer, 2011; Gulf Times, November 2025
// (the Doha museum); Scale, 2020 (Seeroo fi al Ardh).
// Disputed: the birth year (1915 on Wikipedia; DAG says 1913), so the post says
// both. Left out: the year he reached Bombay (DAG gives 1936 and 1937).
const post: BlogPost = {
  slug: "mf-husain-life",
  title: "M.F. Husain: film hoardings, horses and bare feet",
  description:
    "From painting film hoardings in Bombay to a Golden Bear in Berlin and a museum in Doha: the life and stories of M.F. Husain, India's barefoot painter.",
  published: "2026-10-23",
  category: "Artists' lives",
  tags: ["M.F. Husain", "Progressive Artists' Group", "Indian modern art", "Horses"],
  image: portrait("mf-husain", "M.F. Husain, Indian painter", {
    text: "Photo: Suhas Bahulkar, Deepak Ghare, CC BY-SA 4.0, via Wikimedia Commons",
    url: "https://commons.wikimedia.org/wiki/File:M._F._Husain.jpg",
  }),
  artistSlugs: ["mf-husain"],
  sources: [
    { label: "DAG: M.F. Husain", url: "https://dagworld.com/m.f.husain.html" },
    { label: "Wikipedia: M. F. Husain", url: "https://en.wikipedia.org/wiki/M._F._Husain" },
    { label: "Al Jazeera (2025): M.F. Husain was forced into exile. Now his work finds a permanent home in Qatar", url: "https://aljazeera.com/features/2025/12/5/mf-husain-was-forced-into-exile-now-his-work-finds-permanent-home-in-qatar" },
    { label: "AP obituary, via the Philadelphia Inquirer (2011)", url: "https://inquirer.com/philly/obituaries/20110610_M_F__Husain__a_top_painter_in_India_who_left_for_exile.html" },
    { label: "Gulf Times (2025): QF to open Lawh Wa Qalam: M F Husain Museum", url: "https://www.gulf-times.com/article/714840/qatar/qf-to-open-lawh-wa-qalam-m-f-husain-museum-this-month" },
    { label: "Scale (2020): Husain's last work of art", url: "https://scalemag.online/art/husains-last-work-of-art/" },
  ],
  body: [
    {
      type: "p",
      text: "[M.F. Husain](/artists/mf-husain) was born on 17 September in Pandharpur, Maharashtra. The year is usually given as 1915, but the gallery DAG says he made up his birth date throughout his life, and gives 1913. He died in London in 2011, having painted film hoardings, horses and Mother Teresa, made films with Madhuri Dixit, walked barefoot for almost fifty years and ended his life as a citizen of Qatar.",
    },
    { type: "h2", id: "film-hoardings", text: "Painting film hoardings in Bombay" },
    {
      type: "p",
      text: "Husain arrived in Bombay in the 1930s with no money. He slept on footpaths and earned a living painting cinema hoardings under the streetlights. From 1942 to 1947 he designed nursery furniture and wooden toys for a furniture shop called Fantasy.",
    },
    { type: "h2", id: "progressive-artists-group", text: "The Progressive Artists' Group" },
    {
      type: "p",
      text: "In 1947 he was one of the founders of the Progressive Artists' Group in Bombay, with F.N. Souza, S.H. Raza, K.H. Ara, S.K. Bakre and H.A. Gade. One of the friends he drew into that circle was [Krishen Khanna](/blog/krishen-khanna-life).",
    },
    { type: "h2", id: "horses", text: "Horses" },
    {
      type: "p",
      text: "On a visit to China in 1952 Husain was struck by Chinese paintings of horses. His Horse series began with Passage of Time in 1954, and he became famous for them.",
    },
    { type: "h2", id: "barefoot", text: "Why Husain walked barefoot" },
    {
      type: "p",
      text: "In 1964 he gave up shoes for good, saying it was in mourning for the Hindi poet Muktibodh. At other times he gave other reasons: that his mother, who died young, never saw him step into his father's shoes, or the memory of an unrequited love. It cost him at least once, when the Calcutta Club refused to let him in.",
    },
    { type: "h2", id: "films", text: "A painter at the movies" },
    {
      type: "p",
      text: "His first film, Through the Eyes of a Painter (1967), made for the Government of India's Films Division, won the Golden Bear for short film at the Berlin International Film Festival, and the Museum of Modern Art in New York acquired it. Decades later he made Gaja Gamini (2000), starring his muse Madhuri Dixit, and Meenaxi: A Tale of Three Cities (2004), starring Tabu.",
    },
    { type: "h2", id: "stories", text: "Stories from a long life" },
    {
      type: "ul",
      items: [
        "In 1956 he showed 34 paintings in Prague and gave every one of them to his interpreter, Maria Zurkova, with whom he had fallen in love. She turned down his proposal of marriage.",
        "In 1968 he loaded twenty Ramayana paintings onto bullock carts and took them through the villages of Maharashtra.",
        "In 1979 he sketched Mother Teresa on the spot and handed her the drawing. She signed it “God bless you”, and became a muse for the rest of his life.",
        "From 1986 to 1992 he was a nominated member of the Rajya Sabha. The drawings he made in Parliament became a book, Sansad Upanishad.",
        "Between 1992 and 1995 he and the architect B.V. Doshi made Husain-Doshi ni Gufa in Ahmedabad, an underground gallery whose interiors Husain painted.",
      ],
    },
    {
      type: "quote",
      text: "Painting is prayer for me.",
      cite: "M.F. Husain, quoted by DAG",
      url: "https://dagworld.com/m.f.husain.html",
    },
    { type: "h2", id: "exile", text: "Exile, and a passport from Qatar" },
    {
      type: "p",
      text: "In 2006, after death threats and obscenity cases over his nude depictions of Hindu goddesses, Husain left India and lived between Dubai and London. In 2008 India's Supreme Court cleared him in a case over one of the paintings. In 2010 he accepted Qatari citizenship and gave up his Indian passport.",
    },
    {
      type: "quote",
      text: "This is just a piece of paper. India is my motherland.",
      cite: "M.F. Husain on his Indian passport, quoted by Al Jazeera",
      url: "https://aljazeera.com/features/2025/12/5/mf-husain-was-forced-into-exile-now-his-work-finds-permanent-home-in-qatar",
    },
    {
      type: "p",
      text: "He died of a heart attack at the Royal Brompton Hospital in London on 9 June 2011. He had received the Padma Shri in 1966, the Padma Bhushan in 1973 and the Padma Vibhushan in 1991.",
    },
    { type: "h2", id: "last-work", text: "A last work, in glass and bronze" },
    {
      type: "p",
      text: "In 2009 Husain sketched Seeroo fi al Ardh, a moving installation for Doha: five Murano crystal horses on a turning platform with vintage cars, a mosaic wall of about forty horses, and bronzes of the inventor Abbas ibn Firnas and of a Leonardo da Vinci flying machine hanging from the ceiling. He saw only one glass horse finished. Qatar Foundation completed the work and opened it in 2019, and it now stands in the Lawh Wa Qalam: M F Husain Museum in Doha's Education City, which opened in November 2025.",
    },
    {
      type: "faq",
      items: [
        {
          q: "When was M.F. Husain born?",
          a: "On 17 September in Pandharpur, Maharashtra. The year is usually given as 1915; the gallery DAG gives 1913 and says he made up his birth date throughout his life.",
        },
        {
          q: "Why did M.F. Husain walk barefoot?",
          a: "He gave up shoes in 1964, saying it was in mourning for the poet Muktibodh. He gave other reasons at other times, including his mother, who never saw him in his father's shoes.",
        },
        {
          q: "Why did M.F. Husain leave India?",
          a: "He left in 2006 after death threats and obscenity cases over his paintings of Hindu goddesses, and in 2010 he accepted Qatari citizenship.",
        },
        {
          q: "Did M.F. Husain make films?",
          a: "Yes. Through the Eyes of a Painter (1967) won the Golden Bear for short film in Berlin. He also made Gaja Gamini (2000) and Meenaxi: A Tale of Three Cities (2004).",
        },
        {
          q: "Where is the M.F. Husain museum?",
          a: "The Lawh Wa Qalam: M F Husain Museum is in Education City, Doha, Qatar. It opened in November 2025.",
        },
      ],
    },
  ],
};

export default post;
