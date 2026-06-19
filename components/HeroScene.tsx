"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { heroScrollStore } from "./heroScrollStore";

const WIRE_COLOR = "#a08060";

const Model = () => {
  const { scene } = useGLTF("/sculptures/DancingShivaHero.glb");
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const boundsRef = useRef<{ min: number; max: number } | null>(null);
  const frameCount = useRef(0);

  const wireClipBottom = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), -9999), []);
  const wireClipTop = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -9999), []);
  const texClip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), -9999), []);

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

  const texScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
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

  useFrame((_, delta) => {
    frameCount.current++;

    if (groupRef.current) {
      const scrollRot = heroScrollStore.progress * Math.PI * 0.3;
      groupRef.current.rotation.y = -2.0 + scrollRot;
    }

    if (!boundsRef.current) {
      if (frameCount.current < 3 || !groupRef.current) return;
      groupRef.current.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(groupRef.current);
      boundsRef.current = { min: box.min.y, max: box.max.y };
      wireClipBottom.constant = boundsRef.current.min - 1;
      texClip.constant = boundsRef.current.min - 1;
      wireClipTop.constant = -(boundsRef.current.min - 1);
      return;
    }

    if (progressRef.current >= 1) return;
    progressRef.current = Math.min(1, progressRef.current + delta * 0.15);
    const p = progressRef.current;
    const { min, max } = boundsRef.current;
    const range = max - min;
    const margin = range * 0.05;
    const bottom = min - margin;
    const span = range + margin * 2;

    const wireP = Math.min(1, p / 0.5);
    wireClipBottom.constant = bottom + wireP * span;

    const texP = Math.max(0, (p - 0.25) / 0.75);
    texClip.constant = bottom + texP * span;

    wireClipTop.constant = -(bottom + texP * span);
  });

  return (
    <group ref={groupRef} rotation={[0, -1.1, 0]}>
      <primitive object={wireScene} />
      <primitive object={texScene} />
    </group>
  );
};

export default function HeroScene() {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        frameloop="always"
        dpr={[1, 2]}
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
          <Stage adjustCamera intensity={0.5} environment="city">
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
