// Runs the model checks on a file and reports; changes nothing.
//
//   npm run check-model -- "<file>"     .glb, .usdz or .usdc
//
// USD files are converted with Blender to a temporary GLB first.
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { convertUsd } from "./lib/blender.mjs";
import { inspect, makeIO, printReport } from "./lib/model-checks.mjs";

const file = process.argv[2] && resolve(process.argv[2].replace(/^["']|["']$/g, ""));
if (!file || !existsSync(file)) {
  console.error('Give a model file, e.g.  npm run check-model -- "public/sculptures/scan.glb"');
  process.exit(1);
}

const ext = extname(file).toLowerCase();
let glb = file;
let temp = null;
if (ext === ".usdz" || ext === ".usdc") {
  temp = mkdtempSync(join(tmpdir(), "check-model-"));
  glb = join(temp, "model.glb");
  console.log("Converting with Blender…");
  convertUsd(file, glb);
} else if (ext !== ".glb") {
  console.error(`Expected a .glb, .usdz or .usdc file, not "${ext}".`);
  process.exit(1);
}

try {
  const report = await inspect(await (await makeIO()).read(glb));
  console.log(`\n${file}`);
  printReport(report);
  process.exitCode = report.problems.length ? 1 : 0;
} finally {
  if (temp) rmSync(temp, { recursive: true, force: true });
}
