/*
 * Where the heavy files come from: 3D models, their AR and card copies, and
 * the artwork images. In production they are served from a Cloudflare R2
 * bucket, not from the site itself. NEXT_PUBLIC_ASSET_BASE is the bucket's
 * public address (e.g. https://assets.example.com, no trailing slash). Set it
 * on Vercel only: without it (local dev, the scripts) everything comes from
 * public/ as before, so a new model can be checked locally before it's uploaded.
 *
 * Upload new or changed files with `npm run r2-sync` BEFORE pushing a change
 * that refers to them (docs/r2-assets.md).
 */

/** Folders under public/ that live in the bucket, under the same paths. */
export const ASSET_DIRS = ["/sculptures/", "/thumbnails/", "/previews/", "/ar/", "/artworks/"];

const BASE = (process.env.NEXT_PUBLIC_ASSET_BASE ?? "").replace(/\/+$/, "");

/** `/sculptures/x.glb?v=2` → `<bucket>/sculptures/x.glb?v=2` when the bucket is in use. */
export const assetUrl = (path: string) =>
  BASE && ASSET_DIRS.some((dir) => path.startsWith(dir)) ? BASE + path : path;

/** The bucket's origin, or "" when files are served from public/. */
export const assetBase = BASE;
