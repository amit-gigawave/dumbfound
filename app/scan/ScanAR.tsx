"use client";

// Scan AR: point the phone at any work's thumbnail, on paper, a poster or
// another screen, and the work stands up out of it at 90 degrees, fixed to
// the picture: it moves only with the picture, never on its own. The visitor
// can only resize it (pinch) and turn it (drag, or twist two fingers).
//
// Tracking is MindAR's image tracker (self-hosted, public/vendor/mindar-1.2.5)
// against every thumbnail (public/scan/targets.mind.gz, built by
// `node scripts/scan-targets.mjs`); the drawing is our own three.js scene.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DRACO_PATH } from "@/components/three/modelLoader";

export type ScanWork = {
  slug: string;
  title: string;
  artist: string;
  /** The light card copy of the model (quick to load on a phone). */
  modelUrl: string;
  facing: number;
  /** The image the tracker looks for: the work's thumbnail on white. */
  target: string;
};

const MINDAR = "/vendor/mindar-1.2.5/mindar-image.prod.js";
/** The work's height at size 1, in target widths (the target is square). */
const BASE_HEIGHT = 0.9;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
/** How long a work stays put after its picture is lost from view (ms). */
const HOLD_MS = 1500;

/* Pose smoothing. The tracker's pose shakes by a few pixels even when the
   phone is still, and a work standing out of the picture magnifies any tilt.
   Each frame the shown pose moves part of the way to the tracked pose, at a
   rate that depends on how far off it is: small differences (shake) are
   followed slowly, so the work sits still; large ones (the phone or the
   picture really moving) almost at once, so it never trails behind.
   Time-based, so it behaves the same at 30 or 120 frames a second. */
const SLOW = 3; // per second, for shake
const FAST = 28; // per second, for real movement
const POS_SHAKE = 0.004; // target widths: below this it's shake
const POS_MOVE = 0.05; // above this it's movement
const ROT_SHAKE = 0.01; // radians (about 0.6°)
const ROT_MOVE = 0.12; // radians (about 7°)

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const easeFactor = (err: number, shake: number, move: number, dt: number) =>
  1 - Math.exp(-(SLOW + (FAST - SLOW) * smooth(shake, move, err)) * dt);

/** The visitor's resize and turn, read by the render loop every frame. */
type Hand = { zoom: number; turn: number };

