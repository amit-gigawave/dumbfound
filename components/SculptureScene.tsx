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
import { DRACO_PATH, hasRevealed, markRevealed } from "./three/modelLoader";
import StudioEnvironment from "./three/StudioEnvironment";

// Bronze tone for the wireframe scaffold during the reveal (matches the hero).
const WIRE_COLOR = "#a08060";
// Seconds-ish pacing of the materialize animation (higher = faster).
const REVEAL_SPEED = 0.7;

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
}

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
  onReady?: () => void;
}> = ({ url, offsetX, offsetY, reveal, fit, onReady }) => {
  const { scene } = useGLTF(url, DRACO_PATH);
  const get = useThree((state) => state.get);
  const fittedRef = useRef(!fit);
  // Size of the normalized model; used to frame the camera and place the floor shadow.
  const [extent, setExtent] = useState<{
    w: number;
    h: number;
    d: number;
  } | null>(null);
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

  // Textured clone — the real surface, revealed from the floor up.
  const texScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const orig = child.material;
        if (Array.isArray(orig)) {
          child.material = orig.map((m) => {
            const c = m.clone();
            c.clippingPlanes = [texClip];
            return c;
          });
        } else {
          const c = orig.clone();
          c.clippingPlanes = [texClip];
          child.material = c;
        }
      }
    });
    return clone;
  }, [scene, texClip]);

  // Center + uniform-scale once, synchronously, before first paint.
  useLayoutEffect(() => {
    const obj = innerRef.current;
    if (!obj) return;
    const box = new THREE.Box3().setFromObject(scene);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius || 1;
    const scale = 1 / (radius * 2);
    obj.scale.setScalar(scale);
    // Auto-framing centers the bounding box (what the eye sees); the legacy
    // path keeps the bounding-sphere center so existing placements don't move.
    const center = fit ? box.getCenter(new THREE.Vector3()) : sphere.center;
    obj.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    if (fit) {
      const size = box.getSize(new THREE.Vector3()).multiplyScalar(scale);
      setExtent({ w: size.x, h: size.y, d: size.z });
    }
  }, [scene, fit]);

  useFrame((_, delta) => {
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
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      const orbit = controls as unknown as OrbitControlsImpl;
      orbit.target.set(0, 0, 0);
      orbit.minDistance = dist * 0.35;
      orbit.maxDistance = dist * 2.5;
      orbit.update();
      orbit.saveState(); // "Reset view" returns here
      fittedRef.current = true;
      return;
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
      wireClipBottom.constant = boundsRef.current.min - 1;
      texClip.constant = boundsRef.current.min - 1;
      wireClipTop.constant = -(boundsRef.current.min - 1);
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
    wireClipBottom.constant = bottom + wireP * span;

    // Texture follows, slightly behind the wireframe edge.
    const texP = Math.max(0, (p - 0.25) / 0.75);
    texClip.constant = bottom + texP * span;
    wireClipTop.constant = -(bottom + texP * span);
  });

  return (
    <group ref={groupRef} position={fit ? [0, 0, 0] : [offsetX, offsetY, 0]}>
      <group ref={innerRef}>
        {wireScene && <primitive object={wireScene} />}
        <primitive object={texScene} />
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

const SculptureScene: FC<SculptureSceneProps> = ({
  url,
  offsetX = 0,
  offsetY = 0,
  defaultZoom = 1,
  interactive = false,
  mode = "viewer",
  reveal = true,
  fit,
  controlsRef,
  onReady,
}) => {
  const isThumb = mode === "thumbnail";
  const camZ = 4.0 / (defaultZoom <= 0 ? 1 : defaultZoom);
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
        frameloop={onScreen ? "always" : "never"}
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
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, camZ]} fov={35} />

        {/* Deterministic studio lighting — independent of model load order. */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.6}
          castShadow={interactive}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0002}
        />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} />

        {/* Reflections / specular for the bronze patina — procedural, no HDR download. */}
        <StudioEnvironment intensity={0.9} />

        <Suspense fallback={isThumb ? null : <Loader />}>
          <RevealModel
            url={url}
            offsetX={offsetX}
            offsetY={offsetY}
            reveal={reveal && !isThumb}
            fit={fit}
            onReady={onReady}
          />
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
          enableZoom={interactive}
          {...(!fit && { minDistance: camZ * 0.4, maxDistance: camZ * 2 })}
          enablePan={interactive}
          autoRotate={!interactive && !isThumb}
          autoRotateSpeed={1.4}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={interactive ? Math.PI : Math.PI / 1.6}
          minPolarAngle={interactive ? 0 : Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

export default SculptureScene;
