import type { Metadata } from "next";
import { getArtist } from "@/lib/artists";
import { sculptures } from "@/lib/sculptures";
import LightingLab from "./LightingLab";

// Internal page for comparing lighting setups on the real models — not linked anywhere.
export const metadata: Metadata = {
  title: "Lighting lab",
  robots: { index: false, follow: false },
};

export default function LightingLabPage() {
  const works = sculptures
    .filter((w) => w.modelUrl)
    .map((w) => ({
      slug: w.slug,
      title: w.title,
      artist: getArtist(w.artistSlug)?.name ?? "",
      modelUrl: w.modelUrl!,
      facing: w.facing ?? 0,
    }));
  return <LightingLab works={works} initial="dancing-shiva" />;
}
