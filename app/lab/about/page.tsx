import type { Metadata } from "next";
import { artists } from "@/lib/artists";
import { sculptures } from "@/lib/sculptures";
import { events } from "@/lib/events";
import AboutConcepts from "@/components/lab/AboutConcepts";

// Internal inspiration page for a richer About page — not linked anywhere.
export const metadata: Metadata = {
  title: "About — concepts",
  robots: { index: false, follow: false },
};

const firstYear = (s: string) => Number(s.match(/\d{4}/)?.[0]);

export default function AboutLab() {
  const years = artists.map((a) => firstYear(a.born)).filter(Boolean);
  const stats = {
    artists: artists.length,
    works: sculptures.length,
    inRound: sculptures.filter((s) => s.modelUrl).length,
    from: Math.min(...years),
    to: Math.max(...years),
  };

  return (
    <AboutConcepts
      stats={stats}
      portraits={artists
        .filter((a) => a.portrait)
        .map((a) => ({ slug: a.slug, name: a.name, portrait: a.portrait!, medium: a.medium }))}
      events={events.map((e) => ({
        title: e.title,
        kind: e.kind,
        dates: e.dates,
        venue: e.venue,
        past: !!e.past,
      }))}
    />
  );
}
