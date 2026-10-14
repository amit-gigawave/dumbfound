"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Sculpture } from "@/lib/sculptures";
import ARButton from "../ARButton";
import { FIT_VIEWER } from "../three/modelLoader";

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
    className="grid h-9 w-9 place-items-center border border-rule bg-paper/90 text-stone transition-colors hover:text-accent"
  >
    {children}
  </button>
);

/**
 * The artwork's plate. Works with a 3D model open in 3D (the photo shows
 * until the model is ready) and get a 3D | Photo switch plus "View in AR"
 * (on the visitor's phone). Other works show their photo.
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
  const [inRound, setInRound] = useState(Boolean(work.modelUrl));
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [viewerBg, setViewerBg] = useState<string | null>(null);

  const onReady = useCallback(() => setReady(true), []);
  const modelUrl = work.modelUrl;

  useEffect(() => {
    const onChange = () =>
      setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const show3D = (on: boolean) => {
    if (on === inRound) return;
    if (!on && document.fullscreenElement) document.exitFullscreen();
    setInRound(on);
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
        className={`relative isolate aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-rule transition-colors duration-500 ${
          inRound ? "" : "bg-plate"
        }`}
        style={inRound ? { backgroundColor: viewerBg ?? "#4b4b4b" } : undefined}
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
                facing={work.facing}
                controlsRef={controlsRef}
                onReady={onReady}
                onBackground={setViewerBg}
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
          <div
            role="group"
            aria-label="View"
            className="inline-flex rounded-full border border-rule p-0.5 text-[11px] tracking-[0.18em]"
          >
            {(
              [
                [true, "3D"],
                [false, "Photo"],
              ] as const
            ).map(([on, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => show3D(on)}
                aria-pressed={inRound === on}
                className={`rounded-full px-4 py-1.5 uppercase transition-colors ${
                  inRound === on
                    ? "bg-ink text-paper"
                    : "text-stone hover:text-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <ARButton sculpture={{ ...work, modelUrl }} />
        </div>
      )}
      {inRound && (
        <p className="mt-2 text-xs text-stone">
          Drag to turn the work, scroll or pinch to zoom.
        </p>
      )}
    </div>
  );
}
