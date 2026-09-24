"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { isTodo, type Sculpture } from "@/lib/sculptures";
import ARButton from "./ARButton";
import ArtistBadge from "./ArtistBadge";
import MoreModelsSidebar from "./MoreModelsSidebar";

const SculptureScene = dynamic(() => import("./SculptureScene"), { ssr: false });

// Placeholder copy is shown (highlighted) while developing, hidden in production.
const SHOW_TODOS = process.env.NODE_ENV !== "production";
const visible = (value: string) => SHOW_TODOS || !isTodo(value);

const DetailValue = ({ value }: { value: string }) =>
  isTodo(value) ? (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">{value}</span>
  ) : (
    <>{value}</>
  );

const ToolbarButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black/70 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-black"
  >
    {children}
  </button>
);

const SculptureViewer = ({
  sculpture,
  others,
}: {
  sculpture: Sculpture;
  others: Sculpture[];
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen?.();
  };

  const details: [string, string][] = [
    ["Material", sculpture.material],
    ["Year", sculpture.year],
    ["Dimensions", sculpture.dimensions],
    ["Edition", sculpture.edition],
    ["Location", sculpture.location],
    ["Triangles", sculpture.stats.triangles.toLocaleString("en-US")],
    ["Download size", `${sculpture.stats.fileSizeKB} KB`],
  ];

  return (
    <main className="relative min-h-screen w-full page-gradient pb-24 pt-24 md:pt-28">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 md:px-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <Link
            href="/gallery"
            className="mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-black/50 transition-colors hover:text-black"
          >
            <ArrowLeft size={14} /> Gallery
          </Link>

          {/* Viewer stage — data-lenis-prevent lets wheel events zoom the model instead of scrolling */}
          <div
            ref={stageRef}
            data-lenis-prevent
            className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/5 bg-[#f4efe8] sm:aspect-[4/3] lg:aspect-video"
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `radial-gradient(70% 70% at 50% 40%, ${sculpture.accent}2e 0%, ${sculpture.accent}10 45%, transparent 80%)`,
              }}
            />
            {/* Instant placeholder while the model loads */}
            <Image
              src={sculpture.thumbnail}
              alt={`${sculpture.title} by ${sculpture.artist.name}`}
              fill
              priority
              sizes="(min-width: 1024px) 70vw, 100vw"
              className={`object-contain transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
            />
            <div className="absolute inset-0">
              <SculptureScene
                key={sculpture.slug}
                url={sculpture.modelUrl}
                offsetX={sculpture.offsetX}
                offsetY={sculpture.offsetY}
                defaultZoom={sculpture.defaultZoom}
                interactive
                controlsRef={controlsRef}
                onReady={onReady}
              />
            </div>

            <div className="absolute bottom-3 right-3 flex gap-2">
              <ToolbarButton label="Reset view" onClick={() => controlsRef.current?.reset()}>
                <RotateCcw size={16} />
              </ToolbarButton>
              <ToolbarButton
                label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={toggleFullscreen}
              >
                {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </ToolbarButton>
            </div>
            <p className="pointer-events-none absolute bottom-4 left-4 hidden text-[11px] text-black/40 sm:block">
              Drag to rotate · Scroll to zoom · Right-drag to pan
            </p>
          </div>

          {/* Title + artist */}
          <div className="mt-6 flex flex-col gap-5 border-b border-black/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <span
                className="text-[11px] uppercase tracking-[0.3em]"
                style={{ color: sculpture.accent }}
              >
                {sculpture.subtitle} · {sculpture.year}
              </span>
              <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-black md:text-5xl">
                {sculpture.title}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <ArtistBadge artist={sculpture.artist} size="md" accent={sculpture.accent} />
                <span className="hidden text-xs text-black/40 sm:inline">{sculpture.artist.role}</span>
              </div>
            </div>
            <div className="shrink-0">
              <ARButton sculpture={sculpture} />
            </div>
          </div>

          {/* Description + details */}
          <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4 text-base leading-relaxed text-black/65">
              <p>{sculpture.description}</p>
              {visible(sculpture.longDescription) && (
                <p>
                  <DetailValue value={sculpture.longDescription} />
                </p>
              )}

              {sculpture.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2 pt-2">
                  {sculpture.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55"
                    >
                      #{tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <dl className="divide-y divide-black/5 rounded-xl border border-black/5 bg-white/40 text-sm">
              {details
                .filter(([, value]) => visible(value))
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                    <dt className="text-black/45">{label}</dt>
                    <dd className="text-right text-black/80">
                      <DetailValue value={value} />
                    </dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* About the artist */}
          {visible(sculpture.artist.bio) && (
            <section className="mt-10 rounded-2xl border border-black/5 bg-white/40 p-6">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-black/45">
                About the artist
              </h2>
              <div className="mt-4">
                <ArtistBadge artist={sculpture.artist} size="md" accent={sculpture.accent} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-black/60">
                <DetailValue value={sculpture.artist.bio} />
              </p>
            </section>
          )}
        </div>

        <MoreModelsSidebar
          sculptures={others}
          heading={`More from ${sculpture.artist.name}`}
        />
      </div>
    </main>
  );
};

export default SculptureViewer;
