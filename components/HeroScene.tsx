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
/** Turn (radians) on load: face and hair square to the viewer. */
const START_TURN = -1.3;
/** Over the scroll the work turns a little toward its details on the right… */
const SCROLL_TURN = 0.3;
/** …and grows by this share. */
const SCROLL_GROW = 0.12;
/**
 * Camera framing (drei Stage margin): sized for the largest the work gets on
 * scroll, plus a little air for the turn, so it never leaves its frame.
 */
const FRAME_MARGIN = (1 + SCROLL_GROW) * 1.04;
/** On load it pops in from this scale, overshooting slightly, over POP_TIME seconds. */
const POP_FROM = 0.85;
const POP_TIME = 1.1;
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

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
  const popRef = useRef(0);
  const growRef = useRef(1);

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

    const group = groupRef.current;
    if (!group) return;

    // Turn and grow with scroll, damped so it glides rather than steps; keep
    // asking for frames until it has settled.
    const s = heroScrollStore.progress;
    const turn = START_TURN + s * SCROLL_TURN;
    const grow = 1 + s * SCROLL_GROW;
    const first = frameCount.current === 1;
    const settled =
      first ||
      (Math.abs(turn - group.rotation.y) < 0.0005 &&
        Math.abs(grow - growRef.current) < 0.0005);
    group.rotation.y = settled
      ? turn
      : THREE.MathUtils.damp(group.rotation.y, turn, 6, delta);
    growRef.current = settled
      ? grow
      : THREE.MathUtils.damp(growRef.current, grow, 6, delta);
    if (!settled) invalidate();

    if (!boundsRef.current) {
      invalidate();
      if (frameCount.current < 3) return;
      // Measure at the largest scroll size so the reveal sweeps past the top.
      group.scale.setScalar(1 + SCROLL_GROW);
      group.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(group);
      group.scale.setScalar(POP_FROM);
      boundsRef.current = { min: box.min.y, max: box.max.y };
      clip.wireBottom.constant = boundsRef.current.min - 1;
      clip.tex.constant = boundsRef.current.min - 1;
      clip.wireTop.constant = -(boundsRef.current.min - 1);
      return;
    }

    // Pop in as the reveal starts, then follow the scroll size.
    if (popRef.current < 1) {
      popRef.current = Math.min(1, popRef.current + delta / POP_TIME);
      invalidate();
    }
    const pop = POP_FROM + (1 - POP_FROM) * easeOutBack(popRef.current);
    group.scale.setScalar(pop * growRef.current);

    if (progressRef.current >= 1) return;
    progressRef.current = Math.min(1, progressRef.current + delta * 0.15);
    invalidate();
    // Drawn in: hide the wireframe copy and open the surface's clip fully,
    // so growing with scroll can never cut off the top.
    if (progressRef.current >= 1) {
      if (wireRef.current) wireRef.current.visible = false;
      clip.tex.constant = 9999;
      return;
    }
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
        // Don't track the canvas's page position on scroll: it changes R3F's
        // size object, which made the camera refit (flicker) while scrolling.
        resize={{ scroll: false }}
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
            adjustCamera={FRAME_MARGIN}
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
