import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { sculptures, getSculpture, getOtherSculptures } from "@/lib/sculptures";
import SculptureViewer from "@/components/SculptureViewer";

export function generateStaticParams() {
  return sculptures.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sculpture = getSculpture(slug);
  if (!sculpture) return { title: "Sculpture not found" };

  const title = `${sculpture.title} | ${sculpture.artist.name}`;
  return {
    title,
    description: sculpture.description,
    openGraph: {
      title,
      description: sculpture.description,
      images: [{ url: sculpture.thumbnail, width: 800, height: 1000 }],
    },
  };
}

export default async function SculpturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sculpture = getSculpture(slug);
  if (!sculpture) notFound();

  // Start the GLB download from the HTML <head>, before any JS has hydrated.
  preload(sculpture.modelUrl, { as: "fetch", crossOrigin: "anonymous" });

  return (
    <SculptureViewer sculpture={sculpture} others={getOtherSculptures(slug)} />
  );
}
