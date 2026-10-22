"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Sculpture } from "@/lib/sculptures";
import { getArtist } from "@/lib/artists";
import { Rotate3d } from "lucide-react";
import {
  FIT_CARD,
  prefetchModel,
  preloadModel,
  warm3D,
} from "../three/modelLoader";
import { registerAmbient } from "./ambientTurn";
import { tilt, untilt } from "./tilt";

const TilePreview = dynamic(() => import("../three/TilePreview"), {
  ssr: false,
});

/**
 * How long the pointer rests on a tile before the 3D view mounts (the model
 * itself starts downloading at once). Previews share one renderer, so starting
 * one is cheap; this only skips tiles the cursor merely passes over.
 */
const HOVER_DELAY = 60;
/** Once loaded: pause before the work starts turning. */
const TURN_AFTER = 0;

/**
 * Catalogue tile: the work framed on a plate, captioned
 * ARTIST / Title / year · medium. Used on the home page, the artworks grid and
 * artist pages (where the artist line is hidden).
 *
 * `showcase` (the artworks grid, featured works) adds hover motion: the plate
 * leans toward the cursor, a hint pill slides up, and works with a 3D model
 * load (with a progress bar), then turn in the round like a Sketchfab preview
 * once the bar completes. `ambient` (the artworks grid) also lets a random one
 * or two visible works start turning on their own for a few seconds.
 * `quiet` (home page) keeps the turning but drops the lean and the hint pill.
 */
