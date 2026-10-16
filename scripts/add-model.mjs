// Adds a 3D work to the site, or updates one, in one go.
//
//   npm run add-model -- "<file>"                         new work (.glb, .usdz or .usdc)
//   npm run add-model -- "<file>" --slug <slug> --replace new model for an existing work
//   npm run add-model -- --slug <slug> --facing 180       turn an existing work
//
// Steps: convert USD with Blender → fix and check the model (opaque,
// single-sided, white colour layers, winding) → compress (Draco + WebP, 4096 px
// textures for detailed scans) → write the entry in lib/sculptures.ts → render
// the thumbnail (starting the site if it isn't running) → ask whether it faces
// front → build the AR copy. Nothing is committed. Guide: docs/adding-artworks.md
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { spawn, spawnSync } from "node:child_process";
import { addWork, bumpVersion, load, loadWorks, slugify, updateWork } from "./lib/catalogue.mjs";
import { convertUsd } from "./lib/blender.mjs";
import { fix, inspect, makeIO, printReport } from "./lib/model-checks.mjs";

// ---------- arguments ----------

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);
const VALUED = ["slug", "facing", "base"];
const file = argv.find(
  (a, i) => !a.startsWith("--") && !VALUED.some((v) => argv[i - 1] === `--${v}`),
);
const replace = has("replace");
const noOpen = has("no-open");
let slug = flag("slug");
const facingArg = flag("facing");
const BASE = flag("base") ?? process.env.SITE_URL ?? "http://localhost:3000";

const fail = (message) => {
  console.error(`\n${message}`);
  process.exit(1);
};
const kb = (f) => Math.round(statSync(f).size / 1024);
/** Largest model kept at 4096 px textures; heavier ones are redone at 2048. */
const MAX_KB_AT_4096 = 3000;
const node = (script, args) =>
  spawnSync(
    process.execPath,
    ["--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", script, ...args],
    { stdio: "inherit" },
  ).status === 0;

// ---------- questions ----------

const rl = createInterface({ input: process.stdin, terminal: false });
const lines = rl[Symbol.asyncIterator]();
async function ask(question, { def = "", validate, endOk = false } = {}) {
  for (;;) {
    process.stdout.write(`${question}${def ? ` [${def}]` : ""}: `);
    const { value, done } = await lines.next();
    if (done && endOk) return def;
    if (done) fail("Input ended before all questions were answered.");
    const answer = value.trim() || def;
    const problem = validate?.(answer);
    if (!problem) return answer;
    console.log(`  ${problem}`);
  }
}

const parseFacing = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? ((n % 360) + 360) % 360 : null;
};

// ---------- what are we doing? ----------

