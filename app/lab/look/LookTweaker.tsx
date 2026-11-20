"use client";

// Tune a 3D work's look on the site's own viewer: light, metalness,
// roughness, reflections, side lights, paint sheen and the light setup.
// Changes show live; "Save to site" writes them into lib/sculptures.ts
// through /api/lab/look (local dev server only).

import dynamic from "next/dynamic";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { ArtworkLook } from "@/lib/sculptures";
import { FIT_VIEWER } from "@/components/three/modelLoader";
import type { ModelPart } from "@/components/SculptureScene";

const SculptureScene = dynamic(() => import("@/components/SculptureScene"), { ssr: false });

/** sessionStorage key for the save message, kept across the reload that follows a save. */
const SAVED_KEY = "look-tweaker-saved";

const savedText = (title: string, slug: string) =>
  `Saved. ${title} now uses this look on the site. Its card picture updates when you run "npm run thumbnails -- ${slug}".`;

type Work = {
  slug: string;
  title: string;
  artist: string;
  modelUrl: string;
  thumbnail: string;
  facing: number;
  look: ArtworkLook;
};

/** The sliders. Values multiply the scan's own, except where noted. */
const SLIDERS: {
  key: "light" | "metalness" | "roughness" | "reflections" | "sideLights";
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  base: number; // the value when the setting is left out
}[] = [
  { key: "light", label: "Light", hint: "How bright the lights are. 1 is standard.", min: 0.3, max: 3, step: 0.05, base: 1 },
  { key: "metalness", label: "Metalness", hint: "× the scan's own. Lower looks more like paint, higher like polished metal.", min: 0, max: 2, step: 0.05, base: 1 },
  { key: "roughness", label: "Roughness", hint: "× the scan's own. Higher is more matte, lower is glossier.", min: 0.2, max: 3, step: 0.05, base: 1 },
  { key: "reflections", label: "Reflections", hint: "How strongly the studio shows in the surface.", min: 0, max: 3, step: 0.05, base: 1 },
  { key: "sideLights", label: "Side lights", hint: "Extra light from the left and right, for dark works. 0 is none.", min: 0, max: 2, step: 0.05, base: 0 },
];

const same = (a: ArtworkLook, b: ArtworkLook) => JSON.stringify(normal(a)) === JSON.stringify(normal(b));
/** A look without keys that equal their default, in a fixed order (for comparing and showing). */
function normal(l: ArtworkLook): ArtworkLook {
  const out: Record<string, unknown> = {};
  for (const s of SLIDERS) if (l[s.key] !== undefined && l[s.key] !== s.base) out[s.key] = l[s.key];
  for (const k of ["specular", "rig", "cardLight", "selfShadow", "cardZoom", "cardShift", "cardLift"] as const)
    if (l[k] !== undefined) out[k] = l[k];
  // Parts with at least one setting, by name, each as metalness then roughness.
  const parts: Record<string, { metalness?: number; roughness?: number }> = {};
  for (const name of Object.keys(l.parts ?? {}).sort()) {
    const p = l.parts![name];
    const set = {
      ...(p.metalness !== undefined && { metalness: p.metalness }),
      ...(p.roughness !== undefined && { roughness: p.roughness }),
    };
    if (Object.keys(set).length) parts[name] = set;
  }
  if (Object.keys(parts).length) out.parts = parts;
  return out as ArtworkLook;
}
const asLine = (l: ArtworkLook) => {
  const n = normal(l) as Record<string, unknown>;
  const parts = Object.entries(n).map(([k, v]) => {
    if (k === "parts") {
      const each = Object.entries(v as Record<string, Record<string, number>>).map(
        ([name, p]) => `${JSON.stringify(name)}: { ${Object.entries(p).map(([pk, pv]) => `${pk}: ${pv}`).join(", ")} }`,
      );
      return `parts: { ${each.join(", ")} }`;
    }
    return `${k}: ${typeof v === "string" ? JSON.stringify(v) : v}`;
  });
  return `look: ${parts.length ? `{ ${parts.join(", ")} }` : "{}"},`;
};

