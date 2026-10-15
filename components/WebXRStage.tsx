"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

/**
 * In-browser AR for Android (WebXR through Google's <model-viewer>).
 *
 * Scene Viewer, Google's AR app, gives no feedback of ours while it looks for
 * a surface, so on plain or dark floors visitors just saw a camera view and
 * nothing else. In WebXR the page stays in charge: we show our own guidance
 * while it searches, a tip when it can't find the floor, and a note when
 * tracking is lost. Phones without WebXR keep using Scene Viewer.
 *
 * model-viewer is self-hosted (public/vendor, Apache-2.0) as its standalone
 * bundle, which carries its own three.js, and is only loaded on Android.
 */

const SCRIPT = "/vendor/model-viewer-4.3.1.min.js";
/** Seconds of searching before suggesting a better surface. */
const HINT_AFTER = 7;

type ModelViewer = HTMLElement & {
  activateAR: () => Promise<void>;
  canActivateAR: boolean;
  loaded: boolean;
};

let loading: Promise<void> | undefined;
const loadModelViewer = () =>
  (loading ??= new Promise<void>((resolve, reject) => {
    if (customElements.get("model-viewer")) return resolve();
    const s = document.createElement("script");
    s.type = "module";
    s.src = SCRIPT;
    s.onload = () => customElements.whenDefined("model-viewer").then(() => resolve());
    s.onerror = () => {
      loading = undefined;
      reject(new Error("model-viewer failed to load"));
    };
    document.head.appendChild(s);
  }));

/** Whether this browser can run an AR session in the page itself. */
export const webXRSupported = async () => {
  try {
    const xr = (navigator as Navigator & {
      xr?: { isSessionSupported: (mode: string) => Promise<boolean> };
    }).xr;
    return !!(await xr?.isSessionSupported("immersive-ar"));
  } catch {
    return false;
  }
};

export interface WebXRStageHandle {
  /**
   * Start AR. Call it straight from a tap. Returns false when the stage isn't
   * ready yet, so the caller can fall back to Scene Viewer.
   */
  launch: () => boolean;
}

type Phase = "idle" | "searching" | "placed";

const WebXRStage = forwardRef<
  WebXRStageHandle,
  {
    src: string;
    title: string;
    /** AR began (e.g. close the "Place it in my room" prompt). */
    onStart: () => void;
    onFail: () => void;
  }
>(function WebXRStage({ src, title, onStart, onFail }, ref) {
  const [el, setEl] = useState<ModelViewer | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lost, setLost] = useState(false);
  const [struggling, setStruggling] = useState(false);
  const [showPlaced, setShowPlaced] = useState(false);
  const onFailRef = useRef(onFail);
  const onStartRef = useRef(onStart);
  useEffect(() => {
    onFailRef.current = onFail;
    onStartRef.current = onStart;
  }, [onFail, onStart]);

  // Load model-viewer and attach a hidden element for this work, so a tap
  // can start AR at once (browsers only allow it right after a tap).
  useEffect(() => {
    let cancelled = false;
    let mv: ModelViewer | undefined;
    loadModelViewer()
      .then(() => {
        if (cancelled) return;
        mv = document.createElement("model-viewer") as ModelViewer;
        mv.setAttribute("src", src);
        mv.setAttribute("alt", title);
        mv.setAttribute("ar", "");
        mv.setAttribute("ar-modes", "webxr");
        mv.setAttribute("ar-placement", "floor");
        // AR copies are already at the work's real size (see make-ar-models).
        mv.setAttribute("ar-scale", "fixed");
        mv.setAttribute("loading", "eager");
        mv.className = "webxr-stage";
        document.body.appendChild(mv);
        setEl(mv);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      mv?.remove();
    };
  }, [src, title]);

  // Follow the session: searching → placed, tracking lost, ended, failed.
  useEffect(() => {
    if (!el) return;
    const onStatus = (e: Event) => {
      const status = (e as CustomEvent<{ status: string }>).detail.status;
      if (status === "session-started") {
        onStartRef.current();
        setPhase("searching");
        setLost(false);
        setStruggling(false);
      } else if (status === "object-placed") {
        setPhase("placed");
        setStruggling(false);
        setShowPlaced(true);
      } else if (status === "not-presenting") {
        setPhase("idle");
      } else if (status === "failed") {
        setPhase("idle");
        onFailRef.current();
      }
    };
    const onTracking = (e: Event) =>
      setLost((e as CustomEvent<{ status: string }>).detail.status === "not-tracking");
    el.addEventListener("ar-status", onStatus);
    el.addEventListener("ar-tracking", onTracking);
    return () => {
      el.removeEventListener("ar-status", onStatus);
      el.removeEventListener("ar-tracking", onTracking);
    };
  }, [el]);

  // Still no floor after a while: say what helps.
  useEffect(() => {
    if (phase !== "searching") return;
    const t = setTimeout(() => setStruggling(true), HINT_AFTER * 1000);
    return () => clearTimeout(t);
  }, [phase]);

  // The placed note fades after a moment.
  useEffect(() => {
    if (!showPlaced) return;
    const t = setTimeout(() => setShowPlaced(false), 3500);
    return () => clearTimeout(t);
  }, [showPlaced]);

  useImperativeHandle(
    ref,
    () => ({
      launch: () => {
        if (!el || !el.canActivateAR) return false;
        el.activateAR().catch(() => onFailRef.current());
        return true;
      },
    }),
    [el],
  );

  const active = phase !== "idle";
  const message = lost
    ? "Can't see the room. Check the camera isn't covered and the room is lit, then move your phone slowly."
    : phase === "searching"
      ? struggling
        ? "Still looking for the floor, so the work may float. Try a well-lit floor with some pattern or texture; plain, dark or shiny surfaces are hard to detect."
        : "Point your phone at the floor and move it slowly from side to side. The work will settle onto it."
      : phase === "placed" && showPlaced
        ? `${title} is placed on the floor. Drag to move it, twist with two fingers to turn it.`
        : null;

  return el
    ? createPortal(
        <>
          {/* Hidden outside AR; in AR this element is the on-screen overlay. */}
          <style>{`
            model-viewer.webxr-stage {
              position: fixed; inset: 0; width: 100%; height: 100%;
              z-index: 300; background: transparent;
              opacity: ${active ? 1 : 0};
              pointer-events: ${active ? "auto" : "none"};
            }
          `}</style>
          {/* model-viewer's own button and hand animation are replaced by ours. */}
          <span slot="ar-button" hidden />
          <span slot="ar-prompt" hidden />
          {message && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none absolute inset-x-4 bottom-[max(24px,env(safe-area-inset-bottom))] mx-auto max-w-sm rounded-2xl bg-black/70 px-5 py-4 text-center text-[15px] leading-snug text-white backdrop-blur-md"
            >
              {message}
            </div>
          )}
        </>,
        el,
      )
    : null;
});

export default WebXRStage;
