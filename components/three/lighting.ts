import * as THREE from "three";

/**
 * The light every 3D view of a work shares: artwork viewer, card thumbnail
 * and hover preview. A work's `look.light` and `look.reflections` multiply it.
 * Re-run `npm run thumbnails` after changing it.
 */
export interface LightRig {
  /** How the renderer maps light to screen colour (applies to the whole canvas). */
  toneMapping: THREE.ToneMapping;
  exposure: number;
  /** Soft light from above (sky) with a bounce from below (floor). */
  hemisphere: { sky: string; ground: string; intensity: number };
  /** Even light from everywhere; flattens the form, so keep it low. */
  ambient: number;
  /** Main light, gives the work its shape. Position is relative to the work. */
  key: { position: [number, number, number]; intensity: number; color: string };
  fill: { position: [number, number, number]; intensity: number };
  /** From behind, separates the outline from the backdrop. */
  back: { position: [number, number, number]; intensity: number };
  /** Strength of the studio reflections on the surface. */
  reflections: number;
}

/**
 * Daylight in a calm room: true colours (Neutral tone mapping), soft light from
 * above with a warm floor bounce, a gentle key from the front left for shape.
 * Chosen 2026-11-17 over brighter and filmic (ACES) alternatives.
 */
export const LIGHTING: LightRig = {
  toneMapping: THREE.NeutralToneMapping,
  exposure: 1,
  hemisphere: { sky: "#ffffff", ground: "#b8b2a8", intensity: 0.64 },
  ambient: 0,
  key: { position: [-3, 6, 4], intensity: 0.8, color: "#fff8ef" },
  fill: { position: [4, 1.5, 3], intensity: 0.32 },
  back: { position: [2, 3, -4], intensity: 0.32 },
  reflections: 0.48,
};

/** The earlier filmic studio light, kept to compare against. */
const previous: LightRig = {
  toneMapping: THREE.ACESFilmicToneMapping,
  exposure: 1.05,
  hemisphere: { sky: "#ffffff", ground: "#888888", intensity: 0 },
  ambient: 0.5,
  key: { position: [3, 5, 4], intensity: 1.6, color: "#ffffff" },
  fill: { position: [-4, 1.5, 3], intensity: 0 },
  back: { position: [-4, 2, -3], intensity: 0.5 },
  reflections: 0.9,
};

/** Rigs to compare, previewed with `/artworks/thumb/<slug>?rig=<name>`. */
const RIGS: Record<string, LightRig> = { current: LIGHTING, previous };

export const rigFor = (name?: string): LightRig =>
  (name && RIGS[name]) || LIGHTING;
