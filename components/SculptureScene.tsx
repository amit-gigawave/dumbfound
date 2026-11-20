"use client";

import {
  FC,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
  Html,
  useProgress,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  DRACO_PATH,
  hasRevealed,
  markRevealed,
  retainModel,
} from "./three/modelLoader";
import StudioEnvironment from "./three/StudioEnvironment";
import { setupRenderer } from "./three/renderer";
import type { ArtworkLook } from "@/lib/sculptures";
import { rigFor, SHINE, type LightRig } from "./three/lighting";

// Neutral grey for the wireframe scaffold during the reveal.
const WIRE_COLOR = "#5c5c5c";
// Seconds-ish pacing of the materialize animation (higher = faster).
const REVEAL_SPEED = 0.7;

// The reveal moves its clip planes every frame. The planes come from useMemo,
// so they're updated through this helper rather than assigned in the component.
function setPlaneConstant(plane: THREE.Plane, constant: number) {
  plane.constant = constant;
}

// Adaptive viewer backdrop: a light model gets a dark background and a dark
// model gets a light one, so the sculpture always stands out with contrast.
const BG_FOR_LIGHT_MODEL = "#2b2b2b";
const BG_FOR_DARK_MODEL = "#e9e9e9";

/** Average sRGB colour of an image, downscaled to 16×16. Returns [r,g,b] 0..1. */
const sampleImageColor = (
  image: CanvasImageSource | null | undefined,
): [number, number, number] | null => {
  if (!image || typeof document === "undefined") return null;
  try {
    const size = 16;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    let r = 0;
    let g = 0;
    let b = 0;
    let weight = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] / 255;
      r += (data[i] / 255) * a;
      g += (data[i + 1] / 255) * a;
      b += (data[i + 2] / 255) * a;
      weight += a;
    }
    if (weight === 0) return null;
    return [r / weight, g / weight, b / weight];
  } catch {
    return null; // tainted canvas etc. — fall back to the neutral default
  }
};

/** Perceived lightness (0 dark .. 1 light) of a model's base colour. */
const modelLuminance = (root: THREE.Object3D): number => {
  let sum = 0;
  let count = 0;
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      let r = 1;
      let g = 1;
      let b = 1;
      if (mat.color) {
        r = mat.color.r;
        g = mat.color.g;
        b = mat.color.b;
      }
      const avg = sampleImageColor(mat.map?.image as CanvasImageSource | undefined);
      if (avg) {
        r *= avg[0];
        g *= avg[1];
        b *= avg[2];
      }
      sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      count++;
    }
  });
  return count ? sum / count : 0.5;
};

const pickBackground = (lum: number) =>
  lum >= 0.5 ? BG_FOR_LIGHT_MODEL : BG_FOR_DARK_MODEL;

/**
 * The surface a work is drawn with: a clone of its own material, cleaned of
 * scan export faults and adjusted by the work's `look`.
 */
const prepareMaterial = (m: THREE.Material, clip: THREE.Plane) => {
  const c = m.clone();
  c.clippingPlanes = [clip];
  if (c instanceof THREE.MeshPhysicalMaterial) {
    // USD exports mark some scans as glass (transmission) or set specular
    // above the physical maximum; on an opaque work both draw as glare.
    c.transmission = 0;
    const s = c.specularColor;
    s.setRGB(Math.min(s.r, 1), Math.min(s.g, 1), Math.min(s.b, 1));
  }
  if (c instanceof THREE.MeshStandardMaterial) {
    // The scan's own values, which the look scales (see applyLook).
    c.userData.base = {
      metalness: c.metalness,
      roughness: c.roughness,
      specular: c instanceof THREE.MeshPhysicalMaterial ? c.specularIntensity : undefined,
    };
  }
  return c;
};

/**
 * Sets a prepared material's surface from the work's `look`. It only changes
 * values (no new materials, no shader rebuild), so the look tweaker's sliders
 * stay smooth.
 */
