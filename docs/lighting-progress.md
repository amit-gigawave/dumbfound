# Lighting the 3D works: progress notes

Handoff for continuing the per-work lighting. State as of 2026-11-17.
Branch `site-redesign-oct-2026`, last commit `e277956`. **Nothing is pushed**, so dumbfound.vercel.app still shows the old, shiny look.

## The problem
Many scans looked "flashy". Painted works (Thota heads, Khanna bandsmen, …) were exported as polished metal (metalness 0.6–1, roughness ~0.3), so the paint showed moving chrome streaks. Some USD scans also carried faults: glass transmission (Lord Krishna, Pandit), specular colour above 1 (Gulratan), and specular strength 0 (black paint then reflects nothing).

## How lighting works now
- **Shared light**: `LIGHTING` in `components/three/lighting.ts`. "Natural soft" daylight: Neutral tone mapping (true colours), hemisphere light from above, a gentle key from the front left, fill and back light, reflections 0.48. The user picked it over the old filmic (ACES) studio light, which is kept as `previous`.
- **Per work**: `look` on each entry in `lib/sculptures.ts` (type `ArtworkLook`). It's used by the 3D viewer, the card thumbnail and the hover preview. It is **not** used in AR.

  | Field | Effect |
  |---|---|
  | `metalness` | multiplies metalness (0 = paint) |
  | `roughness` | multiplies roughness (>1 = more matte, capped) |
  | `reflections` | multiplies studio reflections; on dark bronze this brightens more than `light` does |
  | `light` | multiplies every light |
  | `sideLights` | extra lights from left and right at face height (1 = key strength) |
  | `specular` | *sets* the paint's sheen 0–1 (fixes scans exported with 0) |
  | `rig` | `"previous"` = use the old filmic light for this work (tone mapping set per scene, so it works in the shared hover renderer too) |

- **Applied in** `components/SculptureScene.tsx`: `prepareMaterial` handles the material fixes for every work (transmission off, specular colour capped) plus `look`. `SculptureContents` builds the lights.
- **Preview** without editing: `/artworks/thumb/<slug>?look={"light":1.2}&rig=previous&facing=90`.

## Settings so far
User's taste: **matte and natural, not shiny**. The user judges each work by eye. One setting does not fit all.

| Group | look | Works |
|---|---|---|
| Painted heads | `{ metalness: 0, roughness: 2, reflections: 0.5, light: 0.9 }` | Ruby Saree, Polka-Dot Collar, Nose Ring |
| … dimmer | same, `light: 0.65` | Dark Green Saree, Yellow Saree |
| … brighter | same, `light: 1.2` | Side Braid |
| Painted figures | `{ metalness: 0.2, roughness: 1.6, reflections: 0.6 }` | 9 Khanna bandsmen, Ganesha, Meri Patang |
| … dimmer | same, `reflections: 0.51, light: 0.7` | Couple |
| … brighter | same, `reflections: 0.9, light: 1.4` | Trumpeter |
| Seated Bandsman | `{ light: 1.4, reflections: 1.5 }` | dark grey, needed lifting |
| … brighter | same, `light: 1.3` | Dotted Saree, Man with Mridangam |
| Blue Saree | `{ metalness: 0.2, roughness: 1.6, reflections: 1.2, light: 1.6 }` | dark bronze skin needed lifting |
| Blue Turban | `{ metalness: 0.15, roughness: 1.3, reflections: 1.2, light: 1.3, specular: 0.6, sideLights: 1 }` | black face showed no form |
| Old light | `{ rig: "previous" }`: the earlier filmic studio light, nothing else changed | Lord Krishna, Pandit, Dancing Shiva (user preferred them as before) |
| Bronze | `{ metalness: 0.5, roughness: 1.3 }` | both Shah heads, Tirthankar, Levitation, Parekh |
| Bronze Long-Hair head | `{ metalness: 0.2, roughness: 1.8, reflections: 0.6 }` | the bronze setting still glared on its face |
| Lady | `{ light: 1.8, reflections: 2.5, sideLights: 1 }` | dark patina read as dull black |
| Glossy non-metal | `{ roughness: 2, reflections: 0.6 }` / `{ roughness: 1.8, reflections: 0.7 }` | Ghosh / Matar |
| Untouched | — | Tailor, Cat, Man from Moon |

## Changing a work
1. Dev server: `npx next dev --webpack -p 3000` (Turbopack crashes on this machine).
2. Edit its `look` in `lib/sculptures.ts`, then check the turning model on its artwork page.
3. `npm run thumbnails -- <slug>`. **Bump the thumbnail's `?v=`** in `lib/sculptures.ts`, or browsers keep the old image.
4. Commit as Ayan Ali, one change per commit.

Untracked helper scripts (not committed):
- `scripts/.tmp-lookgrid.mjs <outDir> <variants.json> slug…`: renders a grid of look variants (`ANGLES=0,45`; a variant can be `{"look":"catalogue","mul":{"light":1.3}}`).
- `scripts/.tmp-setlook.mjs '<json>' slug…`: writes `look`.
- `scripts/.tmp-bump.mjs slug…`: bumps `?v=`.

The last two need the file's CRLF line endings. Git Bash `sed -i` strips them, so don't use it on `lib/sculptures.ts`.

Gotchas:
- `make-thumbnails` sometimes times out, especially on `sugandh-matar` (heavy). Run it alone, last.
- Grid rows depend on width: desktop has 3 columns, a phone 2. Order is in `lib/catalogue-order.ts`. The first rows are Dark Green Saree, Blue Saree, Yellow Saree / Dotted Saree, Mridangam, Side Braid / Polka-Dot Collar, Ruby Saree, Blue Turban.

## Still open
- Keep tuning per work as the user reviews. There are no reference photos of the Thota heads in `public/artworks`, so the levels are chosen from renders.
- These scans also have specular 0: Yellow Saree, Ruby Saree, Side Braid, Dotted Saree, Mridangam, Ganesha, Trumpeter, both Patinder works, Man from Moon. Use `specular` if any looks flat.
- AR copies (`public/ar/`) don't get `look`, so works can still look shiny in AR. Bake it into `scripts/make-ar-models.mjs` if wanted.
- Lord Krishna has a see-through sheet under its base. That's part of the scan's shape, not the lighting.
- The home hero (`components/HeroScene.tsx`) has its own, much brighter light and was not changed.
- To go live: push the branch to `origin` and `ayan`, then merge it into each `main` (no force). Only when the user asks.
