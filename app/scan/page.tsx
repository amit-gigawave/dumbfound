import type { Metadata } from "next";
import { getArtist } from "@/lib/artists";
import { previewModelUrl, sculptures } from "@/lib/sculptures";
// The targets' order in public/scan/targets.mind.gz: the tracker reports a
// picture by its index. Written by `node scripts/scan-targets.mjs`.
import order from "@/lib/scan-targets.json";
import ScanAR, { type ScanWork } from "./ScanAR";

// Point the phone at any work's picture and the work stands up out of it.
// Not linked from the site yet.
export const metadata: Metadata = {
  title: "Scan a work",
  robots: { index: false, follow: false },
};

export default function ScanPage() {
  const works: ScanWork[] = order.map((slug) => {
    const w = sculptures.find((s) => s.slug === slug);
    if (!w?.modelUrl) throw new Error(`scan target "${slug}" has no 3D work: run node scripts/scan-targets.mjs`);
    return {
      slug,
      title: w.title,
      artist: getArtist(w.artistSlug)?.name ?? "",
      modelUrl: previewModelUrl(w)!,
      facing: w.facing ?? 0,
      target: `/scan/targets/${slug}.jpg`,
    };
  });
  return <ScanAR works={works} targets="/scan/targets.mind.gz" />;
}
