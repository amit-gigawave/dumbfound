// Copies three's Draco decoder into /public/draco so models decode without
// hitting gstatic.com. Runs on postinstall to stay in sync with the three version.
import { cpSync, existsSync, mkdirSync } from "node:fs";

const src = "node_modules/three/examples/jsm/libs/draco/gltf";
const dest = "public/draco";

if (!existsSync(src)) {
  console.warn(`[copy-draco] ${src} not found, skipping`);
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
for (const f of ["draco_decoder.js", "draco_decoder.wasm", "draco_wasm_wrapper.js"]) {
  cpSync(`${src}/${f}`, `${dest}/${f}`);
}
console.log(`[copy-draco] decoder copied to ${dest}`);
