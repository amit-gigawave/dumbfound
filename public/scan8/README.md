# Scan AR on 8th Wall (`/scan8/`)

A standalone WebAR page that places a work in the room with **world tracking**,
so it stays anchored after the picture leaves the camera (unlike the MindAR
`/scan` page). Built the same way as the Gallantry Awards app.

## One-time setup (in the 8th Wall / Niantic console)

1. **App key.** Open (or create) a project, copy its **App Key**, and paste it
   into `index.html`, replacing `REPLACE_WITH_8THWALL_APP_KEY`.
2. **Image Targets.** Upload each `targets/<slug>.jpg` as an **Image Target**
   named **exactly `<slug>`** (the `name` values in `works.json`). World
   tracking holds only a handful at once, so keep to the ~6 here.
3. **Authorise the domain.** Add the host this page is served from
   (e.g. `dumbfound.vercel.app`) to the project's **authorised domains**.

## Change which works

Edit `SLUGS` in `scripts/scan8-targets.mjs`, then run:

```bash
node scripts/scan8-targets.mjs
```

This rebuilds `targets/*.jpg` and `works.json`. Upload any new target images to
the console (named by slug) and remove ones you dropped.

## Test

On a phone (HTTPS only), open `/scan8/index.html`, allow the camera, and point it down at
a printed target on the floor. The work stands up; straighten the phone and it
stays; walk around it; **Remove · scan another** clears it. Pinch to resize.

If the camera won't start, the app key or the domain isn't set up (the 8th Wall
error overlay says which).