const applyLook = (c: THREE.Material, look: ArtworkLook | undefined) => {
  if (!(c instanceof THREE.MeshStandardMaterial)) return;
  const base = c.userData.base as { metalness: number; roughness: number; specular?: number };
  // A part's own setting (look.parts) replaces the whole work's multiplier.
  const part = look?.parts?.[c.userData.part as string];
  c.metalness = part?.metalness ?? base.metalness * (look?.metalness ?? 1);
  // Scales the roughness texture too; the shader caps it at fully matte.
  c.roughness = (part?.roughness ?? base.roughness * (look?.roughness ?? 1)) * SHINE.roughness;
  if (c instanceof THREE.MeshPhysicalMaterial && base.specular !== undefined)
    c.specularIntensity = look?.specular ?? base.specular;
};

/** One surface of a model, as the look tweaker lists it. */
export type ModelPart = { name: string; points: number; metalness: number; roughness: number };

interface SculptureSceneProps {
  url: string;
  offsetX?: number;
  offsetY?: number;
  defaultZoom?: number;
  /**
   * When true the viewer is fully interactive (zoom + pan) and idle auto-rotate
   * is disabled. When false (default) it's a passive showcase: auto-rotate on,
   * zoom/pan off, and pointer events pass through so a parent link stays clickable.
   */
  interactive?: boolean;
  /**
   * "thumbnail" renders a static, transparent, reveal-free frame for the
   * thumbnail generator (scripts/make-thumbnails.mjs).
   */
  mode?: "viewer" | "thumbnail";
  /** Play the wireframe "materialize" intro (first view per session only). */
  reveal?: boolean;
  /**
   * Auto-frame the model: center it and place the camera so the sculpture fills
   * this fraction of the canvas (e.g. 0.85). Ignores offsetX/offsetY/defaultZoom.
   * Thumbnails, hover previews and the viewer share it so they line up exactly.
   */
  fit?: number;
  /** Receives the OrbitControls instance (e.g. for a "reset view" button). */
  controlsRef?: React.RefObject<OrbitControlsImpl | null>;
  /** Fires once the model has been loaded and drawn. */
  onReady?: () => void;
  /** Reports the chosen adaptive backdrop colour (so a parent can match it). */
  onBackground?: (hex: string) => void;
  /**
   * Paint a contrasting backdrop behind the model (default on in the viewer).
   * Hover previews turn it off so the model sits on the tile's own plate.
   */
  adaptiveBackground?: boolean;
  /** Showcase auto-rotate (default on); lets a parent hold the turn until it's ready. */
  autoRotate?: boolean;
  /** Degrees to turn the model so it faces the camera (see Sculpture.facing). */
  facing?: number;
  /** Per-work surface and light tuning (see Sculpture.look). */
  look?: ArtworkLook;
  /** Reports the model's parts (surfaces), largest first; for the look tweaker. */
  onParts?: (parts: ModelPart[]) => void;
  /** A part to tint green, to show where it is (look tweaker). */
  highlight?: string;
  /** A candidate light rig to preview (components/three/lighting.ts); default LIGHTING. */
  rig?: string;
  /**
   * With `interactive`: drag to turn the work, but leave the mouse wheel and
   * panning alone, so a page that scrolls past the canvas keeps scrolling.
   */
  rotateOnly?: boolean;
  /**
   * Redraw every frame while on screen. Off by default: a still work is drawn
   * only when something changes (a drag, the reveal, a resize), so an open
   * page doesn't keep the GPU busy. Turn it on for a parent that moves the
   * camera itself through `controlsRef` (e.g. its own slow auto-turn).
   */
  alwaysRender?: boolean;
}

/**
 * The canvas draws on demand, so anything that animates by itself must ask
 * for frames. This asks for one every frame for `ms` after it mounts: long
 * enough for the reveal (~1.4 s), the camera framing and the first frames of
 * the environment to settle. Remount it (a new `key`) to run it again.
 */
