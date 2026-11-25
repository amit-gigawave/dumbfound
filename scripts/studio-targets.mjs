// Builds everything the Niantic Studio scan app (Documents/8th Wall/Sculpted_India)
// needs to recognise EVERY work, into an output folder:
//   <out>/works.json                     [{ slug, title, artist, url }]  (the app reads this)
//   <out>/image-targets/<slug>.json      engine target data (same format Studio produces)
//   <out>/image-targets/<slug>_*.jpg     original / cropped / luminance / thumbnail
//   <out>/print/<slug>.jpg               the picture to print (work on white, 768x1024)
//   <out>/assets/<slug>.glb              the work's real-size model (copied from public/ar)
//
// A Studio image target is: a 3:4 portrait crop of the picture, turned into a
// 480x640 grayscale "luminance" image, plus a small JSON (crop rectangle etc.).
// Verified against a target Studio made itself: plain grayscale matches to ~1/255.
//
//   node scripts/studio-targets.mjs --out "<folder>"
import sharp from "sharp";
import { copyFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const oi = process.argv.indexOf("--out");
if (oi < 0 || !process.argv[oi + 1]) throw new Error('usage: --out "<folder>"');
const OUT = resolve(process.argv[oi + 1]);

const { sculptures } = await import(pathToFileURL(resolve("lib/sculptures.ts")).href);
const { getArtist } = await import(pathToFileURL(resolve("lib/artists.ts")).href);

for (const d of ["image-targets", "print", "assets"]) mkdirSync(join(OUT, d), { recursive: true });

// The printed picture is a 3:4 portrait canvas (the engine’s planar target shape), so the
// whole picture is tracked and nothing is cropped away, wide works included.
const W = 768;
const H = 1024;
const PAD = 24;
const BW = W - 2 * PAD;
const BH = H - 2 * PAD;
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

const works = [];
for (const s of sculptures) {
  const slug = s.slug;
  if (!s.thumbnail) throw new Error(`"${slug}" has no thumbnail`);
  if (!existsSync(resolve(`public/ar/${slug}.glb`))) throw new Error(`no public/ar/${slug}.glb`);

  // 1) The work on white, trimmed to its outline, centred in a 1024 square.
  //    (Pad with OPAQUE white: transparent padding flattens to black bars.)
  const flat = await sharp(resolve("public" + s.thumbnail.split("?")[0]))
    .flatten({ background: "#ffffff" })
    .toBuffer();
  const trimmed = await sharp(flat).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const original = await sharp(trimmed.data)
    .resize(BW, BH, { fit: "contain", background: WHITE })
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: WHITE })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 92 })
    .toBuffer();
  // 2) The crop is the whole picture (already 3:4).
  const left = 0;
  const top = 0;
  const cw = W;
  const ch = H;

  const cropped = sharp(original).extract({ left, top, width: cw, height: ch });
  await cropped.clone().jpeg({ quality: 92 }).toFile(join(OUT, "image-targets", `${slug}_cropped.jpg`));
  await cropped
    .clone()
    .resize(480, 640, { fit: "fill" })
    .grayscale()
    .toColourspace("srgb")
    .jpeg({ quality: 92 })
    .toFile(join(OUT, "image-targets", `${slug}_luminance.jpg`));
  await cropped
    .clone()
    .resize(263, 350, { fit: "fill" })
    .jpeg({ quality: 85 })
    .toFile(join(OUT, "image-targets", `${slug}_thumbnail.jpg`));
  writeFileSync(join(OUT, "image-targets", `${slug}_original.jpg`), original);
  writeFileSync(join(OUT, "print", `${slug}.jpg`), original);

  const now = Date.now();
  writeFileSync(
    join(OUT, "image-targets", `${slug}.json`),
    JSON.stringify(
      {
        type: "PLANAR",
        properties: { top, left, width: cw, height: ch, isRotated: false, originalWidth: W, originalHeight: H },
        imagePath: `image-targets/${slug}_luminance.jpg`,
        metadata: null,
        name: slug,
        resources: {
          originalImage: `${slug}_original.jpg`,
          croppedImage: `${slug}_cropped.jpg`,
          thumbnailImage: `${slug}_thumbnail.jpg`,
          luminanceImage: `${slug}_luminance.jpg`,
        },
        created: now,
        updated: now,
      },
      null,
      2,
    ) + "\n",
  );

  copyFileSync(resolve(`public/ar/${slug}.glb`), join(OUT, "assets", `${slug}.glb`));
  works.push({
    slug,
    title: s.title,
    artist: getArtist(s.artistSlug)?.name ?? "",
    url: `assets/${slug}.glb`,
  });
}
writeFileSync(join(OUT, "works.json"), JSON.stringify(works, null, 2) + "\n");

console.log(`${works.length} works written to ${OUT}`);
