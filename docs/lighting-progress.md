# Lighting the 3D works: progress notes

Handoff for continuing the per-work lighting. State as of 2026-11-17.
Branch `site-redesign-oct-2026`. **Live since 2026-11-17** (merged into `origin/main` `153768f` and `ayan/main`), so dumbfound.vercel.app shows the new light. Next steps: [session-2026-11-17.md](session-2026-11-17.md), to-do 2.

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
  | `cardLight` | multiplies light and reflections on the catalogue card only (thumbnail + hover preview), not the artwork-page viewer |
  | `selfShadow` | `false` = the viewer drops the shadows the work casts on itself (thumbnails never have them), so the two match |
  | `cardZoom` / `cardShift` / `cardLift` | card framing only (thumbnail + hover): zoom, sideways shift (fraction of width, + = right), upward shift (fraction of height). Zoom and lift are a camera view offset; the shift moves where the camera aims, so the turning preview circles the centred part and its long sides stay on the card. Centre what the eye centres on (figure + base), not the outline. `scripts/.tmp-hovershot.mjs <prefix> <slug>` (untracked) captures a card's hover preview turning |
  | `rig` | `"previous"` = use the old filmic light for this work (tone mapping set per scene, so it works in the shared hover renderer too) |

- **Applied in** `components/SculptureScene.tsx`: `prepareMaterial` handles the material fixes for every work (transmission off, specular colour capped) plus `look`. `SculptureContents` builds the lights.
- **Preview** without editing: `/artworks/thumb/<slug>?look={"light":1.2}&rig=previous&facing=90`.

## House look (since 2026-11-18)
The founder picked **Bronze Female Head with Long Hair** as the surface every work should have: no glare, not dull. Its material ends up at **metalness 0.15, roughness 0.6, reflections 0.6** (texture average × factor × `look`).

Copying its `look` numbers would not give the same result, because `look` multiplies each scan's own maps and the scans differ a lot (painted works often arrive as polished metal, others with no metal at all). So each work's `metalness` and `roughness` multipliers are worked out from its model to land on those values (`scripts/lib/house-look.mjs`, `houseLook`). `npm run add-model` does this for every new work. Brightness settings (`light`, `sideLights`, `cardLight`, framing) are separate and still tuned by eye.

Applied to every work in commit `ee3008d`, except: the Lady (washes out grey; keeps her own look), Lord Krishna, Pandit and Dancing Shiva (old light by choice), and Seated Bandsman with Horn (its scan has sheen 0, so roughness changes nothing). A model with no metal map and metalness 0 stays paint. `scripts/.tmp-matstats.mjs` (untracked) prints each work's resulting values.

## Settings before the house look
The table below is the history up to 2026-11-17. The metalness/roughness/reflections in it were replaced by the house look; the brightness settings still apply.

User's taste: **matte and natural, not shiny**. The user judges each work by eye. One setting does not fit all.

| Group | look | Works |
|---|---|---|
| Painted heads | `{ metalness: 0, roughness: 2, reflections: 0.5, light: 0.9 }` | Ruby Saree, Polka-Dot Collar, Nose Ring |
| … dimmer | same, `light: 0.65` | Dark Green Saree, Yellow Saree |
| … brighter | same, `light: 1.2` | Side Braid |
| Painted figures | `{ metalness: 0.2, roughness: 1.6, reflections: 0.6 }` | 5 Khanna bandsmen, Ganesha, Meri Patang |
| … dimmer | same, `reflections: 0.51, light: 0.7` | Couple |
| … brighter | same, `reflections: 0.9, light: 1.4` | Trumpeter |
| … dimmer on the card only | same, `cardLight: 0.72` | Ramesh Kumar Accordian, Rajinder Kaka Horn, Davinder Raj Tutu (white uniforms glared on the light card plate; viewer was fine) |
| Seated Bandsman | `{ light: 1.4, reflections: 1.5 }` | dark grey, needed lifting |
| Bandwalla | painted-figure look + `light: 1.15, cardLight: 0.87, selfShadow: false` | viewer was darker than its thumbnail; this matches them (thumbnail unchanged) |
| … brighter | same, `light: 1.3` | Dotted Saree, Man with Mridangam |
| Blue Saree | `{ metalness: 0.2, roughness: 1.6, reflections: 1.2, light: 1.6 }` | dark bronze skin needed lifting |
| Blue Turban | `{ metalness: 0.15, roughness: 1.3, reflections: 1.2, light: 1.3, specular: 0.6, sideLights: 1 }` | black face showed no form |
| Old light | `{ rig: "previous" }`: the earlier filmic studio light, nothing else changed | Lord Krishna, Pandit, Dancing Shiva (user preferred them as before) |
| Bronze | `{ metalness: 0.5, roughness: 1.3 }` | both Shah heads, Tirthankar, Levitation, Parekh |
| Bronze Long-Hair head | `{ metalness: 0.2, roughness: 1.8, reflections: 0.6 }` | the bronze setting still glared on its face |
| Lady | `{ light: 1.8, reflections: 2.5, sideLights: 1 }` | dark patina read as dull black |
| Glossy non-metal | `{ roughness: 2, reflections: 0.6 }` / `{ roughness: 1.8, reflections: 0.7 }` | Ghosh / Matar |
| Tailor | `{ cardZoom: 1.1, cardShift: 0.075, cardLift: 0.04 }` | framing only: its long sewing-machine base made it small and off-centre on the card |
| Untouched | — | Cat, Man from Moon |

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

## Viewer vs thumbnail
The artwork-page viewer differs from the card in three ways: the key light casts self-shadows there (darker faces, arms), the backdrop is chosen by the work's colour (dark for light works), and framing is wider. Use `selfShadow: false` and/or `cardLight` to match them. `scripts/.tmp-viewershot.mjs <out.png> <slug>` (untracked) screenshots the viewer.

## Still open
- Keep tuning per work as the user reviews. There are no reference photos of the Thota heads in `public/artworks`, so the levels are chosen from renders.
- These scans also have specular 0: Yellow Saree, Ruby Saree, Side Braid, Dotted Saree, Mridangam, Ganesha, Trumpeter, both Patinder works, Man from Moon. Use `specular` if any looks flat.
- AR copies (`public/ar/`) don't get `look`, so works can still look shiny in AR. Bake it into `scripts/make-ar-models.mjs` if wanted.
- Lord Krishna has a see-through sheet under its base. That's part of the scan's shape, not the lighting.
- The home hero (`components/HeroScene.tsx`) has its own, much brighter light and was not changed.
- To publish later changes: push the branch to `origin` and `ayan`, then merge it into each `main` (no force). Only when the user asks.
