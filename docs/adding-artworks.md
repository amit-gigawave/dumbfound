# Adding artworks and artists

Everything shown on the site comes from two data files:

| File | Contains |
| --- | --- |
| `lib/artists.ts` | The artists (name, bio, portrait, honours, quotes) |
| `lib/sculptures.ts` | The artworks (title, image or 3D model, medium, year, …) |

There are two ways to add a work: the **helpers** (recommended) or **by hand**.
You need a recent Node.js (the project uses Node 24) and `npm install` done once.
For scans in `.usdz` / `.usdc`, Blender 5.1 must be installed too.

---

## 1. The quick way

### A 3D model: `npm run add-model`

```bash
npm run add-model -- "public/sculptures/scan.usdz"   # .glb, .usdz or .usdc
```

It asks for the **title** and the **artist** (Enter if unknown). Medium, year,
dimensions, edition and description are optional: press Enter to leave them
empty, and they stay hidden on the site until they are known. Then it does
everything else:

1. **Converts USD scans with Blender** (found automatically; set `BLENDER_PATH`
   in `.env.local` if it's installed somewhere unusual). The full-size result
   is kept in `.glb-backup/web/<slug>.glb`, which is not committed.
2. **Checks and fixes the model** (the [model checks](#model-checks)): makes it
   solid and single-sided, drops all-white colour layers, and **refuses** a model
   whose triangles face the wrong way (it would show holes) or that has no
   colour at all (it would render white).
3. **Compresses it** (Draco + WebP) into `public/sculptures/<slug>.glb`, at
   4096 px textures for detailed scans and 2048 px otherwise (or when 4096 px
   would make it heavier than 3 MB).
4. **Adds the entry** to `lib/sculptures.ts` (and puts the file back if anything
   goes wrong).
5. **Renders the thumbnail.** It uses the running site, or starts one for a
   moment if none is running. The thumbnail opens so you can look at it.
6. **Asks whether the work faces the front.** Press Enter if it does, or type
   how far to turn it (`90`, `180`, `270`). It turns it, renders again and asks
   again.
7. **Builds the AR copy**, `public/ar/<slug>.glb` (see [AR](#things-to-know-about-ar)).

It doesn't commit. At the end it prints the files it made and a ready
`git add` / `git commit` command, so you can check the page first.

Other uses:

```bash
npm run add-model -- "new-scan.glb" --slug female-head --replace   # new model for an existing work
npm run add-model -- --slug female-head --facing 180               # turn a work, redo thumbnail and AR copy
npm run check-model -- "scan.usdz"                                 # only report on a file, change nothing
```

`--replace` overwrites the work's model file and bumps `?v=N` on its
`modelUrl`, so visitors get the new one instead of a cached copy. Add
`--no-open` to skip opening the thumbnail, or `--base http://localhost:3100`
if your site runs on an unusual port.

### A photo: `npm run add-work`

```bash
npm run add-work
```

For works without a 3D model (paintings, photographs, drawings). It asks for
the image and the details (only the title is required), resizes the image
(max 1600 px on the long side) to `public/artworks/<slug>.webp` and adds the
entry. Give it a 3D file instead and it hands over to `add-model`.

> The helpers add works for **existing artists**. To add a new artist, do step 3 below first.

---

## 2. By hand

The helpers above do all of this for you. These steps are for when you need
to do one part on its own, or something goes wrong.

### Model checks

Every model goes through these before it is published. `npm run add-model`
does 1–3, 5 and 6 itself and asks about 4. `npm run check-model -- <file>`
reports on 1–3 and 5 without changing anything.

1. **Opaque and single-sided**: `alphaMode: OPAQUE` (unless the texture really
   has transparency) and backface culling on. Scans often arrive as `BLEND` and
   double-sided, which looks see-through.
2. **Winding**: the triangles must face the same way as their normals, or
   backface culling opens holes. Fix in Blender (Mesh → Normals → Recalculate
   Outside).
3. **Colour**: export vertex colours (`export_vertex_color='ACTIVE'`), drop
   all-white colour layers (they wash the texture out), and make sure the
   model has a texture or vertex colours, or it renders white.
4. **Facing**: look at the thumbnail and set `facing` if it shows the back or
   a side.
5. **Texture size**: 4096 px for detailed scans (source 4096 px or more),
   2048 px otherwise.
6. **Replacing a model**: bump `?v=N` on its `modelUrl`, then redo the
   thumbnail and AR copy.

### A work with a 3D model

1. **Prepare the model.** Export a `.glb` (upright, facing front) and compress it:

   ```bash
   npx @gltf-transform/cli optimize your-model.glb public/sculptures/<slug>.glb --compress draco --texture-compress webp --texture-size 2048
   ```

   Aim for **under 1 MB**. Larger files load slowly on phones.

   **Scans with a large, detailed texture** (4096 or 8192 px, with painted details such as eyes or patterns): use `--texture-size 4096` instead. At 2048 the detail turns blurry on the artwork page. The file will be about 0.5–1.5 MB, which is acceptable for these.

2. **Add the entry** to the list in `lib/sculptures.ts`:

   ```ts
   {
     slug: "my-sculpture",
     title: "My Sculpture",
     description: "One or two sentences about the work.",
     artistSlug: "thota-vaikuntam",
     thumbnail: "/thumbnails/my-sculpture.webp",
     modelUrl: "/sculptures/my-sculpture.glb",
     material: "Patinated bronze",
     year: "2024",
     featured: true, // optional: show on the home page
   },
   ```

3. **Make the thumbnail** (site must be running with `npm run dev`):

   ```bash
   npm run thumbnails -- my-sculpture
   ```

   Leave out the slug to redo the thumbnails of every work that has a model.

4. **Make the AR model** (what "View in AR" opens):

   ```bash
   npm run ar-models -- my-sculpture
   ```

### A 3D scan (.usdz or .usdc)

Scans from a phone or scanning app come as USD files. Turn them into a `.glb` with Blender (5.1), then follow the steps above.

1. **Put the scan in `public/sculptures/`.** Raw scans are large (often 40 MB or more) and are not committed. Only the compressed `.glb` is.

2. **Convert it with Blender.** Run this from the project folder, with your file name and slug filled in:

   ```bash
   "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --python-expr "import bpy, os; bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.wm.usd_import(filepath=os.path.abspath('public/sculptures/<scan>.usdz')); [(setattr(m, 'use_backface_culling', True), [m.node_tree.links.remove(l) for l in list(m.node_tree.links) if l.to_socket.name == 'Alpha']) for m in bpy.data.materials if m.node_tree]; bpy.ops.export_scene.gltf(filepath=os.path.abspath('.glb-backup/web/<slug>.glb'), export_format='GLB', export_vertex_color='ACTIVE')"
   ```

   - `export_vertex_color='ACTIVE'` matters: many scans keep their colour in the vertices, and without it the model renders plain white.
   - The middle part makes the model solid. USD scans often arrive with their opacity linked up and backface culling off, so the export comes out transparent (`alphaMode: BLEND`) and double-sided. On the site that looks see-through, with the inside and back faces showing.
   - Blender needs full paths, so the command wraps them in `os.path.abspath`. A bare relative path fails with "unable to open stage".
   - The uncompressed result goes to `.glb-backup/web/`, which is not committed.

3. **Compress** `.glb-backup/web/<slug>.glb` into `public/sculptures/<slug>.glb` (step 1 above), add the entry, and make the thumbnail.

4. **Check which way it faces.** Look at the thumbnail. Scans are often saved facing sideways or backwards. If so, set `facing` (for example `180`) and make the thumbnail again. Then make the AR model.

Unknown details (artist, year, medium) can stay empty (`""`), or start with `TODO`, until they are known. They are hidden on the site.

### A work without 3D (painting, photograph, drawing, …)

1. Save the photo as `public/artworks/<slug>.webp` (about 1600 px on the long side, under 300 KB).
2. Add the entry, with the image as `thumbnail` and **no `modelUrl`**:

   ```ts
   {
     slug: "morning-light",
     title: "Morning Light",
     description: "Oil on canvas, painted in the artist's studio.",
     artistSlug: "some-artist",
     thumbnail: "/artworks/morning-light.webp",
     material: "Oil on canvas",
     year: "2023",
   },
   ```

Works without a `modelUrl` show their photo, with no 3D view or "View in AR".
No thumbnail step is needed.

---

## 3. Adding an artist

1. Copy the Thota Vaikuntam entry in `lib/artists.ts` and change it.
2. Put the portrait in `public/artists/<slug>.webp` (square works best) and set `portrait: "/artists/<slug>.webp"`. Until then, initials are shown. To replace a portrait, save it under a new name (e.g. `<slug>-colour.webp`) and update `portrait`: browsers keep showing a cached image whose name hasn't changed. Portraits should be in colour; the site shows them in black and white until hovered.
3. Fill in the details. `education`, `honours`, `collections` and `quotes` may be empty lists (`[]`); empty sections are not shown.
4. The `slug` (for example `"jane-doe"`) is what artworks use as `artistSlug`.

The entries marked `placeholder: true` ("Artist Name") only fill the layout. Delete one for each real artist you add.

> **Facts must be sourced.** Only add dates, awards, exhibitions and quotes that come from a reliable published source. The Thota entry has the source of each fact in a comment next to it.
>
> The same goes for **artworks**: a title, year, medium, size or description must come from the artist, the gallery or a published source. If a detail isn't known, leave it empty (`""`); empty details are hidden. Don't write a description to fill the space. Every artist and work was checked against its sources on 2026-10-15, and unsourced text was removed.

---

## Field reference (artworks)

**Required**

| Field | What it is |
| --- | --- |
| `slug` | Lowercase words with hyphens, unique. Becomes the address: `/artworks/<slug>` |
| `title` | The work's title |
| `description` | One or two sentences. Shown on the page and in search |
| `artistSlug` | Must match an artist's `slug` in `lib/artists.ts` |
| `thumbnail` | The main image, e.g. `/artworks/<slug>.webp` or `/thumbnails/<slug>.webp` |
| `material` | e.g. `"Patinated bronze"`, `"Oil on canvas"` |
| `year` | e.g. `"2024"` |

**Optional**

| Field | What it does |
| --- | --- |
| `featured` | `true` shows the work in **Featured works** on the home page |
| `modelUrl` | The 3D model. The work's page opens in 3D (with a 3D / Photo switch) and gets "View in AR" |
| `facing` | Degrees to turn the model (anticlockwise, seen from above) so it faces front. For scans saved facing sideways. Run `npm run thumbnails -- <slug>` and `npm run ar-models -- <slug>` again after changing it |
| `heightCm` | The work's real height in cm: the size it appears at in AR. Without it, AR uses 50 cm. Run `npm run ar-models -- <slug>` again after changing it |
| `usdzUrl` | A ready-made iPhone AR file. Without it, one is generated from the `.glb` |
| `subtitle` | A short line, e.g. `"From the Nayika series"`. Searchable |
| `longDescription` | Extra paragraph under the description |
| `dimensions` | e.g. `"60 × 25 × 20 cm"`. Listed in the details |
| `edition` | e.g. `"1 of 8"`. Listed in the details |
| `location` | Collection or gallery. Listed in the details as "Collection" |
| `tags` | Search keywords, e.g. `["bronze", "portrait"]` |
| `accent` | Colour tint for the AR dialog (defaults to the site's green, from the logo) |

Optional details only appear on the page when filled in. Text that starts with `TODO` is treated as empty and hidden.

---

## Guidelines

- **Images:** any shape works; the site shows them whole on a 4:5 plate, so leave some space around the subject. Clean, evenly lit photos on a plain background look best.
- **3D models:** upright (Y up), facing front, one object, ideally under 3 MB. Textures 2048 px, or 4096 px for detailed scans (see [model checks](#model-checks)).
- **Asking a 3D artist for a model:** a `.glb` (or a `.usdz`, which packs its textures; a `.usdc` doesn't, so textures go missing) with the colour baked into one texture of 4096 px. No colour stored on the mesh (vertex colours) instead of a texture: it can only be as sharp as the mesh, so details smear. Opaque, single-sided material, facing front, with the real height in cm.
- **Thumbnails of 3D works** are renders of the model itself (transparent 800 × 1000 WebP), so what visitors see on the grid matches the 3D view.
- **Removing a work:** delete its entry from `lib/sculptures.ts` and its files (`public/sculptures/<slug>.glb`, `public/ar/<slug>.glb`, `public/thumbnails/<slug>.webp` or `public/artworks/<slug>.webp`).
- **Replacing a model:** `npm run add-model -- "<new file>" --slug <slug> --replace`. By hand: overwrite the `.glb`, bump `?v=N` on `modelUrl`, then run `npm run thumbnails -- <slug>` and `npm run ar-models -- <slug>` again.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Could not reach http://localhost:3000` | Start the site with `npm run dev`, or point to its port (see above) |
| Compression failed | The file may not be a valid model, or there is no internet for the first download of the compression tool. Nothing is added; fix it and run again |
| `Blender was not found` | Install Blender 5.1, or set `BLENDER_PATH` in `.env.local` to `blender.exe` |
| `Not published: … face against their normals` | The model's normals are flipped. Recalculate them in Blender (Mesh → Normals → Recalculate Outside), export, and run again |
| `"npm run dev" is already running, but not on ports 3000-3005` | Add `--base` with the address your site runs on |
| `"…" is already used by another work` | Pick a different address name (slug) |
| The new work isn't on the site | Check that `artistSlug` matches an artist, and refresh the page |
| The thumbnail looks wrong | Run `npm run thumbnails -- <slug>` again |
| A model looks see-through, inside faces showing | Its material is set to transparent (`BLEND`). Convert the scan again with the Blender command above, then compress, and make the thumbnail and AR model again |
| A replaced model still shows the old version | Models are cached for a day. Add `?v=2` (then `?v=3`, …) to its `modelUrl` |
| Search doesn't find it | Search reads `title`, `subtitle`, `description`, `tags`, medium, year and artist name |

## Things to know about AR

- **"View in AR" needs `https://`**: the live website, or locally the `npm run tunnel` address (see the README). It will not work from the local network link.
- AR opens `public/ar/<slug>.glb`, a copy of the model made by `npm run ar-models`. Phone AR reads model units as metres, while our models come in arbitrary units, so the copy is scaled to the work's **`heightCm`**, turned by `facing`, and stands on the floor.
- **Works without `heightCm` appear 50 cm tall.** Add the real height for true-to-life size.
- On **Android** AR runs in the browser (WebXR, through Google's `<model-viewer>`, self-hosted in `public/vendor/`). The work shows straight away and settles onto the floor once the phone finds it. Messages guide the visitor while it searches, suggest a better surface if it can't find one, and say when the camera can't see the room. Phones without in-browser AR open Google Scene Viewer instead. On **iPhone** the copy is converted to USDZ in the browser and opens in AR Quick Look.
- Floors are found fastest when they are **well lit and have some texture or pattern**. Plain, dark or shiny surfaces (a black desk, glossy tiles) can take a long time or not be found at all.
