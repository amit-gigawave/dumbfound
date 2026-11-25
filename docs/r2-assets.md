# Models and thumbnails on Cloudflare R2

The live site doesn't serve its heavy files itself. Each work's model
(`/sculptures/`), AR copy (`/ar/`), card preview (`/previews/`) and thumbnail
(`/thumbnails/`, or a photo in `/artworks/`) is loaded from a Cloudflare R2
bucket, under the same path.

## How it works

- `lib/assets.ts` turns a site path into the bucket's address when
  `NEXT_PUBLIC_ASSET_BASE` is set: `/sculptures/Lady.glb` →
  `https://<bucket address>/sculptures/Lady.glb`. `?v=N` is kept, so a bumped
  version still gets a fresh copy.
- `lib/sculptures.ts` keeps site paths in its entries. The scripts read and
  write them and find the files in `public/`. At the end of the file every
  work's `thumbnail`, `modelUrl` and `usdzUrl` is passed through `assetUrl`,
  and so are `arModelUrl()` and `previewModelUrl()`. The home hero
  (`components/HeroScene.tsx`) and the blog's thumbnails
  (`lib/blog-posts/images.ts`) do the same.
- `next.config.ts` allows the bucket's host for `next/image`, so thumbnails are
  still resized and converted by the image optimiser.
- Link previews (`app/artworks/[slug]/opengraph-image.tsx`) read the thumbnail
  from `public/` when it's there and fetch it from the bucket otherwise.
- Not moved: the Draco decoder (`/draco/`), the scan pages' files (`/scan/`,
  `/scan8/`), artist portraits, and the lab pages' own model paths.

**Set `NEXT_PUBLIC_ASSET_BASE` on Vercel only** (Production and Preview, for
both projects), not in `.env.local`. Locally everything then still comes from
`public/`, so a new or replaced model can be checked, rendered into a thumbnail
and turned into an AR copy before it's uploaded. The variable must be there at
build time and at runtime: `next.config.ts` reads it when the server starts.

## Uploading

```bash
npm run r2-sync              # new or changed files only
npm run r2-sync -- --dry-run # list what would be sent
npm run r2-sync -- --all     # send everything again
```

It uploads every file the catalogue refers to: each work's thumbnail and model,
and for 3D works `/previews/<slug>.glb` and `/ar/<slug>.glb`, plus every file in
`public/thumbnails/` (the blog uses those by slug). Each one gets the right
content type and the same cache header the site uses (a day, then revalidated
in the background). A file whose contents haven't changed since the last upload
is skipped. `scripts/r2-manifest.json` records what's been sent: commit it.

**Run it before pushing** any change that adds or replaces a model or
thumbnail. Otherwise the live site asks the bucket for a file that isn't there
yet.

It needs:

- `R2_BUCKET=<bucket name>` in `.env.local`
- a Cloudflare login for Wrangler: `npx wrangler login` once (it opens the
  browser), or `CLOUDFLARE_API_TOKEN` set to a token with R2 edit rights

## Setting up the bucket (once)

1. Create the bucket: `npx wrangler r2 bucket create <name>`.
2. Give it a public address: a custom domain (Cloudflare dashboard → R2 → the
   bucket → Settings → Custom Domains). The `r2.dev` address works for testing
   but is rate-limited and not cached, so it isn't for the live site.
3. Allow the site to read it from the browser (CORS). The 3D viewers fetch the
   models with `fetch`, and the artworks views read thumbnail pixels on a
   canvas, so without CORS models don't load and the views break. Dashboard →
   the bucket → Settings → CORS policy:

   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 86400
     }
   ]
   ```

4. Upload everything: `npm run r2-sync`.
5. On Vercel, set `NEXT_PUBLIC_ASSET_BASE=https://<custom domain>` (no
   trailing slash) for both projects and redeploy.
