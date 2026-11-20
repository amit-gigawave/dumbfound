import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Saves a work's `look` into lib/sculptures.ts, for the look tweaker at
 * /lab/look. Development only: on a production build (the live site) it
 * refuses, so nobody can rewrite the catalogue from the web.
 *
 * Body: { slug, look }. Only known look keys are written, numbers must be in
 * range, and the work's other settings are left untouched. The look stays on
 * one line, as every work's does.
 */

const NUMBERS: Record<string, [number, number]> = {
  metalness: [0, 3],
  roughness: [0, 4],
  reflections: [0, 5],
  light: [0, 5],
  sideLights: [0, 3],
  specular: [0, 1],
  cardLight: [0, 5],
  cardZoom: [0.2, 4],
  cardShift: [-1, 1],
  cardLift: [-1, 1],
};
/** Key order when writing, so saved lines read the same way across works. */
const ORDER = [
  "metalness",
  "roughness",
  "reflections",
  "light",
  "sideLights",
  "specular",
  "rig",
  "cardLight",
  "selfShadow",
  "cardZoom",
  "cardShift",
  "cardLift",
  "parts",
];

/** A part's settings: metalness and roughness, each 0–1. */
const PART_KEYS = ["metalness", "roughness"] as const;

const round = (v: number) => Math.round(v * 100) / 100;

function serialise(look: Record<string, unknown>) {
  const parts = ORDER.filter((k) => look[k] !== undefined).map((k) => {
    const v = look[k];
    if (k === "parts") {
      const each = Object.entries(v as Record<string, Record<string, number>>).map(([name, p]) => {
        const set = PART_KEYS.filter((pk) => p[pk] !== undefined).map((pk) => `${pk}: ${p[pk]}`);
        return `${JSON.stringify(name)}: { ${set.join(", ")} }`;
      });
      return `parts: { ${each.join(", ")} }`;
    }
    return `${k}: ${typeof v === "string" ? JSON.stringify(v) : String(v)}`;
  });
  return parts.length ? `{ ${parts.join(", ")} }` : "{}";
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Saving looks only works on the local dev server." }, { status: 403 });
  }
  let body: { slug?: unknown; look?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "The request wasn't valid JSON." }, { status: 400 });
  }
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Unknown work." }, { status: 400 });
  }
  const input = (body.look ?? {}) as Record<string, unknown>;
  const look: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null) continue;
    if (k in NUMBERS) {
      const [lo, hi] = NUMBERS[k];
      if (typeof v !== "number" || !Number.isFinite(v) || v < lo || v > hi) {
        return NextResponse.json({ error: `${k} must be a number from ${lo} to ${hi}.` }, { status: 400 });
      }
      look[k] = round(v);
    } else if (k === "rig") {
      if (v !== "previous") return NextResponse.json({ error: "rig can only be \"previous\"." }, { status: 400 });
      look[k] = v;
    } else if (k === "parts") {
      if (typeof v !== "object" || Array.isArray(v)) {
        return NextResponse.json({ error: "parts must be an object." }, { status: 400 });
      }
      const parts: Record<string, Record<string, number>> = {};
      for (const [name, p] of Object.entries(v as Record<string, unknown>)) {
        if (!name || name.length > 120 || /[\r\n]/.test(name) || typeof p !== "object" || p === null) {
          return NextResponse.json({ error: `Part "${name}" isn't valid.` }, { status: 400 });
        }
        const set: Record<string, number> = {};
        for (const [pk, pv] of Object.entries(p as Record<string, unknown>)) {
          if (pv === undefined || pv === null) continue;
          if (!(PART_KEYS as readonly string[]).includes(pk) || typeof pv !== "number" || !Number.isFinite(pv) || pv < 0 || pv > 1) {
            return NextResponse.json({ error: `Part "${name}": ${pk} must be a number from 0 to 1.` }, { status: 400 });
          }
          set[pk] = round(pv);
        }
        if (Object.keys(set).length) parts[name] = set;
      }
      if (Object.keys(parts).length) look[k] = parts;
    } else if (k === "selfShadow") {
      if (typeof v !== "boolean") return NextResponse.json({ error: "selfShadow must be true or false." }, { status: 400 });
      look[k] = v;
    } else {
      return NextResponse.json({ error: `Unknown setting "${k}".` }, { status: 400 });
    }
  }

  const file = path.join(process.cwd(), "lib", "sculptures.ts");
  const src = await fs.readFile(file, "utf8");
  const nl = src.includes("\r\n") ? "\r\n" : "\n";
  const start = src.indexOf(`slug: "${slug}",`);
  if (start === -1) return NextResponse.json({ error: "Unknown work." }, { status: 404 });
  const next = src.indexOf('slug: "', start + 1);
  const end = next === -1 ? src.length : next;
  const block = src.slice(start, end);
  const line = /\n([ \t]*)look: \{[^\n]*\},[ \t]*\r?\n/.exec(block);
  let updated: string;
  if (line) {
    const indent = line[1];
    const replaced = block.replace(line[0], `\n${indent}look: ${serialise(look)},${nl}`);
    updated = src.slice(0, start) + replaced + src.slice(end);
  } else {
    // No look yet: add one after the work's thumbnail line.
    const thumb = /\n([ \t]*)thumbnail: [^\n]*\r?\n/.exec(block);
    if (!thumb) return NextResponse.json({ error: "Couldn't find where to write the look." }, { status: 500 });
    const at = thumb.index + thumb[0].length;
    updated =
      src.slice(0, start) +
      block.slice(0, at) +
      `${thumb[1]}look: ${serialise(look)},${nl}` +
      block.slice(at) +
      src.slice(end);
  }
  await fs.writeFile(file, updated, "utf8");
  return NextResponse.json({ ok: true, line: `look: ${serialise(look)},` });
}
