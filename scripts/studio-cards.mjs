// One QR code per work for the printed cards. Scanning it opens the Studio scan app
// with that work already chosen (?work=<slug>), so the card is recognised instantly
// instead of the app searching all works.
//   node scripts/studio-cards.mjs --out "<folder>" [--base https://sculpted-india-ar.vercel.app]
// Writes <out>/qr/<slug>.png and <out>/cards.csv (slug,title,artist,url).
import QRCode from "qrcode";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const OUT = resolve(arg("--out", ""));
if (!arg("--out")) throw new Error('usage: --out "<folder>" [--base <url>]');
const BASE = arg("--base", "https://sculpted-india-ar.vercel.app").replace(/\/$/, "");

const works = JSON.parse(readFileSync(join(OUT, "works.json"), "utf8"));
mkdirSync(join(OUT, "qr"), { recursive: true });
const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
const rows = ["slug,title,artist,url"];
for (const w of works) {
  const url = `${BASE}/?work=${w.slug}`;
  await QRCode.toFile(join(OUT, "qr", `${w.slug}.png`), url, { width: 800, margin: 2, errorCorrectionLevel: "M" });
  rows.push([w.slug, q(w.title), q(w.artist), url].join(","));
}
writeFileSync(join(OUT, "cards.csv"), rows.join("\n") + "\n");
console.log(`${works.length} QR codes in ${join(OUT, "qr")} and ${join(OUT, "cards.csv")}`);
