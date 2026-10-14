"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  _roots,
  advance,
  createRoot,
  extend,
  type ReconcilerRoot,
} from "@react-three/fiber";
import { SculptureContents } from "../SculptureScene";
import { sharedRenderer } from "./renderer";

const DPR_MAX = 1.5;

// <Canvas> registers three's classes for JSX itself; a bare root must do it.
extend(THREE as unknown as Parameters<typeof extend>[0]);

/**
 * The turning 3D preview inside an artwork tile.
 *
 * Instead of a WebGL canvas of its own (a new context, lighting and shader
 * compile on every hover, ~0.6 s), each preview is its own small R3F scene
 * drawn by the page's one shared renderer, and every frame is copied into this
 * tile's plain 2D canvas. The preview stays part of the tile, so the card's
 * tilt, rounded corners and overlays apply to it as before.
 *
 * Same framing as the thumbnails (SculptureContents), so the cross-fade from
 * the photo lines up.
 */
export default function TilePreview({
  url,
  fit,
  facing,
  autoRotate,
  onReady,
}: {
  url: string;
  fit: number;
  facing?: number;
  autoRotate: boolean;
  onReady: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<ReconcilerRoot<HTMLCanvasElement> | null>(null);

  // The scene's root and its frame loop live as long as the tile shows 3D.
  useEffect(() => {
    const out = canvasRef.current;
    const ctx = out?.getContext("2d");
    if (!out || !ctx) return;
    const gl = sharedRenderer();
    // R3F keys a root by a canvas; this one is never shown or drawn into.
    const key = document.createElement("canvas");
    const root = createRoot(key);
    rootRef.current = root;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const measure = () => {
      const r = out.getBoundingClientRect();
      width = Math.max(1, Math.round(r.width));
      height = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
      out.width = Math.round(width * dpr);
      out.height = Math.round(height * dpr);
      root.configure({
        gl,
        size: { width, height, top: 0, left: 0 },
        dpr,
        frameloop: "never",
      });
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(out);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(out);

    // Render this scene with the shared renderer at this tile's size, then
    // copy the frame across before anything else can draw.
    const size = new THREE.Vector2();
    const start = performance.now();
    let raf = requestAnimationFrame(function frame(now) {
      raf = requestAnimationFrame(frame);
      const state = _roots.get(key)?.store.getState();
      if (!visible || !state) return;
      if (gl.getPixelRatio() !== dpr) gl.setPixelRatio(dpr);
      gl.getSize(size);
      if (size.x !== width || size.y !== height) gl.setSize(width, height, false);
      advance((now - start) / 1000, true, state);
      ctx.clearRect(0, 0, out.width, out.height);
      ctx.drawImage(gl.domElement, 0, 0, out.width, out.height);
    });

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      io.disconnect();
      rootRef.current = null;
      root.unmount();
    };
  }, []);

  useEffect(() => {
    rootRef.current?.render(
      <SculptureContents
        url={url}
        fit={fit}
        facing={facing}
        reveal={false}
        adaptiveBackground={false}
        autoRotate={autoRotate}
        onReady={onReady}
        loader={false}
      />,
    );
  }, [url, fit, facing, autoRotate, onReady]);

  return <canvas ref={canvasRef} className="pointer-events-none h-full w-full" />;
}
