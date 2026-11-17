"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import StudioEnvironment from "@/components/three/StudioEnvironment";
import { DRACO_PATH } from "@/components/three/modelLoader";

/* ------------------------------------------------------------------ */
/* Setups                                                              */
/* ------------------------------------------------------------------ */

type Tone = "aces" | "agx" | "neutral";

interface Light {
  name: string;
  kind: "dir" | "spot" | "point";
  /** Degrees around the work: 0 = from the front, 90 = from the viewer's right. */
  az: number;
  /** Degrees above the horizon. */
  el: number;
  /** Distance from the work's centre (the work is 1 unit across). */
  dist: number;
  intensity: number;
  color: string;
  /** Spotlight cone, radians. */
  angle?: number;
  penumbra?: number;
}

interface Setup {
  id: string;
  name: string;
  note: string;
  ambient: number;
  hemi: number;
  hemiSky: string;
  hemiGround: string;
  lights: Light[];
  /** Strength of the soft studio reflections (environment map). */
  env: number;
  exposure: number;
  tone: Tone;
  bg: string;
  shadow: number;
  shadowBlur: number;
}

const dir = (name: string, az: number, el: number, intensity: number, color = "#ffffff"): Light => ({
  name, kind: "dir", az, el, dist: 6, intensity, color,
});

const SETUPS: Setup[] = [
  {
    id: "viewer",
    name: "Current: artwork viewer",
    note: "What the artwork pages, thumbnails and hover previews use today.",
    ambient: 0.5, hemi: 0, hemiSky: "#ffffff", hemiGround: "#888888",
    lights: [dir("Key", 37, 45, 1.6), dir("Back", -127, 22, 0.5)],
    env: 0.9, exposure: 1.05, tone: "aces", bg: "#f0f0f0", shadow: 0.22, shadowBlur: 3,
  },
  {
    id: "hero",
    name: "Current: home hero",
    note: "Today's hero (approximate): very bright and almost all from the front, so it looks flat.",
    ambient: 3, hemi: 0, hemiSky: "#ffffff", hemiGround: "#888888",
    lights: [
      dir("Front", 0, 11, 5),
      dir("Front right", 32, 28, 3),
      dir("Front left", -32, 28, 3),
      dir("Top front", 0, 58, 2),
      { name: "Point", kind: "point", az: 0, el: 0, dist: 8, intensity: 4, color: "#ffffff" },
    ],
    env: 1, exposure: 1.05, tone: "aces", bg: "#fafafa", shadow: 0.2, shadowBlur: 2.5,
  },
  {
    id: "three-point",
    name: "Three-point",
    note: "Classic photo lighting: a strong key from one side, a soft fill and a rim behind. Shows the form.",
    ambient: 0.12, hemi: 0, hemiSky: "#ffffff", hemiGround: "#888888",
    lights: [
      dir("Key", -40, 35, 2.8, "#fff3e2"),
      dir("Fill", 50, 15, 0.8, "#e4ecff"),
      dir("Rim", 180, 40, 2.2),
    ],
    env: 0.6, exposure: 1, tone: "aces", bg: "#ececec", shadow: 0.35, shadowBlur: 2.2,
  },
  {
    id: "warm-bronze",
    name: "Warm bronze",
    note: "Warm key with a cool rim: brings out bronze, patina and metal.",
    ambient: 0, hemi: 0.6, hemiSky: "#fff1dc", hemiGround: "#4a3a2a",
    lights: [dir("Warm key", 35, 40, 2.4, "#ffd6a0"), dir("Cool rim", -150, 30, 1.6, "#a9c8ff")],
    env: 1.1, exposure: 1.1, tone: "aces", bg: "#efe9e1", shadow: 0.3, shadowBlur: 2.5,
  },
  {
    id: "spot",
    name: "Gallery spotlight",
    note: "One spotlight from above on a dark ground, like a museum plinth. Dramatic.",
    ambient: 0.04, hemi: 0, hemiSky: "#ffffff", hemiGround: "#888888",
    lights: [
      { name: "Spot", kind: "spot", az: 15, el: 65, dist: 5, intensity: 70, color: "#fff6ea", angle: 0.42, penumbra: 0.65 },
      dir("Rim", -160, 25, 1),
    ],
    env: 0.3, exposure: 1.15, tone: "agx", bg: "#1a1a1a", shadow: 0.55, shadowBlur: 1.6,
  },
  {
    id: "museum",
    name: "Soft museum",
    note: "Even, soft daylight from above with gentle shadows. True colours, calm.",
    ambient: 0.25, hemi: 0.55, hemiSky: "#ffffff", hemiGround: "#bfc4bf",
    lights: [dir("Key", 25, 60, 1.1), dir("Fill", -40, 20, 0.7)],
    env: 1.4, exposure: 1, tone: "neutral", bg: "#f4f4f2", shadow: 0.18, shadowBlur: 4,
  },
];

