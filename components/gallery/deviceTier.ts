/*
 * Whether this device should turn artwork cards in 3D (hover previews and the
 * grid's ambient turns). Those download a 1.3–2.5 MB model and draw it every
 * frame, which only a desktop with a mouse and some power to spare uses well.
 * Everywhere else the cards stay photos; each work's own page keeps its full
 * 3D viewer.
 *
 * Browser only: call it after mount (an effect), never during render, so the
 * server's HTML is the same for every device.
 */
import { lightConnection } from "../three/modelLoader";

let cached: boolean | undefined;

export function cardsIn3D(): boolean {
  if (cached !== undefined) return cached;
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  cached =
    // Phones and tablets: no hover, so a preview could only be started by an
    // ambient turn, which costs data and battery for little.
    matchMedia("(hover: hover)").matches &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    // Data Saver, or a 2G/3G connection.
    !lightConnection() &&
    // Weak hardware (both are absent on some browsers: then assume it's fine).
    (nav.hardwareConcurrency ?? 8) > 4 &&
    (nav.deviceMemory ?? 8) > 4;
  return cached;
}
