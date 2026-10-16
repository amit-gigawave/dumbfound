// Finds Blender and converts USD scans (.usdz / .usdc) to GLB with it.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

/** BLENDER_PATH (environment or .env.local), the newest Windows install, or `blender` on PATH. */
export function findBlender() {
  const tried = [];
  let fromEnv = process.env.BLENDER_PATH;
  if (!fromEnv && existsSync(".env.local")) {
    fromEnv = readFileSync(".env.local", "utf8").match(/^BLENDER_PATH=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
  }
  if (fromEnv) {
    if (existsSync(fromEnv)) return fromEnv;
    tried.push(`BLENDER_PATH (${fromEnv})`);
  }

  const root = "C:\\Program Files\\Blender Foundation";
  if (existsSync(root)) {
    const installs = readdirSync(root)
      .filter((d) => /^Blender \d/.test(d))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const d of installs) {
      const exe = join(root, d, "blender.exe");
      if (existsSync(exe)) return exe;
    }
  }
  tried.push(root);

  const onPath = spawnSync("blender", ["--version"], { stdio: "ignore", shell: process.platform === "win32" });
  if (onPath.status === 0) return "blender";
  tried.push("blender on PATH");

  throw new Error(
    `Blender was not found (tried ${tried.join(", ")}). Install Blender 5.1, or set BLENDER_PATH in .env.local to blender.exe.`,
  );
}

/**
 * USD → GLB. Same as the manual command in docs/adding-artworks.md: unlinks
 * Alpha so the material is solid, turns on backface culling, and exports the
 * vertex colours (many scans keep their colour there).
 */
export function convertUsd(source, out) {
  const blender = findBlender();
  const py = (p) => JSON.stringify(resolve(p));
  const script = [
    "import bpy",
    "bpy.ops.wm.read_factory_settings(use_empty=True)",
    `bpy.ops.wm.usd_import(filepath=${py(source)})`,
    "for m in bpy.data.materials:",
    "    if m.node_tree:",
    "        m.use_backface_culling = True",
    "        for l in [l for l in m.node_tree.links if l.to_socket.name == 'Alpha']:",
    "            m.node_tree.links.remove(l)",
    `bpy.ops.export_scene.gltf(filepath=${py(out)}, export_format='GLB', export_vertex_color='ACTIVE')`,
  ].join("\n");

  const run = spawnSync(blender, ["-b", "--python-expr", script], { encoding: "utf8" });
  if (run.status !== 0 || !existsSync(out)) {
    const log = `${run.stdout ?? ""}${run.stderr ?? ""}`.trim().split("\n").slice(-15).join("\n");
    throw new Error(`Blender could not convert ${source}.\n${log || run.error?.message || ""}`);
  }
  return blender;
}
