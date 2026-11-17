import type { Metadata } from "next";
import { getArtist } from "@/lib/artists";
import { getWorksByArtist } from "@/lib/sculptures";
import PortraitEffects, { type LabArtist } from "@/components/lab/PortraitEffects";

// Internal comparison page for portrait treatments — not linked anywhere.
export const metadata: Metadata = {
  title: "Portrait effects — compare",
  robots: { index: false, follow: false },
};

const SLUGS = [
  "thota-vaikuntam",
  "krishen-khanna",
  "himmat-shah",
  "yashika-sugandh",
  "mf-husain",
];

export default function PortraitLab() {
  const artists: LabArtist[] = SLUGS.flatMap((slug) => {
    const a = getArtist(slug);
    if (!a?.portrait) return [];
    return [
      {
        slug,
        name: a.name,
        portrait: a.portrait,
        work: getWorksByArtist(slug)[0]?.thumbnail,
      },
    ];
  });

  return (
    <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-24 pt-14">
      <span className="label">Lab · not public</span>
      <h1 className="heading-caps mt-4 text-[clamp(28px,4vw,44px)] tracking-[0.05em]">
        Portrait effects
      </h1>
      <p className="font-text mt-3 max-w-[60ch] text-stone">
        Hover any portrait to see its effect. Every row uses the same five
        artists, so you can compare treatments like for like.
      </p>
      <PortraitEffects artists={artists} />
    </main>
  );
}
