import type { Metadata } from "next";
import { getArtist } from "@/lib/artists";
import { previewModelUrl, sculptures } from "@/lib/sculptures";
import ImageAR, { type ARWork } from "./ImageAR";

// Prototype: point the phone at a printed AR card and the work stands on it,
// sized from its real height. Not linked anywhere.
export const metadata: Metadata = {
  title: "Image AR (prototype)",
  robots: { index: false, follow: false },
};

/**
 * The works on the test cards, in the order they were compiled into
 * public/lab/image-ar/targets.mind (the tracker reports a card by its index).
 */
const CARD_SLUGS = [
  "khanna-kc-the-bandmaster",
  "thota-female-head-with-polka-dot-collar",
  "sugandh-meri-patang",
  "thota-yellow-saree-lady",
];

export default function ImageARPage() {
  const works: ARWork[] = CARD_SLUGS.map((slug) => {
    const w = sculptures.find((s) => s.slug === slug)!;
    return {
      slug,
      title: w.title,
      artist: getArtist(w.artistSlug)?.name ?? "",
      modelUrl: previewModelUrl(w)!,
      facing: w.facing ?? 0,
      heightCm: w.heightCm ?? 50,
      card: `/lab/image-ar/${slug}.png`,
    };
  });
  return <ImageAR works={works} targets="/lab/image-ar/targets.mind" />;
}
