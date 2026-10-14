"use client";

import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  Stage,
  OrbitControls,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { heroScrollStore } from "./heroScrollStore";
import { DRACO_PATH } from "./three/modelLoader";
import StudioEnvironment from "./three/StudioEnvironment";

const WIRE_COLOR = "#a08060";
/** Turn (radians) on load: faces the viewer straight on. Scroll turns it from here. */
const START_TURN = -Math.PI / 2;

/** Lets the page's scroll handler ask for a new frame (the canvas renders on demand). */
const ScrollFrames = () => {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    heroScrollStore.invalidate = invalidate;
    return () => {
      heroScrollStore.invalidate = undefined;
    };
  }, [invalidate]);
  return null;
};

const Model = () => {
  const { scene } = useGLTF("/sculptures/DancingShivaHero.glb", DRACO_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const boundsRef = useRef<{ min: number; max: number } | null>(null);
  const frameCount = useRef(0);

  // Clipping planes that sweep up the model: the wireframe draws in first,
  // then the finished surface follows it.
  const { wireScene, texScene, clip } = useMemo(() => {
    const clip = {
      wireBottom: new THREE.Plane(new THREE.Vector3(0, -1, 0), -9999),
      wireTop: new THREE.Plane(new THREE.Vector3(0, 1, 0), -9999),
      tex: new THREE.Plane(new THREE.Vector3(0, -1, 0), -9999),
    };

    const wireScene = scene.clone(true);
    wireScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: WIRE_COLOR,
          wireframe: true,
          transparent: true,
          opacity: 0.5,
          clippingPlanes: [clip.wireBottom, clip.wireTop],
        });
      }
    });

    const texScene = scene.clone(true);
    texScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const orig = child.material;
        if (Array.isArray(orig)) {
          child.material = orig.map((m) => {
            const c = m.clone();
            c.clippingPlanes = [clip.tex];
            return c;
          });
        } else {
          const c = orig.clone();
          c.clippingPlanes = [clip.tex];
          child.material = c;
        }
      }
    });

    return { wireScene, texScene, clip };
  }, [scene]);

  // The frame loop moves the planes through a ref (the memo's result stays untouched).
  const clipRef = useRef<typeof clip | null>(null);
  useEffect(() => {
    clipRef.current = clip;
  }, [clip]);

  useFrame(({ invalidate }, delta) => {
    frameCount.current++;
    const clip = clipRef.current;
    if (!clip) return;

    // Turn with scroll, damped so it glides rather than steps; keep asking
    // for frames until it has settled.
    if (groupRef.current) {
      const target = START_TURN + heroScrollStore.progress * Math.PI * 0.3;
      const y = groupRef.current.rotation.y;
      const settled = frameCount.current === 1 || Math.abs(target - y) < 0.0005;
      groupRef.current.rotation.y = settled
        ? target
        : THREE.MathUtils.damp(y, target, 6, delta);
      if (!settled) invalidate();
    }

    if (!boundsRef.current) {
      invalidate();
      if (frameCount.current < 3 || !groupRef.current) return;
      groupRef.current.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(groupRef.current);
      boundsRef.current = { min: box.min.y, max: box.max.y };
      clip.wireBottom.constant = boundsRef.current.min - 1;
      clip.tex.constant = boundsRef.current.min - 1;
      clip.wireTop.constant = -(boundsRef.current.min - 1);
      return;
    }

    if (progressRef.current >= 1) return;
    progressRef.current = Math.min(1, progressRef.current + delta * 0.15);
    invalidate();
    // Drawn in: the wireframe copy is fully clipped away, so stop drawing it.
    if (progressRef.current >= 1 && wireRef.current)
      wireRef.current.visible = false;
    const p = progressRef.current;
    const { min, max } = boundsRef.current;
    const range = max - min;
    const margin = range * 0.05;
    const bottom = min - margin;
    const span = range + margin * 2;

    const wireP = Math.min(1, p / 0.5);
    clip.wireBottom.constant = bottom + wireP * span;

    const texP = Math.max(0, (p - 0.25) / 0.75);
    clip.tex.constant = bottom + texP * span;

    clip.wireTop.constant = -(bottom + texP * span);
  });

  return (
    <group ref={groupRef} rotation={[0, START_TURN, 0]}>
      <group ref={wireRef}>
        <primitive object={wireScene} />
      </group>
      <primitive object={texScene} />
    </group>
  );
};

export default function HeroScene() {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      {/* Renders only while something moves (draw-in, scroll turn, drag). */}
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ fov: 35 }}
        gl={{ antialias: true, alpha: true, localClippingEnabled: true }}
      >
        <ambientLight intensity={3} />
        <directionalLight position={[0, 2, 10]} intensity={5} />
        <directionalLight position={[5, 5, 8]} intensity={3} />
        <directionalLight position={[-5, 5, 8]} intensity={3} />
        <directionalLight position={[0, 8, 5]} intensity={2} />
        <pointLight position={[0, 0, 8]} intensity={4} color="#ffffff" />

        <Suspense fallback={null}>
          {/* Procedural reflections instead of Stage's downloaded "city" HDR. */}
          <StudioEnvironment />
          <ScrollFrames />
          {/* One soft contact shadow (below); Stage's own would double it. */}
          <Stage
            adjustCamera
            intensity={0.5}
            environment={null}
            shadows={false}
          >
            <Model />
          </Stage>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 3}
          />
          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.2}
            scale={5}
            blur={2.5}
            far={2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