const WarmFrames: FC<{ ms?: number }> = ({ ms = 2500 }) => {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const end = performance.now() + ms;
    let raf = 0;
    const tick = () => {
      invalidate();
      if (performance.now() < end) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [invalidate, ms]);
  return null;
};

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black/40" />
        <div className="text-[9px] uppercase tracking-[0.3em] text-black/30">
          {Math.round(progress)}%
        </div>
      </div>
    </Html>
  );
};

/**
 * Loads a GLB and plays the same "materialize" reveal as the hero: a wireframe
 * scaffold rises from the floor up, then the solid textured surface fills in
 * behind it — driven by animated local clipping planes.
 *
 * The model is also normalized deterministically (centered at the origin, scaled
 * so its bounding sphere has a diameter of 1 unit). That normalization is the
 * single source of truth for placement — no <Stage> auto-fit that could race
 * with the async load and cause inconsistent framing between reloads.
 */
const RevealModel: FC<{
  url: string;
  offsetX: number;
  offsetY: number;
  reveal: boolean;
  fit?: number;
  facing: number;
  look?: ArtworkLook;
  /** Card framing (look.cardZoom / cardShift); thumbnails and hover previews only. */
  cardFrame?: { zoom: number; shift: number; lift: number };
  adaptiveBg: boolean;
  onBackground?: (hex: string) => void;
  onReady?: () => void;
  onParts?: (parts: ModelPart[]) => void;
  highlight?: string;
}> = ({ url, offsetX, offsetY, reveal, fit, facing, look, cardFrame, adaptiveBg, onBackground, onReady, onParts, highlight }) => {
  const { scene } = useGLTF(url, DRACO_PATH);
  // Keep the model cached while it's on screen; afterwards it may be evicted.
  useEffect(() => retainModel(url, scene), [url, scene]);
  const get = useThree((state) => state.get);

  // Choose a contrasting backdrop from the model's own base colour.
  const bgHex = useMemo(
    () => (adaptiveBg ? pickBackground(modelLuminance(scene)) : null),
    [scene, adaptiveBg],
  );
  useLayoutEffect(() => {
    if (!adaptiveBg) return;
    get().scene.background = bgHex ? new THREE.Color(bgHex) : null;
    if (bgHex) onBackground?.(bgHex);
  }, [get, bgHex, adaptiveBg, onBackground]);
  const fittedRef = useRef(!fit);
  // Center + uniform scale that normalize the model, and (when auto-framing)
  // its normalized size, used to frame the camera and place the floor shadow.
  const normalized = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius || 1;
    const scale = 1 / (radius * 2);
    // Auto-framing centers the bounding box (what the eye sees); the legacy
    // path keeps the bounding-sphere center so existing placements don't move.
    const center = fit ? box.getCenter(new THREE.Vector3()) : sphere.center;
    const size = box.getSize(new THREE.Vector3()).multiplyScalar(scale);
    const extent = fit ? { w: size.x, h: size.y, d: size.z } : null;
    return { scale, center, extent };
  }, [scene, fit]);
  const { extent } = normalized;
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  const readyRef = useRef(false);
  const boundsRef = useRef<{ min: number; max: number } | null>(null);
  const frameCount = useRef(0);

  // Skip the reveal when disabled or already shown this session, so returning
  // to a model (or opening one preloaded from the grid) is instant.
  const [willReveal] = useState(() => reveal && !hasRevealed(url));
  const progressRef = useRef(willReveal ? 0 : 1);

  // Reveal is driven by three world-space horizontal clip planes (as in the hero).
  // Initial constants: everything hidden until the reveal starts, or — when
  // skipping it — wireframe hidden and texture fully visible.
  const initialConstant = willReveal ? -9999 : 9999;
  const wireClipBottom = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), initialConstant),
    [initialConstant],
  );
  const wireClipTop = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -9999),
    [],
  );
  const texClip = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), initialConstant),
    [initialConstant],
  );

  // Wireframe scaffold clone — only visible in the band above the solid fill.
  // Not built at all when the reveal is skipped.
  const wireScene = useMemo(() => {
    if (!willReveal) return null;
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: WIRE_COLOR,
          wireframe: true,
          transparent: true,
          opacity: 0.5,
          clippingPlanes: [wireClipBottom, wireClipTop],
        });
      }
    });
    return clone;
  }, [scene, willReveal, wireClipBottom, wireClipTop]);

  // Textured clone — the real surface, revealed from the floor up. Built once
  // per model; the look is applied to its materials below.
  const texScene = useMemo(() => {
    const clone = scene.clone(true);
    // Each surface is a "part", named after its material in the model file
    // (look.parts); unnamed ones are numbered in the order they're met.
    let unnamed = 0;
    const named = new Map<THREE.Material, string>();
    const partOf = (m: THREE.Material) => {
      if (!named.has(m)) named.set(m, m.name || `Part ${++unnamed}`);
      return named.get(m)!;
    };
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const orig = child.material;
        const prep = (m: THREE.Material) => {
          const c = prepareMaterial(m, texClip);
          c.userData.part = partOf(m);
          return c;
        };
        child.material = Array.isArray(orig) ? orig.map(prep) : prep(orig);
      }
    });
    return clone;
  }, [scene, texClip]);

  const metalness = look?.metalness;
  const roughness = look?.roughness;
  const specular = look?.specular;
  const partsKey = JSON.stringify(look?.parts ?? {});
  useLayoutEffect(() => {
    const surface: ArtworkLook = { metalness, roughness, specular, parts: JSON.parse(partsKey) };
    texScene.traverse((child) => {
      if (child instanceof THREE.Mesh)
        for (const m of [child.material].flat()) applyLook(m, surface);
    });
    get().invalidate();
  }, [texScene, metalness, roughness, specular, partsKey, get]);

  // Report the parts (for the look tweaker), largest first.
  useEffect(() => {
    if (!onParts) return;
    const found = new Map<string, ModelPart>();
    texScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const points = child.geometry.getAttribute("position")?.count ?? 0;
      for (const m of [child.material].flat()) {
        const name = m.userData.part as string;
        const base = m.userData.base as { metalness: number; roughness: number } | undefined;
        const p = found.get(name) ?? { name, points: 0, metalness: base?.metalness ?? 0, roughness: base?.roughness ?? 1 };
        p.points += points;
        found.set(name, p);
      }
    });
    onParts([...found.values()].sort((a, b) => b.points - a.points));
  }, [texScene, onParts]);

  // Tint one part green for a moment, so the tweaker can show which it is.
  useEffect(() => {
    if (!highlight) return;
    const lit: THREE.MeshStandardMaterial[] = [];
    texScene.traverse((child) => {
      if (child instanceof THREE.Mesh)
        for (const m of [child.material].flat())
          if (m instanceof THREE.MeshStandardMaterial && m.userData.part === highlight) lit.push(m);
    });
    const before = lit.map((m) => [m.emissive.clone(), m.emissiveIntensity, m.emissiveMap] as const);
    for (const m of lit) {
      m.emissive.set("#3fa85f");
      m.emissiveIntensity = 0.6;
      m.emissiveMap = null;
      m.needsUpdate = true;
    }
    get().invalidate();
    return () => {
      lit.forEach((m, i) => {
        m.emissive.copy(before[i][0]);
        m.emissiveIntensity = before[i][1];
        m.emissiveMap = before[i][2];
        m.needsUpdate = true;
      });
      get().invalidate();
    };
  }, [highlight, texScene, get]);

  // Center + uniform-scale once, synchronously, before first paint.
  useLayoutEffect(() => {
    const obj = innerRef.current;
    if (!obj) return;
    const { scale, center } = normalized;
    obj.scale.setScalar(scale);
    obj.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [normalized]);

  useFrame((_, delta) => {
    // Card framing: zoom, and a lift done in screen space (a view offset);
    // the sideways shift moves where the camera aims (below, when framing).
    // Re-applied when the canvas size changes.
    if (cardFrame) {
      const { camera, size } = get();
      if (camera instanceof THREE.PerspectiveCamera) {
        const v = camera.view;
        const py = cardFrame.lift * size.height;
        if (
          camera.zoom !== cardFrame.zoom ||
          !v ||
          v.fullWidth !== size.width ||
          v.fullHeight !== size.height ||
          v.offsetY !== py
        ) {
          camera.zoom = cardFrame.zoom;
          camera.setViewOffset(size.width, size.height, 0, py, size.width, size.height);
        }
      }
    }

    // Frame the camera once the model size and the default controls are known.
    if (!fittedRef.current) {
      const { camera, controls, size } = get();
      if (!extent || !controls || !(camera instanceof THREE.PerspectiveCamera))
        return;
      const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const tanH = tanV * (size.width / size.height);
      // Fit height, and the wider of width/depth so turning stays mostly in frame;
      // the extra term accounts for the front of the model sitting nearer the camera.
      const half = Math.max(extent.w, extent.d) / 2;
      const dist =
        Math.max(extent.h / 2 / (tanV * fit!), half / (tanH * fit!)) +
        half * 0.5;
      // Card framing's sideways shift (look.cardShift, a fraction of the card's
      // width): aim beside the work, so it sits off-axis by that much and a
      // turning preview circles that point instead of sliding off the card.
      const aimX = cardFrame?.shift
        ? -(cardFrame.shift * 2 * dist * tanH) / cardFrame.zoom
        : 0;
      camera.position.set(aimX, 0, dist);
      camera.lookAt(aimX, 0, 0);
      const orbit = controls as unknown as OrbitControlsImpl;
      orbit.target.set(aimX, 0, 0);
      orbit.minDistance = dist * 0.35;
      orbit.maxDistance = dist * 2.5;
      orbit.update();
      orbit.saveState(); // "Reset view" returns here
      fittedRef.current = true;
      return;
    }

    // The model stands on a floor at its base: panning can't drag the view
    // below it (with the polar limit, the camera stays above the floor too,
    // so the underside is never shown).
    if (extent) {
      const orbit = get().controls as unknown as OrbitControlsImpl | null;
      const floor = -extent.h / 2;
      if (orbit && orbit.target.y < floor) {
        const lift = floor - orbit.target.y;
        orbit.target.y += lift;
        orbit.object.position.y += lift;
      }
    }

    frameCount.current++;

    if (!readyRef.current && frameCount.current >= 2) {
      readyRef.current = true;
      markRevealed(url);
      onReady?.();
    }
    // Reveal disabled: planes stay at their "show everything" defaults.
    if (progressRef.current >= 1 && !boundsRef.current) return;

    // Measure the real world-space vertical bounds once the transform settles.
    if (!boundsRef.current) {
      if (frameCount.current < 3 || !groupRef.current) return;
      groupRef.current.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(groupRef.current);
      boundsRef.current = { min: box.min.y, max: box.max.y };
      // Keep everything hidden until the animation drives the planes up.
      setPlaneConstant(wireClipBottom, boundsRef.current.min - 1);
      setPlaneConstant(texClip, boundsRef.current.min - 1);
      setPlaneConstant(wireClipTop, -(boundsRef.current.min - 1));
      return;
    }

    if (progressRef.current >= 1) return;
    progressRef.current = Math.min(
      1,
      progressRef.current + delta * REVEAL_SPEED,
    );
    const p = progressRef.current;
    const { min, max } = boundsRef.current;
    const range = max - min;
    const margin = range * 0.05;
    const bottom = min - margin;
    const span = range + margin * 2;

    // Wireframe leads, filling the first half of the timeline.
    const wireP = Math.min(1, p / 0.5);
    setPlaneConstant(wireClipBottom, bottom + wireP * span);

    // Texture follows, slightly behind the wireframe edge.
    const texP = Math.max(0, (p - 0.25) / 0.75);
    setPlaneConstant(texClip, bottom + texP * span);
    setPlaneConstant(wireClipTop, -(bottom + texP * span));
  });

  return (
    <group ref={groupRef} position={fit ? [0, 0, 0] : [offsetX, offsetY, 0]}>
      {/* Turn the centered model about its own vertical axis to face the camera. */}
      <group rotation={[0, THREE.MathUtils.degToRad(facing), 0]}>
        <group ref={innerRef}>
          {wireScene && <primitive object={wireScene} />}
          <primitive object={texScene} />
        </group>
      </group>
      {extent && (
        <ContactShadows
          position={[0, -extent.h / 2 - 0.002, 0]}
          opacity={0.3}
          scale={Math.max(extent.w, extent.d) * 2.5}
          blur={2.5}
          far={extent.h * 0.6}
          resolution={512}
        />
      )}
    </group>
  );
};

