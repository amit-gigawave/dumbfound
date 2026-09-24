// Adds an artwork to the site.
//
//   npm run add-work
//
// Asks a few questions, prepares the image or 3D model, writes the entry into
// lib/sculptures.ts and (for 3D works, when the site is running) makes the
// thumbnail. Full guide: docs/adding-artworks.md
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const CATALOGUE = "lib/sculptures.ts";
const BASE = process.env.SITE_URL ?? "http://localhost:3000";

// ---------- small helpers ----------

const rl = createInterface({ input: process.stdin, terminal: false });
const lines = rl[Symbol.asyncIterator]();

/** Ask one question. Empty answer returns `def` (if any). Re-asks until valid. */
async function ask(question, { def, validate } = {}) {
  for (;;) {
    process.stdout.write(`${question}${def !== undefined ? ` [${def}]` : ""}: `);
    const { value, done } = await lines.next();
    if (done) fail("\nInput ended before all questions were answered.");
    const answer = value.trim() || def || "";
    const problem = validate?.(answer);
    if (!problem) return answer;
    console.log(`  ${problem}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const load = (file, bust = "") =>
  import(pathToFileURL(resolve(file)).href + bust);

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Windows "Copy as path" wraps paths in quotes; drag-and-drop may too. */
const cleanPath = (p) => p.trim().replace(/^["']|["']$/g, "");

const kb = (file) => Math.round(statSync(file).size / 1024);

const required = (label) => (v) => (v ? null : `${label} is required.`);

// ---------- questions ----------

const { artists } = await load("lib/artists.ts");
const { sculptures } = await load(CATALOGUE);
const realArtists = artists.filter((a) => !a.placeholder);
if (realArtists.length === 0) {
  fail("There are no artists yet. Add one to lib/artists.ts first (see docs/adding-artworks.md).");
}

console.log("\nAdd an artwork\n");

console.log("Artists:");
realArtists.forEach((a, i) => console.log(`  ${i + 1}. ${a.name}  (${a.slug})`));
let artist;
await ask("Which artist? (number or slug)", {
  def: realArtists.length === 1 ? "1" : undefined,
  validate: (v) => {
    artist = realArtists[Number(v) - 1] ?? realArtists.find((a) => a.slug === v);
    return artist ? null : "Pick a number from the list, or type an artist slug.";
  },
});

const title = await ask("Title", { validate: required("Title") });
const slug = await ask("Address name (slug)", {
  def: slugify(title),
  validate: (v) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) return "Use lowercase letters, numbers and hyphens only.";
    if (sculptures.some((w) => w.slug === v)) return `"${v}" is already used by another work.`;
    return null;
  },
});
const year = await ask("Year (e.g. 2024)", { validate: required("Year") });
const material = await ask("Medium / material (e.g. Patinated bronze, Oil on canvas)", {
  validate: required("Medium"),
});
const description = await ask("Short description (one or two sentences)", {
  validate: required("Description"),
});
const featured = /^y/i.test(await ask("Show in Featured works on the home page? (y/n)", { def: "n" }));

console.log("\nWhat do you have for this work?\n  1. A 3D model (.glb)\n  2. An image (.jpg, .png or .webp)");
const kind = await ask("Choose 1 or 2", { validate: (v) => (v === "1" || v === "2" ? null : "Type 1 or 2.") });
const is3d = kind === "1";

const okExt = is3d ? [".glb"] : [".jpg", ".jpeg", ".png", ".webp"];
let source = "";
await ask(`Path to the ${is3d ? ".glb file" : "image"} (you can paste or drag the file here)`, {
  validate: (v) => {
    source = resolve(cleanPath(v));
    if (!existsSync(source)) return "That file was not found.";
    if (!okExt.includes(extname(source).toLowerCase())) return `Expected a ${okExt.join(" / ")} file.`;
    return null;
  },
});

console.log(`
About to add:
  ${title}  (${slug})
  by ${artist.name}, ${year}, ${material}
  ${is3d ? "3D model" : "Image"}: ${source}
  Featured on home page: ${featured ? "yes" : "no"}`);
if (/^n/i.test(await ask("Go ahead? (y/n)", { def: "y" }))) fail("Cancelled. Nothing was changed.");
rl.close();

// ---------- prepare the file ----------

let thumbnail;
let modelUrl;

if (is3d) {
  mkdirSync("public/sculptures", { recursive: true });
  const out = `public/sculptures/${slug}.glb`;
  console.log("\nCompressing the model (Draco + WebP). This can take a minute…");
  const run = spawnSync(
    `npx --yes @gltf-transform/cli optimize "${source}" "${out}" --compress draco --texture-compress webp --texture-size 2048`,
    { stdio: "inherit", shell: true },
  );
  if (run.status !== 0 || !existsSync(out)) {
    console.warn("\nCompression failed — using the original file instead. It may be large and slow to load.");
    copyFileSync(source, out);
  }
  const size = kb(out);
  console.log(`Model saved: ${out} (${size} KB)`);
  if (size > 1500) console.warn("  Warning: over 1.5 MB. Consider reducing the model's detail or textures.");
  modelUrl = `/sculptures/${slug}.glb`;
  thumbnail = `/thumbnails/${slug}.webp`;
} else {
  mkdirSync("public/artworks", { recursive: true });
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    sharp = null;
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
}

// ---------- write the catalogue entry ----------

const str = (v) => JSON.stringify(v);
const entry = [
  "  {",
  `    slug: ${str(slug)},`,
  `    title: ${str(title)},`,
  `    description: ${str(description)},`,
  `    artistSlug: ${str(artist.slug)},`,
  `    thumbnail: ${str(thumbnail)},`,
  ...(modelUrl ? [`    modelUrl: ${str(modelUrl)},`] : []),
  `    material: ${str(material)},`,
  `    year: ${str(year)},`,
  ...(featured ? ["    featured: true,"] : []),
  "  },",
].join("\n");

const original = readFileSync(CATALOGUE, "utf8");
const arrayStart = original.indexOf("export const sculptures: Sculpture[] = [");
const arrayEnd = arrayStart === -1 ? -1 : original.indexOf("\n];", arrayStart);
if (arrayEnd === -1) fail(`Could not find the list of works in ${CATALOGUE}. Add the entry by hand (see docs/adding-artworks.md).`);

writeFileSync(CATALOGUE, `${original.slice(0, arrayEnd)}\n${entry}${original.slice(arrayEnd)}`);

// Make sure the file still loads and now contains the work; otherwise undo.
try {
  const { sculptures: after } = await load(CATALOGUE, `?check=${Date.now()}`);
  if (!after.some((w) => w.slug === slug)) throw new Error("new entry not found");
} catch (err) {
  writeFileSync(CATALOGUE, original);
  fail(`Something went wrong writing ${CATALOGUE} (${err.message}). The file was restored; no entry was added.`);
}
console.log(`Added "${title}" to ${CATALOGUE}`);

// ---------- thumbnail (3D works only) ----------

if (is3d) {
  let running = false;
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(3000) });
    running = true;
  } catch {
    /* not running */
  }
  if (running) {
    console.log("\nMaking the thumbnail…");
    const t = spawnSync(
      process.execPath,
      [
        "--disable-warning=ExperimentalWarning",
        "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
        "scripts/make-thumbnails.mjs",
        slug,
        "--base",
        BASE,
      ],
      { stdio: "inherit" },
    );
    if (t.status !== 0) {
      console.warn(`\nThe thumbnail could not be made. Fix the problem above, then run:  npm run thumbnails -- ${slug}`);
    }
  } else {
    console.log(`
The site is not running, so the thumbnail was not made yet. To make it:
  1. In one terminal:      npm run dev
  2. In another terminal:  npm run thumbnails -- ${slug}`);
  }
}

console.log(`\nDone. Open ${BASE}/artworks/${slug} to check it.`);