const TONES: Record<Tone, THREE.ToneMapping> = {
  aces: THREE.ACESFilmicToneMapping,
  agx: THREE.AgXToneMapping,
  neutral: THREE.NeutralToneMapping,
};

const lightPos = (l: Light): [number, number, number] => {
  const az = THREE.MathUtils.degToRad(l.az);
  const el = THREE.MathUtils.degToRad(l.el);
  return [l.dist * Math.cos(el) * Math.sin(az), l.dist * Math.sin(el), l.dist * Math.cos(el) * Math.cos(az)];
};

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

/** Tone mapping changes need a shader recompile, so materials are flagged. */
function RendererLook({ tone, exposure }: { tone: Tone; exposure: number }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const { gl, scene } = get();
    gl.toneMapping = TONES[tone];
    gl.toneMappingExposure = exposure;
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (m) (Array.isArray(m) ? m : [m]).forEach((x) => (x.needsUpdate = true));
    });
  }, [get, tone, exposure]);
  return null;
}

/** The work, 1 unit across, centred on the origin so every light aims at its middle. */
function Model({ url, facing, setup }: { url: string; facing: number; setup: Setup }) {
  const { scene } = useGLTF(url, DRACO_PATH);
  const { group, height } = useMemo(() => {
    const work = scene.clone(true);
    work.rotation.y = THREE.MathUtils.degToRad(facing);
    work.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(work);
    const size = box.getSize(new THREE.Vector3());
    work.position.sub(box.getCenter(new THREE.Vector3()));
    const g = new THREE.Group();
    g.add(work);
    const s = 1 / Math.max(size.x, size.y, size.z);
    g.scale.setScalar(s);
    return { group: g, height: size.y * s };
  }, [scene, facing]);
  return (
    <>
      <primitive object={group} />
      {setup.shadow > 0 && (
        <ContactShadows
          position={[0, -height / 2 - 0.001, 0]}
          opacity={setup.shadow}
          blur={setup.shadowBlur}
          scale={2.2}
          far={1}
          resolution={512}
        />
      )}
    </>
  );
}

function Lights({ setup }: { setup: Setup }) {
  return (
    <>
      {setup.ambient > 0 && <ambientLight intensity={setup.ambient} />}
      {setup.hemi > 0 && (
        <hemisphereLight args={[setup.hemiSky, setup.hemiGround, setup.hemi]} />
      )}
      {setup.lights.map((l, i) => {
        const p = lightPos(l);
        if (l.kind === "spot")
          return (
            <spotLight
              key={i}
              position={p}
              intensity={l.intensity}
              color={l.color}
              angle={l.angle ?? 0.5}
              penumbra={l.penumbra ?? 0.5}
              decay={2}
            />
          );
        if (l.kind === "point")
          return <pointLight key={i} position={p} intensity={l.intensity} color={l.color} decay={2} />;
        return <directionalLight key={i} position={p} intensity={l.intensity} color={l.color} />;
      })}
    </>
  );
}

