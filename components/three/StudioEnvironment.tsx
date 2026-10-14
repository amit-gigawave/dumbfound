"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * One environment map per renderer. Building it is one of the slower parts of
 * starting a scene, and the artwork grid's previews all share one renderer
 * (see TilePreview), so later previews reuse the first one's map. It lives as
 * long as its renderer.
 */
const maps = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

export const studioMap = (gl: THREE.WebGLRenderer) => {
  let env = maps.get(gl);
  if (!env) {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    env = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    room.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    maps.set(gl, env);
  }
  return env;
};

/**
 * Procedural studio reflections built on the GPU — replaces drei's
 * `preset="city"`, which downloads a ~1.5 MB HDR from a third-party CDN.
 */
export default function StudioEnvironment({
  intensity = 1,
}: {
  intensity?: number;
}) {
  // Read the live store inside the effect: mutating scene.environment is the
  // intended three.js API, it just shouldn't go through a hook return value.
  const get = useThree((state) => state.get);

  useEffect(() => {
    const { gl, scene } = get();
    const prevEnv = scene.environment;
    const prevIntensity = scene.environmentIntensity;
    scene.environment = studioMap(gl);
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = prevEnv;
      scene.environmentIntensity = prevIntensity;
    };
  }, [get, intensity]);

  return null;
}
