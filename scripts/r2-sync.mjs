// Uploads the files the site loads from the Cloudflare R2 bucket (lib/assets.ts):
// each work's model, AR copy, card preview and thumbnail, from public/ to the
// same path in the bucket. Only new or changed files are sent; what's been sent
// is recorded in scripts/r2-manifest.json (commit it with the change).
//
//   npm run r2-sync                 upload what's new or changed
//   npm run r2-sync -- --dry-run    list it, upload nothing
//   npm run r2-sync -- --all        upload everything again
//
// Needs R2_BUCKET (in .env.local or the environment) and a Cloudflare login:
// `npx wrangler login` once, or CLOUDFLARE_API_TOKEN for a non-interactive run.
// Run it BEFORE pushing a change that refers to new files, or the live site
// asks the bucket for files that aren't there yet. Full notes: docs/r2-assets.md.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadWorks } from "./lib/catalogue.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const all = args.includes("--all");

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const bucket = process.env.R2_BUCKET;
if (!bucket && !dryRun) {
  console.error("Set R2_BUCKET (the bucket's name) in .env.local first.");
  process.exit(1);
}

const MANIFEST = "scripts/r2-manifest.json";
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};

// Same as next.config.ts gives the files under public/: a day, then revalidate
// in the background. Replaced files get a new ?v=, which is a new address.
const CACHE = "public, max-age=86400, stale-while-revalidate=2592000";
const TYPES = {
  ".glb": "model/gltf-binary",
  ".usdz": "model/vnd.usdz+zip",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

// The site paths to keep in the bucket. Works are read with no
// NEXT_PUBLIC_ASSET_BASE set, so their paths are still /sculptures/… etc.
const works = await loadWorks();
const paths = new Set();
const add = (url) => url && paths.add(url.split("?")[0]);
for (const w of works) {
  add(w.thumbnail);
  add(w.modelUrl);
  add(w.usdzUrl);
  if (w.modelUrl) {
    add(`/previews/${w.slug}.glb`);
    add(`/ar/${w.slug}.glb`);
  }
}
// Blog posts show thumbnails by slug (lib/blog-posts/images.ts): send them all.
for (const f of readdirSync("public/thumbnails")) add(`/thumbnails/${f}`);

const missing = [];
const todo = [];
for (const path of [...paths].sort()) {
  const file = join("public", path);
  if (!existsSync(file)) {
    missing.push(path);
    continue;
  }
  const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
  if (all || manifest[path] !== hash) todo.push({ path, file, hash });
}

if (missing.length) {
  console.warn(`Not in public/ (not uploaded):\n  ${missing.join("\n  ")}`);
}
console.log(`${paths.size} files, ${todo.length} to upload${dryRun ? " (dry run)" : ""}.`);
if (dryRun) {
  for (const t of todo) console.log(`  ${t.path}`);
  process.exit(0);
}

const put = ({ path, file }) =>
  new Promise((resolve, reject) => {
    const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
    const child = spawn(
      "npx",
      [
        "--yes", "wrangler@4", "r2", "object", "put", `${bucket}${path}`,
        "--file", file, "--remote",
        "--content-type", TYPES[ext] ?? "application/octet-stream",
        "--cache-control", `"${CACHE}"`,
      ],
      { shell: true, stdio: ["ignore", "ignore", "pipe"] },
    );
    let err = "";
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${path}: wrangler exited ${code}\n${err}`)),
    );
  });

// A few at a time; the manifest is saved after each file so a failed run resumes.
let done = 0;
let failed = 0;
const queue = [...todo];
const worker = async () => {
  for (let t; (t = queue.shift()); ) {
    try {
      await put(t);
      manifest[t.path] = t.hash;
      writeFileSync(MANIFEST, JSON.stringify(manifest, Object.keys(manifest).sort(), 2) + "\n");
      console.log(`  [${++done}/${todo.length}] ${t.path}`);
    } catch (e) {
      failed++;
      console.error(String(e.message ?? e));
    }
  }
};
await Promise.all(Array.from({ length: 6 }, worker));
console.log(failed ? `${failed} failed; run it again to retry them.` : "All uploaded.");
process.exit(failed ? 1 : 0);