let works = await loadWorks();
const source = file ? resolve(file.replace(/^["']|["']$/g, "")) : null;
if (!source && !slug) {
  fail('Give a model file, e.g.  npm run add-model -- "public/sculptures/scan.usdz"\nor a work to update, e.g.  npm run add-model -- --slug female-head --facing 180');
}
if (source) {
  if (!existsSync(source)) fail(`File not found: ${source}`);
  const ext = extname(source).toLowerCase();
  if (![".glb", ".usdz", ".usdc"].includes(ext)) fail(`Expected a .glb, .usdz or .usdc file, not "${ext || basename(source)}".`);
}
if (facingArg !== undefined && parseFacing(facingArg) === null) fail(`--facing must be a number of degrees, e.g. 180.`);

const existing = slug ? works.find((w) => w.slug === slug) : undefined;
if (slug && !source && !existing) fail(`There is no work "${slug}" in lib/sculptures.ts.`);
if (existing && source && !replace) {
  fail(`"${slug}" already exists. Add --replace to give it this new model, or pick another --slug.`);
}
if (replace && !existing) fail(`--replace needs --slug of an existing work.`);

let isNew = !existing;
let details = {};

if (isNew) {
  const { artists } = await load("lib/artists.ts");
  const real = artists.filter((a) => !a.placeholder);
  console.log(`\nNew 3D work from ${basename(source)}`);
  console.log("Leave anything you don't know empty: unknown details stay hidden on the site.\n");
  const title = await ask("Title", { validate: (v) => (v ? null : "A title is needed.") });
  slug = await ask("Address name (slug)", {
    def: slug ?? slugify(title),
    validate: (v) => {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) return "Use lowercase letters, numbers and hyphens only.";
      if (works.some((w) => w.slug === v)) return `"${v}" is already used.`;
      return null;
    },
  });
  console.log("Artists:");
  real.forEach((a, i) => console.log(`  ${i + 1}. ${a.name}`));
  let artistSlug = "";
  await ask("Artist (number, or Enter if unknown)", {
    validate: (v) => {
      if (!v) return null;
      const a = real[Number(v) - 1] ?? real.find((x) => x.slug === v);
      if (!a) return "Pick a number from the list, or press Enter.";
      artistSlug = a.slug;
      return null;
    },
  });
  details = {
    title,
    artistSlug,
    material: await ask("Medium (optional)"),
    year: await ask("Year (optional)"),
    dimensions: await ask("Dimensions, e.g. 14 × 5 × 6 inches (optional)"),
    edition: await ask("Edition, e.g. 3 of 9 (optional)"),
    description: await ask("Short description (optional)"),
  };
  const artistName = real.find((a) => a.slug === artistSlug)?.name ?? "artist unknown";
  console.log(`\nAbout to add "${title}" (${slug}), ${artistName}.`);
  if (/^n/i.test(await ask("Go ahead? (y/n)", { def: "y" }))) fail("Cancelled. Nothing was changed.");
}

// ---------- model: convert, fix, check, compress ----------

const summary = [];
let modelUrl = existing?.modelUrl;
// A replaced model overwrites the work's current file (whatever its name).
const out = `public${(replace && existing.modelUrl ? existing.modelUrl : `/sculptures/${slug}.glb`).split("?")[0]}`;

if (source) {
  mkdirSync(".glb-backup/web", { recursive: true });
  const master = resolve(`.glb-backup/web/${slug}.glb`);
  const ext = extname(source).toLowerCase();

  if (ext === ".glb") {
    if (resolve(source) !== master) copyFileSync(source, master);
  } else {
    console.log("\nConverting with Blender…");
    rmSync(master, { force: true });
    try {
      convertUsd(source, master);
    } catch (err) {
      fail(err.message);
    }
  }
  summary.push(`Original kept in .glb-backup/web/${slug}.glb (not committed)`);

  console.log("\nChecking the model…");
  const io = await makeIO();
  const doc = await io.read(master);
  const report = await inspect(doc);
  if (report.problems.length) {
    printReport(report);
    fail("Not published: fix the problem above and run the command again. lib/sculptures.ts was not changed.");
  }
  await fix(doc);
  printReport(report, { fixed: true });
  const fixedFile = resolve(`.glb-backup/web/${slug}.fixed.glb`);
  await io.write(fixedFile, doc);

  mkdirSync("public/sculptures", { recursive: true });
  const compress = (px) => {
    console.log(`\nCompressing (Draco + WebP, ${px} px textures)…`);
    rmSync(out, { force: true });
    const run = spawnSync(
      `npx --yes @gltf-transform/cli@4.5.1 optimize "${fixedFile}" "${out}" --compress draco --texture-compress webp --texture-size ${px}`,
      { stdio: "inherit", shell: true },
    );
    if (run.status !== 0 || !existsSync(out)) fail("Compression failed (see above). lib/sculptures.ts was not changed.");
    return kb(out);
  };
  let size = compress(report.textureSize);
  // 4096 px keeps single-texture scans sharp; with several texture maps it
  // gets too heavy for phones, so fall back to 2048.
  if (report.textureSize === 4096 && size > MAX_KB_AT_4096) {
    console.log(`  ${size} KB at 4096 px is too heavy (limit ${MAX_KB_AT_4096} KB); redoing at 2048 px.`);
    size = compress(2048);
  }
  rmSync(fixedFile, { force: true });
  summary.push(`Model ${out} (${size} KB)`);
  if (size > 6000) console.warn(`  Warning: ${size} KB is heavy for phones. Consider asking for a lighter mesh.`);

  modelUrl = replace ? bumpVersion(existing.modelUrl ?? out.slice("public".length)) : out.slice("public".length);
}

// ---------- catalogue entry ----------

const facing = facingArg !== undefined ? parseFacing(facingArg) : existing?.facing ?? 0;
try {
  if (isNew) {
    await addWork(
      { slug, ...details, thumbnail: `/thumbnails/${slug}.webp`, modelUrl, facing },
      `Added with npm run add-model from ${basename(source)}.`,
    );
    summary.push(`Entry added to lib/sculptures.ts`);
  } else {
    const changes = { facing };
    if (source) changes.modelUrl = modelUrl;
    await updateWork(slug, changes);
    summary.push(`Entry updated in lib/sculptures.ts${source ? ` (modelUrl ${modelUrl})` : ""}`);
  }
} catch (err) {
  fail(err.message);
}

// ---------- thumbnail, with a facing check ----------

/** Uses the running site, or starts one on a spare port until we're done. */
async function ensureSite() {
  const up = async (url) => {
    try {
      await fetch(url, { signal: AbortSignal.timeout(3000) });
      return true;
    } catch {
      return false;
    }
  };
  const candidates = [BASE, ...[3000, 3001, 3002, 3003, 3004, 3005].map((p) => `http://localhost:${p}`)];
  for (const url of new Set(candidates)) {
    if (await up(url)) return { base: url, stop: () => {} };
  }

  const port = 3107;
  const base = `http://localhost:${port}`;
  console.log(`
The site isn't running; starting it on :${port} for the thumbnail…`);
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let locked = false;
  const watch = (d) => {
    if (/Unable to acquire lock/.test(String(d))) locked = true;
  };
  child.stdout.on("data", watch);
  child.stderr.on("data", watch);
  const stop = () => {
    if (child.exitCode !== null) return;
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill();
  };
  process.on("exit", stop);
  for (let i = 0; i < 90 && !locked && child.exitCode === null; i++) {
    if (await up(base)) return { base, stop };
    await new Promise((r) => setTimeout(r, 1000));
  }
  stop();
  fail(
    locked
      ? `"npm run dev" is already running, but not on ports 3000-3005. Add --base with its address, e.g.
  npm run add-model -- --slug ${slug} --base http://localhost:3100`
      : `The site did not start. Run "npm run dev", then:  npm run add-model -- --slug ${slug}`,
  );
}

const openFile = (f) => {
  if (noOpen) return;
  const cmd = process.platform === "win32" ? ["cmd", ["/c", "start", "", f]] : [process.platform === "darwin" ? "open" : "xdg-open", [f]];
  spawn(cmd[0], cmd[1], { stdio: "ignore", detached: true }).unref();
};

const site = await ensureSite();
let current = facing;
const thumb = `public/thumbnails/${slug}.webp`;
try {
  for (;;) {
    console.log("\nRendering the thumbnail…");
    if (!node("scripts/make-thumbnails.mjs", [slug, "--base", site.base])) {
      console.warn(`The thumbnail could not be made. Later:  npm run thumbnails -- ${slug}`);
      break;
    }
    openFile(resolve(thumb));
    console.log(`Thumbnail: ${thumb}${noOpen ? "" : " (opened)"}; turned ${current}°.`);
    const answer = await ask("Does it face the front? Enter = yes, or type how far to turn it (90, 180, 270)", {
      validate: (v) => (!v || parseFacing(v) !== null ? null : "Type a number of degrees, or press Enter."),
      endOk: true,
    });
    if (!answer) break;
    current = (current + parseFacing(answer)) % 360;
    await updateWork(slug, { facing: current });
  }
} finally {
  site.stop();
  rl.close();
}
summary.push(`Thumbnail ${thumb}${current ? ` (facing: ${current})` : ""}`);

// ---------- AR copy ----------

console.log("\nBuilding the AR copy…");
if (node("scripts/make-ar-models.mjs", [slug])) summary.push(`AR copy public/ar/${slug}.glb`);
else console.warn(`The AR copy could not be made. Later:  npm run ar-models -- ${slug}`);

// ---------- done ----------

works = await loadWorks();
const title = works.find((w) => w.slug === slug)?.title ?? slug;
const files = [
  source && out,
  `public/thumbnails/${slug}.webp`,
  `public/ar/${slug}.glb`,
  "lib/sculptures.ts",
].filter(Boolean);
console.log(`\nDone: ${title}\n${summary.map((s) => `  • ${s}`).join("\n")}`);
console.log(`\nCheck it at ${BASE}/artworks/${slug}, then commit:`);
console.log(`  git add ${files.map((f) => `"${f}"`).join(" ")}`);
console.log(`  git commit -m "${isNew ? "Add" : replace ? "Replace the model of" : "Turn"} ${title.replace(/"/g, "'")}"`);
