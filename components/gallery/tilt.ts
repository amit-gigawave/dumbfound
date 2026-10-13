/*
 * Lean a card toward the mouse. Shared by the artist and artwork tiles.
 * Mouse and pen only; skipped for visitors who prefer reduced motion.
 * The element needs a `transform` transition (see .artist-plate / ArtworkTile).
 */

/** Largest lean toward the cursor, in degrees. */
export const MAX_TILT = 7;

export const tilt = (e: React.PointerEvent<HTMLElement>, max = MAX_TILT) => {
  if (e.pointerType === "touch") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  e.currentTarget.style.transform = `perspective(700px) rotateX(${(-y * 2 * max).toFixed(2)}deg) rotateY(${(x * 2 * max).toFixed(2)}deg)`;
};

export const untilt = (e: React.PointerEvent<HTMLElement>) => {
  e.currentTarget.style.transform = "";
};
