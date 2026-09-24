// Renders a WebP thumbnail for every sculpture and prints GLB stats.
//
//   npm run dev            (in another terminal)
//   npm run thumbnails     [-- --base http://localhost:3000]
//
// Output: public/thumbnails/<slug>.webp (transparent, 800×1000).
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import puppeteer from "puppeteer";

const baseArg = process.argv.indexOf("--base");
const BASE = baseArg > -1 ? process.argv[baseArg + 1] : "http://localhost:3000";
const OUT = "public/thumbnails";

// Read slug + modelUrl pairs straight from the catalogue source.
const catalogue = readFileSync("lib/sculptures.ts", "utf8");
// Each sculpture entry starts with `{` then `slug:`; the artist object's slug
// is skipped because it isn't the first key of its object literal.
const entries = [
  ...catalogue.matchAll(/\{\s*slug: "([^"]+)",[^{}]*?modelUrl: "([^"]+)"/g),
].map(([, slug, modelUrl]) => ({ slug, modelUrl }));
if (entries.length === 0) throw new Error("No sculptures found in lib/sculptures.ts");

/** Triangle count from the GLB's JSON chunk (works with Draco-compressed meshes). */
const glbStats = (modelUrl) => {
  const path = `public${modelUrl}`;
  const buf = readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
  let triangles = 0;
  for (const mesh of gltf.meshes ?? []) {
    for (const prim of mesh.primitives) {
      const acc = prim.indices ?? prim.attributes.POSITION;
      triangles += gltf.accessors[acc].count / 3;
    }
  }
  return {
    triangles: Math.round(triangles),
    fileSizeKB: Math.round(statSync(path).size / 1024),
  };
};

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

  for (const { slug, modelUrl } of entries) {
    const res = await page.goto(`${BASE}/gallery/thumb/${slug}`, { waitUntil: "networkidle0" });
    if (!res?.ok()) throw new Error(`${slug}: thumbnail route returned ${res?.status()}`);
    await page.waitForFunction(() => window.__thumbReady === true, { timeout: 120_000, polling: 250 });

    const dataUrl = await page.evaluate(() => {
      const canvas = document.querySelector("#thumb-stage canvas");
      return canvas ? canvas.toDataURL("image/webp", 0.86) : null;
    });
    if (!dataUrl) throw new Error(`No canvas rendered for ${slug}`);

    const file = `${OUT}/${slug}.webp`;
    writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
    const stats = glbStats(modelUrl);
    console.log(`${file}  stats: { triangles: ${stats.triangles}, fileSizeKB: ${stats.fileSizeKB} }`);
  }
} finally {
  await browser.close();
}
