"use client";

// An immersive artwork viewer, tried at /lab/viewer/<slug>: the work stands
// alone in a gallery room under a spotlight, filling the screen. The room is
// dark for light works and pale for dark ones (the same contrast rule as the
// site's viewer). On arrival the light comes up as the model appears, then the
// work turns slowly once and stops. Visitors walk round it (drag, or the
// Front / Side / Back buttons) and walk the gallery (side arrows, ← →).

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Sculpture } from "@/lib/sculptures";
import ARButton from "@/components/ARButton";
import { imageStats, prefersReducedMotion } from "@/components/gallery/views/imageStats";

const SculptureScene = dynamic(() => import("@/components/SculptureScene"), { ssr: false });

/** How much of the room the work fills: less than the plain viewer, so it has air. */
const FIT_ROOM = 0.64;
/** Header above every page (px). */
const HEADER_PX = 85;

type Tone = "evening" | "day";

/** Room colours. Evening for light works, day (limestone) for dark ones. */
const ROOM: Record<
  Tone,
  { wall: string; floor: string; spot: string; pool: string; dim: string; text: string; muted: string; chip: string; chipOn: string }
> = {
  evening: {
    wall: "linear-gradient(#121211 0%, #1d1c1a 58%, #24221f 100%)",
    floor: "linear-gradient(rgba(0,0,0,0), #2c2a26 40%, #33302b)",
    spot: "radial-gradient(ellipse 34% 58% at 50% 34%, rgba(255,239,214,.17), rgba(255,239,214,.05) 55%, transparent 75%)",
    pool: "radial-gradient(closest-side, rgba(255,236,205,.24), rgba(255,236,205,.06) 60%, transparent)",
    dim: "#0b0b0a",
    text: "#efece6",
    muted: "#a19d95",
    chip: "bg-white/10 text-[#efece6] hover:bg-white/20",
    chipOn: "bg-[#efece6] text-[#141414]",
  },
  day: {
    wall: "linear-gradient(#d9d6d0 0%, #e8e6e1 58%, #ecebe7 100%)",
    floor: "linear-gradient(rgba(0,0,0,0), #dedbd5 40%, #d4d0c9)",
    spot: "radial-gradient(ellipse 34% 58% at 50% 34%, rgba(255,255,255,.75), rgba(255,255,255,.25) 55%, transparent 75%)",
    pool: "radial-gradient(closest-side, rgba(255,255,255,.8), rgba(255,255,255,.25) 60%, transparent)",
    dim: "#bdb9b1",
    text: "#141414",
    muted: "#5f5c57",
    chip: "bg-black/[.06] text-[#141414] hover:bg-black/[.11]",
    chipOn: "bg-[#141414] text-[#efece6]",
  },
};

/** Camera angles round the work: the model is turned to face the camera at 0. */
const VIEWS = [
  { name: "Front", angle: 0 },
  { name: "Side", angle: Math.PI / 2 },
  { name: "Back", angle: Math.PI },
  { name: "Other side", angle: -Math.PI / 2 },
] as const;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export interface RoomNeighbour {
  slug: string;
  title: string;
}

