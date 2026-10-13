export const heroScrollStore: {
  progress: number;
  /** Set by the hero canvas: requests a frame when progress changes. */
  invalidate?: () => void;
} = { progress: 0 };
