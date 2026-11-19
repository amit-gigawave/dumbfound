import type { Metadata } from "next";
import Link from "next/link";
import TrueScale from "@/components/gallery/views/TrueScale";
import {
  RotaryCompare,
  type DialOption,
  type DialVariant,
} from "@/components/gallery/views/ArtistDial";
import { conceptWorks } from "@/lib/concept-works";

// Internal comparison page for the artist dial on True scale: every look of
// the turning dial side by side, and the real stage with each proposed dial.
// Not linked anywhere.
export const metadata: Metadata = {
  title: "Artist dials — comparison",
  robots: { index: false, follow: false },
};

type Tab = DialVariant | "compare";

const DIALS: { id: Tab; name: string; about: string }[] = [
  {
    id: "compare",
    name: "Compare looks",
    about:
      "Four looks for the same turning dial, open side by side. Each works on its own: drag it round, or click a face.",
  },
  {
    id: "rotary-gallery",
    name: "Gallery",
    about:
      "On True scale: the button opens a light card with the faces in colour on a fine circle and the chosen name large in the middle.",
  },
  {
    id: "rotary-orbit",
    name: "Orbit",
    about:
      "On True scale: the button opens the top of a large wheel; the chosen face sits large at the top and the rest turn away.",
  },
  {
    id: "rotary-bronze",
    name: "Bronze",
    about:
      "On True scale: the button opens a dark disc with a bronze rim, gold-ringed faces and a bronze-edged centre.",
  },
  {
    id: "rotary",
    name: "Disc (current)",
    about:
      "On True scale: the button opens a pale turning disc with black-and-white faces and a dark label in the middle.",
  },
  {
    id: "rotary-inline",
    name: "Dial in page",
    about:
      "The disc, always open, set beside the line of works (above it on phones). No popup: pick an artist straight away.",
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

/** The dial's choices, as True scale makes them: all artists, then each artist with a work on the stage. */
function dialOptions(): DialOption[] {
  const works = conceptWorks().filter((w) => w.heightCm);
  const m = new Map<string, DialOption>();
  for (const w of works) {
    const o = m.get(w.artistSlug) ?? {
      slug: w.artistSlug,
      name: w.artist,
      portrait: w.artistPortrait,
      n: 0,
    };
    o.n++;
    m.set(w.artistSlug, o);
  }
  return [{ slug: null, name: "All artists", n: works.length }, ...m.values()];
}

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
        <div className="-mx-1 max-w-full overflow-x-auto px-1">
          <div className="inline-flex rounded-full border border-rule bg-white p-1">
            {DIALS.map((d) => (
              <Link
                key={d.id}
                href={`/lab/dials${d.id === "compare" ? "" : `?dial=${d.id}`}`}
                className={pill(d.id === dial.id)}
              >
                {d.name}
              </Link>
            ))}
          </div>
        </div>
        <p className="max-w-[60ch] text-[13px] text-stone">{dial.about}</p>
      </div>
      {dial.id === "compare" ? (
        <RotaryCompare options={dialOptions()} />
      ) : (
        // Keyed by dial, so each one starts fresh.
        <TrueScale
          key={dial.id}
          works={conceptWorks()}
          initialArtist={params.artist}
          dial={dial.id}
        />
      )}
    </main>
  );
}
