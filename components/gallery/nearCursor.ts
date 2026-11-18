/*
 * Hover-intent prefetch for artwork tiles: once the cursor has rested for a
 * moment, download the models of the one or two tiles nearest it, so a hover there
 * only has to decode. Tiles far from the cursor are never fetched, so
 * scrolling through the whole grid doesn't download the whole collection.
 */
import { prefetchModels } from "../three/modelLoader";

/** Tiles fetched around the cursor. */
const NEAR = 2;
/** Farther than this from the cursor (px, to the tile's edge) is not near. */
const REACH = 120;
/**
 * How long the cursor must rest first, in ms. Only moving the mouse counts:
 * scrolling under a still cursor is not interest in the tiles it passes.
 */
const REST = 400;

const tiles = new Map<HTMLElement, string>();
let x = -1;
let y = -1;
let timer: ReturnType<typeof setTimeout> | undefined;

const pick = () => {
  if (x < 0 || document.hidden) return;
  const near: [number, string][] = [];
  for (const [el, url] of tiles) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) continue;
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    const d = Math.hypot(dx, dy);
    if (d <= REACH) near.push([d, url]);
  }
  near.sort((a, b) => a[0] - b[0]);
  prefetchModels([...new Set(near.map(([, u]) => u))].slice(0, NEAR));
};

const later = () => {
  clearTimeout(timer);
  timer = setTimeout(pick, REST);
};
const onMove = (e: PointerEvent) => {
  if (e.pointerType !== "mouse") return;
  x = e.clientX;
  y = e.clientY;
  later();
};

/** Enter a tile's plate; returns a function that takes it out again. */
export function registerNear(el: HTMLElement, url: string) {
  if (!tiles.size) {
    addEventListener("pointermove", onMove, { passive: true });
  }
  tiles.set(el, url);
  return () => {
    tiles.delete(el);
    if (tiles.size) return;
    removeEventListener("pointermove", onMove);
    clearTimeout(timer);
  };
}
