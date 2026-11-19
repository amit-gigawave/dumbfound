"use client";

// Image-target AR prototype: the camera looks for one of the printed AR
// cards; the work on it stands up out of the card, at a size taken from its
// real height, with a 1.7 m person beside it for scale. Tracking is MindAR's
// (self-hosted in public/vendor/mindar-1.2.5); the drawing is our own three.js
// scene, so the size is fully ours to set.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DRACO_PATH } from "@/components/three/modelLoader";
import {
  detectPlatform,
  launchSceneViewer,
  openQuickLook,
  resolveUsdz,
  toAbs,
  type WithModel,
} from "@/components/ARButton";
import WebXRStage, {
  webXRSupported,
  type WebXRStageHandle,
} from "@/components/WebXRStage";

export type ARWork = {
  slug: string;
  title: string;
  artist: string;
  /** The light card copy of the model (fast to load on a phone). */
  modelUrl: string;
  facing: number;
  heightCm: number;
  card: string;
  /** The work's AR copy (metres, real height), for the phone's own AR. */
  arUrl: string;
  /** The catalogue entry, for building the iPhone's USDZ. */
  sculpture: WithModel;
};

const MINDAR = "/vendor/mindar-1.2.5/mindar-image.prod.js";
/** A person for scale (cm). */
const PERSON_CM = 170;
/** "Fit" size: the work stands this many card-widths tall (about the card's height). */
const FIT_UNITS = 1.1;
/** Printed card widths a visitor can pick (cm). */
const CARD_WIDTHS = [7, 10, 15];

type Mode = "fit" | "real";
/** Where the card is: upright (held up, on a stand or a screen) or flat on a table. */
type Place = "upright" | "flat";
/** The cards' height / width. */
const CARD_RATIO = 1.3;

/** How big the work is shown, in plain words: "Shown at 1/3 of real size". */
function sizeText(ratio: number) {
  const n = (v: number) =>
    v < 10 ? v.toFixed(1).replace(/\.0$/, "") : String(Math.round(v));
  if (Math.abs(ratio - 1) < 0.03) return "Shown at real size";
  return ratio > 1
    ? `Shown at 1/${n(ratio)} of real size`
    : `Shown ${n(1 / ratio)}× real size`;
}

/* A simple standing figure, `cm` tall, built from primitives (feet at 0). */
function personFigure(cm: number) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: "#7d8a84",
    roughness: 0.9,
    transparent: true,
    opacity: 0.85,
  });
  const u = cm / 170; // proportions for a 170 cm figure
  const part = (geo: THREE.BufferGeometry, x: number, y: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, 0);
    g.add(m);
  };
  part(new THREE.SphereGeometry(11 * u, 20, 16), 0, 159 * u); // head
  part(new THREE.CapsuleGeometry(17 * u, 46 * u, 6, 16), 0, 112 * u); // torso
  part(new THREE.CapsuleGeometry(6.5 * u, 70 * u, 6, 12), -9 * u, 44 * u); // legs
  part(new THREE.CapsuleGeometry(6.5 * u, 70 * u, 6, 12), 9 * u, 44 * u);
  part(new THREE.CapsuleGeometry(4.5 * u, 52 * u, 6, 12), -24 * u, 108 * u); // arms
  part(new THREE.CapsuleGeometry(4.5 * u, 52 * u, 6, 12), 24 * u, 108 * u);
  return g;
}

