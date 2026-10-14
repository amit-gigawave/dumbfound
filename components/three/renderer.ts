import * as THREE from "three";

/** Renderer look shared by every canvas that shows a work. */
export const setupRenderer = (gl: THREE.WebGLRenderer) => {
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  gl.localClippingEnabled = true;
};

let shared: THREE.WebGLRenderer | undefined;

/**
 * The one WebGL renderer behind every hover preview on the page (see
 * TilePreview). Creating a WebGL context and compiling shaders is most of a
 * preview's start-up time; sharing the renderer pays that once per page.
 */
export const sharedRenderer = () => {
  if (!shared) {
    shared = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      stencil: false,
      powerPreference: "high-performance",
    });
    setupRenderer(shared);
    // R3F force-loses the context when a root unmounts; this renderer
    // outlives every preview that uses it, so ignore that.
    shared.forceContextLoss = () => {};
  }
  return shared;
};
