// Builds the light copies the artwork cards turn in 3D: public/previews/<slug>.glb
// for every work with a 3D model.
//
//   npm run preview-models            all works
//   npm run preview-models -- <slug>  one work
//
// A card shows its work about 350 px wide, so the full model's 2048-4096 px
// textures are wasted there: each preview keeps the same geometry (decimating
// these scans scrambles their texture atlases) but shrinks textures to
// PREVIEW_PX, which takes most models from 1.3-3.4 MB to a few hundred KB.
// The artwork page's viewer and AR keep using the full model.
import { existsSync, mkdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { draco } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";

/** Largest texture side in a preview (px). */
const PREVIEW_PX = 1024;

const { sculptures } = await import(pathToFileURL(resolve("lib/sculptures.ts")).href);

const wanted = process.argv.slice(2);
const works = sculptures.filter((w) => w.modelUrl && (!wanted.length || wanted.includes(w.slug)));
if (wanted.length && !works.length) {
  console.error(`No work with a 3D model called "${wanted.join(", ")}" in lib/sculptures.ts.`);
  process.exit(1);
}

// The sharp that @gltf-transform/functions loads (via ndarray-pixels): a
// second copy (Next's) in the same process breaks libvips (see make-ar-models).
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("ndarray-pixels"))("sharp");

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "draco3d.encoder": await draco3d.createEncoderModule(),
});

/** Shrink to PREVIEW_PX on the longer side, keeping the format. */
const shrink = async (image, mime) => {
  const img = sharp(image);
  const meta = await img.metadata();
  if (Math.max(meta.width ?? 0, meta.height ?? 0) <= PREVIEW_PX) return null;
  const resized = img.resize(PREVIEW_PX, PREVIEW_PX, { fit: "inside" });
  return mime === "image/webp"
    ? resized.webp({ quality: 85 }).toBuffer()
    : mime === "image/png"
      ? resized.png().toBuffer()
      : resized.jpeg({ quality: 85 }).toBuffer();
};

mkdirSync("public/previews", { recursive: true });
const kb = (f) => Math.round(statSync(f).size / 1024);

for (const work of works) {
  const source = `public${work.modelUrl.split("?")[0]}`;
  if (!existsSync(source)) {
    console.error(`${work.slug}: ${source} not found, skipped.`);
    process.exitCode = 1;
    continue;
  }
  const doc = await io.read(source);
  for (const texture of doc.getRoot().listTextures()) {
    const out = await shrink(texture.getImage(), texture.getMimeType());
    if (out) texture.setImage(out);
  }
  await doc.transform(draco());
  const out = `public/previews/${work.slug}.glb`;
  await io.write(out, doc);
  console.log(`${out}  ${kb(source)} KB -> ${kb(out)} KB`);
}