export default function ImageAR({
  works,
  targets,
}: {
  works: ARWork[];
  targets: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [found, setFound] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("fit");
  const [zoom, setZoom] = useState(1); // the visitor's resize (slider, pinch)
  const [cardCm, setCardCm] = useState(10);
  // Off by default: beside a small work a 1.7 m person fills the view.
  const [person, setPerson] = useState(false);
  // Upright by default: the tracker holds a card best seen straight on.
  const [place, setPlace] = useState<Place>("upright");
  // Live settings for the render loop (it reads these, not React state).
  // The visitor's turn of the work (degrees), from a one-finger drag.
  const [turn, setTurn] = useState(0);
  const live = useRef({ mode, zoom, cardCm, person, place, turn });
  useEffect(() => {
    live.current = { mode, zoom, cardCm, person, place, turn };
  }, [mode, zoom, cardCm, person, place, turn]);
  const stopRef = useRef<() => void>(() => {});
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal needs the browser
  useEffect(() => setMounted(true), []);

  const start = async () => {
    const el = stage.current;
    if (!el) return;
    setRunning(true);
    setStatus("Starting the camera…");
    try {
      stopRef.current = await startAR(
        el,
        works,
        targets,
        live,
        setFound,
        setStatus,
      );
      setStatus(null);
    } catch (e) {
      setStatus(
        `Couldn't start: ${(e as Error)?.message || "the camera was refused or isn't available"}.`,
      );
    }
  };
  const stop = () => {
    stopRef.current();
    stopRef.current = () => {};
    setRunning(false);
    setFound(null);
  };

  // Hand-off to the phone's own AR, which tracks the room (SLAM: ARCore on
  // Android, ARKit on iPhone) instead of following the card frame by frame,
  // so the work stays pinned to its spot. The card has done its job: it told
  // us which work this is. On Android the WebXR stage for the last work seen
  // is kept loaded, so AR can start straight from the tap.
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop">(
    "desktop",
  );
  const [webXR, setWebXR] = useState(false);
  useEffect(() => {
    const p = detectPlatform();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser only
    setPlatform(p);
    if (p === "android") webXRSupported().then(setWebXR);
  }, []);
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follows the tracker
    if (found !== null) setLastSeen(found);
  }, [found]);
  const xrRef = useRef<WebXRStageHandle>(null);
  const canAnchor = platform === "ios" || platform === "android";
  const anchor = async () => {
    if (lastSeen === null) return;
    const w = works[lastSeen];
    // Free the camera first: the phone's AR needs it.
    stop();
    if (platform === "android") {
      if (!xrRef.current?.launch())
        launchSceneViewer(toAbs(w.arUrl), w.title, window.location.href);
      return;
    }
    try {
      openQuickLook(await resolveUsdz(w.sculpture));
    } catch {
      setStatus("Couldn't open AR on this phone.");
    }
  };
  useEffect(() => () => stopRef.current(), []);

  // Gestures on the camera view: one finger drags the work round, two
  // fingers pinch to resize, a double tap puts both back.
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const drag = useRef<{ x: number; turn: number } | null>(null);
  const lastTap = useRef(0);
  const touches = (e: React.TouchEvent) =>
    Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );

  const work = found !== null ? works[found] : null;
  // Units per cm in the card's space (1 unit = the card's width).
  const perCm = (w: ARWork) =>
    (mode === "real" ? 1 / cardCm : FIT_UNITS / w.heightCm) * zoom;
  const ratio = work ? 1 / (perCm(work) * cardCm) : 1;

  return (
    <main className="mx-auto max-w-[1100px] px-[clamp(16px,4vw,40px)] pb-16 pt-8">
      <h1 className="font-display text-[clamp(28px,4vw,40px)] leading-tight">
        Image AR (prototype)
      </h1>
      <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-stone">
        Print one of the cards below, or open it on another screen. Hold or prop
        the card upright, tap <b>Start camera</b> on your phone and point it at
        the card, straight on: the sculpture stands in front of it. Pinch or use
        the slider to resize, choose <b>Real size</b> and the printed width of
        your card, or add a 1.7 m person at the same scale. A card lying flat on
        a table works too (<b>Card flat on table</b>), but only seen from fairly
        high above: the tracker loses a card tilted much more than about
        35&deg;.
      </p>
      <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-stone">
        <b>For a steady view, tap Anchor it here</b> once the work appears. The
        phone&apos;s own AR takes over (ARCore on Android, ARKit on iPhone): it
        tracks the whole room, not just the card, so the work stays pinned where
        you put it as you walk round it. Lay the card on a table, aim at it and
        tap to place the work there, at its real height; pinch to resize.
      </p>

      <button
        type="button"
        onClick={running ? stop : start}
        className="btn mt-6"
      >
        {running ? "Stop camera" : "Start camera"}
      </button>

      {/* The camera view: full screen while running. Rendered into <body>: the
          page's fade-in transform would otherwise trap a fixed layer inside <main>. */}
      {mounted &&
        createPortal(
          <div
            ref={stage}
            onTouchStart={(e) => {
              if ((e.target as HTMLElement).closest("button, input")) return;
              if (e.touches.length === 2) {
                drag.current = null;
                pinch.current = { d: touches(e), z: zoom };
              } else if (e.touches.length === 1) {
                const now = performance.now();
                if (now - lastTap.current < 300) {
                  setTurn(0);
                  setZoom(1);
                }
                lastTap.current = now;
                drag.current = { x: e.touches[0].clientX, turn };
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2 && pinch.current)
                setZoom(
                  Math.min(
                    4,
                    Math.max(
                      0.15,
                      (pinch.current.z * touches(e)) / pinch.current.d,
                    ),
                  ),
                );
              else if (e.touches.length === 1 && drag.current)
                // A full drag across the screen turns the work once round.
                setTurn(
                  drag.current.turn +
                    ((e.touches[0].clientX - drag.current.x) /
                      window.innerWidth) *
                      360,
                );
            }}
            onTouchEnd={() => {
              pinch.current = null;
              drag.current = null;
            }}
            className={
              running
                ? "fixed inset-0 z-[80] touch-none overflow-hidden bg-black"
                : "hidden"
            }
          >
            {running && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-black/60 to-transparent p-4 text-white">
                <div>
                  {work ? (
                    <>
                      <p className="text-[12px] opacity-80">{work.artist}</p>
                      <p className="font-display text-[20px] leading-tight">
                        {work.title}
                      </p>
                      <p className="mt-1 inline-flex rounded-full bg-[#f3b23a] px-2.5 py-0.5 text-[13px] font-medium tabular-nums text-[#1c1a17]">
                        Real height {work.heightCm} cm
                      </p>
                      <p className="mt-1 text-[13px] tabular-nums opacity-90">
                        {sizeText(ratio)}
                      </p>
                      <p className="mt-1 text-[12px] opacity-75">
                        Drag to turn · pinch to resize · double-tap to reset
                      </p>
                      {canAnchor && (
                        <p className="mt-1 text-[12px] opacity-75">
                          Shaky? Use <b>Anchor it here</b> below.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[15px]">
                      {status ?? "Point the camera at an AR card"}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={stop}
                  className="pointer-events-auto rounded-full bg-white/90 px-4 py-2 text-[14px] text-ink"
                >
                  Close
                </button>
              </div>
            )}
            {running && (
              <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 bg-gradient-to-t from-black/70 to-transparent p-4 pb-[max(16px,env(safe-area-inset-bottom))] text-white">
                {canAnchor && work && (
                  <button
                    type="button"
                    onClick={anchor}
                    className="w-full rounded-full bg-[#f3b23a] px-5 py-3 text-[15px] font-semibold text-[#1c1a17] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
                  >
                    Anchor it here · stable, real size
                  </button>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {(["fit", "real"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMode(m);
                        setZoom(1);
                      }}
                      className={`rounded-full px-4 py-2 text-[14px] ${mode === m ? "bg-white text-ink" : "bg-white/20"}`}
                    >
                      {m === "fit" ? "Fit to card" : "Real size"}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPerson((v) => !v)}
                    className={`rounded-full px-4 py-2 text-[14px] ${person ? "bg-white text-ink" : "bg-white/20"}`}
                  >
                    1.7 m person
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPlace((p) => (p === "upright" ? "flat" : "upright"))
                    }
                    className="rounded-full bg-white/20 px-4 py-2 text-[14px]"
                  >
                    {place === "upright"
                      ? "Card upright"
                      : "Card flat on table"}
                  </button>
                </div>
                {mode === "real" && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="opacity-80">Card printed</span>
                    {CARD_WIDTHS.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setCardCm(w)}
                        className={`rounded-full px-3 py-1 ${cardCm === w ? "bg-white text-ink" : "bg-white/20"}`}
                      >
                        {w} cm wide
                      </button>
                    ))}
                  </div>
                )}
                <label className="flex items-center gap-3 text-[13px]">
                  <span className="opacity-80">Size</span>
                  <input
                    type="range"
                    min={0.15}
                    max={4}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </label>
              </div>
            )}
          </div>,
          document.body,
        )}

      {webXR && lastSeen !== null && (
        <WebXRStage
          key={works[lastSeen].slug}
          ref={xrRef}
          src={toAbs(works[lastSeen].arUrl)}
          title={works[lastSeen].title}
          scale="auto"
          onStart={() => {}}
          onFail={() =>
            launchSceneViewer(
              toAbs(works[lastSeen].arUrl),
              works[lastSeen].title,
              window.location.href,
            )
          }
        />
      )}

      <h2 className="font-display mt-12 text-[24px]">The cards</h2>
      <p className="mt-2 max-w-[64ch] text-[14px] text-stone">
        Printed at 10 cm wide they work best. Two are easy for the tracker
        (busy, high contrast) and two are harder (smooth bronze, thin shapes),
        to test how far this can go.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
        {works.map((w, i) => (
          <a
            key={w.slug}
            href={w.card}
            target="_blank"
            rel="noopener"
            className="group block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={w.card}
              alt={`AR card ${i + 1}: ${w.title}`}
              className="w-full rounded-md border border-rule print:w-[10cm]"
            />
            <span className="mt-2 block text-[13px] text-stone group-hover:text-ink">
              Card {i + 1} · {i < 2 ? "easy target" : "hard target"} · open to
              print
            </span>
          </a>
        ))}
      </div>
    </main>
  );
}

