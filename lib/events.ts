/*
 * Exhibitions where our artists' work is shown — organised by others, not by
 * us, so every entry names its organiser and links to their own page for the
 * full listing. Source: sculptedindia.com/events.html (2026-09-28).
 */

export interface GalleryEvent {
  slug: string;
  title: string;
  /** e.g. "Solo Exhibition", "Group Exhibition" */
  kind: string;
  dates: string;
  venue: string;
  description: string;
  organiser: string;
  /** The organiser's own page for this event. */
  sourceUrl: string;
  /** Slugs of our artists shown at this event, in lib/artists.ts. */
  artistSlugs: string[];
  /** A work of ours shown at the event, if we have its image (lib/sculptures.ts). */
  workSlug?: string;
  past?: boolean;
}

export const events: GalleryEvent[] = [
  {
    slug: "between-presence-and-absence-2026",
    title: "Between Presence and Absence",
    kind: "Solo Exhibition",
    dates: "12–15 October 2026 (preview 11 October, 5pm)",
    venue: "Travancore Palace, New Delhi",
    description:
      "A solo exhibition of Dhananjay Singh's coiled stainless steel, copper and bronze wire — heads, faces and trees from across his career, from wire trees nearly nine feet tall to smaller bronze and steel works.",
    organiser: "Sculpted India, in association with Black Cube Gallery",
    sourceUrl:
      "https://www.sculptedindia.com/events/between-presence-and-absence-2026.html",
    artistSlugs: ["dhananjay-singh"],
    workSlug: "singh-i-am-within-you",
  },
  {
    slug: "design-democracy-2026",
    title: "Design Democracy 2026",
    kind: "Group Exhibition",
    dates: "18–20 September 2026",
    venue: "HITEX Exhibition Centre, Hyderabad — Booth C20",
    description:
      "Sculpted India's debut showcase at Design Democracy, presenting modern and contemporary Indian sculpture at the intersection of art, architecture and design.",
    organiser: "Sculpted India",
    sourceUrl: "https://www.sculptedindia.com/events/design-democracy-2026.html",
    artistSlugs: [
      "krishen-khanna",
      "himmat-shah",
      "thota-vaikuntam",
      "jogen-chowdhury",
      "dhananjay-singh",
      "phaneendra-nath-chaturvedi",
      "yashika-sugandh",
    ],
    past: true,
  },
];

export const upcomingEvents = () => events.filter((e) => !e.past);
export const pastEvents = () => events.filter((e) => e.past);
