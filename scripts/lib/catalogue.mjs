// Reads and edits lib/sculptures.ts for the add-work / add-model scripts.
// Every edit is checked by re-importing the file; if it no longer loads (or
// the change is missing), the original is put back and an error is thrown.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const CATALOGUE = "lib/sculptures.ts";

export const load = (file, bust = "") =>
  import(pathToFileURL(resolve(file)).href + bust);

export const loadWorks = async () =>
  (await load(CATALOGUE, `?t=${Date.now()}`)).sculptures;

export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Order fields are written in, matching the hand-written entries. */
const ORDER = [
  "slug", "title", "description", "artistSlug", "thumbnail", "modelUrl",
  "facing", "material", "year", "dimensions", "edition", "heightCm", "featured",
];
/** Always written, even when empty (the Sculpture type requires them). */
const REQUIRED = new Set(["slug", "title", "description", "artistSlug", "thumbnail", "material", "year"]);

const literal = (v) => (typeof v === "string" ? JSON.stringify(v) : String(v));
const keep = (key, v) => REQUIRED.has(key) || (v !== undefined && v !== "" && v !== false && v !== 0);

/** Applies `edit` to the file text, then checks the result with `verify(works)`. */
async function transaction(edit, verify) {
  const original = readFileSync(CATALOGUE, "utf8");
  const next = edit(original);
  writeFileSync(CATALOGUE, next);
  try {
    const works = await loadWorks();
    const problem = verify(works);
    if (problem) throw new Error(problem);
  } catch (err) {
    writeFileSync(CATALOGUE, original);
    throw new Error(`Could not update ${CATALOGUE} (${err.message}). The file was restored.`);
  }
}

/** Start and end (exclusive) of the `  { … },` block for `slug`. */
function block(src, slug) {
  const at = src.indexOf(`    slug: ${JSON.stringify(slug)},`);
  if (at === -1) return null;
  const start = src.lastIndexOf("\n  {\n", at) + 1;
  const end = src.indexOf("\n  },", at) + "\n  },".length;
  return { start, end };
}

/** Adds a new work at the end of the list. Empty optional fields are left out. */
export async function addWork(fields, comment) {
  const lines = ["  {"];
  for (const key of ORDER) {
    if (keep(key, fields[key])) lines.push(`    ${key}: ${literal(fields[key] ?? "")},`);
  }
  lines.push("  },");
  const entry = (comment ? `  // ${comment}\n` : "") + lines.join("\n");

  await transaction(
    (src) => {
      const arrayStart = src.indexOf("export const sculptures: Sculpture[] = [");
      const arrayEnd = arrayStart === -1 ? -1 : src.indexOf("\n];", arrayStart);
      if (arrayEnd === -1) throw new Error("could not find the list of works");
      return `${src.slice(0, arrayEnd)}\n${entry}${src.slice(arrayEnd)}`;
    },
    (works) => (works.some((w) => w.slug === fields.slug) ? null : "new entry not found"),
  );
}

/**
 * Sets fields on an existing work. A value of undefined (or "" / 0 / false
 * for optional fields) removes the field.
 */
export async function updateWork(slug, fields) {
  await transaction(
    (src) => {
      const b = block(src, slug);
      if (!b) throw new Error(`no work "${slug}"`);
      let body = src.slice(b.start, b.end);
      for (const [key, value] of Object.entries(fields)) {
        const line = new RegExp(`^    ${key}: .*,\\n`, "m");
        const text = keep(key, value) ? `    ${key}: ${literal(value ?? "")},\n` : "";
        if (line.test(body)) {
          body = body.replace(line, text);
        } else if (text) {
          // Insert after the nearest field that comes before it in ORDER.
          const before = ORDER.slice(0, ORDER.indexOf(key)).reverse();
          const anchor = before
            .map((k) => body.match(new RegExp(`^    ${k}: .*,\\n`, "m")))
            .find(Boolean);
          body = anchor
            ? body.replace(anchor[0], anchor[0] + text)
            : body.replace("\n  },", `\n${text.trimEnd()}\n  },`);
        }
      }
      return src.slice(0, b.start) + body + src.slice(b.end);
    },
    (works) => {
      const w = works.find((x) => x.slug === slug);
      if (!w) return "entry disappeared";
      for (const [key, value] of Object.entries(fields)) {
        const expected = keep(key, value) ? value ?? "" : undefined;
        if (w[key] !== expected) return `${key} was not saved`;
      }
      return null;
    },
  );
}

/** `/sculptures/x.glb` → `/sculptures/x.glb?v=2`, `?v=2` → `?v=3`. */
export const bumpVersion = (url) => {
  const [path, query = ""] = url.split("?");
  const v = Number(new URLSearchParams(query).get("v") ?? 1);
  return `${path}?v=${v + 1}`;
};
