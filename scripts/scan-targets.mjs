// Builds the image targets of the scan page (/scan): every 3D work's own
// thumbnail, cropped to the work and laid on white (how it prints), saved as
// public/scan/targets/<slug>.jpg, then compiled with MindAR's own compiler
// (in Chrome, against the running site) into public/scan/targets.mind.gz.
// The order is written to lib/scan-targets.json: the tracker reports a
// target by its index. Run after adding a work or re-rendering a thumbnail.
//   node scripts/scan-targets.mjs [--base http://localhost:3000]
import sharp from "sharp";
import puppeteer from "puppeteer";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const base = process.argv.includes("--base")
  ? process.argv[process.argv.indexOf("--base") + 1]
  : "http://localhost:3000";
const { sculptures } = await import(pathToFileURL(resolve("lib/sculptures.ts")).href);
const works = sculptures.filter((s) => s.modelUrl && s.thumbnail);
rmSync("public/scan/targets", { recursive: true, force: true }); // drop works no longer listed
mkdirSync("public/scan/targets", { recursive: true });

// The tracker works on detail, so the work fills the target: trimmed to its
// outline, then centred on a white square. MindAR stores each target's
// tracking images raw at a fixed size on the SHORT side, so a tall, narrow
// target costs far more than a square one with the same detail; the white
// border adds no features. MAX px is plenty for matching.
const MAX = Number(process.env.SCAN_MAX || 400);
for (const w of works) {
  await sharp(resolve("public" + w.thumbnail.split("?")[0]))
    .trim({ threshold: 1 })
    .resize(MAX - 32, MAX - 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({ top: 16, bottom: 16, left: 16, right: 16, background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90 })
    .toFile(`public/scan/targets/${w.slug}.jpg`);
}
console.log(`${works.length} target images in public/scan/targets/`);

const browser = await puppeteer.launch({ headless: true, protocolTimeout: 0, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
page.on("console", (m) => /progress|error/i.test(m.text()) && console.log("  page:", m.text().slice(0, 120)));
await page.goto(`${base}/robots.txt`, { waitUntil: "load" });
page.setDefaultTimeout(0);
const b64 = await page.evaluate(async (slugs) => {
  const { Compiler } = await import("/vendor/mindar-1.2.5/mindar-image.prod.js");
  const images = await Promise.all(slugs.map((s) => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("no image " + s));
    img.src = `/scan/targets/${s}.jpg`;
  })));
  const compiler = new Compiler();
  let last = -10;
  await compiler.compileImageTargets(images, (pct) => { if (pct - last >= 10) { last = pct; console.log("progress " + Math.round(pct) + "%"); } });
  const u = new Uint8Array(await compiler.exportData());
  let s = "";
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
}, works.map((w) => w.slug));
await browser.close();
const buf = Buffer.from(b64, "base64");
// Gzipped here and unpacked in the browser (DecompressionStream): the host
// doesn't compress a .mind file on its own, and gzip more than halves it.
const gz = gzipSync(buf, { level: 9 });
writeFileSync("public/scan/targets.mind.gz", gz);
// Kept with the code (not in public/) so the page imports it statically.
writeFileSync("lib/scan-targets.json", JSON.stringify(works.map((w) => w.slug), null, 1) + "\n");
console.log(`public/scan/targets.mind.gz  ${Math.round(gz.length / 1024)} KB (${Math.round(buf.length / 1024)} KB unpacked), ${works.length} targets`);