/** Starts the camera, the tracker and the 3D scene; returns a stop function. */
async function startAR(
  el: HTMLDivElement,
  works: ARWork[],
  targets: string,
  live: React.RefObject<{
    mode: Mode;
    zoom: number;
    cardCm: number;
    person: boolean;
    place: Place;
    turn: number;
  }>,
  onFound: (i: number | null) => void,
  onStatus: (s: string | null) => void,
) {
  // The camera.
  const video = document.createElement("video");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  Object.assign(video.style, { position: "absolute", top: "0", left: "0" });
  el.appendChild(video);
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "environment",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });
  video.srcObject = stream;
  await new Promise<void>((r) =>
    video.addEventListener("loadedmetadata", () => r(), { once: true }),
  );
  await video.play().catch(() => {});

  // The tracker reads frames from a canvas copy of the camera: some browsers
  // (and headless Chrome) can't hand live video straight to its GPU code and
  // it then sees blank frames. The copy is updated every animation frame.
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = video.videoWidth;
  frameCanvas.height = video.videoHeight;
  const frameCtx = frameCanvas.getContext("2d", { willReadFrequently: true })!;
  const copyFrame = () =>
    frameCtx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
  copyFrame();

  // The 3D scene, drawn over the camera.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  Object.assign(renderer.domElement.style, {
    position: "absolute",
    top: "0",
    left: "0",
  });
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.8;
  scene.add(new THREE.HemisphereLight("#ffffff", "#8a8070", 1.2));
  const key = new THREE.DirectionalLight("#ffffff", 1.6);
  key.position.set(0.5, -1, 2); // from the viewer's side of the card, above
  scene.add(key);
  const camera = new THREE.PerspectiveCamera();

  // The tracker.
  onStatus("Loading the tracker…");
  const { Controller } = await import(/* webpackIgnore: true */ MINDAR);
  // One anchor per card: the card's own space, 1 unit = its width, origin at
  // its centre, x right, y up the card, z out of it.
  const anchors = works.map(() => {
    const g = new THREE.Group();
    g.matrixAutoUpdate = false;
    g.visible = false;
    scene.add(g);
    return g;
  });
  let post: THREE.Matrix4[] = [];
  // The latest pose from the tracker, per card. Each anchor eases towards it
  // every frame (in the render loop), which steadies the work far more than
  // the tracker's own filter alone, most of all a big work reaching far out
  // from the card, where any wobble is magnified.
  const targetPose: (THREE.Matrix4 | null)[] = works.map(() => null);
  const shownPos = works.map(() => new THREE.Vector3());
  const shownRot = works.map(() => new THREE.Quaternion());
  const shownScale = works.map(() => new THREE.Vector3(1, 1, 1));
  const fresh = works.map(() => true);
  let current: number | null = null;
  const controller = new Controller({
    inputWidth: video.videoWidth,
    inputHeight: video.videoHeight,
    maxTrack: 1,
    // MindAR's own smoothing at its strongest (its docs' "less jitter"
    // setting), and a work isn't dropped for a few missed frames.
    filterMinCF: 0.0001,
    filterBeta: 0.001,
    missTolerance: 8,
    onUpdate: (d: {
      type: string;
      targetIndex: number;
      worldMatrix: number[] | null;
    }) => {
      if (d.type !== "updateMatrix") return;
      const g = anchors[d.targetIndex];
      if (!g) return;
      if (d.worldMatrix) {
        const m = new THREE.Matrix4();
        m.fromArray(d.worldMatrix);
        targetPose[d.targetIndex] = m.multiply(post[d.targetIndex]);
        g.visible = true;
        if (current !== d.targetIndex) {
          current = d.targetIndex;
          onFound(current);
          load(current);
        }
      } else {
        g.visible = false;
        targetPose[d.targetIndex] = null;
        fresh[d.targetIndex] = true;
        if (current === d.targetIndex) {
          current = null;
          onFound(null);
        }
      }
    },
  });
  const { dimensions } = await controller.addImageTargets(targets);
  post = (dimensions as [number, number][]).map(([w, h]) => {
    const m = new THREE.Matrix4();
    m.compose(
      new THREE.Vector3(w / 2, w / 2 + (h - w) / 2, 0),
      new THREE.Quaternion(),
      new THREE.Vector3(w, w, w),
    );
    return m;
  });

  // Each work, and the person beside it, in cm inside `holder`, which turns
  // cm into card units and places them every frame: upright, they stand in
  // front of the card on its bottom edge, facing the viewer; flat, they stand
  // up out of the card's centre, facing its bottom edge.
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);
  loader.setDRACOLoader(draco);
  const holders: (THREE.Group | null)[] = works.map(() => null);
  const people: THREE.Group[] = [];
  const depths: number[] = []; // each work's depth (cm)
  const pivots: (THREE.Group | null)[] = works.map(() => null);
  const load = (i: number) => {
    if (holders[i]) return;
    const w = works[i];
    const holder = new THREE.Group();
    holders[i] = holder;
    anchors[i].add(holder);
    loader.load(w.modelUrl, (gltf) => {
      const model = gltf.scene;
      model.rotation.y = (w.facing * Math.PI) / 180;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      const toCm = w.heightCm / size.y;
      depths[i] = size.z * toCm;
      const fitted = new THREE.Group();
      model.position.set(-centre.x, -box.min.y, -centre.z);
      fitted.add(model);
      fitted.scale.setScalar(toCm); // now in cm, base at 0
      // The visitor turns the work (not the person) on this pivot.
      const pivot = new THREE.Group();
      pivot.add(fitted);
      pivots[i] = pivot;
      holder.add(pivot);
      // The optional person stands to the work's right.
      const fig = personFigure(PERSON_CM);
      fig.position.x = (size.x * toCm) / 2 + 30; // beside the work, 30 cm away
      people[i] = fig;
      holder.add(fig);
    });
  };

  // Fit the camera to MindAR's projection and the video to the screen.
  const resize = () => {
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const vr = video.videoWidth / video.videoHeight;
    let vw: number, vh: number;
    if (vr > cw / ch) {
      vh = ch;
      vw = vh * vr;
    } else {
      vw = cw;
      vh = vw / vr;
    }
    Object.assign(video.style, {
      width: `${vw}px`,
      height: `${vh}px`,
      top: `${-(vh - ch) / 2}px`,
      left: `${-(vw - cw) / 2}px`,
    });
    const proj = controller.getProjectionMatrix();
    camera.fov = (2 * Math.atan((1 / proj[5]) * (ch / vh)) * 180) / Math.PI;
    camera.near = proj[14] / (proj[10] - 1);
    camera.far = proj[14] / (proj[10] + 1);
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    renderer.setSize(cw, ch);
  };
  resize();
  window.addEventListener("resize", resize);

  onStatus("Getting ready…");
  await controller.dummyRun(frameCanvas);
  controller.processVideo(frameCanvas);
  onStatus(null);

  const tmpPos = new THREE.Vector3();
  const tmpRot = new THREE.Quaternion();
  const tmpScale = new THREE.Vector3();
  let raf = requestAnimationFrame(function frame() {
    raf = requestAnimationFrame(frame);
    copyFrame();
    // Ease each visible card's anchor towards the tracker's latest pose.
    anchors.forEach((g, i) => {
      const target = targetPose[i];
      if (!target) return;
      target.decompose(tmpPos, tmpRot, tmpScale);
      if (fresh[i]) {
        shownPos[i].copy(tmpPos);
        shownRot[i].copy(tmpRot);
        shownScale[i].copy(tmpScale);
        fresh[i] = false;
      } else {
        shownPos[i].lerp(tmpPos, 0.25);
        shownRot[i].slerp(tmpRot, 0.25);
        shownScale[i].lerp(tmpScale, 0.25);
      }
      g.matrix.compose(shownPos[i], shownRot[i], shownScale[i]);
    });
    const s = live.current!;
    holders.forEach((h, i) => {
      if (!h) return;
      const perCm =
        (s.mode === "real" ? 1 / s.cardCm : FIT_UNITS / works[i].heightCm) *
        s.zoom;
      h.scale.setScalar(perCm);
      if (s.place === "flat") {
        // Up (y) becomes out of the card (z); the front faces the bottom edge.
        h.rotation.x = Math.PI / 2;
        h.position.set(0, 0, 0);
      } else {
        // Standing on the card's bottom edge, just in front of it.
        h.rotation.x = 0;
        h.position.set(0, -CARD_RATIO / 2, ((depths[i] ?? 0) / 2) * perCm);
      }
      if (people[i]) people[i].visible = s.person;
      if (pivots[i]) pivots[i]!.rotation.y = (s.turn * Math.PI) / 180;
    });
    renderer.render(scene, camera);
  });

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    controller.stopProcessVideo();
    stream.getTracks().forEach((t) => t.stop());
    renderer.dispose();
    pmrem.dispose();
    draco.dispose();
    video.remove();
    renderer.domElement.remove();
  };
}