export default function ViewingRoom({
  work,
  artistName,
  artistBorn,
  label,
  prev,
  next,
  basePath = "/lab/viewer",
}: {
  work: Sculpture;
  artistName?: string;
  artistBorn?: string;
  /** Wall-label lines under the title (medium and edition; size). */
  label: string[];
  prev?: RoomNeighbour;
  next?: RoomNeighbour;
  basePath?: string;
}) {
  const router = useRouter();
  const roomRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const tween = useRef<number>(0);
  const [tone, setTone] = useState<Tone>("evening");
  const [ready, setReady] = useState(false);
  const [lit, setLit] = useState(false);
  const [turning, setTurning] = useState(false);
  const [view, setView] = useState<number | null>(0);
  const [hint, setHint] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const room = ROOM[tone];
  const modelUrl = work.modelUrl;

  // The room's tone from the thumbnail: a light work gets the evening room.
  useEffect(() => {
    let live = true;
    imageStats(work.thumbnail.split("?")[0]).then((s) => {
      if (live && s) setTone(s.hsl[2] >= 0.36 ? "evening" : "day");
    });
    return () => {
      live = false;
    };
  }, [work.thumbnail]);

  const setAutoTurn = useCallback((on: boolean) => {
    const c = controlsRef.current;
    if (c) {
      c.autoRotate = on;
      c.autoRotateSpeed = 0.55;
    }
    setTurning(on);
    // A turning work is at no particular view.
    if (on) setView(null);
  }, []);

  // Arrival: lights up when the model is drawn, then one slow turn.
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    if (!ready && modelUrl) return;
    const still = prefersReducedMotion();
    const t1 = setTimeout(() => setLit(true), still ? 0 : 150);
    if (!modelUrl || still) return () => clearTimeout(t1);
    const t2 = setTimeout(() => {
      setAutoTurn(true);
      setHint(true);
    }, 1900);
    // One full turn at this speed takes about 110 s; stop after a gentle part.
    const t3 = setTimeout(() => setAutoTurn(false), 13000);
    const t4 = setTimeout(() => setHint(false), 6500);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [ready, modelUrl, setAutoTurn]);

  // Glide the camera round to an angle.
  const goTo = useCallback(
    (i: number) => {
      const c = controlsRef.current;
      if (!c) return;
      setAutoTurn(false);
      setView(i);
      cancelAnimationFrame(tween.current);
      const from = c.getAzimuthalAngle();
      let delta = VIEWS[i].angle - from;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta)); // shortest way round
      if (prefersReducedMotion()) {
        c.setAzimuthalAngle(from + delta);
        c.update();
        return;
      }
      const start = performance.now();
      const ms = 700 + Math.abs(delta) * 380;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        c.setAzimuthalAngle(from + delta * ease(t));
        c.update();
        if (t < 1) tween.current = requestAnimationFrame(step);
      };
      tween.current = requestAnimationFrame(step);
    },
    [setAutoTurn],
  );
  useEffect(() => () => cancelAnimationFrame(tween.current), []);

  // Dragging takes over: the slow turn stops and no view button is "on".
  const onPointerDown = () => {
    cancelAnimationFrame(tween.current);
    setAutoTurn(false);
    setView(null);
    setHint(false);
  };

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else roomRef.current?.requestFullscreen?.();
  }, []);

  // ← → walk the gallery; F full screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key === "ArrowLeft" && prev) router.push(`${basePath}/${prev.slug}`);
      if (e.key === "ArrowRight" && next) router.push(`${basePath}/${next.slug}`);
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, basePath, router, toggleFullscreen]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === roomRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const chip = `rounded-full px-3.5 py-2 text-[13px] leading-none backdrop-blur-sm transition-colors ${room.chip}`;
  const roundBtn = `grid size-10 place-items-center rounded-full backdrop-blur-sm transition-colors ${room.chip}`;

  return (
    <section
      ref={roomRef}
      aria-label={`${work.title}, viewing room`}
      className="relative isolate overflow-hidden transition-colors duration-700"
      style={{
        height: fullscreen ? "100vh" : `max(560px, calc(100svh - ${HEADER_PX}px))`,
        color: room.text,
      }}
    >
      {/* The room: wall, floor, the spotlight and its pool on the floor. */}
      <div aria-hidden className="absolute inset-0 -z-20 transition-[background] duration-700" style={{ background: room.wall }} />
      <div aria-hidden className="absolute inset-x-0 bottom-0 top-[60%] -z-20" style={{ background: room.floor }} />
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 transition-[opacity,transform] duration-[1800ms] ease-out ${
          lit ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        style={{ background: room.spot }}
      />
      <div
        aria-hidden
        className={`absolute left-1/2 top-[79%] -z-10 h-[16%] w-[min(70%,760px)] -translate-x-1/2 -translate-y-1/2 transition-opacity delay-300 duration-[1800ms] ${
          lit ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: room.pool }}
      />

      {/* The work. Its photo holds the place until the model is drawn. */}
      <div className="absolute inset-0" onPointerDown={onPointerDown}>
        <Image
          src={work.thumbnail}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`object-contain py-[9%] transition-opacity duration-700 ${
            ready || !modelUrl ? (modelUrl ? "opacity-0" : "opacity-100") : "opacity-60"
          }`}
        />
        {modelUrl && (
          <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
            <SculptureScene
              url={modelUrl}
              interactive
              fit={FIT_ROOM}
              facing={work.facing}
              look={work.look}
              adaptiveBackground={false}
              controlsRef={controlsRef}
              onReady={onReady}
            />
          </div>
        )}
      </div>

      {/* Lights down until the work arrives. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-[1600ms] ease-out ${
          lit ? "opacity-0" : "opacity-60"
        }`}
        style={{ background: room.dim }}
      />

      {/* Top bar: back to the collection; full screen and AR. */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-[clamp(14px,2.4vw,28px)]">
        <Link href="/artworks" className={`${chip} inline-flex items-center gap-1.5`}>
          <ChevronLeft size={15} aria-hidden />
          All artworks
        </Link>
        <div className="flex items-center gap-2">
          {modelUrl && (
            <span className="rounded-full bg-white/90 px-4 py-2.5 text-ink shadow-[0_6px_18px_-10px_rgba(0,0,0,.5)]">
              <ARButton sculpture={{ ...work, modelUrl }} />
            </span>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Leave full screen" : "Full screen"}
            title={fullscreen ? "Leave full screen (F)" : "Full screen (F)"}
            className={roundBtn}
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Walk the gallery. */}
      {prev && (
        <Link
          href={`${basePath}/${prev.slug}`}
          aria-label={`Previous work: ${prev.title}`}
          title={`${prev.title} (←)`}
          className={`absolute left-[clamp(10px,2vw,24px)] top-1/2 z-20 -translate-y-1/2 ${roundBtn}`}
        >
          <ChevronLeft size={18} />
        </Link>
      )}
      {next && (
        <Link
          href={`${basePath}/${next.slug}`}
          aria-label={`Next work: ${next.title}`}
          title={`${next.title} (→)`}
          className={`absolute right-[clamp(10px,2vw,24px)] top-1/2 z-20 -translate-y-1/2 ${roundBtn}`}
        >
          <ChevronRight size={18} />
        </Link>
      )}

      {/* Drag hint, once, while the work first turns. */}
      <p
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-[14%] z-20 -translate-x-1/2 text-[13px] transition-opacity duration-700 ${
          hint ? "opacity-100" : "opacity-0"
        }`}
        style={{ color: room.muted }}
      >
        Drag to walk around it
      </p>

      {/* The wall label, on the floor at the left; the ways round, at the right. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-5 p-[clamp(16px,3vw,40px)] md:flex-row md:items-end md:justify-between">
        <div
          className={`pointer-events-auto max-w-[min(520px,100%)] transition-[opacity,transform] delay-500 duration-1000 ${
            lit ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {artistName && (
            <p className="text-[14px]">
              {artistName}
              {artistBorn && <span style={{ color: room.muted }}> {artistBorn}</span>}
            </p>
          )}
          <h1 className="mt-1 font-display text-[clamp(28px,4vw,52px)] leading-[1.06] tracking-[0.01em]">
            {work.title}
            {work.year && (
              <span className="font-sans text-[clamp(15px,1.4vw,18px)] tracking-normal" style={{ color: room.muted }}>
                , {work.year}
              </span>
            )}
          </h1>
          {label.map((line) => (
            <p key={line} className="mt-1 text-[14px] tabular-nums" style={{ color: room.muted }}>
              {line}
            </p>
          ))}
        </div>

        {modelUrl && (
          <div
            role="group"
            aria-label="Walk round the work"
            className={`pointer-events-auto flex flex-wrap items-center gap-1.5 transition-opacity delay-700 duration-1000 ${
              lit ? "opacity-100" : "opacity-0"
            }`}
          >
            {VIEWS.map((v, i) => (
              <button
                key={v.name}
                type="button"
                onClick={() => goTo(i)}
                aria-pressed={view === i}
                className={`rounded-full px-3.5 py-2 text-[13px] leading-none backdrop-blur-sm transition-colors ${
                  view === i ? room.chipOn : room.chip
                }`}
              >
                {v.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAutoTurn(!turning)}
              aria-pressed={turning}
              aria-label={turning ? "Stop turning" : "Turn slowly"}
              title={turning ? "Stop turning" : "Turn slowly"}
              className={roundBtn}
            >
              {turning ? <Pause size={15} /> : <Play size={15} />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
