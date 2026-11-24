// Builds the assets for the 8th Wall scan app (public/scan8/):
//   - public/scan8/targets/<slug>.jpg  : the work's picture to upload to the
//     8th Wall console as a named Image Target (name = <slug>) and to print.
//   - public/scan8/works.json          : the per-work config the app reads
//     ({ slug, name, title, artist, heightCm, ar }).
//
// 8th Wall holds only a handful of image targets at once with world tracking
// on, so this is a curated set, not every work. Edit SLUGS to change it.
//   node scripts/scan8-targets.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// The curated works (high contrast tracks best). Keep to ~6–8: 8th Wall world
// tracking caps how many targets it holds at once.
const SLUGS = [
  "thota-female-head-with-polka-dot-collar",
  "thota-male-head-with-blue-turban",
  "khanna-kc-the-bandmaster",
  "sugandh-meri-patang",
  "khanna-shyam-pratap-bhompu-walae",
  "thota-man-with-mridangam",
];

const { sculptures } = await import(pathToFileURL(resolve("lib/sculptures.ts")).href);
const { getArtist } = await import(pathToFileURL(resolve("lib/artists.ts")).href);
const { AR_DEFAULT_CM } = await import(pathToFileURL(resolve("lib/sculptures.ts")).href);

mkdirSync("public/scan8/targets", { recursive: true });

// A bigger, detailed image tracks better. The work on white, trimmed to its
// outline (the white border carries no features, so keep it small). This is
// both the file to upload as the console Image Target and the picture to print.
const PX = 1024;
const works = [];
for (const slug of SLUGS) {
  const w = sculptures.find((s) => s.slug === slug);
  if (!w) throw new Error(`no work "${slug}" in lib/sculptures.ts`);
  if (!w.thumbnail) throw new Error(`"${slug}" has no thumbnail`);
  await sharp(resolve("public" + w.thumbnail.split("?")[0]))
    .trim({ threshold: 1 })
    .resize(PX - 48, PX - 48, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 92 })
    .toFile(`public/scan8/targets/${slug}.jpg`);
  works.push({
    slug,
    name: slug, // the exact name to give this Image Target in the 8th Wall console
    title: w.title,
    artist: getArtist(w.artistSlug)?.name ?? "",
    heightCm: w.heightCm ?? AR_DEFAULT_CM,
    ar: `/ar/${slug}.glb`, // real-size (metres), upright, standing on the floor
  });
}
writeFileSync("public/scan8/works.json", JSON.stringify(works, null, 2) + "\n");
console.log(
  `${works.length} targets in public/scan8/targets/ and public/scan8/works.json\n` +
    `Upload each public/scan8/targets/<slug>.jpg to the 8th Wall console as an\n` +
    `Image Target named exactly <slug>.`,
);
