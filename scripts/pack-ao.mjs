// Pack a baked ambient occlusion (AO) map into a model, ready for `npm run add-model`.
//
//   node scripts/pack-ao.mjs "<model.glb>" "<ao.png>" "<out.glb>"
//
// The AO image (greyscale, same UV layout as the model) goes into the red
// channel of the model's metallic-roughness texture, which then also serves as
// its occlusionTexture: the standard glTF "ORM" packing, so the AO adds no
// extra texture to download. The model must have one material with a
// metallic-roughness texture. Then swap it in with
//   npm run add-model -- "<out.glb>" --slug <slug> --replace
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import sharp from "sharp";
const [src, aoFile, out] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
const mat = doc.getRoot().listMaterials()[0];
const mr = mat.getMetallicRoughnessTexture();
if (!mr) throw new Error(`${src} has no metallic-roughness texture to pack the AO into.`);
const mrImg = sharp(Buffer.from(mr.getImage()));
const { width, height } = await mrImg.metadata();
const g = await sharp(Buffer.from(mr.getImage())).extractChannel(1).raw().toBuffer();
const b = await sharp(Buffer.from(mr.getImage())).extractChannel(2).raw().toBuffer();
const r = await sharp(aoFile).toColourspace("b-w").extractChannel(0).resize(width, height, { kernel: "lanczos3" }).raw().toBuffer();
const orm = Buffer.alloc(width * height * 3);
for (let i = 0; i < width * height; i++) { orm[i * 3] = r[i]; orm[i * 3 + 1] = g[i]; orm[i * 3 + 2] = b[i]; }
const png = await sharp(orm, { raw: { width, height, channels: 3 } }).png().toBuffer();
mr.setImage(png).setMimeType("image/png").setName("occlusionRoughnessMetallic");
mat.setOcclusionTexture(mr).setOcclusionStrength(1);
mat.getOcclusionTextureInfo().setTexCoord(0);
await io.write(out, doc);
let s = 0, mn = 255; for (let i = 0; i < r.length; i += 97) { s += r[i]; mn = Math.min(mn, r[i]); }
console.log(`packed AO ${width}x${height}, AO avg ${(s / Math.ceil(r.length / 97) / 255).toFixed(2)} min ${(mn / 255).toFixed(2)} -> ${out}`);
