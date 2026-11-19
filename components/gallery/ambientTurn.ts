/*
 * Ambient turns for the artworks grid: every few seconds a random visible
 * tile with a 3D model starts turning in the round on its own (as it does on
 * hover), then settles back to its photo. A few at most at once; paused while
 * the tab is hidden and while scrolling;
 * at most MAX_NEW different models per visit; desktops with power to spare
 * only (see deviceTier).
 */

import { cardsIn3D } from "./deviceTier";

/** Most tiles turning on their own at once (fewer on small screens). */
const maxAtOnce = () => (window.innerWidth < 768 ? 1 : 2);
/** Gap between picks, in ms. */
const EVERY = 3500;
/** How long a picked tile keeps turning (plus up to HOLD_JITTER), in ms. */
const HOLD = 7000;
const HOLD_JITTER = 2000;
/**
 * Most different models the ambient turns download in one visit. After that
 * they only replay works already loaded, so a visitor who leaves the page open
 * doesn't keep downloading the collection.
 */
const MAX_NEW = 6;
/** No new turn starts within this long of the last scroll (ms). */
const SCROLL_QUIET = 1200;

export interface AmbientTile {
  el: HTMLElement;
  /** The model it turns (for counting how many different ones were loaded). */
  url: string;
  /** True while the visitor is hovering it — hover takes precedence. */
  busy: () => boolean;
  start: () => void;
  stop: () => void;
}

const tiles = new Set<AmbientTile>();
const running = new Map<AmbientTile, ReturnType<typeof setTimeout>>();
let interval: ReturnType<typeof setInterval> | undefined;
/** Models the ambient turns have loaded this visit. */
const loaded = new Set<string>();
let lastScroll = 0;
const onScroll = () => {
  lastScroll = performance.now();
};

/** At least 60% of the tile is on screen. */
const visible = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  const shown = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
  return shown >= r.height * 0.6;
};

const end = (t: AmbientTile) => {
  clearTimeout(running.get(t));
  running.delete(t);
  t.stop();
};

const tick = () => {
  // Not while the tab is hidden or the visitor is scrolling (the work would
  // load for a card already leaving). A page that is on screen but not the
  // focused window (DevTools, another app beside it) still turns.
  if (document.hidden || running.size >= maxAtOnce()) return;
  if (performance.now() - lastScroll < SCROLL_QUIET) return;
  const pool = [...tiles].filter(
    (t) =>
      !running.has(t) &&
      !t.busy() &&
      visible(t.el) &&
      (loaded.has(t.url) || loaded.size < MAX_NEW),
  );
  const t = pool[Math.floor(Math.random() * pool.length)];
  if (!t) return;
  loaded.add(t.url);
  t.start();
  running.set(
    t,
    setTimeout(() => end(t), HOLD + Math.random() * HOLD_JITTER),
  );
};

/** Enter a tile into the draw; returns a function that takes it out again. */
export function registerAmbient(tile: AmbientTile) {
  // Desktops with power to spare only (this also covers reduced motion).
  if (!cardsIn3D()) return () => {};
  tiles.add(tile);
  if (!interval) {
    interval = setInterval(tick, EVERY);
    addEventListener("scroll", onScroll, { passive: true });
  }
  return () => {
    if (running.has(tile)) end(tile);
    tiles.delete(tile);
    if (!tiles.size && interval) {
      clearInterval(interval);
      interval = undefined;
      removeEventListener("scroll", onScroll);
    }
  };
}
