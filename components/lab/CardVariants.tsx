"use client";

// Artwork-card variations for /lab/cards. Each one is the live ArtworkTile
// with an extra layer on the plate and/or its own caption, so hover, 3D
// preview and links all behave exactly as on the site.

import { useEffect, useState } from "react";
import type { Sculpture } from "@/lib/sculptures";
import { getArtist } from "@/lib/artists";
import ArtworkTile, { WallLabel } from "@/components/gallery/ArtworkTile";
import ScaleMark, { IMAGE_SPAN, IMAGE_TOP } from "@/components/gallery/ScaleMark";
import { imageStats, mix, type ImageStats } from "@/components/gallery/views/imageStats";

export type CardVariant = "label" | "scalebar" | "person" | "tint" | "plinth" | "compact";

const useStats = (src: string) => {
  const [stats, setStats] = useState<ImageStats | null>(null);
  useEffect(() => {
    let live = true;
    imageStats(src.split("?")[0]).then((s) => live && setStats(s));
    return () => {
      live = false;
    };
  }, [src]);
  return stats;
};

/** The sculpture's top and bottom on the plate, as fractions of its height. */
const plateSpan = (s: ImageStats) => [
  IMAGE_TOP + s.box[1] * IMAGE_SPAN,
  IMAGE_TOP + s.box[3] * IMAGE_SPAN,
];

const fade = (hidden: boolean) =>
  `transition-opacity duration-500 ${hidden ? "opacity-0" : "opacity-100"}`;

/* ------------------------------------------------------------------ */
/* Scale bar: the black-and-white bar of museum and archive photos     */
/* ------------------------------------------------------------------ */

/** Segment length giving 3 to 10 segments. */
const segmentCm = (h: number) =>
  [5, 10, 20, 25, 50, 100].find((u) => h / u <= 10) ?? 100;

const ScaleBar = ({ work, hidden }: { work: Sculpture; hidden: boolean }) => {
  const s = useStats(work.thumbnail);
  const h = work.heightCm!;
  if (!s) return null;
  const [top, bottom] = plateSpan(s);
  const unit = segmentCm(h);
  const n = Math.ceil(h / unit);
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-10 transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.035] ${hidden ? "opacity-0" : "opacity-100"}`}
    >
      <span
        className="absolute right-[5%] text-[11px] leading-none text-ink/75 tabular-nums"
        style={{ top: `calc(${top * 100}% - 16px)` }}
      >
        {Math.round(h)} cm
      </span>
      <span
        className="absolute right-[5%] flex w-[5px] flex-col-reverse overflow-hidden border border-ink/80"
        style={{ top: `${top * 100}%`, bottom: `${(1 - bottom) * 100}%` }}
      >
        {Array.from({ length: n }, (_, i) => (
          <span
            key={i}
            className={i % 2 ? "bg-white" : "bg-ink/85"}
            // The last segment is only as long as what's left of the height.
            style={{ flex: `0 0 ${(Math.min(unit, h - i * unit) / h) * 100}%` }}
          />
        ))}
      </span>
      <span
        className="absolute text-[10px] leading-none text-stone tabular-nums"
        style={{ top: `calc(${bottom * 100}% + 5px)`, right: "calc(5% - 2px)" }}
      >
        0
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Person: the work beside a 1.7 m visitor, at true relative scale     */
/* ------------------------------------------------------------------ */

const PERSON_CM = 170;
const CHIP_PX = 52;

const PersonChip = ({ work, hidden }: { work: Sculpture; hidden: boolean }) => {
  const s = useStats(work.thumbnail);
  const h = work.heightCm!;
  if (!s) return null;
  const k = CHIP_PX / Math.max(PERSON_CM, h); // px per cm
  const personPx = PERSON_CM * k;
  // Draw the thumbnail so the sculpture inside it is h·k tall, standing on the floor.
  const spanFrac = s.box[3] - s.box[1];
  const imgH = (h * k) / spanFrac;
  const imgW = imgH * 0.8;
  const workW = (s.box[2] - s.box[0]) * imgW;
  return (
    <div
      aria-hidden
      title={`${Math.round(h)} cm, beside a 1.7 m person`}
      className={`pointer-events-none absolute bottom-2 right-2 z-10 flex origin-bottom-right scale-75 items-end gap-1.5 rounded-[8px] bg-white/80 px-2 pb-1.5 pt-2 backdrop-blur-sm sm:bottom-3 sm:right-3 sm:scale-100 ${fade(hidden)}`}
    >
      <svg
        viewBox="0 0 20 70"
        style={{ height: personPx, width: personPx * (20 / 70) }}
        className="fill-stone/70"
      >
        <circle cx="10" cy="6" r="5.2" />
        <path d="M4 13h12a2 2 0 0 1 2 2v20h-3.4v35h-4.2V45h-.8v25H5.4V35H2V15a2 2 0 0 1 2-2z" />
      </svg>
      <span className="relative block overflow-hidden" style={{ width: workW, height: h * k }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={work.thumbnail}
          alt=""
          className="absolute max-w-none brightness-0 opacity-75"
          style={{
            height: imgH,
            width: imgW,
            left: -s.box[0] * imgW,
            top: -s.box[1] * imgH,
          }}
        />
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Tinted plate: the plate takes a whisper of the work's own colour    */
/* ------------------------------------------------------------------ */

const WHITE: [number, number, number] = [255, 255, 255];

const Tint = ({ work, hidden }: { work: Sculpture; hidden: boolean }) => {
  const s = useStats(work.thumbnail);
  if (!s) return null;
  const base = s.accent ?? s.rgb;
  return (
    <>
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(120% 90% at 50% 30%, ${mix(base, WHITE, 0.93)}, ${mix(base, WHITE, 0.82)})`,
        }}
      />
      {work.heightCm ? (
        <div className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.035]">
          <ScaleMark
            src={work.thumbnail}
            heightCm={work.heightCm}
            hidden={hidden}
            labelBg={mix(base, WHITE, 0.87)}
          />
        </div>
      ) : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Plinth: the work stands on a block, its height cut into the front   */
