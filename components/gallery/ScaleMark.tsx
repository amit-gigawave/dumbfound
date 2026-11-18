"use client";

import { useEffect, useState } from "react";
import { imageStats } from "./views/imageStats";

/**
 * A dimension line on a catalogue plate: it runs exactly from the top to the
 * bottom of the sculpture in the thumbnail, labelled with the work's real
 * height. Cards are all the same size, so this is what tells a 30 cm bandsman
 * from a 147 cm head.
 *
 * Geometry, for a plate W wide: the plate and the thumbnail are both 4:5, and
 * the image is drawn with `object-contain` inside a padding of 0.06W on every
 * side (CSS padding is a fraction of the width). That leaves a 0.88W × 1.13W
 * box, so the image is 0.88W × 1.1W, centred: its top is 0.075W down. As a
 * fraction of the plate's 1.25W height it starts at 6% and spans 88%.
 */
const IMAGE_TOP = 0.06;
const IMAGE_SPAN = 0.88;

const ScaleMark = ({
  src,
  heightCm,
  hidden = false,
}: {
  src: string;
  heightCm: number;
  /** Fades out, e.g. while the 3D preview (framed differently) is showing. */
  hidden?: boolean;
}) => {
  const [span, setSpan] = useState<[number, number] | null>(null);

  useEffect(() => {
    let live = true;
    imageStats(src.split("?")[0]).then((s) => {
      if (live && s) setSpan([s.box[1], s.box[3]]);
    });
    return () => {
      live = false;
    };
  }, [src]);

  if (!span) return null;
  const top = (IMAGE_TOP + span[0] * IMAGE_SPAN) * 100;
  const bottom = (1 - (IMAGE_TOP + span[1] * IMAGE_SPAN)) * 100;
  const label = `${Math.round(heightCm)} cm`;

  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute right-[4.5%] z-10 flex w-3 justify-center transition-opacity duration-500 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
      style={{ top: `${top}%`, bottom: `${bottom}%` }}
    >
      {/* The line, with short ticks at both ends. */}
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-stone/45" />
      <span className="absolute left-0 top-0 h-px w-full bg-stone/60" />
      <span className="absolute bottom-0 left-0 h-px w-full bg-stone/60" />
      {/* Height, written along the line on a gap in it. */}
      <span className="relative self-center bg-plate py-1.5 text-[11px] leading-none tracking-[0.02em] text-ink/70 tabular-nums [writing-mode:vertical-rl] rotate-180 transition-colors duration-500 group-hover:bg-[#e8e8e8]">
        {label}
      </span>
    </span>
  );
};

export default ScaleMark;
