import { useGLTF } from "@react-three/drei";

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

const requested = new Set<string>();
const revealed = new Set<string>();

/** Start downloading + decoding a model in the background (idempotent). */
export const preloadModel = (url: string) => {
  if (requested.has(url)) return;
  requested.add(url);
  useGLTF.preload(url, DRACO_PATH);
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

const queue: string[] = [];
let fetching = false;

/** Skip background downloads on data saver or slow connections. */
const lightConnection = () => {
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
  const url = queue.shift();
  if (!url) {
    fetching = false;
    return;
  }
  fetching = true;
  // Warm the HTTP cache only; decoding waits for an actual hover.
  fetch(url)
    .then((r) => r.arrayBuffer())
    .catch(() => {})
    .finally(() => idle(next));
};

/**
 * Download a visible tile's model in the background, one at a time while the
 * page is idle, so hovering it later doesn't wait on the network.
 */
export const prefetchModel = (url: string) => {
  if (typeof window === "undefined" || requested.has(url) || queue.includes(url))
    return;
  if (lightConnection()) return;
  queue.push(url);
  if (!fetching) {
    fetching = true;
    idle(next);
  }
};

/** Whether the materialize reveal already played for this model this session. */
export const hasRevealed = (url: string) => revealed.has(url);
export const markRevealed = (url: string) => {
  revealed.add(url);
};
