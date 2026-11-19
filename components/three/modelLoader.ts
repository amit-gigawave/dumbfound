import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/** Self-hosted Draco decoder (copied by scripts/copy-draco.mjs). */
export const DRACO_PATH = "/draco/";

/**
 * How much of the frame a sculpture fills (see SculptureScene `fit`).
 * Thumbnails and hover previews MUST share FIT_CARD (and the 4:5 aspect) so the
 * 3D preview lines up with the thumbnail when it fades in.
 * Re-run `npm run thumbnails` after changing it.
 */
export const FIT_CARD = 0.86;
export const FIT_VIEWER = 0.8;

const revealed = new Set<string>();

/*
 * Decoded models. A decoded model lives in drei's useGLTF cache (and, once
 * drawn, on the GPU) until it is cleared, so only the KEEP most recently used
 * are kept. A model that is on screen is never evicted.
 */

/** Decoded models kept besides the ones on screen. */
const KEEP = 6;
/** Decoded (or decoding) models, least recently used first. */
const lru: string[] = [];
/** How many mounted scenes draw each model. */
const users = new Map<string, number>();
/** The cached scene of each model that has been drawn, to free its GPU memory. */
const scenes = new Map<string, THREE.Object3D>();

const touch = (url: string) => {
  const i = lru.indexOf(url);
  if (i >= 0) lru.splice(i, 1);
  lru.push(url);
};

/** Frees a cached scene's geometry, materials and textures. */
const disposeScene = (root: THREE.Object3D) => {
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    o.geometry?.dispose();
    for (const m of [o.material].flat() as THREE.Material[]) {
      for (const v of Object.values(m))
        if (v instanceof THREE.Texture) v.dispose();
      m.dispose();
    }
  });
};

const evict = () => {
  for (let i = 0; lru.length > KEEP && i < lru.length; ) {
    const url = lru[i];
    if (users.get(url)) {
      i++;
      continue;
    }
    lru.splice(i, 1);
    useGLTF.clear(url);
    const scene = scenes.get(url);
    if (scene) disposeScene(scene);
    scenes.delete(url);
  }
};

/**
 * Start downloading + decoding a model in the background (idempotent). Call
 * it only when the model is about to be shown (hover, focus, an ambient turn):
 * a decoded model costs tens of MB of memory.
 */
export const preloadModel = (url: string) => {
  const known = lru.includes(url);
  touch(url);
  if (!known) useGLTF.preload(url, DRACO_PATH);
  evict();
};

/**
 * Marks a model as on screen so it isn't evicted; call the returned function
 * when the scene unmounts. `scene` is useGLTF's cached scene for `url`.
 */
export const retainModel = (url: string, scene: THREE.Object3D) => {
  touch(url);
  scenes.set(url, scene);
  users.set(url, (users.get(url) ?? 0) + 1);
  evict();
  return () => {
    users.set(url, (users.get(url) ?? 1) - 1);
    touch(url);
    evict();
  };
};

let warmed = false;

/**
 * Once the page is idle, get the hover previews ready: fetch their code and
 * the Draco decoder, and create the shared renderer with its lighting, so the
 * first hover only has to load the model itself (idempotent).
 */
export const warm3D = () => {
  if (warmed || typeof window === "undefined") return;
  warmed = true;
  const go = async () => {
    for (const f of ["draco_wasm_wrapper.js", "draco_decoder.wasm"])
      fetch(DRACO_PATH + f).catch(() => {});
    await import("./TilePreview");
    const [{ sharedRenderer }, { studioMap }] = await Promise.all([
      import("./renderer"),
      import("./StudioEnvironment"),
    ]);
    studioMap(sharedRenderer());
  };
  if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 3000 });
  else setTimeout(go, 1500);
};

/*
 * Background downloads. These only fill the browser's HTTP cache (models are
 * served with a one-day max-age); nothing is decoded until the tile is hovered.
 */

/** Models already downloaded (or downloading) this page visit. */
const downloaded = new Set<string>();
/** Models wanted next; replaced as the cursor moves, so stale ones drop out. */
let wanted: string[] = [];
let fetching = false;

/** Skip background downloads on data saver or slow connections. */
export const lightConnection = () => {
  const c = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  return !!c && (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType ?? ""));
};

const idle = (fn: () => void) =>
  "requestIdleCallback" in window
    ? requestIdleCallback(fn, { timeout: 4000 })
    : setTimeout(fn, 500);

const next = () => {
  const url = wanted.shift();
  if (!url) {
    fetching = false;
    return;
  }
  fetching = true;
  downloaded.add(url);
  fetch(url)
    .then((r) => r.arrayBuffer())
    .catch(() => downloaded.delete(url))
    .finally(() => idle(next));
};

/**
 * Download the models of the few tiles nearest the cursor, one at a time while
 * the page is idle, so hovering one of them only has to decode it. Replaces
 * the previous wish list: tiles the cursor has moved away from aren't fetched.
 */
export const prefetchModels = (urls: string[]) => {
  if (typeof window === "undefined" || lightConnection()) return;
  wanted = urls.filter((u) => !downloaded.has(u) && !lru.includes(u));
  if (!fetching && wanted.length) {
    fetching = true;
    idle(next);
  }
};

/** Whether the materialize reveal already played for this model this session. */
export const hasRevealed = (url: string) => revealed.has(url);
export const markRevealed = (url: string) => {
  revealed.add(url);
};
