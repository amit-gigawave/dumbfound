"use client";

import { FC, Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
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

interface SculptureSceneProps {
  url: string;
  offsetX?: number;
  offsetY?: number;
  defaultZoom?: number;
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
 * Loads a GLB and normalizes it deterministically: the model is centered at the
 * origin and scaled so its bounding sphere has a diameter of 1 unit. This is the
 * single source of truth for placement — no <Stage> auto-fitting that could race
 * with the async load and cause inconsistent framing between reloads.
 */
const SingleModel: FC<{ url: string; offsetX: number; offsetY: number }> = ({
  url,
  offsetX,
  offsetY,
}) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  // Clone so multiple cards using the same model don't share/mutate one object.
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Center + uniform-scale the cloned model exactly once, synchronously, before
  // the first paint — so framing is identical on every load.
  useLayoutEffect(() => {
    const obj = clonedScene;
    if (!obj) return;

    // Reset any prior transform before measuring.
    obj.position.set(0, 0, 0);
    obj.scale.setScalar(1);
    obj.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(obj);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius || 1;
    const scale = 1 / (radius * 2);

    obj.scale.setScalar(scale);
    obj.position.set(
      -sphere.center.x * scale,
      -sphere.center.y * scale,
      -sphere.center.z * scale,
    );
  }, [clonedScene]);

  return (
    <group ref={groupRef} position={[offsetX, offsetY, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
};

const SculptureScene: FC<SculptureSceneProps> = ({
  url,
  offsetX = 0,
  offsetY = 0,
  defaultZoom = 1,
}) => {
  const camZ = 4.0 / (defaultZoom <= 0 ? 1 : defaultZoom);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
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
          <SingleModel url={url} offsetX={offsetX} offsetY={offsetY} />
          {/* Reflections / specular for the bronze patina. */}
          <Environment preset="city" />
        </Suspense>

        <ContactShadows
          position={[0, -0.55, 0]}
          opacity={0.32}
          scale={5}
          blur={2.2}
          far={2}
          resolution={512}
        />

        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.4}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

// Warm the GLB cache so models are ready before the card scrolls into view.
useGLTF.preload("/sculptures/Lady.glb");
useGLTF.preload("/sculptures/LordKrishna.glb");
useGLTF.preload("/sculptures/Pandit.glb");

export default SculptureScene;
