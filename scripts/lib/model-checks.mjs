// The model checks every 3D work goes through before it is published
// (docs/adding-artworks.md, "Model checks"). `inspect` only reports;
// `fix` repairs what can be repaired automatically.
//
//   1. Opaque + single-sided: scans often export as BLEND and double-sided,
//      which looks see-through on the site.
//   2. Winding: if many triangles face against their normals, backface
//      culling would open holes, so the model is refused instead.
//   3. Vertex colours: all-white COLOR layers are dropped (they only wash the
//      texture out); a model with no texture and no colours renders white.
//   4. Texture size: detailed scans (4096 px or more) keep 4096 px textures.
import { createRequire } from "node:module";
import { ImageUtils, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";

/** Above this share of reversed triangles the model is refused. */
export const MAX_FLIPPED = 0.05;

export async function makeIO() {
  return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });
}

// The sharp that @gltf-transform/functions loads (see make-ar-models.mjs).
let sharp = null;
try {
  const require = createRequire(import.meta.url);
  sharp = createRequire(require.resolve("ndarray-pixels"))("sharp");
} catch {
  /* alpha check falls back to "opaque" */
}

/** True when the image has an alpha channel that is actually used. */
async function usesAlpha(texture) {
  const image = texture.getImage();
  if (!image || texture.getMimeType() === "image/jpeg" || !sharp) return false;
  try {
    const { channels, isOpaque } = await sharp(image).stats();
    return channels.length === 4 && !isOpaque;
  } catch {
    return false;
  }
}

const isWhite = (accessor) => {
  const el = [];
  for (let i = 0; i < accessor.getCount(); i++) {
    accessor.getElement(i, el);
    if (el[0] < 0.99 || el[1] < 0.99 || el[2] < 0.99) return false;
  }
  return true;
};

/** Share of triangles whose winding points against their vertex normals. */
function flippedShare(doc) {
  let flipped = 0;
  let total = 0;
  const p = [[], [], []];
  const n = [[], [], []];
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4) continue; // triangles only
      const pos = prim.getAttribute("POSITION");
      const nor = prim.getAttribute("NORMAL");
      if (!pos || !nor) continue;
      const idx = prim.getIndices();
      const count = idx ? idx.getCount() : pos.getCount();
      const at = (k) => (idx ? idx.getScalar(k) : k);
      for (let t = 0; t + 2 < count; t += 3) {
        for (let j = 0; j < 3; j++) {
          pos.getElement(at(t + j), p[j]);
          nor.getElement(at(t + j), n[j]);
        }
        const ux = p[1][0] - p[0][0], uy = p[1][1] - p[0][1], uz = p[1][2] - p[0][2];
        const vx = p[2][0] - p[0][0], vy = p[2][1] - p[0][1], vz = p[2][2] - p[0][2];
        const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
        const sx = n[0][0] + n[1][0] + n[2][0];
        const sy = n[0][1] + n[1][1] + n[2][1];
        const sz = n[0][2] + n[1][2] + n[2][2];
        const dot = fx * sx + fy * sy + fz * sz;
        if (dot === 0) continue; // degenerate
        total++;
        if (dot < 0) flipped++;
      }
    }
  }
  return total ? flipped / total : 0;
}

/**
 * Reports on a loaded document. `problems` stop publishing; `fixes` are what
 * `fix()` would change; `notes` are for information.
 */
export async function inspect(doc) {
  const root = doc.getRoot();
  const fixes = [];
  const problems = [];
  const notes = [];

  for (const mat of root.listMaterials()) {
    const name = mat.getName() || "(unnamed material)";
    const tex = mat.getBaseColorTexture();
    if (mat.getAlphaMode() !== "OPAQUE" && !(tex && (await usesAlpha(tex)))) {
      fixes.push(`${name}: alphaMode ${mat.getAlphaMode()} → OPAQUE`);
    }
    if (mat.getDoubleSided()) fixes.push(`${name}: double-sided → single-sided (backface culling)`);
  }

  let hasTexture = root.listTextures().length > 0;
  let hasColours = false;
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      for (const sem of prim.listSemantics().filter((s) => s.startsWith("COLOR_"))) {
        if (isWhite(prim.getAttribute(sem))) fixes.push(`${mesh.getName() || "mesh"}: all-white ${sem} removed`);
        else hasColours = true;
      }
    }
  }
  if (!hasTexture && !hasColours) {
    problems.push("No texture and no vertex colours: the model would render plain white. Re-export with its texture (or with export_vertex_color='ACTIVE').");
  } else if (!hasTexture) {
    notes.push("Colour comes from vertex colours only (no texture), so close-ups will look soft.");
  }

  const sizes = root.listTextures().map((t) => ImageUtils.getSize(t.getImage(), t.getMimeType()) ?? [0, 0]);
  const largest = Math.max(0, ...sizes.flat());
  const textureSize = largest >= 4096 ? 4096 : 2048;
  if (largest) notes.push(`Largest texture ${largest} px → compressed to ${textureSize} px.`);

  const share = flippedShare(doc);
  const pct = `${(share * 100).toFixed(1)}%`;
  if (share > MAX_FLIPPED) {
    problems.push(`${pct} of triangles face against their normals; with backface culling they would show as holes. Fix the normals in Blender (Mesh → Normals → Recalculate Outside) and try again.`);
  } else {
    notes.push(`Winding OK (${pct} reversed).`);
  }

  return { fixes, problems, notes, textureSize };
}

/** Applies the automatic fixes in place. */
export async function fix(doc) {
  const root = doc.getRoot();
  for (const mat of root.listMaterials()) {
    const tex = mat.getBaseColorTexture();
    if (mat.getAlphaMode() !== "OPAQUE" && !(tex && (await usesAlpha(tex)))) mat.setAlphaMode("OPAQUE");
    mat.setDoubleSided(false);
  }
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      for (const sem of prim.listSemantics().filter((s) => s.startsWith("COLOR_"))) {
        const acc = prim.getAttribute(sem);
        if (isWhite(acc)) {
          prim.setAttribute(sem, null);
          if (acc.listParents().length <= 1) acc.dispose();
        }
      }
    }
  }
}

/** Prints an inspect() report. */
export function printReport({ fixes, problems, notes }, { fixed = false } = {}) {
  for (const f of fixes) console.log(`  ${fixed ? "fixed" : "would fix"}: ${f}`);
  for (const n of notes) console.log(`  note: ${n}`);
  for (const p of problems) console.log(`  PROBLEM: ${p}`);
  if (!fixes.length && !problems.length) console.log("  All checks passed.");
}
