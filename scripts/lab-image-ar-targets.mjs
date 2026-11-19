// Compiles the AR cards into public/lab/image-ar/targets.mind with MindAR's
// own compiler, run in Chrome against the dev server (npm run dev first).
// Keep SLUGS in the same order as CARD_SLUGS in app/lab/image-ar/page.tsx.
//   node scripts/lab-image-ar-targets.mjs
import puppeteer from "puppeteer";
import { writeFileSync } from "node:fs";
const SLUGS = ["khanna-kc-the-bandmaster", "thota-female-head-with-polka-dot-collar", "sugandh-meri-patang", "thota-yellow-saree-lady"];
const b = await puppeteer.launch({ headless: true, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
p.on("console", (m) => /progress|error/i.test(m.text()) && console.log("  page:", m.text().slice(0, 120)));
await p.goto("http://localhost:3000/robots.txt", { waitUntil: "load" });
const b64 = await p.evaluate(async (slugs) => {
  const { Compiler } = await import("/vendor/mindar-1.2.5/mindar-image.prod.js");
  const images = await Promise.all(slugs.map((s) => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = `/lab/image-ar/${s}.png`;
  })));
  const compiler = new Compiler();
  let last = -10;
  await compiler.compileImageTargets(images, (pct) => { if (pct - last >= 25) { last = pct; console.log("progress " + Math.round(pct) + "%"); } });
  const data = await compiler.exportData();
  let s = "";
  const u = new Uint8Array(data);
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
}, SLUGS);
writeFileSync("public/lab/image-ar/targets.mind", Buffer.from(b64, "base64"));
console.log("public/lab/image-ar/targets.mind", Math.round(Buffer.from(b64, "base64").length / 1024), "KB, targets:", SLUGS.length);
await b.close();