/* ------------------------------------------------------------------ */

const Plinth = ({ work, hidden }: { work: Sculpture; hidden: boolean }) => {
  const s = useStats(work.thumbnail);
  if (!s) return null;
  // The block starts a little above the base, where the floor shadow sits.
  const top = Math.min(plateSpan(s)[1] - 0.025, 0.9);
  return (
    <>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 border-t border-white bg-[linear-gradient(#e6e6e3,#dcdcd8)] shadow-[0_-1px_0_rgba(0,0,0,.06)]"
        style={{ top: `${top * 100}%` }}
      />
      {work.heightCm ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute bottom-[3%] right-[5%] z-10 text-[11px] text-stone tabular-nums ${fade(hidden)}`}
        >
          {Math.round(work.heightCm)} cm high
        </span>
      ) : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Compact caption: two lines, for dense phone grids                   */
/* ------------------------------------------------------------------ */

const CompactCaption = ({ work, showArtist }: { work: Sculpture; showArtist: boolean }) => {
  const artist = getArtist(work.artistSlug);
  const facts = [
    showArtist ? artist?.name : null,
    work.heightCm ? `${Math.round(work.heightCm)} cm high` : null,
  ].filter(Boolean);
  return (
    <div className="grid gap-0.5">
      <span className="line-clamp-1 font-display text-[16px] tracking-[0.02em] text-ink transition-colors group-hover:text-accent sm:text-[18px]">
        {work.title}
      </span>
      {facts.length > 0 && (
        <span className="line-clamp-1 text-[13px] text-stone">{facts.join(", ")}</span>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const VariantCard = ({
  work,
  variant,
  showArtist,
  priority,
}: {
  work: Sculpture;
  variant: CardVariant;
  showArtist: boolean;
  priority: boolean;
}) => {
  const common = { work, showArtist, priority, showcase: true, badge: true } as const;
  const label = <WallLabel work={work} artist={showArtist ? getArtist(work.artistSlug) : undefined} />;
  const sized = Boolean(work.heightCm);

  switch (variant) {
    case "label":
      return <ArtworkTile {...common} variant="label" />;
    case "scalebar":
      return (
        <ArtworkTile
          {...common}
          caption={label}
          plateExtra={({ active, ready }) =>
            sized && <ScaleBar work={work} hidden={active && ready} />
          }
        />
      );
    case "person":
      return (
        <ArtworkTile
          {...common}
          caption={label}
          plateExtra={({ active, ready }) =>
            sized && <PersonChip work={work} hidden={active && ready} />
          }
        />
      );
    case "tint":
      return (
        <ArtworkTile
          {...common}
          caption={label}
          plateExtra={({ active, ready }) => <Tint work={work} hidden={active && ready} />}
        />
      );
    case "plinth":
      return (
        <ArtworkTile
          {...common}
          caption={label}
          plateExtra={({ active, ready }) => <Plinth work={work} hidden={active && ready} />}
        />
      );
    case "compact":
      return (
        <ArtworkTile
          {...common}
          caption={<CompactCaption work={work} showArtist={showArtist} />}
        />
      );
  }
};
