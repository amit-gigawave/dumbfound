export interface Sculpture {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  modelUrl: string;
  accent: string;
  offsetX: number;
  offsetY: number;
  defaultZoom: number;
  material: string;
  year: string;
}

export const sculptures: Sculpture[] = [
  {
    slug: "telangana-woman",
    title: "Telangana Woman",
    subtitle: "The iconic muse",
    description:
      "The iconic subject of Vaikuntam's world — a rural woman adorned with vermilion bindi, almond eyes, and traditional jewellery, capturing the dignity and sensuality of Telangana heritage in three dimensions.",
    modelUrl: "/sculptures/Lady.glb",
    accent: "#d4a574",
    offsetX: 0,
    offsetY: -0.1,
    defaultZoom: 2.2,
    material: "Patinated bronze",
    year: "2019",
  },
  {
    slug: "lord-krishna",
    title: "Lord Krishna",
    subtitle: "Celestial grace",
    description:
      "Rooted in the mythology that shaped his childhood village theatre, Vaikuntam brings celestial grace and folk intimacy together — poise, peace, and primary colours meeting bronze patina.",
    modelUrl: "/sculptures/LordKrishna.glb",
    accent: "#e67e22",
    offsetX: 0,
    offsetY: 0,
    defaultZoom: 3,
    material: "Painted bronze",
    year: "2020",
  },
  {
    slug: "sacred-gaze",
    title: "Sacred Gaze",
    subtitle: "Dravidian dignity",
    description:
      "From Vaikuntam's celebrated series of sculptural heads in patinated bronze — almond eyes and ornate adornments embodying what curator Uma Nair calls 'Dravidian dignity in tone and tenor.'",
    modelUrl: "/sculptures/Pandit.glb",
    accent: "#8b6914",
    offsetX: 0,
    offsetY: 0,
    defaultZoom: 2.2,
    material: "Patinated bronze",
    year: "2018",
  },
  {
    slug: "dancing-shiva",
    title: "Dancing Shiva",
    subtitle: "Nataraja in motion",
    description:
      "The cosmic dancer caught mid-stride — Vaikuntam's Nataraja fuses the rhythm of South Indian temple iconography with his unmistakable folk sensibility, rendered in flowing, gilded bronze.",
    modelUrl: "/sculptures/DancingShiva.glb",
    accent: "#b8860b",
    offsetX: 0,
    offsetY: 0,
    defaultZoom: 2.4,
    material: "Gilded bronze",
    year: "2021",
  },
];

export const getSculpture = (slug: string): Sculpture | undefined =>
  sculptures.find((s) => s.slug === slug);
