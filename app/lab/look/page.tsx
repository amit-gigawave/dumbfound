import type { Metadata } from "next";
import { getArtist } from "@/lib/artists";
import { sculptures } from "@/lib/sculptures";
import { catalogueOrder } from "@/lib/catalogue-order";
import LookTweaker from "./LookTweaker";

// Internal page: tune each 3D work's light, metalness, roughness and the rest
// on the real viewer, and save the result into lib/sculptures.ts (dev server
// only). Not linked anywhere.
export const metadata: Metadata = {
  title: "Look tweaker",
  robots: { index: false, follow: false },
};

export default async function LookPage({
  searchParams,
}: {
  searchParams: Promise<{ work?: string }>;
}) {
  const { work } = await searchParams;
  const works = catalogueOrder(sculptures)
    .filter((w) => w.modelUrl)
    .map((w) => ({
      slug: w.slug,
      title: w.title,
      artist: getArtist(w.artistSlug)?.name ?? "",
      modelUrl: w.modelUrl!,
      facing: w.facing ?? 0,
      look: w.look ?? {},
    }));
  return (
    <LookTweaker
      works={works}
      initial={work}
      canSave={process.env.NODE_ENV === "development"}
    />
  );
}
