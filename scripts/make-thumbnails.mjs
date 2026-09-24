// Renders a WebP thumbnail for works that have a 3D model.
//
//   npm run dev                      (in another terminal — the site must be running)
//   npm run thumbnails               all works with a model
//   npm run thumbnails -- my-slug    just that work
//   npm run thumbnails -- --base http://localhost:3100    if the site is on another port
//
// Output: public/thumbnails/<slug>.webp (transparent, 800×1000).
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const args = process.argv.slice(2);
const baseAt = args.indexOf("--base");
const BASE = baseAt > -1 ? args[baseAt + 1] : "http://localhost:3000";
const wanted = args.filter((a, i) => !a.startsWith("--") && i !== baseAt + 1);
const OUT = "public/thumbnails";

// Load the catalogue itself (Node can read the .ts file directly).
const { sculptures } = await import(pathToFileURL(resolve("lib/sculptures.ts")).href);

const withModels = sculptures.filter((w) => w.modelUrl);
const entries = wanted.length ? withModels.filter((w) => wanted.includes(w.slug)) : withModels;

for (const slug of wanted) {
  if (!withModels.some((w) => w.slug === slug)) {
    console.error(`No work with a 3D model called "${slug}" in lib/sculptures.ts.`);
    process.exit(1);
  }
}
if (entries.length === 0) {
  console.log("No works with a 3D model — nothing to do.");
  process.exit(0);
}

// Fail early, with a useful message, if the site isn't running.
try {
  await fetch(BASE, { signal: AbortSignal.timeout(5000) });
} catch {
  console.error(`Could not reach ${BASE}. Start the site first with "npm run dev" (in another terminal).`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1100, deviceScaleFactor: 1 });

  for (const { slug } of entries) {
    const res = await page.goto(`${BASE}/artworks/thumb/${slug}`, { waitUntil: "networkidle0" });
    if (!res?.ok()) throw new Error(`${slug}: thumbnail route returned ${res?.status()}`);
    await page.waitForFunction(() => window.__thumbReady === true, {
      timeout: 120_000,
      polling: 250,
    });

    const dataUrl = await page.evaluate(() => {
      const canvas = document.querySelector("#thumb-stage canvas");
      return canvas ? canvas.toDataURL("image/webp", 0.86) : null;
    });
    if (!dataUrl) throw new Error(`No canvas rendered for ${slug}`);

    const file = `${OUT}/${slug}.webp`;
    writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
    console.log(`Created ${file}`);
  }
} finally {
  await browser.close();
}