function Viewer({
  url,
  facing,
  setup,
  turn,
  controls,
}: {
  url: string;
  facing: number;
  setup: Setup;
  turn: boolean;
  controls: boolean;
}) {
  return (
    <div className="h-full w-full" style={{ background: setup.bg }}>
      <Canvas dpr={[1, 1.5]} camera={{ fov: 35, position: [0, 0.15, 2.9] }} gl={{ antialias: true, alpha: true }}>
        <RendererLook tone={setup.tone} exposure={setup.exposure} />
        <Lights setup={setup} />
        <StudioEnvironment intensity={setup.env} />
        <Suspense fallback={null}>
          <Model url={url} facing={facing} setup={setup} />
        </Suspense>
        <OrbitControls
          enabled={controls}
          enablePan={false}
          enableZoom={controls}
          autoRotate={turn}
          autoRotateSpeed={1.2}
          minDistance={1.4}
          maxDistance={5}
        />
      </Canvas>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

const Slider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) => (
  <label className="grid grid-cols-[110px_1fr_48px] items-center gap-3 text-[12px] text-stone">
    <span>{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="accent-[#396046]"
    />
    <span className="text-right tabular-nums text-ink">{value}</span>
  </label>
);

const Colour = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="grid grid-cols-[110px_1fr] items-center gap-3 text-[12px] text-stone">
    <span>{label}</span>
    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-14 cursor-pointer rounded border border-rule bg-white" />
  </label>
);

const BACKGROUNDS: [string, string][] = [
  ["Setup", ""],
  ["White", "#ffffff"],
  ["Plate grey", "#f0f0f0"],
  ["Patina tint", "#edf1ee"],
  ["Warm", "#efe9e1"],
  ["Charcoal", "#2b2b2b"],
  ["Black", "#111111"],
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

interface Work {
  slug: string;
  title: string;
  artist: string;
  modelUrl: string;
  facing: number;
}

const clone = (s: Setup): Setup => JSON.parse(JSON.stringify(s));

export default function LightingLab({ works, initial }: { works: Work[]; initial: string }) {
  const [slug, setSlug] = useState(works.some((w) => w.slug === initial) ? initial : works[0]?.slug);
  const [setups, setSetups] = useState(() => SETUPS.map(clone));
  const [selected, setSelected] = useState("three-point");
  const [turn, setTurn] = useState(true);
  const [bgAll, setBgAll] = useState("");
  const [copied, setCopied] = useState(false);

  const work = works.find((w) => w.slug === slug) ?? works[0];
  const withBg = (s: Setup) => (bgAll ? { ...s, bg: bgAll } : s);
  const current = setups.find((s) => s.id === selected)!;

  const update = (patch: Partial<Setup>) =>
    setSetups((all) => all.map((s) => (s.id === selected ? { ...s, ...patch } : s)));
  const updateLight = (i: number, patch: Partial<Light>) =>
    update({ lights: current.lights.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const reset = () =>
    setSetups((all) => all.map((s) => (s.id === selected ? clone(SETUPS.find((d) => d.id === selected)!) : s)));

  const copy = async () => {
    const text = JSON.stringify({ work: work.slug, setup: current }, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy these settings:", text);
    }
  };

  if (!work) return null;

  return (
    <main className="mx-auto max-w-[1400px] px-[clamp(16px,3vw,32px)] py-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="label">Internal · Lighting lab</span>
          <h1 className="heading-caps mt-3 text-[clamp(28px,3.4vw,44px)] tracking-[0.06em]">Lighting conditions</h1>
          <p className="font-text mt-3 max-w-[70ch] text-[15px] leading-relaxed text-stone">
            The same work under six lighting setups. The first two are what the site uses today. Pick one
            to open it below, adjust it with the sliders, then use &ldquo;Copy settings&rdquo; and send them over to
            apply to the site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[12px]">
          <label className="grid gap-1 text-stone">
            Work
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="min-w-[240px] rounded-md border border-rule bg-white px-3 py-2 text-[13px] text-ink"
            >
              {works.map((w) => (
                <option key={w.slug} value={w.slug}>
                  {w.title}
                  {w.artist ? ` — ${w.artist}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-stone">
            Background (all)
            <select
              value={bgAll}
              onChange={(e) => setBgAll(e.target.value)}
              className="rounded-md border border-rule bg-white px-3 py-2 text-[13px] text-ink"
            >
              {BACKGROUNDS.map(([n, v]) => (
                <option key={n} value={v}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-5 flex items-center gap-2 text-stone">
            <input type="checkbox" checked={turn} onChange={(e) => setTurn(e.target.checked)} className="accent-[#396046]" />
            Turn
          </label>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {setups.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={`group overflow-hidden rounded-[14px] border text-left transition-[border-color,box-shadow] ${
              s.id === selected ? "border-accent shadow-[0_0_0_2px_#396046]" : "border-rule hover:border-[#cfcfcf]"
            }`}
          >
            <div className="aspect-[4/5]">
              <Viewer url={work.modelUrl} facing={work.facing} setup={withBg(s)} turn={turn} controls={false} />
            </div>
            <div className="border-t border-rule bg-white p-3">
              <p className="font-display text-[17px] leading-tight">{s.name}</p>
              <p className="mt-1 text-[12px] leading-snug text-stone">{s.note}</p>
            </div>
          </button>
        ))}
      </section>

      <section className="mt-10 grid gap-6 rounded-[18px] border border-rule bg-white p-[clamp(14px,2.4vw,28px)] lg:grid-cols-[1.3fr_1fr]">
        <div className="aspect-[4/5] overflow-hidden rounded-[12px] border border-rule lg:aspect-auto lg:min-h-[640px]">
          <Viewer url={work.modelUrl} facing={work.facing} setup={withBg(current)} turn={turn} controls />
        </div>

        <div className="grid content-start gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="label">Selected</span>
              <h2 className="font-display mt-1 text-[24px]">{current.name}</h2>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={reset} className="rounded-full border border-rule px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-stone hover:text-ink">
                Reset
              </button>
              <button type="button" onClick={copy} className="btn !px-4 !py-2">
                {copied ? "Copied" : "Copy settings"}
              </button>
            </div>
          </div>
          <p className="-mt-3 text-[12px] text-stone">Drag the large view to turn the work; scroll to zoom.</p>

          <fieldset className="grid gap-3">
            <legend className="label mb-2">Overall</legend>
            <Slider label="Brightness" value={current.exposure} min={0.4} max={2.2} step={0.05} onChange={(v) => update({ exposure: v })} />
            <Slider label="Reflections" value={current.env} min={0} max={2.5} step={0.05} onChange={(v) => update({ env: v })} />
            <Slider label="Ambient" value={current.ambient} min={0} max={3} step={0.05} onChange={(v) => update({ ambient: v })} />
            <Slider label="Sky / ground" value={current.hemi} min={0} max={2} step={0.05} onChange={(v) => update({ hemi: v })} />
            {current.hemi > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Colour label="Sky colour" value={current.hemiSky} onChange={(v) => update({ hemiSky: v })} />
                <Colour label="Ground colour" value={current.hemiGround} onChange={(v) => update({ hemiGround: v })} />
              </div>
            )}
            <label className="grid grid-cols-[110px_1fr] items-center gap-3 text-[12px] text-stone">
              <span>Tone mapping</span>
              <select value={current.tone} onChange={(e) => update({ tone: e.target.value as Tone })} className="rounded-md border border-rule bg-white px-2 py-1.5 text-[13px] text-ink">
                <option value="aces">ACES (film, punchy)</option>
                <option value="agx">AgX (soft highlights)</option>
                <option value="neutral">Neutral (true colour)</option>
              </select>
            </label>
            <Colour label="Background" value={current.bg} onChange={(v) => update({ bg: v })} />
            <Slider label="Floor shadow" value={current.shadow} min={0} max={1} step={0.01} onChange={(v) => update({ shadow: v })} />
            <Slider label="Shadow softness" value={current.shadowBlur} min={0.5} max={6} step={0.1} onChange={(v) => update({ shadowBlur: v })} />
          </fieldset>

          {current.lights.map((l, i) => (
            <fieldset key={i} className="grid gap-3 border-t border-rule pt-5">
              <legend className="label mb-2">
                {l.name} · {l.kind === "dir" ? "directional" : l.kind === "spot" ? "spotlight" : "point"}
              </legend>
              <Slider
                label="Strength"
                value={l.intensity}
                min={0}
                max={l.kind === "dir" ? 8 : 200}
                step={l.kind === "dir" ? 0.05 : 1}
                onChange={(v) => updateLight(i, { intensity: v })}
              />
              <Slider label="Around (°)" value={l.az} min={-180} max={180} step={1} onChange={(v) => updateLight(i, { az: v })} />
              <Slider label="Height (°)" value={l.el} min={-20} max={90} step={1} onChange={(v) => updateLight(i, { el: v })} />
              {l.kind === "spot" && (
                <>
                  <Slider label="Cone" value={l.angle ?? 0.5} min={0.1} max={1.2} step={0.01} onChange={(v) => updateLight(i, { angle: v })} />
                  <Slider label="Edge softness" value={l.penumbra ?? 0.5} min={0} max={1} step={0.01} onChange={(v) => updateLight(i, { penumbra: v })} />
                </>
              )}
              <Colour label="Colour" value={l.color} onChange={(v) => updateLight(i, { color: v })} />
            </fieldset>
          ))}
          <p className="text-[11px] leading-relaxed text-stone">
            Around: 0° lights the work from the front, 90° from your right, 180° from behind. Height: 0° is level
            with the work, 90° straight above.
          </p>
        </div>
      </section>
    </main>
  );
}
