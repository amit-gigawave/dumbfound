# Adding artworks and artists

Everything shown on the site comes from two data files:

| File | Contains |
| --- | --- |
| `lib/artists.ts` | The artists (name, bio, portrait, honours, quotes) |
| `lib/sculptures.ts` | The artworks (title, image or 3D model, medium, year, …) |

There are two ways to add a work: the **helper** (recommended) or **by hand**.
You need a recent Node.js (the project uses Node 24) and `npm install` done once.

---

## 1. The quick way: `npm run add-work`

```bash
npm run add-work
```

It asks a few questions, then does the rest:

1. Which artist (choose from the list)
2. Title, address name (slug), year, medium, short description
3. Whether to show it in **Featured works** on the home page
4. Whether you have a **3D model (.glb)** or an **image (.jpg / .png / .webp)**
5. The path to the file. Paste it, or drag the file into the terminal. Quotes around the path are fine.

What it does for you:

- **Image:** resizes it (max 1600 px on the long side), saves it as WebP to `public/artworks/<slug>.webp`.
- **3D model:** compresses it (Draco + WebP textures, the same way the existing models were made) into `public/sculptures/<slug>.glb`. The first run downloads the compression tool, so it needs an internet connection and takes about a minute. It also builds the AR copy, `public/ar/<slug>.glb` (see [AR](#things-to-know-about-ar)).
- Adds the entry to `lib/sculptures.ts` (and puts the file back the way it was if anything goes wrong).
- **3D model only:** makes the thumbnail image, **if the site is running** (see below).

**For a 3D work, start the site first** so the thumbnail can be made:

```bash
npm run dev            # terminal 1, leave it running
npm run add-work       # terminal 2
```

If the site wasn't running, the helper tells you. Start it and run:

```bash
npm run thumbnails -- <slug>
```

If the site is on a different port, tell the helper where it is:

```bash
SITE_URL=http://localhost:3100 npm run add-work          # macOS / Linux / Git Bash
$env:SITE_URL="http://localhost:3100"; npm run add-work  # Windows PowerShell
```

(and `npm run thumbnails -- <slug> --base http://localhost:3100`).

When it finishes, open `http://localhost:3000/artworks/<slug>` and check the page.

> The helper adds works for **existing artists**. To add a new artist, do step 3 below first.

---

## 2. By hand

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
2. Put the portrait in `public/artists/<slug>.webp` (square works best) and set `portrait: "/artists/<slug>.webp"`. Until then, initials are shown.
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
- **3D models:** upright (Y up), facing front, one object, under 1 MB. Textures 2048 px, or 4096 px for detailed scans (see above).
- **Asking a 3D artist for a model:** a `.glb` (or a `.usdz`, which packs its textures; a `.usdc` doesn't, so textures go missing) with the colour baked into one texture of 4096 px. No colour stored on the mesh (vertex colours) instead of a texture: it can only be as sharp as the mesh, so details smear. Opaque, single-sided material, facing front, with the real height in cm.
- **Thumbnails of 3D works** are renders of the model itself (transparent 800 × 1000 WebP), so what visitors see on the grid matches the 3D view.
- **Removing a work:** delete its entry from `lib/sculptures.ts` and its files (`public/sculptures/<slug>.glb`, `public/ar/<slug>.glb`, `public/thumbnails/<slug>.webp` or `public/artworks/<slug>.webp`).
- **Replacing a model:** overwrite the `.glb`, then run `npm run thumbnails -- <slug>` and `npm run ar-models -- <slug>` again.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Could not reach http://localhost:3000` | Start the site with `npm run dev`, or point to its port (see above) |
| Compression failed, "using the original file" | The file may not be a valid `.glb`, or there is no internet for the first download. The work is still added, but the file may be large |
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