/**
 * Tone mapping and exposure belong to the renderer, and the grid's hover
 * previews share one (TilePreview), so each scene sets its own before every
 * frame; three recompiles a material's shader only when they change.
 */
const RendererLook: FC<{ rig: LightRig }> = ({ rig }) => {
  useFrame(({ gl }) => {
    gl.toneMapping = rig.toneMapping;
    gl.toneMappingExposure = rig.exposure;
  });
  return null;
};

/**
 * Everything inside the canvas: camera, lights, studio reflections, the model
 * and controls. Shared by SculptureScene (its own canvas: viewer, thumbnails)
 * and TilePreview (the grid's shared renderer), so every view of a work is
 * framed and lit identically.
 */
export const SculptureContents: FC<
  Omit<SculptureSceneProps, "mode"> & {
    isThumb?: boolean;
    /** Show the spinner while the model loads (needs a DOM-attached canvas). */
    loader?: boolean;
    /** A catalogue card's hover preview: lit like the thumbnail (look.cardLight). */
    card?: boolean;
  }
> = ({
  url,
  offsetX = 0,
  offsetY = 0,
  defaultZoom = 1,
  interactive = false,
  isThumb = false,
  loader = !isThumb,
  reveal = true,
  fit,
  controlsRef,
  onReady,
  onBackground,
  adaptiveBackground = true,
  autoRotate = true,
  facing = 0,
  look,
  rig: rigName,
  rotateOnly = false,
  card = false,
  onParts,
  highlight,
}) => {
  const camZ = 4.0 / (defaultZoom <= 0 ? 1 : defaultZoom);
  // Thumbnails and card previews sit on a light plate, the viewer on its own
  // backdrop, so a work can be lit differently on its card.
  const onCard = card || isThumb;
  const cardLight = onCard ? (look?.cardLight ?? 1) : 1;
  const cardFrame =
    onCard && (look?.cardZoom || look?.cardShift || look?.cardLift)
      ? { zoom: look.cardZoom ?? 1, shift: look.cardShift ?? 0, lift: look.cardLift ?? 0 }
      : undefined;
  const light = (look?.light ?? 1) * cardLight;
  const rig = rigFor(rigName ?? look?.rig);
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, camZ]} fov={35} />
      <RendererLook rig={rig} />

      {/* Deterministic studio lighting (components/three/lighting.ts). */}
      {rig.hemisphere.intensity > 0 && (
        <hemisphereLight
          args={[rig.hemisphere.sky, rig.hemisphere.ground, rig.hemisphere.intensity * light]}
        />
      )}
      {rig.ambient > 0 && <ambientLight intensity={rig.ambient * light} />}
      <directionalLight
        position={rig.key.position}
        intensity={rig.key.intensity * light}
        color={rig.key.color}
        // Shadows the work casts on itself, viewer only (thumbnails have none).
        castShadow={interactive && look?.selfShadow !== false}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />
      {rig.fill.intensity > 0 && (
        <directionalLight position={rig.fill.position} intensity={rig.fill.intensity * light} />
      )}
      <directionalLight position={rig.back.position} intensity={rig.back.intensity * light} />
      {/* Optional side lights (look.sideLights): graze dark surfaces so their form shows. */}
      {!!look?.sideLights &&
        ([-1, 1] as const).map((side) => (
          <directionalLight
            key={side}
            position={[side * 5, 1, 1.5]}
            intensity={rig.key.intensity * look.sideLights! * light}
            color={rig.key.color}
          />
        ))}

      {/* Reflections / specular for the bronze patina — procedural, no HDR download.
          Set per scene: three ignores a material's own envMapIntensity here. */}
      <StudioEnvironment intensity={rig.reflections * (look?.reflections ?? 1) * SHINE.reflections * cardLight} />

      {/* Frames on demand: a burst while the canvas starts, again once the
          model has loaded (it mounts with it, inside Suspense), and again when
          the work's look or turn changes. */}
      <WarmFrames />
      <Suspense fallback={loader ? <Loader /> : null}>
        <RevealModel
          url={url}
          offsetX={offsetX}
          offsetY={offsetY}
          reveal={reveal && !isThumb}
          fit={fit}
          facing={facing}
          look={look}
          cardFrame={cardFrame}
          adaptiveBg={!isThumb && adaptiveBackground}
          onBackground={onBackground}
          onReady={onReady}
          onParts={onParts}
          highlight={highlight}
        />
        <WarmFrames key={`${url}|${facing}|${fit}|${JSON.stringify(look ?? {})}`} />
      </Suspense>

      {/* Auto-framed models render their own shadow at their base. */}
      {!fit && (
        <ContactShadows
          position={[0, -0.6, 0]}
          opacity={0.22}
          scale={4}
          blur={3}
          far={1.5}
          resolution={512}
        />
      )}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableZoom={interactive && !rotateOnly}
        {...(!fit && { minDistance: camZ * 0.4, maxDistance: camZ * 2 })}
        enablePan={interactive && !rotateOnly}
        autoRotate={autoRotate && !interactive && !isThumb}
        autoRotateSpeed={1.4}
        enableDamping
        dampingFactor={0.08}
        // Auto-framed viewers stop at eye level, so the camera never goes
        // under the floor the model stands on.
        maxPolarAngle={interactive ? (fit ? Math.PI / 2 : Math.PI) : Math.PI / 1.6}
        minPolarAngle={interactive ? 0 : Math.PI / 3}
      />
    </>
  );
};

