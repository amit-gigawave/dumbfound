"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "motion/react";
import { X, Smartphone } from "lucide-react";
import type { Sculpture } from "@/lib/sculptures";

type Platform = "android" | "ios" | "desktop";

const detectPlatform = (): Platform => {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  // iPadOS 13+ reports as MacIntel with touch support.
  const iOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  return "desktop";
};

const toAbs = (path: string) =>
  typeof window === "undefined" ? path : new URL(path, window.location.origin).href;

/** Launch Android Scene Viewer with the GLB. */
const launchSceneViewer = (glbAbsUrl: string, title: string, fallback: string) => {
  const params = new URLSearchParams({
    file: glbAbsUrl,
    mode: "ar_preferred",
    title,
  });
  const intent =
    `intent://arvr.google.com/scene-viewer/1.0?${params.toString()}` +
    `#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;` +
    `S.browser_fallback_url=${encodeURIComponent(fallback)};end;`;
  window.location.href = intent;
};

/** Open an href in iOS AR Quick Look (must contain an <img> child). */
const openQuickLook = (usdzUrl: string) => {
  const anchor = document.createElement("a");
  anchor.setAttribute("rel", "ar");
  anchor.setAttribute("href", usdzUrl);
  anchor.appendChild(document.createElement("img"));
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

/**
 * Build a USDZ for iOS Quick Look. Uses a prebuilt `usdzUrl` if one is supplied,
 * otherwise converts the GLB to USDZ in-browser with three's USDZExporter.
 */
const resolveUsdz = async (sculpture: Sculpture): Promise<string> => {
  if (sculpture.usdzUrl) return toAbs(sculpture.usdzUrl);

  const [{ GLTFLoader }, { DRACOLoader }, { USDZExporter }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/loaders/DRACOLoader.js"),
    import("three/examples/jsm/exporters/USDZExporter.js"),
  ]);

  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
  loader.setDRACOLoader(draco);

  const gltf = await loader.loadAsync(toAbs(sculpture.modelUrl));
  const exporter = new USDZExporter();
  const usdz = await exporter.parseAsync(gltf.scene);
  const blob = new Blob([usdz as BlobPart], { type: "model/vnd.usdz+zip" });
  return URL.createObjectURL(blob);
};

const ARButton = ({ sculpture }: { sculpture: Sculpture }) => {
  const [mounted, setMounted] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [arPromptOpen, setArPromptOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const platformRef = useRef<Platform>("desktop");

  useEffect(() => {
    setMounted(true);
    platformRef.current = detectPlatform();
    // Arrived from a QR scan → show a tap prompt (iOS/Android AR needs a gesture).
    const wantsAR = new URLSearchParams(window.location.search).get("ar") === "1";
    if (wantsAR && platformRef.current !== "desktop") setArPromptOpen(true);
  }, []);

  const openQr = useCallback(async () => {
    const target = new URL(window.location.href);
    target.searchParams.set("ar", "1");
    const data = await QRCode.toDataURL(target.href, {
      margin: 1,
      width: 320,
      color: { dark: "#151415", light: "#00000000" },
    });
    setQrDataUrl(data);
    setQrOpen(true);
  }, []);

  /** Fire AR. Must be called from within a user gesture (tap/click). */
  const launchAR = useCallback(async () => {
    const platform = platformRef.current;
    setError(null);
    if (platform === "android") {
      launchSceneViewer(
        toAbs(sculpture.modelUrl),
        sculpture.title,
        window.location.href.replace(/[?&]ar=1/, ""),
      );
      return;
    }
    // iOS
    try {
      setBusy(true);
      const usdz = await resolveUsdz(sculpture);
      openQuickLook(usdz);
    } catch (e) {
      console.error(e);
      setError("Could not prepare the AR model. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [sculpture]);

  const onButtonClick = useCallback(() => {
    if (platformRef.current === "desktop") openQr();
    else launchAR();
  }, [openQr, launchAR]);

  const closeArPrompt = useCallback(() => {
    if (!busy) setArPromptOpen(false);
  }, [busy]);

  return (
    <>
      <motion.button
        onClick={onButtonClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_30px_-8px_rgba(21,20,21,0.5)] ring-1 ring-white/10"
      >
        {/* animated accent glow */}
        <span
          className="pointer-events-none absolute -inset-12 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(40% 60% at 30% 50%, ${sculpture.accent}66, transparent 70%)`,
          }}
        />
        {/* shimmer sweep */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

        {/* rotating AR cube */}
        <span className="relative grid h-5 w-5 place-items-center">
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <path
              d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M12 2v20M3 7l9 5 9-5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              opacity="0.7"
            />
          </motion.svg>
        </span>

        <span className="relative tracking-wide">View in AR</span>

        {/* pulsing live dot */}
        <span className="relative ml-0.5 flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ background: sculpture.accent }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: sculpture.accent }}
          />
        </span>
      </motion.button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {/* Desktop: QR handoff to a phone */}
            {qrOpen && (
              <Backdrop key="qr" onClose={() => setQrOpen(false)}>
                <button
                  onClick={() => setQrOpen(false)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
                <div className="mb-1 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.35em] text-black/40">
                  <Smartphone size={13} /> Augmented Reality
                </div>
                <h3 className="font-display text-2xl tracking-[-0.02em] text-black">
                  View on your phone
                </h3>
                <div
                  className="mx-auto mt-6 grid h-56 w-56 place-items-center rounded-2xl bg-white p-3 ring-1 ring-black/5"
                  style={{ boxShadow: `0 16px 40px -16px ${sculpture.accent}88` }}
                >
                  {qrDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrDataUrl} alt="Scan to view in AR" className="h-full w-full" />
                  )}
                </div>
                <p className="mx-auto mt-6 max-w-xs text-sm leading-relaxed text-black/55">
                  Scan with your phone&apos;s camera to place{" "}
                  <span className="font-medium text-black/75">{sculpture.title}</span>{" "}
                  in your space at true scale.
                </p>
              </Backdrop>
            )}

            {/* Mobile: tap prompt after a QR scan (provides the required gesture) */}
            {arPromptOpen && (
              <Backdrop key="arp" onClose={closeArPrompt}>
                {!busy && (
                  <button
                    onClick={closeArPrompt}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                )}
                <div className="mb-1 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.35em] text-black/40">
                  <Smartphone size={13} /> Augmented Reality
                </div>
                <h3 className="font-display text-2xl tracking-[-0.02em] text-black">
                  {sculpture.title}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-black/55">
                  {busy
                    ? "Preparing the 3D model for AR…"
                    : "Tap below, then point your camera at the floor to place the sculpture at true scale."}
                </p>

                <button
                  onClick={launchAR}
                  disabled={busy}
                  className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-medium text-white shadow-lg transition-transform active:scale-95 disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Preparing…
                    </>
                  ) : (
                    "Launch AR"
                  )}
                </button>

                {error && (
                  <p className="mt-4 text-xs text-red-600">{error}</p>
                )}
              </Backdrop>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};

const Backdrop = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.92, y: 16, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.92, y: 16, opacity: 0 }}
      transition={{ type: "spring", damping: 24, stiffness: 280 }}
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm rounded-[1.75rem] bg-[#faf9f6] p-8 text-center shadow-2xl ring-1 ring-black/5"
    >
      {children}
    </motion.div>
  </motion.div>
);

export default ARButton;
