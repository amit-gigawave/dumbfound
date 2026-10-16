// Adds an artwork from a photo (painting, photograph, drawing, a sculpture
// without a scan…).
//
//   npm run add-work
//
// For a 3D model use  npm run add-model -- "<file>"  instead (this script
// hands .glb/.usdz/.usdc files over to it). Full guide: docs/adding-artworks.md
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { spawnSync } from "node:child_process";
import { addWork, load, loadWorks, slugify } from "./lib/catalogue.mjs";

const BASE = process.env.SITE_URL ?? "http://localhost:3000";
const IMAGE = [".jpg", ".jpeg", ".png", ".webp"];
const MODEL = [".glb", ".usdz", ".usdc"];

// ---------- small helpers ----------

const rl = createInterface({ input: process.stdin, terminal: false });
const lines = rl[Symbol.asyncIterator]();

/** Ask one question. Empty answer returns `def`. Re-asks until valid. */
async function ask(question, { def = "", validate } = {}) {
  for (;;) {
    process.stdout.write(`${question}${def ? ` [${def}]` : ""}: `);
    const { value, done } = await lines.next();
    if (done) fail("\nInput ended before all questions were answered.");
    const answer = value.trim() || def;
    const problem = validate?.(answer);
    if (!problem) return answer;
    console.log(`  ${problem}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

/** Windows "Copy as path" wraps paths in quotes; drag-and-drop may too. */
const cleanPath = (p) => p.trim().replace(/^["']|["']$/g, "");

const kb = (file) => Math.round(statSync(file).size / 1024);

// ---------- the file ----------

console.log("\nAdd an artwork from a photo\n");

let source = "";
await ask("Path to the image (you can paste or drag the file here)", {
  validate: (v) => {
    source = resolve(cleanPath(v));
    if (!existsSync(source)) return "That file was not found.";
    const ext = extname(source).toLowerCase();
    if (![...IMAGE, ...MODEL].includes(ext)) return `Expected ${IMAGE.join(" / ")} (or a 3D model: ${MODEL.join(" / ")}).`;
    return null;
  },
});

if (MODEL.includes(extname(source).toLowerCase())) {
  rl.close();
  console.log("\nThat's a 3D model, so handing over to  npm run add-model …\n");
  const run = spawnSync(
    process.execPath,
    ["--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/add-model.mjs", source],
    { stdio: "inherit" },
  );
  process.exit(run.status ?? 1);
}

// ---------- questions ----------

const { artists } = await load("lib/artists.ts");
const works = await loadWorks();
const real = artists.filter((a) => !a.placeholder);

console.log("Leave anything you don't know empty: unknown details stay hidden on the site.\n");
const title = await ask("Title", { validate: (v) => (v ? null : "A title is needed.") });
const slug = await ask("Address name (slug)", {
  def: slugify(title),
  validate: (v) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) return "Use lowercase letters, numbers and hyphens only.";
    if (works.some((w) => w.slug === v)) return `"${v}" is already used by another work.`;
    return null;
  },
});
console.log("Artists:");
real.forEach((a, i) => console.log(`  ${i + 1}. ${a.name}`));
let artist = null;
await ask("Artist (number, or Enter if unknown)", {
  validate: (v) => {
    if (!v) return null;
    artist = real[Number(v) - 1] ?? real.find((a) => a.slug === v) ?? null;
    return artist ? null : "Pick a number from the list, or press Enter.";
  },
});
const material = await ask("Medium (optional, e.g. Oil on canvas)");
const year = await ask("Year (optional)");
const dimensions = await ask("Dimensions (optional)");
const description = await ask("Short description (optional)");
const featured = /^y/i.test(await ask("Show in Featured works on the home page? (y/n)", { def: "n" }));

console.log(`\nAbout to add "${title}" (${slug}), ${artist?.name ?? "artist unknown"}.`);
if (/^n/i.test(await ask("Go ahead? (y/n)", { def: "y" }))) fail("Cancelled. Nothing was changed.");
rl.close();

// ---------- prepare the image ----------

mkdirSync("public/artworks", { recursive: true });
let thumbnail;
let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  /* copied as-is below */
}
if (sharp) {
  const out = `public/artworks/${slug}.webp`;
  await sharp(source)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`\nImage saved: ${out} (${kb(out)} KB)`);
  thumbnail = `/artworks/${slug}.webp`;
} else {
  const ext = extname(source).toLowerCase();
  const out = `public/artworks/${slug}${ext}`;
  copyFileSync(source, out);
  console.warn(`\nCould not resize the image (sharp is missing); copied it as-is: ${out} (${kb(out)} KB)`);
  thumbnail = `/artworks/${slug}${ext}`;
}

// ---------- catalogue entry ----------

try {
  await addWork({
    slug,
    title,
    description,
    artistSlug: artist?.slug ?? "",
    thumbnail,
    material,
    year,
    dimensions,
    featured,
  });
} catch (err) {
  fail(err.message);
}
console.log(`Added "${title}" to lib/sculptures.ts`);
console.log(`\nDone. Open ${BASE}/artworks/${slug} to check it, then commit the image and lib/sculptures.ts.`);