export default function ScanAR({
  works,
  targets,
}: {
  works: ScanWork[];
  targets: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [found, setFound] = useState<number | null>(null);
  const hand = useRef<Hand>({ zoom: 1, turn: 0 });
  const stopRef = useRef<() => void>(() => {});
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal needs the browser
  useEffect(() => setMounted(true), []);
  useEffect(() => () => stopRef.current(), []);

  const reset = () => {
    hand.current.zoom = 1;
    hand.current.turn = 0;
  };

  const start = async () => {
    const el = stage.current;
    if (!el) return;
    setRunning(true);
    // Browsers give pages the camera only over https (or on localhost).
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setStatus(
        "The camera only works on a secure (https://) page. Open this page on the live site, or run \"npm run tunnel\" and use the https address it prints.",
      );
      return;
    }
    if (typeof DecompressionStream === "undefined") {
      setStatus("This browser is too old for scanning. Update it and try again.");
      return;
    }
    reset();
    try {
      stopRef.current = await startAR(el, works, targets, hand, (i) => {
        if (i !== null) reset(); // each work starts at its own size, unturned
        setFound(i);
      }, setStatus);
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
    setStatus(null);
  };

  // Gestures: one finger drags to turn the work, two fingers pinch to resize
  // (and twist to turn), a double tap puts it back. Nothing moves the work
  // off the picture. Kept in a ref, not React state, so a gesture never
  // re-renders the page mid-frame.
  const gesture = useRef<{
    x?: number;
    d?: number;
    a?: number;
    zoom: number;
    turn: number;
  } | null>(null);
  const lastTap = useRef(0);
  const two = (t: React.TouchList) => ({
    d: Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY),
    a: Math.atan2(t[1].clientY - t[0].clientY, t[1].clientX - t[0].clientX),
  });
  const begin = (t: React.TouchList) => {
    const { zoom, turn } = hand.current;
    gesture.current =
      t.length >= 2 ? { ...two(t), zoom, turn } : { x: t[0].clientX, zoom, turn };
  };

  const work = found !== null ? works[found] : null;

  return (
    <main className="mx-auto max-w-[1100px] px-[clamp(16px,4vw,40px)] pb-16 pt-8">
      <h1 className="font-display text-[clamp(28px,4vw,40px)] leading-tight">
        Scan a work
      </h1>
      <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-stone">
        Point your phone at a picture of any work below, printed or on
        another screen, and the sculpture stands up out of the picture. It stays
        on the picture: move around it to see it from every side. Pinch to make
        it bigger or smaller, drag to turn it, double-tap to put it back.
      </p>

      <button type="button" onClick={running ? stop : start} className="btn mt-6">
        {running ? "Stop camera" : "Start camera"}
      </button>

      {mounted &&
        createPortal(
          <div
            ref={stage}
            onTouchStart={(e) => {
              if ((e.target as HTMLElement).closest("button")) return;
              begin(e.touches);
              if (e.touches.length === 1) {
                const now = performance.now();
                if (now - lastTap.current < 300) reset();
                lastTap.current = now;
              }
            }}
            onTouchMove={(e) => {
              const g = gesture.current;
              if (!g) return;
              const t = e.touches;
              if (t.length >= 2 && g.d !== undefined && g.a !== undefined) {
                const now = two(t);
                hand.current.zoom = Math.min(
                  MAX_ZOOM,
                  Math.max(MIN_ZOOM, (g.zoom * now.d) / g.d),
                );
                hand.current.turn = g.turn - (now.a - g.a);
              } else if (t.length === 1 && g.x !== undefined) {
                // A full screen width of drag turns it once round.
                hand.current.turn =
                  g.turn + ((t[0].clientX - g.x) / window.innerWidth) * Math.PI * 2;
              }
            }}
            onTouchEnd={(e) => {
              // A finger lifted mid-pinch: carry on from where things are.
              if (e.touches.length) begin(e.touches);
              else gesture.current = null;
            }}
            className={
              running
                ? "fixed inset-0 z-[80] touch-none select-none overflow-hidden bg-black"
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
                      {status && <p className="mt-1 text-[13px] opacity-90">{status}</p>}
                    </>
                  ) : (
                    <p className="text-[15px]">
                      {status ?? "Point the camera at a picture of a work"}
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
            {running && work && (
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 bg-gradient-to-t from-black/60 to-transparent p-4 pb-[max(16px,env(safe-area-inset-bottom))] text-white">
                <p className="text-[13px] opacity-85">
                  Pinch to resize · drag to turn
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full bg-white/20 px-4 py-2 text-[14px]"
                >
                  Reset
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}

      <h2 className="font-display mt-12 text-[24px]">Works you can scan</h2>
      <p className="mt-2 max-w-[64ch] text-[14px] text-stone">
        Any of these pictures works: printed (the bigger the better: a postcard
        works at arm&apos;s length, A4 from further back), on a poster, or on a
        laptop screen. Hold the phone so the picture fills a good part of the
        camera view.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {works.map((w) => (
          <a key={w.slug} href={w.target} target="_blank" rel="noopener" className="group block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={w.target}
              alt={w.title}
              loading="lazy"
              className="aspect-square w-full rounded-md border border-rule bg-white object-contain"
            />
            <span className="mt-1.5 block text-[12px] leading-snug text-stone group-hover:text-ink">
              {w.title}
            </span>
          </a>
        ))}
      </div>
    </main>
  );
}

/** Downloads the gzipped targets with progress and unpacks them in the browser. */
async function loadTargets(url: string, onStatus: (s: string) => void) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error("the list of works didn't load");
  const total = Number(res.headers.get("content-length")) || 0;
  let got = 0;
  const counted = res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, c) {
        got += chunk.byteLength;
        if (total) onStatus(`Loading the works… ${Math.round((got / total) * 100)}%`);
        c.enqueue(chunk);
      },
    }),
  );
  let data = new Uint8Array(await new Response(counted).arrayBuffer());
  // Unpack it, unless a server already did (sent with Content-Encoding).
  if (data[0] === 0x1f && data[1] === 0x8b) {
    const unpacked = new Blob([data]).stream().pipeThrough(
      new DecompressionStream("gzip") as unknown as TransformStream<Uint8Array, Uint8Array>,
    );
    data = new Uint8Array(await new Response(unpacked).arrayBuffer());
  }
  return URL.createObjectURL(new Blob([data]));
}

