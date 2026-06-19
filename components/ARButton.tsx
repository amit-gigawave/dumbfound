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

/** Launch iOS AR Quick Look with a USDZ. */
const launchQuickLook = (usdzAbsUrl: string) => {
  const anchor = document.createElement("a");
  anchor.setAttribute("rel", "ar");
  anchor.setAttribute("href", usdzAbsUrl);
  // Quick Look requires an <img> child to engage from a user gesture.
  anchor.appendChild(document.createElement("img"));
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

const ARButton = ({ sculpture }: { sculpture: Sculpture }) => {
  const [mounted, setMounted] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const platformRef = useRef<Platform>("desktop");

  useEffect(() => {
    setMounted(true);
    platformRef.current = detectPlatform();
  }, []);

  const abs = useCallback(
    (path: string) =>
      typeof window === "undefined"
        ? path
        : new URL(path, window.location.origin).href,
    [],
  );

  const openQr = useCallback(async () => {
    // Encode the current page with ?ar=1 so a phone scan can auto-launch AR.
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

  const launch = useCallback(() => {
    const platform = platformRef.current;
    if (platform === "android") {
      launchSceneViewer(abs(sculpture.modelUrl), sculpture.title, window.location.href);
    } else if (platform === "ios" && sculpture.usdzUrl) {
      launchQuickLook(abs(sculpture.usdzUrl));
    } else {
      // Desktop (or iOS without a USDZ) → hand off to a phone via QR.
      openQr();
    }
  }, [abs, openQr, sculpture.modelUrl, sculpture.title, sculpture.usdzUrl]);

  // Auto-launch when arriving from a QR scan (?ar=1) on a capable device.
  useEffect(() => {
    if (!mounted) return;
    const wantsAR = new URLSearchParams(window.location.search).get("ar") === "1";
    if (!wantsAR) return;
    const platform = platformRef.current;
    if (platform === "android" || (platform === "ios" && sculpture.usdzUrl)) {
      const t = setTimeout(launch, 400);
      return () => clearTimeout(t);
    }
  }, [mounted, launch, sculpture.usdzUrl]);

  return (
    <>
      <motion.button
        onClick={launch}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_30px_-8px_rgba(21,20,21,0.5)] ring-1 ring-white/10"
        style={{ "--ar": sculpture.accent } as React.CSSProperties}
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

      {/* Desktop QR handoff modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {qrOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setQrOpen(false)}
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
                    style={{
                      boxShadow: `0 16px 40px -16px ${sculpture.accent}88`,
                    }}
                  >
                    {qrDataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="Scan to view in AR"
                        className="h-full w-full"
                      />
                    )}
                  </div>

                  <p className="mx-auto mt-6 max-w-xs text-sm leading-relaxed text-black/55">
                    Scan with your phone&apos;s camera to place{" "}
                    <span className="font-medium text-black/75">
                      {sculpture.title}
                    </span>{" "}
                    in your space at true scale.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};

export default ARButton;
