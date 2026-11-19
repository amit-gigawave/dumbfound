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

export type ARWork = {
  slug: string;
  title: string;
  artist: string;
  /** The light card copy of the model (fast to load on a phone). */
  modelUrl: string;
  facing: number;
  heightCm: number;
  card: string;
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

/**
 * A height ruler, `cm` tall (base at 0): a slim post with a mark every 10 cm
 * (every 50 cm on tall works) and the height written at the top.
 */
function heightRuler(cm: number) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const w = Math.max(0.6, cm * 0.012);
  const post = new THREE.Mesh(new THREE.BoxGeometry(w, cm, w), mat);
  post.position.y = cm / 2;
  g.add(post);
  const step = cm > 150 ? 50 : 10;
  for (let y = 0; y <= cm + 0.01; y += step) {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(w * 4, w * 0.8, w), mat);
    tick.position.y = Math.min(y, cm);
    g.add(tick);
  }
  // The label, drawn on a canvas.
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(20,20,18,0.78)";
  ctx.beginPath();
  ctx.roundRect(4, 8, 248, 80, 40);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 46px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(cm)} cm`, 128, 50);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, depthTest: false }),
  );
  const lw = Math.max(12, cm * 0.32);
  label.scale.set(lw, lw * 0.375, 1);
  label.position.y = cm + lw * 0.3;
  g.add(label);
  return g;
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
  const live = useRef({ mode, zoom, cardCm, person, place });
  useEffect(() => {
    live.current = { mode, zoom, cardCm, person, place };
  }, [mode, zoom, cardCm, person, place]);
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
  useEffect(() => () => stopRef.current(), []);

  // Pinch to resize (two fingers on the camera view).
  const pinch = useRef<{ d: number; z: number } | null>(null);
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
        the card, straight on: the sculpture stands in front of it, with a ruler
        marking its real height. Pinch or use the slider to resize, choose{" "}
        <b>Real size</b> and the printed width of your card, or add a 1.7 m
        person at the same scale. A card lying flat on a table works too (
        <b>Card flat on table</b>), but only seen from fairly high above: the
        tracker loses a card tilted much more than about 35&deg;.
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
              if (e.touches.length === 2)
                pinch.current = { d: touches(e), z: zoom };
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
            }}
            onTouchEnd={() => (pinch.current = null)}
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
                      <p className="mt-0.5 text-[13px] tabular-nums opacity-90">
                        {work.heightCm} cm tall ·{" "}
                        {Math.abs(ratio - 1) < 0.03
                          ? "real size"
                          : `shown at 1 : ${ratio < 10 ? ratio.toFixed(1) : Math.round(ratio)}`}
                      </p>
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
  let current: number | null = null;
  const controller = new Controller({
    inputWidth: video.videoWidth,
    inputHeight: video.videoHeight,
    maxTrack: 1,
    filterMinCF: 0.001,
    filterBeta: 10,
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
        g.matrix = m.multiply(post[d.targetIndex]);
        g.visible = true;
        if (current !== d.targetIndex) {
          current = d.targetIndex;
          onFound(current);
          load(current);
        }
      } else {
        g.visible = false;
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
      holder.add(fitted);
      // The height ruler just left of the work; the person to its right.
      const ruler = heightRuler(w.heightCm);
      ruler.position.x = -(size.x * toCm) / 2 - Math.max(4, w.heightCm * 0.08);
      holder.add(ruler);
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

  let raf = requestAnimationFrame(function frame() {
    raf = requestAnimationFrame(frame);
    copyFrame();
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
