/*
 * The platform's own words about itself, shared by the About page and the
 * home page. **Double asterisks** mark key words (see Manifesto/StaggerStory).
 */

// Lights up word by word on scroll; **key words** turn the accent colour.
export const MANIFESTO =
  "Sculpture has always been one of the most **powerful and enduring** forms of artistic expression — yet it has often remained on the **periphery** of India's broader art ecosystem. Sculpted India was founded to **change that.**";

// Rises in word by word; a marker then sweeps across the **key phrases**.
export const STORY = [
  "Sculpted India is a pioneering public art initiative and dedicated platform committed to advancing modern and contemporary Indian sculpture by giving it the **visibility, recognition, and cultural presence** it has long deserved—placing sculpture at the **centre of contemporary cultural discourse** and creating a platform where the medium can be experienced at its fullest scale, ambition, and impact.",
  "More than an exhibition platform, Sculpted India serves as a **bridge** between artists, collectors, galleries, institutions, architects, designers, and art enthusiasts. It creates meaningful opportunities for **dialogue, collaboration, and patronage,** fostering a stronger ecosystem around sculpture and encouraging deeper engagement with three-dimensional artistic practice.",
  "What distinguishes Sculpted India is its **long-term commitment** to the medium. Rather than existing as a one-time exhibition, it is envisioned as a **sustained cultural initiative** dedicated to building visibility, accessibility, and patronage for sculpture across India.",
  "At its core, Sculpted India is founded on values of excellence, inclusivity, innovation, and cultural stewardship. The mission remains clear: to become **the leading platform** for modern and contemporary Indian sculpture, positioning the medium at the forefront of India's cultural imagination while creating a lasting legacy for artists, audiences, and future generations.",
];

/** The three ideas of the story above, in its own words, for the home page. */
export const PILLARS = [
  {
    title: "Visibility",
    text: "Giving sculpture the visibility, recognition, and cultural presence it has long deserved.",
  },
  {
    title: "A bridge",
    text: "Between artists, collectors, galleries, institutions, architects, designers, and art enthusiasts.",
  },
  {
    title: "For the long term",
    text: "A sustained cultural initiative building visibility, accessibility, and patronage for sculpture across India.",
  },
];

/** Story text without the ** markers, for plain paragraphs. */
export const plain = (s: string) => s.replaceAll("**", "");
