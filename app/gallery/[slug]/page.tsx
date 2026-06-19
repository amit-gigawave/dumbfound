import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sculptures, getSculpture } from "@/lib/sculptures";
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

  return {
    title: `${sculpture.title} | Thota Vaikuntam`,
    description: sculpture.description,
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

  return <SculptureViewer sculpture={sculpture} />;
}
