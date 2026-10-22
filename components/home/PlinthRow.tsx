"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface PlinthWork {
  slug: string;
  title: string;
  thumbnail: string;
  artist: string;
  /** Year and material, already joined; empty when neither is known. */
  details: string;
}

/**
 * Share of the image's height that is empty below the work, measured from
 * its alpha channel, so the work can be lowered onto the plinth.
 */
const emptyBelow = (img: HTMLImageElement) => {
  const w = 40;
  const h = 50;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  for (let y = h - 1; y >= 0; y--)
    for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 40) return (h - 1 - y) / h;
  return 0;
};

function Plinth({ work, priority }: { work: PlinthWork; priority: boolean }) {
  const [drop, setDrop] = useState(0);
  return (
    <Link
      href={`/artworks/${work.slug}`}
      className="group flex w-[72vw] max-w-[340px] shrink-0 snap-center flex-col justify-end focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-auto sm:max-w-none"
    >
      <div className="relative mx-auto aspect-[4/5] w-full">
        <Image
          src={work.thumbnail}
          alt={`${work.title}, by ${work.artist}`}
          fill
          sizes="(min-width: 640px) 30vw, 72vw"
          priority={priority}
          onLoad={(e) => {
            try {
              setDrop(emptyBelow(e.currentTarget));
            } catch {
              // An unreadable image just stands where it is.
            }
          }}
          style={{ transform: `translateY(${(drop * 100).toFixed(2)}%)` }}
          className="object-contain transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none"
        />
      </div>
      {/* The plinth, with the label on its face. Its foot is the floor line. */}
      <div className="relative z-10 mx-auto h-[clamp(96px,10vw,132px)] w-[66%] border border-b-0 border-rule bg-white px-4 pt-4 shadow-[inset_0_10px_14px_-12px_rgba(0,0,0,.18)]">
        <p className="text-[13px] leading-snug text-ink">{work.artist}</p>
        <p className="font-text mt-0.5 text-[16px] italic leading-snug transition-colors group-hover:text-accent">
          {work.title}
        </p>
        {work.details && (
          <p className="mt-0.5 text-[13px] leading-snug text-stone">{work.details}</p>
        )}
      </div>
    </Link>
  );
}

/**
 * Featured works standing on plinths along one floor line, each with its
 * label on the plinth's face. On phones the row scrolls sideways.
 */
export default function PlinthRow({ works }: { works: PlinthWork[] }) {
  return (
    <div className="-mx-[clamp(16px,4vw,40px)] flex snap-x snap-mandatory items-end gap-6 overflow-x-auto px-[clamp(16px,4vw,40px)] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible sm:px-0">
      {works.map((w, i) => (
        <Plinth key={w.slug} work={w} priority={i < 3} />
      ))}
    </div>
  );
}