/** Starts the camera, the tracker and the 3D scene; returns a stop function. */
async function startAR(
  el: HTMLDivElement,
  works: ScanWork[],
  targets: string,
  hand: React.RefObject<Hand>,
  onFound: (i: number | null) => void,
  onStatus: (s: string | null) => void,
) {
  const cleanups: (() => void)[] = [];
  const stop = () => cleanups.splice(0).reverse().forEach((f) => f());
  try {
    // The tracker data downloads while the visitor allows the camera.
    onStatus("Starting the camera…");
    const tracker = import(/* webpackIgnore: true */ MINDAR);
    const targetsUrl = loadTargets(targets, onStatus);
    targetsUrl.then((u) => cleanups.push(() => URL.revokeObjectURL(u)), () => {});

    const video = document.createElement("video");
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    Object.assign(video.style, { position: "absolute", top: "0", left: "0" });
    el.appendChild(video);
    cleanups.push(() => video.remove());
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    cleanups.push(() => stream.getTracks().forEach((t) => t.stop()));
    video.srcObject = stream;
    await new Promise<void>((r) =>
      video.addEventListener("loadedmetadata", () => r(), { once: true }),
    );
    await video.play().catch(() => {});

    // The tracker reads a canvas copy of the camera: some browsers can't hand
    // live video straight to its GPU code and it then sees blank frames.
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
    Object.assign(renderer.domElement.style, { position: "absolute", top: "0", left: "0" });
    el.appendChild(renderer.domElement);
    cleanups.push(() => {
      renderer.dispose();
      renderer.domElement.remove();
    });
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.8;
    cleanups.push(() => pmrem.dispose());
    scene.add(new THREE.HemisphereLight("#ffffff", "#8a8070", 1.2));
    const key = new THREE.DirectionalLight("#ffffff", 1.6);
    key.position.set(0.5, -1, 2); // from the viewer's side of the picture, above
    scene.add(key);
    const camera = new THREE.PerspectiveCamera();

    onStatus("Loading the works…");
    const { Controller } = await tracker;
    // One anchor per target: the picture's own space, 1 unit = its width,
    // origin at its centre, x right, y up the picture, z out of it.
    const anchors = works.map(() => {
      const g = new THREE.Group();
      g.matrixAutoUpdate = false;
      g.visible = false;
      scene.add(g);
      return g;
    });
    let post: THREE.Matrix4[] = [];
    const tracked: (THREE.Matrix4 | null)[] = works.map(() => null);
    const lostAt: (number | null)[] = works.map(() => null);
    const fresh = works.map(() => true);
    const shownPos = works.map(() => new THREE.Vector3());
    const shownRot = works.map(() => new THREE.Quaternion());
    const shownScale = works.map(() => new THREE.Vector3(1, 1, 1));
    let current: number | null = null;

    const controller = new Controller({
      inputWidth: video.videoWidth,
      inputHeight: video.videoHeight,
      maxTrack: 1,
      // MindAR's own filter at its steadiest; ours (in the render loop) keeps
      // the work still without lagging behind real movement.
      filterMinCF: 0.0001,
      filterBeta: 0.001,
      missTolerance: 10,
      onUpdate: (d: { type: string; targetIndex: number; worldMatrix: number[] | null }) => {
        if (d.type !== "updateMatrix" || !anchors[d.targetIndex]) return;
        const i = d.targetIndex;
        if (d.worldMatrix) {
          tracked[i] = new THREE.Matrix4().fromArray(d.worldMatrix).multiply(post[i]);
          lostAt[i] = null;
          if (current !== i) {
            if (current !== null) anchors[current].visible = false;
            current = i;
            fresh[i] = true;
            onFound(i);
            load(i);
          }
        } else {
          tracked[i] = null;
          lostAt[i] = performance.now();
        }
      },
    });
    cleanups.push(() => controller.stopProcessVideo());
    const { dimensions } = await controller.addImageTargets(await targetsUrl);
    post = (dimensions as [number, number][]).map(([w, h]) =>
      new THREE.Matrix4().compose(
        new THREE.Vector3(w / 2, h / 2, 0),
        new THREE.Quaternion(),
        new THREE.Vector3(w, w, w),
      ),
    );

    // Each work stands in `holder`, base on the picture's centre, up out of
    // the picture, front towards its bottom edge; `turner` takes the
    // visitor's turn, `sizer` their resize.
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_PATH);
    loader.setDRACOLoader(draco);
    cleanups.push(() => draco.dispose());
    const turners: (THREE.Group | null)[] = works.map(() => null);
    const sizers: (THREE.Group | null)[] = works.map(() => null);
    const loading = new Set<number>();
    const load = (i: number) => {
      if (turners[i] || loading.has(i)) return;
      loading.add(i);
      onStatus("Loading the work…");
      const w = works[i];
      loader.load(
        w.modelUrl,
        async (gltf) => {
          const model = gltf.scene;
          model.rotation.y = (w.facing * Math.PI) / 180;
          model.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const centre = box.getCenter(new THREE.Vector3());
          model.position.set(-centre.x, -box.min.y, -centre.z);
          const fitted = new THREE.Group();
          fitted.add(model);
          fitted.scale.setScalar(BASE_HEIGHT / size.y);
          const turner = new THREE.Group();
          turner.add(fitted);
          const sizer = new THREE.Group();
          sizer.add(turner);
          sizer.rotation.x = Math.PI / 2; // up (y) becomes out of the picture (z)
          // Upload the textures and shaders before it appears, so it doesn't
          // stall the camera view for a frame or two when it first shows.
          model.traverse((o) => {
            const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
            if (!m) return;
            for (const t of [m.map, m.normalMap, m.roughnessMap, m.metalnessMap, m.aoMap, m.emissiveMap])
              if (t) renderer.initTexture(t);
          });
          await renderer.compileAsync(sizer, camera, scene).catch(() => {});
          anchors[i].add(sizer);
          turners[i] = turner;
          sizers[i] = sizer;
          loading.delete(i);
          if (current === i) onStatus(null);
        },
        undefined,
        () => {
          loading.delete(i);
          if (current === i) onStatus("This work didn't load. Check the connection.");
        },
      );
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
    cleanups.push(() => window.removeEventListener("resize", resize));

    onStatus("Getting ready…");
    await controller.dummyRun(frameCanvas);
    controller.processVideo(frameCanvas);
    onStatus(null);

    const pos = new THREE.Vector3();
    const rot = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    let shownZoom = 1;
    let shownTurn = 0;
    let last = performance.now();
    let raf = requestAnimationFrame(function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      copyFrame();

      anchors.forEach((g, i) => {
        const target = tracked[i];
        if (!target) {
          // Lost: stay put for HOLD_MS (the card is often found again at
          // once), then hide.
          const since = lostAt[i];
          if (since !== null && now - since > HOLD_MS) {
            lostAt[i] = null;
            g.visible = false;
            if (current === i) {
              current = null;
              onFound(null);
              onStatus("Lost the picture: hold the phone a little closer");
            }
          }
          return;
        }
        target.decompose(pos, rot, scl);
        if (fresh[i]) {
          shownPos[i].copy(pos);
          shownRot[i].copy(rot);
          shownScale[i].copy(scl);
          fresh[i] = false;
        } else {
          // Errors measured in picture widths, so it's the same near or far.
          const width = shownScale[i].x || 1;
          const kp = easeFactor(shownPos[i].distanceTo(pos) / width, POS_SHAKE, POS_MOVE, dt);
          const kr = easeFactor(shownRot[i].angleTo(rot), ROT_SHAKE, ROT_MOVE, dt);
          shownPos[i].lerp(pos, kp);
          shownScale[i].lerp(scl, kp);
          shownRot[i].slerp(rot, Math.max(kr, kp));
        }
        g.matrix.compose(shownPos[i], shownRot[i], shownScale[i]);
        g.visible = true;
      });

      // The visitor's resize and turn, eased so a gesture feels smooth.
      const h = hand.current!;
      const k = 1 - Math.exp(-18 * dt);
      shownZoom += (h.zoom - shownZoom) * k;
      shownTurn += (h.turn - shownTurn) * k;
      if (current !== null && sizers[current]) {
        sizers[current]!.scale.setScalar(shownZoom);
        turners[current]!.rotation.y = shownTurn;
      }
      renderer.render(scene, camera);
    });
    cleanups.push(() => cancelAnimationFrame(raf));
    return stop;
  } catch (e) {
    stop();
    throw e;
  }
}
