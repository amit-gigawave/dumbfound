# Plan: scan a QR code, see the work in AR

**Goal:** a visitor scans a printed QR code (a gallery wall label, catalogue, poster, invitation) with their phone. The work then stands in their room at its real size, with one tap and no app to install.

Status: plan, not built yet. Written 2026-10-14.

---

## What exists today

- **Artwork page → "View in AR"** (`components/ARButton.tsx`):
  - **Desktop:** shows a QR code of the current page with `?ar=1`, generated in the browser and only shown on screen.
  - **Phone opened with `?ar=1`:** shows a "tap to place" prompt. iOS and Android only open AR from a tap.
  - **Android:** opens the `.glb` in Google Scene Viewer (`mode=ar_preferred`).
  - **iPhone:** converts the `.glb` to USDZ in the browser (three.js `USDZExporter`) and opens it in AR Quick Look. A prebuilt `usdzUrl` is used when a work has one.
- AR only works on the live `https://` site.

## Problems to fix before printing codes

| # | Problem | Effect |
| --- | --- | --- |
| 1 | **Android size is wrong.** The scans are stored in centimetre-like units, and Scene Viewer reads them as metres. | Works appear **20–48 m tall**: Cymbal Walae is "21 m", Female with Blue Saree is "48 m". |
| 2 | **iPhone size is a guess.** Every work is scaled to 0.6 m tall. | A 15 cm head and a 1 m figure look the same size. |
| 3 | **`facing` isn't applied in AR.** The web viewer turns models with `facing`, but AR doesn't. | Head G (`facing: 180`) faces away from the visitor in AR on both platforms. |
| 4 | **iPhone colour on scans is uncertain.** The vertex-coloured scans (e.g. Female with Blue Saree) are exported with `displayColor`. Quick Look may ignore it when a material is bound. | Coloured scans may show plain on iPhone. **Verify on a device.** |
| 5 | **iPhone conversion runs on the phone.** It downloads the model, decodes it and builds the USDZ in the browser on every tap. Its Draco decoder also comes from gstatic.com, not our self-hosted `/draco/`. | Slow first tap on large works, and an extra outside dependency. |
| 6 | **No printable codes.** The QR code only exists inside the desktop dialog. | Nothing to put on a wall label or in a catalogue. |
| 7 | **The prebuilt `.usdz` files are huge** (`headA.usdz` 35 MB, `headG.usdz` 42 MB, untracked). | Unusable on mobile data. |

## Plan

### Phase 1: correct AR models (fixes 1–5, 7)

1. **Add real size to the catalogue.** Add an optional `heightCm` to each work in `lib/sculptures.ts`, sourced from the artist or gallery. Fill `dimensions` at the same time. Works without it fall back to a sensible default (0.6 m) and show "approximate size" in the AR prompt.
2. **Build AR files at publish time, not on the phone.** Add a script, `npm run ar-models` (run by `add-work` as well). For each work with a model, it writes:
   - `public/ar/<slug>.glb`: scaled to metres from `heightCm`, `facing` baked in, base on the floor, centred. Same Draco compression as today.
   - `public/ar/<slug>.usdz`: the same scene for iPhone. Vertex colours are baked into a small texture if step 4 shows Quick Look ignores them. Target size under 3 MB, with textures capped at 2048 px.

   The web viewer keeps using the existing models, which it auto-frames.
3. **Point `ARButton` at the prebuilt files.** Remove the in-browser conversion and the gstatic decoder. Keep the 0.6 m path only as a fallback.
4. **Device test pass:** at least one recent iPhone (Safari) and one Android phone (Chrome), on every 3D work. Check size, facing, colour, and time from tap to placed.

### Phase 2: printable codes (fixes 6)

1. **Short, permanent links:** `/ar/<slug>` redirects to `/artworks/<slug>?ar=1`. Printed codes then survive page and route changes, and the code is smaller and easier to scan.
2. **Code sheet:** a hidden page, `/ar/codes`, or a script, `npm run qr`, that outputs one print-ready card per work. Each card has an SVG QR code (vector, any print size), the work's title, artist and thumbnail, and the line "Scan to see it in your space". Also export an A4 sheet for the gallery.
3. **Picture QR codes (option):** the codes could be made with AriaQR instead. That gives artwork-style codes, scan counts per code, and a destination that can be changed after printing. A plain SVG code is enough to start.

### Phase 3: smoother landing after the scan

1. **Prepare while the prompt shows.** Start downloading the AR file as soon as the page opens with `?ar=1`, so the tap launches AR immediately. Show "Ready" instead of "Preparing…".
2. **In-app browsers.** QR codes scanned via WhatsApp, Instagram or a camera app often open in a webview that can't launch AR. Detect this and show "Open in Safari / Chrome" with a copy-link button.
3. **No AR support** (older phones, desktop): fall back to the 3D viewer on the page with a short note.
4. **Measure.** Add `utm_source=qr&utm_content=<slug>` to the printed links, and count prompt shown → AR launched → enquiry, per work.

## Order and rough effort

| Step | Effort |
| --- | --- |
| Phase 1.1 sizes (data entry, needs real measurements) | depends on getting sizes |
| Phase 1.2–1.3 AR build script + ARButton change | ~1–2 days |
| Phase 1.4 device testing | ~½ day |
| Phase 2 links + code sheet | ~1 day |
| Phase 3 landing polish + tracking | ~1 day |

## Decisions needed

- **Real heights** of each work: who can supply them?
- **Plain or picture QR codes** (AriaQR), and whether scans should be counted.
- **Where codes will be printed** (wall labels, catalogue, posters). This sets card size and wording.
- **The live domain** the codes will point to. It must be final before printing.
