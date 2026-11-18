// The house surface for 3D works: how Bronze Female Head with Long Hair reads
// (no glare, not dull), chosen by the founder on 2026-11-18.
//
// A work's `look` multiplies its scan's own metalness and roughness, and scans
// arrive very different (painted works are often exported as polished metal).
// So the multipliers are worked out per model, to land the average of each map
// on the same values. See docs/lighting-progress.md, "House look".

import { createRequire } from "node:module";

export const HOUSE = { metalness: 0.15, roughness: 0.6, reflections: 0.6 };

// Same sharp that @gltf-transform already loads (see make-ar-models.mjs).
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("ndarray-pixels"))("sharp");

/** Average of each channel (0–1) of a texture, or null without one. */
async function channelMeans(texture) {
  if (!texture) return null;
  const { data, info } = await sharp(Buffer.from(texture.getImage()))
    .resize(256, 256, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const sums = new Array(info.channels).fill(0);
  for (let i = 0; i < data.length; i += info.channels) {
    for (let c = 0; c < info.channels; c++) sums[c] += data[i + c];
  }
  return sums.map((s) => s / (data.length / info.channels) / 255);
}

const round = (v) => Math.round(v * 100) / 100;

/** The `look` that brings this model's main material to the house surface. */
export async function houseLook(doc) {
  const material = doc.getRoot().listMaterials()[0];
  if (!material) return { ...HOUSE };
  // glTF metallic-roughness map: green = roughness, blue = metalness.
  const mr = await channelMeans(material.getMetallicRoughnessTexture());
  const metal = (mr ? mr[2] : 1) * material.getMetallicFactor();
  const rough = (mr ? mr[1] : 1) * material.getRoughnessFactor();
  const look = {};
  // A model with no metal stays paint: a multiplier can't add any.
  if (metal > 0.01) look.metalness = round(HOUSE.metalness / metal);
  if (rough > 0.01) look.roughness = round(HOUSE.roughness / rough);
  look.reflections = HOUSE.reflections;
  return look;
}
