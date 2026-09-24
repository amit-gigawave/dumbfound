"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Sculpture } from "@/lib/sculptures";
import ARButton from "../ARButton";
import { FIT_VIEWER, preloadModel } from "../three/modelLoader";

const SculptureScene = dynamic(() => import("../SculptureScene"), {
  ssr: false,
});

const IconButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="grid h-9 w-9 place-items-center border border-rule bg-paper/90 text-stone transition-colors hover:text-ink"
  >
    {children}
  </button>
);

/**
 * The artwork's plate. Shows the still image by default. Works with a 3D model
 * also get "View in the round" — which swaps in the turnable work (the model
 * only downloads then) — and "See it in your space" (AR on the visitor's phone).
 */
export default function ArtworkStage({
  work,
  alt,
}: {
  work: Sculpture;
  alt: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [inRound, setInRound] = useState(false);
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const onReady = useCallback(() => setReady(true), []);
  const modelUrl = work.modelUrl;

  useEffect(() => {
    const onChange = () =>
      setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleRound = () => {
    if (inRound && document.fullscreenElement) document.exitFullscreen();
    setInRound((v) => !v);
    setReady(false);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen?.();
  };

  return (
    <div>
      <div
        ref={stageRef}
        className="relative aspect-[4/5] w-full overflow-hidden border border-rule bg-plate"
      >
        <Image
          src={work.thumbnail}
          alt={alt}
          fill
          priority
          sizes="(min-width: 820px) 55vw, 100vw"
          className={`object-contain p-[7%] transition-opacity duration-500 ${
            inRound && ready ? "opacity-0" : "opacity-100"
          }`}
        />

        {inRound && modelUrl && (
          <>
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
            >
              <SculptureScene
                url={modelUrl}
                interactive
                fit={FIT_VIEWER}
                controlsRef={controlsRef}
                onReady={onReady}
              />
            </div>
            {!ready && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-rule">
                <div className="h-full w-1/3 animate-[card-load_1s_ease-in-out_infinite] bg-accent" />
              </div>
            )}
            <div className="absolute right-3 top-3 flex gap-2">
              <IconButton
                label="Return to the first view"
                onClick={() => controlsRef.current?.reset()}
              >
                <RotateCcw size={15} />
              </IconButton>
              <IconButton
                label={fullscreen ? "Exit full screen" : "Full screen"}
                onClick={toggleFullscreen}
              >
                {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </IconButton>
            </div>
          </>
        )}
      </div>

      {modelUrl && (
        <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-3">
          <button
            type="button"
            onClick={toggleRound}
            onPointerEnter={() => preloadModel(modelUrl)}
            onFocus={() => preloadModel(modelUrl)}
            aria-pressed={inRound}
            className="group inline-flex items-center gap-2 text-[13px] tracking-[0.04em] transition-colors hover:text-accent"
          >
            <span aria-hidden className="text-base leading-none">
              {inRound ? "▢" : "↻"}
            </span>
            <span className="border-b border-current/30 pb-0.5 group-hover:border-current">
              {inRound ? "Back to the image" : "View in the round"}
            </span>
          </button>
          <ARButton sculpture={{ ...work, modelUrl }} />
        </div>
      )}
      {inRound && (
        <p className="mt-2 text-xs text-stone">
          Turn the work with your finger or mouse.
        </p>
      )}
    </div>
  );
}
