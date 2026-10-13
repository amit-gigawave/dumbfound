/*
 * Ambient turns for the artworks grid: every few seconds a random visible
 * tile with a 3D model starts turning in the round on its own (as it does on
 * hover), then settles back to its photo. A few at most at once; paused while
 * the tab is hidden; off for visitors who prefer reduced motion.
 */

/** Most tiles turning on their own at once (fewer on small screens). */
const maxAtOnce = () => (window.innerWidth < 768 ? 1 : 2);
/** Gap between picks, in ms. */
const EVERY = 3500;
/** How long a picked tile keeps turning (plus up to HOLD_JITTER), in ms. */
const HOLD = 7000;
const HOLD_JITTER = 2000;

export interface AmbientTile {
  el: HTMLElement;
  /** True while the visitor is hovering it — hover takes precedence. */
  busy: () => boolean;
  start: () => void;
  stop: () => void;
}

const tiles = new Set<AmbientTile>();
const running = new Map<AmbientTile, ReturnType<typeof setTimeout>>();
let interval: ReturnType<typeof setInterval> | undefined;

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
  if (document.hidden || running.size >= maxAtOnce()) return;
  const pool = [...tiles].filter(
    (t) => !running.has(t) && !t.busy() && visible(t.el),
  );
  const t = pool[Math.floor(Math.random() * pool.length)];
  if (!t) return;
  t.start();
  running.set(
    t,
    setTimeout(() => end(t), HOLD + Math.random() * HOLD_JITTER),
  );
};

/** Enter a tile into the draw; returns a function that takes it out again. */
export function registerAmbient(tile: AmbientTile) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return () => {};
  tiles.add(tile);
  interval ??= setInterval(tick, EVERY);
  return () => {
    if (running.has(tile)) end(tile);
    tiles.delete(tile);
    if (!tiles.size && interval) {
      clearInterval(interval);
      interval = undefined;
    }
  };
}
