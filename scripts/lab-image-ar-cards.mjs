// Builds the printed AR cards of the image-target prototype (/lab/image-ar):
// public/lab/image-ar/<slug>.png. Then run lab-image-ar-targets.mjs.
//   node scripts/lab-image-ar-cards.mjs
import sharp from "sharp";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { sculptures } = await import(pathToFileURL(resolve("lib/sculptures.ts")).href);
const { artists } = await import(pathToFileURL(resolve("lib/artists.ts")).href);
const SLUGS = ["khanna-kc-the-bandmaster", "thota-female-head-with-polka-dot-collar", "sugandh-meri-patang", "thota-yellow-saree-lady"];
const W = 1000, H = 1300, B = 70; // card size, border width
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
// A different high-contrast border pattern per card.
const patterns = [
  (c) => `<pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#fff"/><path d="M0 40 L20 0 L40 40 Z" fill="${c}"/><circle cx="20" cy="30" r="4" fill="#fff"/></pattern>`,
  (c) => `<pattern id="p" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="${c}"/><circle cx="9" cy="9" r="6" fill="#fff"/><circle cx="27" cy="27" r="6" fill="#fff"/><rect x="24" y="4" width="8" height="8" fill="#111"/></pattern>`,
  (c) => `<pattern id="p" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#fff"/><path d="M22 2 L42 22 L22 42 L2 22 Z" fill="${c}"/><path d="M22 14 L30 22 L22 30 L14 22 Z" fill="#fff"/><circle cx="22" cy="22" r="3" fill="#111"/></pattern>`,
  (c) => `<pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#fff"/><rect width="20" height="20" fill="${c}"/><rect x="20" y="20" width="20" height="20" fill="#111"/><circle cx="30" cy="10" r="5" fill="${c}"/></pattern>`,
];
const colours = ["#b4532a", "#396046", "#2f4f8f", "#8a6a3f"];
for (const [i, slug] of SLUGS.entries()) {
  const w = sculptures.find((s) => s.slug === slug);
  const a = artists.find((x) => x.slug === w.artistSlug);
  const art = await sharp(resolve("public" + w.thumbnail.split("?")[0]))
    .trim({ threshold: 1 })
    .resize(W - 2 * B - 80, 860, { fit: "contain", background: "#f0f0f0" })
    .flatten({ background: "#f0f0f0" })
    .png().toBuffer();
  const meta = await sharp(art).metadata();
  const title = w.title.length > 34 ? w.title.slice(0, 33) + "…" : w.title;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>${patterns[i](colours[i])}</defs>
    <rect width="${W}" height="${H}" fill="url(#p)"/>
    <rect x="${B}" y="${B}" width="${W - 2 * B}" height="${H - 2 * B}" fill="#f0f0f0" stroke="#111" stroke-width="6"/>
    <rect x="${B}" y="${H - B - 230}" width="${W - 2 * B}" height="230" fill="#fff" stroke="#111" stroke-width="6"/>
    <text x="${W / 2}" y="${H - B - 150}" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="#111">${esc(title)}</text>
    <text x="${W / 2}" y="${H - B - 90}" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="${colours[i]}">${esc(a?.name ?? "")}</text>
    <text x="${W / 2}" y="${H - B - 40}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" letter-spacing="4" fill="#555">SCULPTED INDIA · AR CARD ${i + 1}</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: art, left: Math.round((W - meta.width) / 2), top: B + 20 + Math.round((860 - meta.height) / 2) }])
    .png().toFile(`public/lab/image-ar/${slug}.png`);
  console.log(`public/lab/image-ar/${slug}.png  height ${w.heightCm} cm`);
}
