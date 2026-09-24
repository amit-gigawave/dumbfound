import { useGLTF } from "@react-three/drei";

/** Self-hosted Draco decoder (copied by scripts/copy-draco.mjs). */
export const DRACO_PATH = "/draco/";

const requested = new Set<string>();
const revealed = new Set<string>();

/** Start downloading + decoding a model in the background (idempotent). */
export const preloadModel = (url: string) => {
  if (requested.has(url)) return;
  requested.add(url);
  useGLTF.preload(url, DRACO_PATH);
};

/** Whether the materialize reveal already played for this model this session. */
export const hasRevealed = (url: string) => revealed.has(url);
export const markRevealed = (url: string) => {
  revealed.add(url);
};
