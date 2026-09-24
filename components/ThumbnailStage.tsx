"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";
import type { Sculpture } from "@/lib/sculptures";

const SculptureScene = dynamic(() => import("./SculptureScene"), { ssr: false });

export const THUMB_WIDTH = 800;
export const THUMB_HEIGHT = 1000;

declare global {
  interface Window {
    __thumbReady?: boolean;
  }
}

/** Fixed-size, transparent render of one model for the thumbnail generator. */
const ThumbnailStage = ({ sculpture }: { sculpture: Sculpture }) => {
  const onReady = useCallback(() => {
    // Give the environment map and shadows a couple of frames to settle.
    setTimeout(() => {
      window.__thumbReady = true;
    }, 500);
  }, []);

  return (
    <div
      id="thumb-stage"
      className="fixed left-0 top-0 z-[9999]"
      style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
    >
      <SculptureScene
        url={sculpture.modelUrl}
        offsetX={sculpture.offsetX}
        offsetY={sculpture.offsetY}
        defaultZoom={sculpture.defaultZoom}
        mode="thumbnail"
        onReady={onReady}
      />
    </div>
  );
};

export default ThumbnailStage;
