// Builds the files "View in AR" opens: public/ar/<slug>.glb for every work
// with a 3D model.
//
//   npm run ar-models            all works
//   npm run ar-models -- <slug>  one work
//
// Phone AR viewers read glTF units as metres and place the model's origin on
// the floor, but our models come in arbitrary units (5-48 "metres" tall). Each
// AR copy is scaled to the work's real height (`heightCm` in lib/sculptures.ts,
// AR_DEFAULT_CM when unknown), turned by `facing`, and rests its base on the
// floor, centred. Textures become JPEG, which every AR viewer can read.
import { existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { draco, getBounds } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";

const { sculptures, AR_DEFAULT_CM } = await import(
  pathToFileURL(resolve("lib/sculptures.ts")).href
);

const wanted = process.argv.slice(2);
const works = sculptures.filter(
  (w) => w.modelUrl && (!wanted.length || wanted.includes(w.slug)),
);
if (wanted.length && !works.length) {
  console.error(`No work with a 3D model called "${wanted.join(", ")}" in lib/sculptures.ts.`);
  process.exit(1);
}

// Use the sharp that @gltf-transform/functions already loaded (via
// ndarray-pixels): a second copy (Next's) in the same process breaks libvips.
let sharp;
try {
  const require = createRequire(import.meta.url);
  sharp = createRequire(require.resolve("ndarray-pixels"))("sharp");
} catch {
  console.warn("sharp not found: keeping the original texture format.");
}

/** WebP → JPEG. Some textures carry a colour space libvips can't convert
 *  directly, so fall back to re-encoding their raw pixels. */
const toJpeg = async (image) => {
  try {
    return await sharp(image).jpeg({ quality: 85 }).toBuffer();
  } catch {
    const { data, info } = await sharp(image)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    return sharp(data, { raw: { width, height, channels } })
      .jpeg({ quality: 85 })
      .toBuffer();
  }
};

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "draco3d.encoder": await draco3d.createEncoderModule(),
});

mkdirSync("public/ar", { recursive: true });

for (const work of works) {
  const source = `public${work.modelUrl.split("?")[0]}`;
  if (!existsSync(source)) {
    console.error(`${work.slug}: ${source} not found, skipped.`);
    process.exitCode = 1;
    continue;
  }
  const doc = await io.read(source);
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];

  // Put everything under one node that carries the AR transform.
  const arRoot = doc.createNode("ar-root");
  for (const child of scene.listChildren()) {
    scene.removeChild(child);
    arRoot.addChild(child);
  }
  scene.addChild(arRoot);

  const turn = ((work.facing ?? 0) * Math.PI) / 180;
  arRoot.setRotation([0, Math.sin(turn / 2), 0, Math.cos(turn / 2)]);
  const heightCm = work.heightCm ?? AR_DEFAULT_CM;
  const before = getBounds(scene);
  const scale = heightCm / 100 / (before.max[1] - before.min[1]);
  arRoot.setScale([scale, scale, scale]);
  const b = getBounds(scene);
  arRoot.setTranslation([
    -(b.min[0] + b.max[0]) / 2,
    -b.min[1],
    -(b.min[2] + b.max[2]) / 2,
  ]);

  if (sharp) {
    for (const texture of doc.getRoot().listTextures()) {
      if (texture.getMimeType() !== "image/webp") continue;
      texture
        .setImage(await toJpeg(texture.getImage()))
        .setMimeType("image/jpeg")
        .setURI(texture.getURI().replace(/\.webp$/i, ".jpg"));
    }
    doc
      .getRoot()
      .listExtensionsUsed()
      .find((e) => e.extensionName === "EXT_texture_webp")
      ?.dispose();
  }
  await doc.transform(draco());

  const out = `public/ar/${work.slug}.glb`;
  await io.write(out, doc);
  console.log(`${out}  ${heightCm} cm${work.heightCm ? "" : " (default)"}`);
}
