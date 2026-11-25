"use client";

import { useEffect, useState } from "react";

/**
 * What the concepts read from a work's transparent thumbnail: its average
 * colour and where the sculpture actually sits in the image (the frame has
 * empty margin around it). Computed once per image in the browser.
 */
export interface ImageStats {
  /** Average colour of the sculpture's own pixels, 0–255. */
  rgb: [number, number, number];
  /** Hue 0–360, saturation and lightness 0–1, of `rgb`. */
  hsl: [number, number, number];
  /**
   * Signature colour: the average of its clearly coloured pixels (paint),
   * or null for a work that is mostly bronze, stone or grey.
   */
  accent: [number, number, number] | null;
  /** The sculpture's bounding box as fractions of the image: left, top, right, bottom. */
  box: [number, number, number, number];
}

const cache = new Map<string, Promise<ImageStats | null>>();

export const hsl = (rgb: [number, number, number]) => toHsl(rgb);

const toHsl = ([r, g, b]: [number, number, number]): [
  number,
  number,
  number,
] => {
  const R = r / 255,
    G = g / 255,
    B = b / 255;
  const max = Math.max(R, G, B),
    min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R
      ? (G - B) / d + (G < B ? 6 : 0)
      : max === G
        ? (B - R) / d + 2
        : (R - G) / d + 4;
  return [h * 60, s, l];
};

const measure = (src: string): Promise<ImageStats | null> =>
  new Promise((resolve) => {
    const img = new Image();
    // Thumbnails may come from the R2 bucket (lib/assets.ts): without CORS
    // the canvas is tainted and its pixels can't be read.
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      try {
        const w = 80,
          h = 100;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        let r = 0,
          g = 0,
          b = 0,
          n = 0;
        let ar = 0,
          ag = 0,
          ab = 0,
          an = 0;
        let x0 = w,
          y0 = h,
          x1 = -1,
          y1 = -1;
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            if (data[i + 3] < 128) continue;
            const px: [number, number, number] = [
              data[i],
              data[i + 1],
              data[i + 2],
            ];
            r += px[0];
            g += px[1];
            b += px[2];
            n++;
            const [, s, l] = toHsl(px);
            if (s > 0.35 && l > 0.18 && l < 0.85) {
              ar += px[0];
              ag += px[1];
              ab += px[2];
              an++;
            }
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        if (!n) return resolve(null);
        const rgb: [number, number, number] = [r / n, g / n, b / n];
        const accent: [number, number, number] | null =
          an > n * 0.12 ? [ar / an, ag / an, ab / an] : null;
        resolve({
          rgb,
          hsl: toHsl(rgb),
          accent,
          box: [x0 / w, y0 / h, (x1 + 1) / w, (y1 + 1) / h],
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    // The thumbnail itself (a small WebP), not the image optimiser, which can
    // stall in development when asked for many new sizes at once.
    img.src = src;
  });

export const imageStats = (src: string) => {
  let p = cache.get(src);
  if (!p) {
    p = measure(src);
    cache.set(src, p);
  }
  return p;
};

/** Stats for many images; each entry appears as soon as it's measured. */
export const useImageStats = (srcs: string[]) => {
  const [stats, setStats] = useState<Record<string, ImageStats | null>>({});
  const key = srcs.join("|");
  useEffect(() => {
    let live = true;
    for (const s of srcs)
      imageStats(s).then((v) => {
        if (live) setStats((prev) => ({ ...prev, [s]: v }));
      });
    return () => {
      live = false;
    };
    // srcs is compared by value through key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return stats;
};

/** A colour mixed toward another, as an rgb() string. */
export const mix = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(", ")})`;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