/** Point count in a short form: 30k, 1.4M. */
const points = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M points` : n >= 1e3 ? `${Math.round(n / 1e3)}k points` : `${n} points`;

export default function LookTweaker({
  works,
  initial,
  canSave,
}: {
  works: Work[];
  initial?: string;
  canSave: boolean;
}) {
  const [slug, setSlug] = useState(works.some((w) => w.slug === initial) ? initial! : works[0]?.slug);
  const index = Math.max(0, works.findIndex((w) => w.slug === slug));
  const work = works[index];
  // The saved look (from the catalogue; it updates after a save), and the one being tuned.
  const saved = work.look;
  const [look, setLook] = useState<ArtworkLook>(saved);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  // The model's parts (reported by the viewer), the one being tuned (null is
  // the whole work) and the one tinted to show where it is.
  const [parts, setParts] = useState<ModelPart[]>([]);
  const [part, setPart] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string>();
  useEffect(() => {
    if (!highlight) return;
    const t = setTimeout(() => setHighlight(undefined), 1200);
    return () => clearTimeout(t);
  }, [highlight]);
  const choosePart = (name: string | null) => {
    setPart(name);
    setHighlight(name ?? undefined);
  };
  const setPartValue = (key: "metalness" | "roughness", value: number | undefined) => {
    if (!part) return;
    const current = { ...(look.parts?.[part] ?? {}), [key]: value };
    if (value === undefined) delete current[key];
    const next = { ...(look.parts ?? {}), [part]: current };
    if (!Object.keys(current).length) delete next[part];
    set({ parts: Object.keys(next).length ? next : undefined });
  };
  const clearPart = () => {
    if (!part) return;
    const next = { ...(look.parts ?? {}) };
    delete next[part];
    set({ parts: Object.keys(next).length ? next : undefined });
  };
  // The viewer follows the sliders a beat behind, so dragging stays smooth.
  const shown = useDeferredValue(look);

  // Saving rewrites lib/sculptures.ts, and the dev server then reloads this
  // page. The message is kept for that reload so it isn't lost.
  useEffect(() => {
    try {
      const kept = sessionStorage.getItem(SAVED_KEY);
      if (!kept) return;
      // Kept before sending, as the reload (sometimes two) can come before the
      // server's reply: the save went through if the catalogue now holds that
      // look. Shown for a minute, or until the next change.
      const { slug: s, sent, at } = JSON.parse(kept);
      if (s !== slug || Date.now() - at > 60_000) return sessionStorage.removeItem(SAVED_KEY);
      setStatus(
        same(sent, saved)
          ? { kind: "ok", text: savedText(work.title, slug) }
          : { kind: "error", text: "The last save didn't go through. Try Save to site again." },
      );
    } catch {}
    // Only on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [bg, setBg] = useState<string | null>(null);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const changed = !same(look, saved);

  // A different work (or a fresh save) starts from its saved look.
  const [seen, setSeen] = useState(`${slug}|${JSON.stringify(saved)}`);
  if (seen !== `${slug}|${JSON.stringify(saved)}`) {
    if (!seen.startsWith(`${slug}|`)) {
      setParts([]);
      setPart(null);
    }
    setSeen(`${slug}|${JSON.stringify(saved)}`);
    setLook(saved);
  }

  // Keep the chosen work in the address, so a reload (after a save) returns to it.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("work", slug);
    window.history.replaceState(window.history.state, "", url);
  }, [slug]);

  const go = useCallback(
    (i: number) => {
      if (changed && !window.confirm("You have unsaved changes on this work. Leave them?")) return;
      setStatus(null);
      setSlug(works[(i + works.length) % works.length].slug);
    },
    [changed, works],
  );

  // ← and → step through the works (not while a slider or menu has the focus,
  // where the arrow keys move that control instead).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if ((e.target as HTMLElement | null)?.closest("input, select, textarea")) return;
      e.preventDefault();
      go(index + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  // Keep the current work's picture in view in the strip.
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    strip.current
      ?.querySelector<HTMLElement>(`[data-slug="${slug}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [slug]);

  const forgetSave = () => {
    try {
      sessionStorage.removeItem(SAVED_KEY);
    } catch {}
  };

  const set = (patch: Partial<ArtworkLook>) => {
    forgetSave();
    setStatus(null);
    setLook((l) => ({ ...l, ...patch }));
  };

  const save = async () => {
    setStatus(null);
    setSaving(true);
    try {
      sessionStorage.setItem(SAVED_KEY, JSON.stringify({ slug, sent: normal(look), at: Date.now() }));
    } catch {}
    try {
      const res = await fetch("/api/lab/look", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, look: normal(look) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Saving failed (error ${res.status}). Check the dev server is running.`);
      setStatus({ kind: "ok", text: savedText(work.title, slug) });
    } catch (e) {
      try {
        sessionStorage.removeItem(SAVED_KEY);
      } catch {}
      const msg = (e as Error).message;
      setStatus({
        kind: "error",
        text: msg === "Failed to fetch" ? "Couldn't reach the dev server. Check it's running, then save again." : msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    const text = asLine(look);
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ kind: "ok", text: `Copied: ${text}` });
    } catch {
      setStatus({ kind: "ok", text });
    }
  };

  // The viewer is remounted per work; the look itself updates live.
  const viewer = useMemo(
    () => ({ url: work.modelUrl, facing: work.facing }),
    [work.modelUrl, work.facing],
  );

  return (
    <main className="mx-auto max-w-[1280px] px-[clamp(16px,3vw,32px)] pb-16 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display mr-2 text-[26px] leading-none">Look tweaker</h1>
        <button type="button" onClick={() => go(index - 1)} aria-label="Previous work" className="grid h-9 w-9 place-items-center rounded-full border border-rule bg-white hover:border-ink">
          <ChevronLeft size={16} />
        </button>
        <select
          value={slug}
          onChange={(e) => go(works.findIndex((w) => w.slug === e.target.value))}
          className="h-9 min-w-0 max-w-[26rem] flex-1 rounded-full border border-rule bg-white px-4 text-[14px]"
          aria-label="Work"
        >
          {works.map((w) => (
            <option key={w.slug} value={w.slug}>
              {w.title} · {w.artist}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => go(index + 1)} aria-label="Next work" className="grid h-9 w-9 place-items-center rounded-full border border-rule bg-white hover:border-ink">
          <ChevronRight size={16} />
        </button>
        <span className="text-[13px] tabular-nums text-stone">
          {index + 1} of {works.length} · ← → to switch
        </span>
      </div>

      {/* Every work, to switch with one click. */}
      <div
        ref={strip}
        role="listbox"
        aria-label="All works"
        className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]"
      >
        {works.map((w, i) => {
          const on = w.slug === slug;
          return (
            <button
              key={w.slug}
              type="button"
              role="option"
              aria-selected={on}
              data-slug={w.slug}
              onClick={() => go(i)}
              title={`${w.title} · ${w.artist}`}
              className={`relative h-[84px] w-[68px] shrink-0 overflow-hidden rounded-[10px] border bg-white transition-[border-color,box-shadow] ${
                on
                  ? "border-accent shadow-[0_0_0_2px_#396046]"
                  : "border-rule hover:border-ink"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={w.thumbnail} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
              {on && changed && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#b4532a]" aria-label="Not saved" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-6 min-[900px]:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        {/* The site's own artwork viewer, with the look being tuned. */}
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-rule transition-colors duration-500"
          style={{ backgroundColor: bg ?? "#4b4b4b" }}
        >
          <SculptureScene
            key={viewer.url}
            url={viewer.url}
            interactive
            fit={FIT_VIEWER}
            facing={viewer.facing}
            look={shown}
            reveal={false}
            controlsRef={controls}
            onBackground={setBg}
            onParts={setParts}
            highlight={highlight}
          />
          <button
            type="button"
            onClick={() => controls.current?.reset()}
            aria-label="Return to the front view"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md bg-white/85 text-ink hover:bg-white"
          >
            <RotateCcw size={15} />
          </button>
          {changed && (
            <span className="absolute left-3 top-3 rounded-full bg-[#b4532a] px-2.5 py-1 text-[12px] text-white">
              Not saved
            </span>
          )}
        </div>

        <section aria-label="Look settings" className="min-[900px]:sticky min-[900px]:top-[100px] min-[900px]:self-start">
          <p className="text-[13px] text-stone">{work.artist}</p>
          <h2 className="font-display text-[24px] leading-tight">{work.title}</h2>

          <div className="mt-5 space-y-5">
            {SLIDERS.map((s) => {
              const v = look[s.key] ?? s.base;
              return (
                <label key={s.key} className="block">
                  <span className="flex items-baseline justify-between text-[14px]">
                    <span>{s.label}</span>
                    <span className="tabular-nums text-ink">
                      {v.toFixed(2)}
                      {(saved[s.key] ?? s.base) !== v && (
                        <span className="ml-2 text-[12px] text-stone">was {(saved[s.key] ?? s.base).toFixed(2)}</span>
                      )}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={v}
                    onChange={(e) => set({ [s.key]: Number(e.target.value) })}
                    className="mt-1.5 w-full accent-[#396046]"
                  />
                  <span className="block text-[12px] leading-snug text-stone">{s.hint}</span>
                </label>
              );
            })}

            {/* Paint sheen sets (not multiplies) the scan's own; off leaves it as exported. */}
            <div>
              <label className="flex items-center justify-between text-[14px]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={look.specular !== undefined}
                    onChange={(e) => set({ specular: e.target.checked ? 1 : undefined })}
                    className="accent-[#396046]"
                  />
                  Paint sheen
                </span>
                <span className="tabular-nums text-ink">
                  {look.specular !== undefined ? look.specular.toFixed(2) : "scan's own"}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                disabled={look.specular === undefined}
                value={look.specular ?? 1}
                onChange={(e) => set({ specular: Number(e.target.value) })}
                className="mt-1.5 w-full accent-[#396046] disabled:opacity-40"
                aria-label="Paint sheen"
              />
              <span className="block text-[12px] leading-snug text-stone">
                Some scans come with no sheen at all, which leaves dark paint flat. 1 is ordinary paint.
              </span>
            </div>

            <label className="flex items-center justify-between text-[14px]">
              <span>Light setup</span>
              <select
                value={look.rig ?? ""}
                onChange={(e) => set({ rig: (e.target.value || undefined) as ArtworkLook["rig"] })}
                className="h-8 rounded-full border border-rule bg-white px-3 text-[13px]"
              >
                <option value="">Natural soft (standard)</option>
                <option value="previous">Previous studio light</option>
              </select>
            </label>
          </div>

          {/* Parts: a model made of several surfaces can set each one's
              metalness and roughness on its own. */}
          {parts.length > 1 && (
            <div className="mt-6 border-t border-rule pt-5">
              <p className="text-[14px]">Parts</p>
              <p className="mt-1 text-[12px] leading-snug text-stone">
                This model has {parts.length} surfaces. Pick one to set it on its own; it lights up green in the
                viewer. The sliders above still apply to every part you haven&rsquo;t set here.
              </p>
              <div role="radiogroup" aria-label="Part" className="mt-3 flex flex-wrap gap-1.5">
                {[null, ...parts.map((p) => p.name)].map((name) => {
                  const on = part === name;
                  const info = parts.find((p) => p.name === name);
                  const tuned = name !== null && look.parts?.[name] !== undefined;
                  return (
                    <button
                      key={name ?? "whole"}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => choosePart(name)}
                      title={info ? points(info.points) : undefined}
                      className={`relative rounded-full border px-3 py-1.5 text-[13px] ${
                        on ? "border-ink bg-ink text-white" : "border-rule bg-white hover:border-ink"
                      }`}
                    >
                      {name ?? "Whole work"}
                      {info && <span className={`ml-1.5 text-[11px] ${on ? "text-white/70" : "text-stone"}`}>{points(info.points)}</span>}
                      {tuned && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" aria-label="Set on its own" />}
                    </button>
                  );
                })}
              </div>

              {part && (() => {
                const info = parts.find((p) => p.name === part);
                const own = look.parts?.[part] ?? {};
                return (
                  <div className="mt-4 space-y-5">
                    {(["metalness", "roughness"] as const).map((key) => {
                      const scan = info?.[key] ?? 0;
                      const v = own[key];
                      return (
                        <label key={key} className="block">
                          <span className="flex items-baseline justify-between text-[14px]">
                            <span>{key === "metalness" ? "Metalness" : "Roughness"} of {part}</span>
                            <span className="tabular-nums text-ink">
                              {v !== undefined ? v.toFixed(2) : `scan's own ${scan.toFixed(2)}`}
                            </span>
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={v ?? scan}
                            onChange={(e) => setPartValue(key, Number(e.target.value))}
                            className="mt-1.5 w-full accent-[#396046]"
                          />
                          <span className="block text-[12px] leading-snug text-stone">
                            {key === "metalness"
                              ? "Sets this part's metalness: 0 is paint or stone, 1 is metal."
                              : "Sets this part's roughness: 0 is glossy, 1 is fully matte."}
                          </span>
                        </label>
                      );
                    })}
                    {Object.keys(own).length > 0 && (
                      <button
                        type="button"
                        onClick={clearPart}
                        className="rounded-full border border-rule bg-white px-3 py-1.5 text-[13px] hover:border-ink"
                      >
                        Follow the whole-work sliders
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!canSave || !changed || saving}
              className="btn !px-5 !py-2 disabled:cursor-not-allowed disabled:opacity-40"
              title={canSave ? undefined : "Saving only works on the local dev server"}
            >
              {saving ? "Saving…" : "Save to site"}
            </button>
            <button type="button" onClick={() => { setStatus(null); setLook(saved); }} disabled={!changed} className="rounded-full border border-rule bg-white px-4 py-2 text-[14px] hover:border-ink disabled:opacity-40">
              Reset to saved
            </button>
            <button type="button" onClick={() => { setStatus(null); setLook({}); }} className="rounded-full border border-rule bg-white px-4 py-2 text-[14px] hover:border-ink">
              Original scan
            </button>
            <button type="button" onClick={copy} className="rounded-full border border-rule bg-white px-4 py-2 text-[14px] hover:border-ink">
              Copy
            </button>
          </div>

          {status && (
            <p
              role="status"
              className={`mt-3 break-words text-[13px] ${status.kind === "error" ? "text-[#b4532a]" : "text-accent"}`}
            >
              {status.text}
            </p>
          )}

          <p className="mt-6 border-t border-rule pt-4 font-mono text-[12px] leading-relaxed text-stone">
            {asLine(look)}
          </p>
          <p className="mt-2 text-[12px] leading-snug text-stone">
            Every work also gets the site-wide shine (roughness × 0.75, reflections × 1.6), as on the site. Card-only
            settings (card light, zoom, shift, lift) are kept as they are.
          </p>
        </section>
      </div>
    </main>
  );
}