const ArtworkTile = ({
  work,
  showArtist = true,
  priority = false,
  showcase = false,
  ambient = false,
  backdrop = false,
  quiet = false,
  sizes = "(min-width: 1024px) 33vw, 50vw",
}: {
  work: Sculpture;
  showArtist?: boolean;
  priority?: boolean;
  showcase?: boolean;
  ambient?: boolean;
  /** Studio-light plate with a floor shadow, for tiles on a tinted section. */
  backdrop?: boolean;
  /** No lean toward the cursor and no hint pill; works still turn. */
  quiet?: boolean;
  sizes?: string;
}) => {
  const artist = getArtist(work.artistSlug);
  const modelUrl = showcase ? work.modelUrl : undefined;
  const plateRef = useRef<HTMLDivElement>(null);

  const [hovering, setHovering] = useState(false);
  const [turning, setTurning] = useState(false); // hover delay has passed
  const [ambientOn, setAmbientOn] = useState(false); // turning on its own
  const [ready, setReady] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverRef = useRef(false);
  const turningRef = useRef(false);
  const onReady = useCallback(() => setReady(true), []);
  const active = turning || ambientOn;

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (modelUrl) warm3D();
  }, [modelUrl]);

  // On devices that can hover, fetch the model once the tile is on screen.
  useEffect(() => {
    const el = plateRef.current;
    if (!modelUrl || !el || !matchMedia("(hover: hover)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        prefetchModel(modelUrl);
        io.disconnect();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [modelUrl]);

  // Enter the ambient draw; when the turn ends, fall back to the photo unless
  // the visitor has since hovered in and taken over.
  useEffect(() => {
    const el = plateRef.current;
    if (!ambient || !modelUrl || !el) return;
    return registerAmbient({
      el,
      busy: () => hoverRef.current,
      start: () => {
        preloadModel(modelUrl);
        setAmbientOn(true);
      },
      stop: () => {
        setAmbientOn(false);
        if (!turningRef.current) {
          setReady(false);
          setSpinning(false);
        }
      },
    });
  }, [ambient, modelUrl]);

  // Start turning only after the progress bar has completed.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setSpinning(true), TURN_AFTER);
    return () => clearTimeout(t);
  }, [ready]);

  const onEnter = () => {
    if (!modelUrl) return;
    preloadModel(modelUrl);
    hoverRef.current = true;
    setHovering(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      turningRef.current = true;
      setTurning(true);
    }, HOVER_DELAY);
  };
  const onLeave = () => {
    clearTimeout(timer.current);
    hoverRef.current = false;
    turningRef.current = false;
    setHovering(false);
    setTurning(false);
    // An ambient turn in progress keeps going; otherwise back to the photo.
    if (!ambientOn) {
      setReady(false);
      setSpinning(false);
    }
  };

  return (
    <Link
      href={`/artworks/${work.slug}`}
      className="group grid content-start gap-3.5"
      onPointerEnter={modelUrl ? onEnter : undefined}
      onPointerLeave={modelUrl ? onLeave : undefined}
      onFocus={modelUrl ? () => preloadModel(modelUrl) : undefined}
    >
      <div
        ref={plateRef}
        data-turning={active || undefined}
        onPointerMove={showcase && !quiet ? (e) => tilt(e, 5) : undefined}
        onPointerLeave={showcase && !quiet ? untilt : undefined}
        className={`relative isolate grid aspect-[4/5] place-items-center overflow-hidden rounded-[14px] border transition-[background-color,transform,box-shadow] duration-500 ease-[cubic-bezier(.3,.7,.3,1)] ${
          backdrop
            ? "border-white/80 bg-[radial-gradient(120%_80%_at_50%_22%,#ffffff_0%,#f6f7f5_45%,#dde2dd_100%)] shadow-[0_18px_34px_-24px_rgba(20,40,28,.45)]"
            : "border-rule bg-plate group-hover:bg-[#e8e8e8]"
        } ${
          showcase
            ? "group-hover:shadow-[0_26px_46px_-30px_rgba(0,0,0,.5)]"
            : ""
        }`}
      >
        {backdrop && (
          // Studio floor: a soft pool of shadow the work stands on.
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[18%] bottom-[7%] -z-10 h-[9%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(20,40,28,.22),transparent)]"
          />
        )}
        <Image
          src={work.thumbnail}
          alt={`${work.title}${artist ? ` by ${artist.name}` : ""}`}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-contain p-[6%] transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.035] ${
            active && ready ? "opacity-0" : "opacity-100"
          }`}
        />
        {active && modelUrl && (
          // Same hover scale as the photo, so the cross-fade lines up exactly.
          <div
            className={`absolute inset-0 scale-[1.035] transition-opacity duration-500 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          >
            <TilePreview
              url={modelUrl}
              fit={FIT_CARD}
              facing={work.facing}
              autoRotate={spinning}
              onReady={onReady}
            />
          </div>
        )}
        {modelUrl && (
          // Hover progress: fills over the hover delay, creeps while the model
          // loads, completes when it starts turning, then fades out.
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[3px] bg-rule/60"
            style={{
              opacity: hovering && !ready ? 1 : 0,
              transition: "opacity 300ms ease 150ms",
            }}
          >
            <div
              className="h-full bg-accent"
              style={
                !hovering
                  ? { width: 0, transition: "none" }
                  : ready
                    ? { width: "100%", transition: "width 200ms ease-out" }
                    : turning
                      ? {
                          width: "92%",
                          transition:
                            "width 2500ms cubic-bezier(0.1, 0.6, 0.3, 1)",
                        }
                      : {
                          width: "60%",
                          transition: `width ${HOVER_DELAY}ms linear`,
                        }
              }
            />
          </div>
        )}
        {showcase && !quiet && (
          // Hint that slides up on hover; tracks the 3D preview as it loads.
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-3.5 left-3.5 z-10 inline-flex translate-y-3 items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-ink opacity-0 shadow-[0_4px_14px_-6px_rgba(0,0,0,.3)] backdrop-blur-sm transition-[transform,opacity] duration-500 ease-[cubic-bezier(.3,.7,.3,1)] group-hover:translate-y-0 group-hover:opacity-100"
          >
            {modelUrl ? (
              <>
                <Rotate3d size={12} strokeWidth={1.8} className="text-accent" />
                {spinning ? "Turning in 3D" : "Loading 3D…"}
              </>
            ) : (
              <>
                View work <span className="text-accent">→</span>
              </>
            )}
          </span>
        )}
      </div>
      <div className="grid gap-0.5">
        {showArtist && artist && <span className="label">{artist.name}</span>}
        <span className="font-display text-[17px] leading-snug sm:text-[21px] tracking-[0.03em] transition-colors group-hover:text-accent">
          {work.title}
        </span>
        <span className="text-[13px] text-stone">
          {[work.year, work.material].filter(Boolean).join(" · ")}
        </span>
        <span
          aria-hidden
          className="mt-2 block h-px w-0 bg-accent transition-[width] duration-500 ease-out group-hover:w-12"
        />
      </div>
    </Link>
  );
};

export default ArtworkTile;
