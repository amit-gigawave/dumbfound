"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "lucide-react";
import type { Sculpture } from "@/lib/sculptures";
import { preloadModel } from "./three/modelLoader";
import ArtistBadge from "./ArtistBadge";
import { formatCount } from "@/lib/utils";

const SculptureScene = dynamic(() => import("./SculptureScene"), {
  ssr: false,
});

/** Hover this long before spinning up WebGL, so sweeping the mouse across the grid is free. */
const HOVER_INTENT_MS = 150;

/**
 * Gallery card: a static thumbnail by default. On mouse hover the 3D model loads
 * and auto-rotates on top of it (one live canvas at a time — it unmounts when the
 * pointer leaves). The download is cached, so clicking through opens instantly.
 * Touch devices only get the thumbnail + a background preload on touch.
 */
const SculpturePreviewCard = ({
  sculpture,
  index,
}: {
  sculpture: Sculpture;
  index: number;
}) => {
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const timer = useRef<number | null>(null);

  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => clearTimer, []);

  const onPointerEnter = (e: React.PointerEvent) => {
    preloadModel(sculpture.modelUrl);
    if (e.pointerType !== "mouse") return;
    clearTimer();
    timer.current = window.setTimeout(() => setActive(true), HOVER_INTENT_MS);
  };

  const onPointerLeave = () => {
    clearTimer();
    setActive(false);
    setReady(false);
  };

  const onReady = useCallback(() => setReady(true), []);

  return (
    <Link
      href={`/gallery/${sculpture.slug}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={() => preloadModel(sculpture.modelUrl)}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white/40 transition-shadow duration-300 hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 90% at 50% 30%, ${sculpture.accent}26 0%, ${sculpture.accent}12 35%, transparent 70%)`,
          }}
        />

        <Image
          src={sculpture.thumbnail}
          alt={`${sculpture.title} by ${sculpture.artist.name}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={index < 3}
          className={`object-contain transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
        />

        {active && (
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
          >
            <SculptureScene
              url={sculpture.modelUrl}
              offsetX={sculpture.offsetX}
              offsetY={sculpture.offsetY}
              defaultZoom={sculpture.defaultZoom}
              reveal={false}
              onReady={onReady}
            />
          </div>
        )}

        {/* Loading bar while the hovered model downloads */}
        {active && !ready && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-black/5">
            <div
              className="h-full w-1/3 animate-[card-load_1s_ease-in-out_infinite]"
              style={{ background: sculpture.accent }}
            />
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
          <Box size={11} /> 3D
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/70 px-2 py-1 text-[10px] text-black/60 backdrop-blur">
          {formatCount(sculpture.stats.triangles)} tris
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t border-black/5 px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate font-display text-xl tracking-[-0.02em] text-black">
            {sculpture.title}
          </h3>
          <span className="shrink-0 text-[11px] text-black/40">{sculpture.year}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <ArtistBadge artist={sculpture.artist} accent={sculpture.accent} />
          <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-black/40">
            {sculpture.material}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SculpturePreviewCard;
