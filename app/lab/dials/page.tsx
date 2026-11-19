import type { Metadata } from "next";
import Link from "next/link";
import TrueScale from "@/components/gallery/views/TrueScale";
import type { DialVariant } from "@/components/gallery/views/ArtistDial";
import { conceptWorks } from "@/lib/concept-works";

// Internal comparison page for the artist dial on True scale: the real stage
// with each proposed dial. Not linked anywhere.
export const metadata: Metadata = {
  title: "Artist dials — comparison",
  robots: { index: false, follow: false },
};

const DIALS: { id: DialVariant; name: string; about: string }[] = [
  {
    id: "clock",
    name: "Clock",
    about:
      "The floating dial (drag it anywhere) shows the chosen artist's face. Click it and it opens into a clock: each hour is an artist, their face where the number would be and their name outside the rim. Click a face, or drag the hand round.",
  },
  {
    id: "clock-inline",
    name: "Clock in page",
    about:
      "The same clock, always open, set beside the line of works (above it on phones). No popup: pick an artist straight away.",
  },
  {
    id: "knob",
    name: "Knob",
    about:
      "A turning knob with a tick per artist. Drag it round, click it to step to the next artist, or click a tick to jump.",
  },
  {
    id: "ring",
    name: "Ring",
    about:
      "A turntable of artist initials; the chosen one turns to the marker at the top. Spin it, or click an initial.",
  },
  {
    id: "drum",
    name: "Drum",
    about:
      "Full artist names on a turning drum, like a phone's date picker. Drag up or down, or scroll over it.",
  },
  {
    id: "tuner",
    name: "Radio tuner",
    about:
      "A dark radio band with one station per artist and a red needle. Drag the needle, or click a station.",
  },
  {
    id: "float",
    name: "Floating",
    about:
      "A small dial that can be dragged anywhere on the screen (it remembers where). Click it and the artists fan out around it.",
  },
];

const pill = (on: boolean) =>
  `whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition-colors ${
    on ? "bg-ink text-paper" : "text-stone hover:text-ink"
  }`;

export default async function DialsLab({
  searchParams,
}: {
  searchParams: Promise<{ dial?: string; artist?: string }>;
}) {
  const params = await searchParams;
  const dial = DIALS.find((d) => d.id === params.dial) ?? DIALS[0];

  return (
    <main>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-rule bg-white px-[clamp(16px,4vw,48px)] py-3">
        <h1 className="font-display text-[22px] leading-none">Artist dial</h1>
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="inline-flex rounded-full border border-rule bg-white p-1">
            {DIALS.map((d) => (
              <Link
                key={d.id}
                href={`/lab/dials${d.id === "clock" ? "" : `?dial=${d.id}`}`}
                className={pill(d.id === dial.id)}
              >
                {d.name}
              </Link>
            ))}
          </div>
        </div>
        <p className="max-w-[60ch] text-[13px] text-stone">{dial.about}</p>
      </div>
      {/* Keyed by dial, so each one starts fresh. */}
      <TrueScale
        key={dial.id}
        works={conceptWorks()}
        initialArtist={params.artist}
        dial={dial.id}
      />
    </main>
  );
}