const SculptureScene: FC<SculptureSceneProps> = ({
  mode = "viewer",
  interactive = false,
  alwaysRender = false,
  ...props
}) => {
  const isThumb = mode === "thumbnail";
  // Draw every frame only when something moves by itself: the thumbnail
  // generator, a showcase that auto-rotates, or a parent that drives the camera.
  // A work the visitor turns by hand redraws on demand: OrbitControls asks for
  // frames while it's dragged and while its damping settles, then it stops.
  const continuous =
    isThumb ||
    alwaysRender ||
    (!interactive && props.autoRotate !== false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Pause the render loop while the canvas is scrolled out of view so multiple
  // gallery canvases don't all burn GPU/CPU at once.
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`w-full h-full relative ${
        interactive
          ? "cursor-grab active:cursor-grabbing touch-none"
          : "pointer-events-none"
      }`}
    >
      <Canvas
        shadows={interactive}
        frameloop={!onScreen ? "never" : continuous ? "always" : "demand"}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
          // The thumbnail generator screenshots the canvas.
          preserveDrawingBuffer: isThumb,
          localClippingEnabled: true,
        }}
        onCreated={({ gl }) => setupRenderer(gl, rigFor(props.rig ?? props.look?.rig))}
      >
        <SculptureContents
          {...props}
          interactive={interactive}
          isThumb={isThumb}
        />
      </Canvas>
    </div>
  );
};

export default SculptureScene;
