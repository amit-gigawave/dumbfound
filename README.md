# Sculpted India

A catalogue website for artists and their works, with 3D viewing and "View in AR" for works that have a model.
The platform is multi-artist and not tied to one medium. Each work can be a photograph or a 3D model.

The name, tagline and contact details are set in `lib/site.ts` and used everywhere from there.

Reference: https://www.sculptedindia.com/

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **3D:** three.js, React Three Fiber, drei. Models are Draco-compressed GLBs, and the decoder is self-hosted in `public/draco`.
- **Motion:** GSAP, Motion, Lenis
- **Styling:** Tailwind CSS 4

## Getting started

Needs Node.js 24.

```bash
npm install --legacy-peer-deps   # also copies the Draco decoder to public/draco
npm run dev                      # http://localhost:3000
```

Only one `next dev` can run per checkout. A second one fails on the `.next/dev/lock` file.
To test on a phone, open the "Network" address that `npm run dev` prints. AR itself needs the live `https://` site (see [docs/adding-artworks.md](docs/adding-artworks.md#things-to-know-about-ar)).

### Testing AR from your computer

The "View in AR" QR code on desktop is scanned by a phone, so it can't point at `localhost`, and AR needs `https://`. `npm run tunnel` opens an ngrok tunnel to the dev server and points the QR code at it.

One-time setup, in `.env.local` (not committed):

```bash
NGROK_AUTHTOKEN=<token>             # https://dashboard.ngrok.com/get-started/your-authtoken
NGROK_DOMAIN=<name>.ngrok-free.app  # optional, https://dashboard.ngrok.com/domains
```

Each free ngrok account gets one permanent domain. With `NGROK_DOMAIN` set, the address stays the same on every run. Without it, it changes each time.

```bash
npm run dev       # terminal 1
npm run tunnel    # terminal 2: prints the https:// address
```

The script writes the address into `NEXT_PUBLIC_SITE_URL` in `.env.local`, which the QR code uses. Refresh the page after it starts. On the free plan the phone sees an ngrok "Visit Site" page once; tap through to reach the site.

**Production** (`main`, deployed by Vercel at https://dumbfound.vercel.app) needs none of this. `NEXT_PUBLIC_SITE_URL` is unset there, so the QR code uses the page's own address.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run add-model -- <file>` | Adds a 3D work from a `.glb`, `.usdz` or `.usdc`: Blender conversion, model checks and fixes, compression, catalogue entry, thumbnail, facing check and AR copy. `--slug <slug> --replace` swaps a work's model; `--slug <slug> --facing 180` turns one |
| `npm run check-model -- <file>` | Reports on a model's checks (opaque, single-sided, colour layers, winding, texture size) without changing anything |
| `npm run add-work` | Interactive helper for photo-only works: resizes the image and adds the entry |
| `npm run thumbnails -- [slug]` | Renders thumbnails of 3D works with Puppeteer. The dev server must be running. Leave out the slug to redo all of them |
| `npm run ar-models -- [slug]` | Builds the AR copies of 3D works (`public/ar/`): real size from `heightCm`, facing front, on the floor |
| `npm run tunnel -- [--port 3000]` | ngrok tunnel to the dev server, for testing the AR QR code from a phone (see above) |

## Routes

| Route | Page |
| --- | --- |
| `/` | Home: scroll-driven 3D hero, About Sculpted India (manifesto from `lib/about.ts` beside artist portraits), artists, featured works, Explore in 3D, an artist quote, events |
| `/artists`, `/artists/[slug]` | Artist list and artist pages |
| `/artworks`, `/artworks/[slug]` | Artwork grid with an artist filter, and artwork pages, which open in 3D (with a Photo switch) and offer AR |
| `/events` | Upcoming and past exhibitions |
| `/about` | About the platform |
| `/contact` | Enquiry form. It opens WhatsApp (to `site.phone`) or the visitor's mail app (to `site.email`) with the message filled in |
| `/artworks/thumb/[slug]` | Hidden page that `npm run thumbnails` renders thumbnails from |
| `/sitemap.xml`, `/robots.txt` | Built from the catalogue by `app/sitemap.ts` and `app/robots.ts` |
| `/lab/*` | Internal design comparison pages. They are not linked anywhere and are not indexed |

`/gallery/*` redirects to `/artworks/*`.

## Project structure

```
app/                    Routes (see above); favicon.ico, icon.png and apple-icon.png are the site icons;
                        opengraph-image.tsx draws the default link preview (artwork and artist
                        pages use their own image)
assets/                 Files read at build time: the Marcellus font (OFL) and the image for the link preview
components/
  HeroScroll.tsx        Home hero: sculpture that moves with the scroll
  HeroScene.tsx         3D scene for the hero
  SculptureScene.tsx    Shared 3D viewer (auto-frames models with the `fit` prop)
  ThumbnailStage.tsx    Scene used to render thumbnails
  ARButton.tsx          AR: Android in-browser AR (WebXRStage, Scene Viewer fallback), iOS Quick Look, QR code on desktop
  WebXRStage.tsx        Guided in-browser AR session on Android (model-viewer), with on-screen guidance
  SearchDialog.tsx      Site search
  Navbar, Footer, MobileMenu, Contact, Magnetic, RevealObserver
  gallery/              Artwork and artist tiles, artwork stage, artist filter, portrait fan
  about/ contact/ events/  Page sections
  three/                Model loader (Draco), studio lighting, and the artwork tiles'
                        hover previews (TilePreview), which share one WebGL renderer
  lab/                  Components for the /lab pages
lib/
  site.ts               Name, tagline, navigation, contact details, public site URL
  artists.ts            Artists (facts must be sourced; `placeholder` entries fill the layout)
  sculptures.ts         Artworks: the catalogue behind every page, search and AR
  events.ts             Exhibitions
  search.ts             Search over artists and works
scripts/
  add-model.mjs         `npm run add-model`
  check-model.mjs       `npm run check-model`
  add-work.mjs          `npm run add-work`
  lib/                  Shared by the above: catalogue editing, model checks, Blender
  make-thumbnails.mjs   `npm run thumbnails`
  make-ar-models.mjs    `npm run ar-models`
  tunnel.mjs            `npm run tunnel` (ngrok)
  copy-draco.mjs        postinstall: copies three's Draco decoder to public/draco
public/
  sculptures/           GLB models (the web viewer). Raw .usdz/.usdc scans are dropped here
                        for conversion but not committed
  ar/                   AR copies of the models, in metres (built by `npm run ar-models`)
  vendor/               model-viewer 4.3.1 (Apache-2.0), loaded only for AR on Android
  thumbnails/           Rendered thumbnails of 3D works (WebP)
  artworks/             Photos of works without a model
  artists/              Artist portraits
  logos/                Wordmark shown in the navbar (from sculptedindia.com)
docs/
  adding-artworks.md    How to add artworks and artists
  ar-qr-plan.md         Plan: scan a QR code to see a work in AR (not built yet)
```

## Content

All content lives in `lib/`. Components don't hold any content.
To add or change artworks and artists, follow **[docs/adding-artworks.md](docs/adding-artworks.md)**.

## Notes

- `project.md` is the original design brief. It describes a single-page site that was never built in that form. This README describes the code as it is now.
- `.glb-backup/` holds the uncompressed source models. It is ignored by git.
- Static models, thumbnails and the Draco files are cached for a day (`next.config.ts`).

## To do

- **Admin panel for adding works.** Plan a panel where a non-developer can add an artist or work (details, photos, 3D model) without editing `lib/` or running the conversion scripts by hand. To plan: where the content lives instead of `lib/*.ts`, sign-in, model upload and conversion (USD → GLB, Draco, AR copy, thumbnail), and how changes reach the live site. Today's manual steps are in [docs/adding-artworks.md](docs/adding-artworks.md).

## License

All Rights Reserved © 2026 Sculpted India
