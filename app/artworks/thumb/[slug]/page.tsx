import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sculptures, getSculpture } from "@/lib/sculptures";
import ThumbnailStage from "@/components/ThumbnailStage";

// Internal render target for scripts/make-thumbnails.mjs — not linked anywhere.
export const metadata: Metadata = {
  title: "Thumbnail render",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return sculptures.map((s) => ({ slug: s.slug }));
}

export default async function ThumbnailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  /**
   * `?facing=90` previews another angle and `?look={"metalness":0.3}` another
   * surface, and `?rig=natural` a light rig from components/three/lighting.ts,
   * without editing the catalogue.
   */
  searchParams: Promise<{ facing?: string; look?: string; rig?: string }>;
}) {
  const { slug } = await params;
  const { facing, look, rig } = await searchParams;
  const sculpture = getSculpture(slug);
  // Only works with a 3D model get a generated thumbnail.
  if (!sculpture?.modelUrl) notFound();

  return (
    <ThumbnailStage
      rig={rig}
      sculpture={{
        ...sculpture,
        modelUrl: sculpture.modelUrl,
        ...(facing !== undefined && { facing: Number(facing) }),
        ...(look !== undefined && { look: JSON.parse(look) }),
      }}
    />
  );
}
