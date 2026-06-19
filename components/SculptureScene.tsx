"use client";

import { FC, Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
  Environment,
  Html,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";

// Bronze tone for the wireframe scaffold during the reveal (matches the hero).
const WIRE_COLOR = "#a08060";
// Seconds-ish pacing of the materialize animation (higher = faster).
const REVEAL_SPEED = 0.35;

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
const RevealModel: FC<{ url: string; offsetX: number; offsetY: number }> = ({
  url,
  offsetX,
  offsetY,
}) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  const progressRef = useRef(0);
  const boundsRef = useRef<{ min: number; max: number } | null>(null);
  const frameCount = useRef(0);

  // Reveal is driven by three world-space horizontal clip planes (as in the hero).
  const wireClipBottom = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), -9999),
    [],
  );
  const wireClipTop = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -9999),
    [],
  );
  const texClip = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), -9999),
    [],
  );

  // Wireframe scaffold clone — only visible in the band above the solid fill.
  const wireScene = useMemo(() => {
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
  }, [scene, wireClipBottom, wireClipTop]);

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
    obj.position.set(
      -sphere.center.x * scale,
      -sphere.center.y * scale,
      -sphere.center.z * scale,
    );
  }, [scene]);

  useFrame((_, delta) => {
    frameCount.current++;

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
    progressRef.current = Math.min(1, progressRef.current + delta * REVEAL_SPEED);
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
    <group ref={groupRef} position={[offsetX, offsetY, 0]}>
      <group ref={innerRef}>
        <primitive object={wireScene} />
        <primitive object={texScene} />
      </group>
    </group>
  );
};

const SculptureScene: FC<SculptureSceneProps> = ({
  url,
  offsetX = 0,
  offsetY = 0,
  defaultZoom = 1,
  interactive = false,
}) => {
  const camZ = 4.0 / (defaultZoom <= 0 ? 1 : defaultZoom);

  return (
    <div
      className={`w-full h-full relative ${
        interactive
          ? "cursor-grab active:cursor-grabbing"
          : "pointer-events-none"
      }`}
    >
      <Canvas
        shadows
        frameloop="always"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
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
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0002}
        />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} />

        <Suspense fallback={<Loader />}>
          <RevealModel url={url} offsetX={offsetX} offsetY={offsetY} />
          {/* Reflections / specular for the bronze patina. */}
          <Environment preset="city" />
        </Suspense>

        <ContactShadows
          position={[0, -0.6, 0]}
          opacity={0.22}
          scale={4}
          blur={3}
          far={1.5}
          resolution={512}
        />

        <OrbitControls
          makeDefault
          enableZoom={interactive}
          enablePan={interactive}
          autoRotate={!interactive}
          autoRotateSpeed={1.4}
          enableDamping
          dampingFactor={0.08}
          minDistance={interactive ? camZ * 0.4 : undefined}
          maxDistance={interactive ? camZ * 2.5 : undefined}
          maxPolarAngle={interactive ? Math.PI : Math.PI / 1.6}
          minPolarAngle={interactive ? 0 : Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

// Warm the GLB cache so models are ready before the card scrolls into view.
useGLTF.preload("/sculptures/Lady.glb");
useGLTF.preload("/sculptures/LordKrishna.glb");
useGLTF.preload("/sculptures/Pandit.glb");
useGLTF.preload("/sculptures/DancingShiva.glb");

export default SculptureScene;
