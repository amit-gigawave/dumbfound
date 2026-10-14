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

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run add-work` | Interactive helper: adds an artwork, compresses its image or model and makes its thumbnail |
| `npm run thumbnails -- [slug]` | Renders thumbnails of 3D works with Puppeteer. The dev server must be running. Leave out the slug to redo all of them |

## Routes

| Route | Page |
| --- | --- |
| `/` | Home: scroll-driven 3D hero, featured works, artists |
| `/artists`, `/artists/[slug]` | Artist list and artist pages |
| `/artworks`, `/artworks/[slug]` | Artwork grid with an artist filter, and artwork pages, which open in 3D (with a Photo switch) and offer AR |
| `/events` | Upcoming and past exhibitions |
| `/about` | About the platform |
| `/contact` | Enquiry form. It opens the visitor's mail app with the message filled in |
| `/artworks/thumb/[slug]` | Hidden page that `npm run thumbnails` renders thumbnails from |
| `/lab/*` | Internal design comparison pages. They are not linked anywhere and are not indexed |

`/gallery/*` redirects to `/artworks/*`.

## Project structure

```
app/                    Routes (see above); favicon.ico, icon.png and apple-icon.png are the site icons
components/
  HeroScroll.tsx        Home hero: sculpture that moves with the scroll
  HeroScene.tsx         3D scene for the hero
  SculptureScene.tsx    Shared 3D viewer (auto-frames models with the `fit` prop)
  ThumbnailStage.tsx    Scene used to render thumbnails
  ARButton.tsx          AR: Android Scene Viewer, iOS Quick Look (USDZ made in the browser), QR code on desktop
  SearchDialog.tsx      Site search
  Navbar, Footer, MobileMenu, Contact, FAQ, Magnetic, RevealObserver
  gallery/              Artwork and artist tiles, artwork stage, artist filter, portrait fan
  about/ contact/ events/  Page sections
  three/                Model loader (Draco) and procedural studio lighting
  lab/                  Components for the /lab pages
lib/
  site.ts               Name, tagline, navigation, contact details
  artists.ts            Artists (facts must be sourced; `placeholder` entries fill the layout)
  sculptures.ts         Artworks: the catalogue behind every page, search and AR
  events.ts             Exhibitions
  search.ts             Search over artists and works
scripts/
  add-work.mjs          `npm run add-work`
  make-thumbnails.mjs   `npm run thumbnails`
  copy-draco.mjs        postinstall: copies three's Draco decoder to public/draco
public/
  sculptures/           GLB models
  thumbnails/           Rendered thumbnails of 3D works (WebP)
  artworks/             Photos of works without a model
  artists/              Artist portraits
  logos/                Wordmark shown in the navbar (from sculptedindia.com)
docs/
  adding-artworks.md    How to add artworks and artists
```

## Content

All content lives in `lib/`. Components don't hold any content.
To add or change artworks and artists, follow **[docs/adding-artworks.md](docs/adding-artworks.md)**.

## Notes

- `project.md` is the original design brief. It describes a single-page site that was never built in that form. This README describes the code as it is now.
- `.glb-backup/` holds the uncompressed source models. It is ignored by git.
- Static models, thumbnails and the Draco files are cached for a day (`next.config.ts`).

## License

All Rights Reserved © 2026 Sculpted India
