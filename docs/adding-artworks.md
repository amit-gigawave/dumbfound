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
- **3D model:** compresses it (Draco + WebP textures, the same way the existing models were made) into `public/sculptures/<slug>.glb`. The first run downloads the compression tool, so it needs an internet connection and takes about a minute.
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

Works without a `modelUrl` simply don't show "View in the round" or "See it in your space".
No thumbnail step is needed.

---

## 3. Adding an artist

1. Copy the Thota Vaikuntam entry in `lib/artists.ts` and change it.
2. Put the portrait in `public/artists/<slug>.webp` (square works best) and set `portrait: "/artists/<slug>.webp"`. Until then, initials are shown.
3. Fill in the details. `education`, `honours`, `collections` and `quotes` may be empty lists (`[]`); empty sections are not shown.
4. The `slug` (for example `"jane-doe"`) is what artworks use as `artistSlug`.

The entries marked `placeholder: true` ("Artist Name") only fill the layout. Delete one for each real artist you add.

> **Facts must be sourced.** Only add dates, awards, exhibitions and quotes that come from a reliable published source. The Thota entry has the source of each fact in a comment next to it.

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
| `modelUrl` | The 3D model. Adds "View in the round" and "See it in your space" |
| `usdzUrl` | A ready-made iPhone AR file. Without it, one is generated from the `.glb` |
| `subtitle` | A short line, e.g. `"The iconic muse"`. Searchable |
| `longDescription` | Extra paragraph under the description |
| `dimensions` | e.g. `"60 × 25 × 20 cm"`. Listed in the details |
| `edition` | e.g. `"1 of 8"`. Listed in the details |
| `location` | Collection or gallery. Listed in the details as "Collection" |
| `tags` | Search keywords, e.g. `["bronze", "portrait"]` |
| `accent` | Colour tint for the AR dialog (defaults to the site's red) |

Optional details only appear on the page when filled in. Text that starts with `TODO` is treated as empty and hidden.

---

## Guidelines

- **Images:** any shape works; the site shows them whole on a 4:5 plate, so leave some space around the subject. Clean, evenly lit photos on a plain background look best.
- **3D models:** upright (Y up), facing front, one object, textures no larger than 2048 px, under 1 MB.
- **Thumbnails of 3D works** are renders of the model itself (transparent 800 × 1000 WebP), so what visitors see on the grid matches the 3D view.
- **Removing a work:** delete its entry from `lib/sculptures.ts` and its files (`public/sculptures/<slug>.glb`, `public/thumbnails/<slug>.webp` or `public/artworks/<slug>.webp`).
- **Replacing a model:** overwrite the `.glb`, then run `npm run thumbnails -- <slug>` again.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Could not reach http://localhost:3000` | Start the site with `npm run dev`, or point to its port (see above) |
| Compression failed, "using the original file" | The file may not be a valid `.glb`, or there is no internet for the first download. The work is still added, but the file may be large |
| `"…" is already used by another work` | Pick a different address name (slug) |
| The new work isn't on the site | Check that `artistSlug` matches an artist, and refresh the page |
| The thumbnail looks wrong | Run `npm run thumbnails -- <slug>` again |
| Search doesn't find it | Search reads `title`, `subtitle`, `description`, `tags`, medium, year and artist name |

## Things to know about AR

- **"See it in your space" only works on the live website**, served over `https://`. It will not work from the local network link.
- On **Android** the `.glb` opens in Google's viewer at the size it was modelled (in metres).
- On **iPhone** the model is currently scaled to **0.6 m tall**, whatever the real size of the work. Real sizes per work are not supported yet.
