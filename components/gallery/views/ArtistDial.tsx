"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Ways to pick one artist (or all of them) for True scale. Every variant takes
 * the same options and reports the chosen index; /lab/dials shows them side
 * by side so one can be chosen for the site.
 */
export type DialVariant = "knob" | "ring" | "drum" | "tuner" | "float";

export type DialOption = { slug: string | null; name: string; n: number };

type Props = {
  options: DialOption[];
  value: number;
  onChange: (i: number) => void;
};

/** "Krishen Khanna" → "KK"; "All artists" → "All". */
export const initialsOf = (o: DialOption) =>
  o.slug === null
    ? "All"
    : o.name
        .split(/\s+/)
        .filter(Boolean)
        .map((w, i, all) => (i === 0 || i === all.length - 1 ? w[0] : ""))
        .join("")
        .toUpperCase();

/**
 * A point on a circle, rounded: server and browser can differ in the last
 * digit of sin/cos, which would break hydration.
 */
const onCircle = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return {
    left: Math.round((cx + Math.sin(a) * r) * 100) / 100,
    top: Math.round((cy - Math.cos(a) * r) * 100) / 100,
  };
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const wrap = (i: number, n: number) => ((i % n) + n) % n;

/** Pointer angle around an element's centre, in degrees: 0 = up, clockwise positive. */
const angleAround = (el: Element, x: number, y: number) => {
  const r = el.getBoundingClientRect();
  return (
    (Math.atan2(x - (r.left + r.width / 2), -(y - (r.top + r.height / 2))) *
      180) /
    Math.PI
  );
};

/**
 * The wheel over `ref` calls `step` once per notch (a native listener, so it
 * can keep the page from scrolling). A trackpad's stream of small events is
 * thinned to one step at a time.
 */
function useWheelStep(
  ref: React.RefObject<HTMLElement | null>,
  step: (d: 1 | -1) => void,
) {
  const latest = useRef(step);
  useEffect(() => {
    latest.current = step;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now - last < 180 || Math.abs(e.deltaY) < 4) return;
      last = now;
      latest.current(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref]);
}

/** Arrow keys (and Home / End) for a dial that has keyboard focus. */
const keyStep =
  (step: (d: 1 | -1) => void, go: (i: number) => void, last: number) =>
  (e: React.KeyboardEvent) => {
    const d =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (d) step(d);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(last);
    else return;
    e.preventDefault();
  };

/** The chosen (or previewed) artist's name and count, set beside a dial. */
function Readout({ o }: { o?: DialOption }) {
  return (
    <div aria-hidden className="min-w-[9.5rem] text-right">
      <p className="text-[12px] text-stone">Artist</p>
      <p className="font-display max-w-[14rem] truncate text-[clamp(17px,1.6vw,22px)] leading-tight text-ink">
        {o?.name}
      </p>
      <p className="text-[12px] tabular-nums text-stone">
        {o?.n} {o?.n === 1 ? "work" : "works"}
      </p>
    </div>
  );
}

const sliderProps = ({ options, value }: Props, label = "Choose an artist") => ({
  role: "slider" as const,
  tabIndex: 0,
  "aria-label": label,
  "aria-valuemin": 0,
  "aria-valuemax": options.length - 1,
  "aria-valuenow": value,
  "aria-valuetext": `${options[value]?.name}, ${options[value]?.n} works`,
});

/* ------------------------------------------------------------------ */
/* 1. Knob: a turning knob with a tick per artist on a 270° travel.     */
/* ------------------------------------------------------------------ */

function Knob(props: Props) {
  const { options, value, onChange } = props;
  const count = options.length;
  const SWEEP = 135;
  const BOX = 120;
  const KNOB = 72;
  const RING = 50;
  const angleOf = (i: number) =>
    count < 2 ? 0 : -SWEEP + (2 * SWEEP * i) / (count - 1);
  const nearest = (a: number) =>
    clamp(Math.round(((a + SWEEP) / (2 * SWEEP)) * (count - 1)), 0, count - 1);

  const knob = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [dragAngle, setDragAngle] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const drag = useRef<{ moved: boolean; x: number; y: number } | null>(null);
  const step = (d: 1 | -1) => onChange(wrap(value + d, count));
  useWheelStep(root, step);
  const pointer = (e: React.PointerEvent) =>
    clamp(angleAround(knob.current!, e.clientX, e.clientY), -SWEEP, SWEEP);

  return (
    <div className="flex items-center gap-4">
      <Readout o={options[preview ?? value]} />
      <div
        ref={root}
        className="relative shrink-0 touch-none select-none"
        style={{ width: BOX, height: BOX }}
      >
        {options.map((o, i) => {
          return (
            <button
              key={o.slug ?? "all"}
              type="button"
              tabIndex={-1}
              aria-label={o.name}
              title={o.name}
              onClick={() => onChange(i)}
              onMouseEnter={() => setPreview(i)}
              onMouseLeave={() => setPreview(null)}
              className="group absolute grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={onCircle(BOX / 2, BOX / 2, RING, angleOf(i))}
            >
              <span
                className={`block rounded-full transition-all duration-200 ${
                  i === value
                    ? "h-2 w-2 bg-ink"
                    : "h-1.5 w-1.5 bg-[#a9a397] group-hover:h-2 group-hover:w-2 group-hover:bg-ink/70"
                }`}
              />
            </button>
          );
        })}
        <div
          ref={knob}
          {...sliderProps(props)}
          onKeyDown={keyStep(step, onChange, count - 1)}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { moved: false, x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4)
              return;
            d.moved = true;
            setDragAngle(pointer(e));
            setPreview(nearest(pointer(e)));
          }}
          onPointerUp={(e) => {
            const d = drag.current;
            drag.current = null;
            if (!d) return;
            if (d.moved) onChange(nearest(pointer(e)));
            else step(1);
            setDragAngle(null);
            setPreview(null);
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDragAngle(null);
            setPreview(null);
          }}
          className="absolute cursor-grab rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#e6e2d8_70%)] shadow-[0_8px_18px_-8px_rgba(0,0,0,0.45),inset_0_-2px_4px_rgba(0,0,0,0.08)] outline-none ring-1 ring-[#cfc9bc] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ink"
          style={{
            width: KNOB,
            height: KNOB,
            left: (BOX - KNOB) / 2,
            top: (BOX - KNOB) / 2,
          }}
        >
          <div
            aria-hidden
            className={`absolute inset-0 ${dragAngle === null ? "transition-transform duration-300 ease-out" : ""}`}
            style={{ transform: `rotate(${dragAngle ?? angleOf(value)}deg)` }}
          >
            <span className="absolute left-1/2 top-[7px] h-[18px] w-[3px] -translate-x-1/2 rounded-full bg-ink" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Ring: a turntable of initials; the chosen one turns to the top.   */
/* ------------------------------------------------------------------ */

function Ring(props: Props) {
  const { options, value, onChange } = props;
  const count = options.length;
  const seg = 360 / count;
  const BOX = 156;
  const R = 58;

  // The disc's turn, kept continuous so going from the last to the first
  // artist turns one step on rather than spinning all the way back.
  const [rot, setRot] = useState(-value * seg);
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    setSeen(value);
    setRot((cur) => {
      const target = -value * seg;
      return cur + ((((target - cur) % 360) + 540) % 360) - 180;
    });
  }

  const disc = useRef<HTMLDivElement>(null);
  const [dragRot, setDragRot] = useState<number | null>(null);
  const drag = useRef<{
    a: number;
    rot: number;
    moved: boolean;
    target: number | null;
  } | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const step = (d: 1 | -1) => onChange(wrap(value + d, count));
  useWheelStep(disc, step);
  const at = (r: number) => wrap(Math.round(-r / seg), count);
  const turn = dragRot ?? rot;

  return (
    <div className="flex items-center gap-4">
      <Readout o={options[preview ?? (dragRot !== null ? at(dragRot) : value)]} />
      <div
        className="relative shrink-0 select-none"
        style={{ width: BOX, height: BOX }}
      >
        {/* The fixed marker at the top that the chosen artist turns under. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-ink"
        />
        <div
          ref={disc}
          {...sliderProps(props)}
          onKeyDown={keyStep(step, onChange, count - 1)}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            const hit = (e.target as HTMLElement).closest<HTMLElement>(
              "[data-i]",
            );
            drag.current = {
              a: angleAround(e.currentTarget, e.clientX, e.clientY),
              rot,
              moved: false,
              target: hit ? Number(hit.dataset.i) : null,
            };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            let da = angleAround(e.currentTarget, e.clientX, e.clientY) - d.a;
            da = ((da + 540) % 360) - 180;
            if (!d.moved && Math.abs(da) < 3) return;
            d.moved = true;
            // Unwrap so a long turn keeps going round.
            d.rot += da;
            d.a += da;
            setDragRot(d.rot);
          }}
          onPointerUp={() => {
            const d = drag.current;
            drag.current = null;
            if (!d) return;
            if (d.moved) {
              setDragRot(null);
              onChange(at(d.rot));
              // Settle exactly on the chosen artist.
              setRot(Math.round(d.rot / seg) * seg);
            } else if (d.target !== null) onChange(d.target);
            else step(1);
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDragRot(null);
          }}
          className="absolute inset-[10px] cursor-grab touch-none rounded-full bg-[radial-gradient(circle_at_40%_30%,#ffffff,#e9e5dc_75%)] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)] outline-none ring-1 ring-[#d4cec1] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ink"
        >
          <div
            aria-hidden
            className={`absolute inset-0 ${dragRot === null ? "transition-transform duration-500 ease-out" : ""}`}
            style={{ transform: `rotate(${turn}deg)` }}
          >
            {options.map((o, i) => {
              const c = (BOX - 20) / 2;
              return (
                <span
                  key={o.slug ?? "all"}
                  data-i={i}
                  title={o.name}
                  onMouseEnter={() => setPreview(i)}
                  onMouseLeave={() => setPreview(null)}
                  className={`absolute grid h-[26px] w-[26px] cursor-pointer place-items-center rounded-full text-[10px] font-medium tracking-wide transition-colors ${
                    i === value
                      ? "bg-ink text-white"
                      : "bg-white text-ink/70 ring-1 ring-[#d4cec1] hover:text-ink"
                  }`}
                  style={{
                    ...onCircle(c, c, R - 6, i * seg),
                    // Letters stay upright as the disc turns.
                    transform: `translate(-50%,-50%) rotate(${-turn}deg)`,
                  }}
                >
                  {initialsOf(o)}
                </span>
              );
            })}
          </div>
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] tabular-nums text-stone">
            {value + 1}/{count}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Drum: names on a turning drum, like a phone's date picker.        */
/* ------------------------------------------------------------------ */

function Drum(props: Props) {
  const { options, value, onChange } = props;
  const count = options.length;
  const ITEM = 30;
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<number | null>(null);
  const drag = useRef<{
    y: number;
    from: number;
    moved: boolean;
    target: number | null;
  } | null>(null);
  const step = (d: 1 | -1) => onChange(clamp(value + d, 0, count - 1));
  useWheelStep(box, step);
  const p = pos ?? value;

  return (
    <div className="flex items-center gap-3">
      <p aria-hidden className="text-[12px] text-stone">
        Artist
      </p>
      <div
        ref={box}
        {...sliderProps(props)}
        onKeyDown={keyStep(step, onChange, count - 1)}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const hit = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
          drag.current = {
            y: e.clientY,
            from: value,
            moved: false,
            target: hit ? Number(hit.dataset.i) : null,
          };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dy = e.clientY - d.y;
          if (!d.moved && Math.abs(dy) < 4) return;
          d.moved = true;
          setPos(clamp(d.from - dy / ITEM, 0, count - 1));
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (!d) return;
          if (d.moved && pos !== null) onChange(Math.round(pos));
          else if (d.target !== null) onChange(d.target);
          setPos(null);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setPos(null);
        }}
        className="relative w-[15rem] cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-white/80 shadow-[inset_0_8px_12px_-8px_rgba(0,0,0,0.18),inset_0_-8px_12px_-8px_rgba(0,0,0,0.18)] outline-none ring-1 ring-[#d4cec1] [perspective:400px] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ink"
        style={{ height: ITEM * 3 + 10 }}
      >
        {/* The band the chosen name sits in. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#efece5]"
          style={{ height: ITEM }}
        />
        {options.map((o, i) => {
          const off = i - p;
          if (Math.abs(off) > 2.5) return null;
          return (
            <div
              key={o.slug ?? "all"}
              data-i={i}
              aria-hidden
              className={`absolute inset-x-0 top-1/2 flex items-center justify-between px-5 text-[14px] ${
                pos === null ? "transition-[transform,opacity] duration-300 ease-out" : ""
              } ${Math.round(p) === i ? "text-ink" : "text-stone"}`}
              style={{
                height: ITEM,
                marginTop: -ITEM / 2,
                transform: `translateY(${off * ITEM * 0.92}px) rotateX(${-off * 24}deg)`,
                opacity: Math.max(0, 1 - Math.abs(off) * 0.38),
              }}
            >
              <span className="truncate">{o.name}</span>
              <span className="ml-2 text-[11px] tabular-nums opacity-70">
                {o.n}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Tuner: a radio band, one station per artist, and a needle.        */
/* ------------------------------------------------------------------ */

function Tuner(props: Props) {
  const { options, value, onChange } = props;
  const count = options.length;
  const band = useRef<HTMLDivElement>(null);
  const [frac, setFrac] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const dragging = useRef(false);
  const step = (d: 1 | -1) => onChange(clamp(value + d, 0, count - 1));
  useWheelStep(band, step);
  const fracOf = (i: number) => (count < 2 ? 0.5 : i / (count - 1));
  const nearest = (f: number) => clamp(Math.round(f * (count - 1)), 0, count - 1);
  const read = (e: React.PointerEvent) => {
    const r = band.current!.getBoundingClientRect();
    return clamp((e.clientX - r.left - 14) / (r.width - 28), 0, 1);
  };
  const f = frac ?? fracOf(value);
  const shown = options[preview ?? (frac !== null ? nearest(frac) : value)];

  return (
    <div className="w-[min(22rem,80vw)]">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="font-display truncate text-[clamp(17px,1.6vw,21px)] leading-tight text-ink">
          {shown?.name}
        </p>
        <p className="shrink-0 text-[12px] tabular-nums text-stone">
          {shown?.n} {shown?.n === 1 ? "work" : "works"}
        </p>
      </div>
      <div
        ref={band}
        {...sliderProps(props)}
        onKeyDown={keyStep(step, onChange, count - 1)}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          setFrac(read(e));
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFrac(read(e));
        }}
        onPointerUp={(e) => {
          if (!dragging.current) return;
          dragging.current = false;
          onChange(nearest(read(e)));
          setFrac(null);
        }}
        onPointerCancel={() => {
          dragging.current = false;
          setFrac(null);
        }}
        className="relative h-[58px] cursor-pointer touch-none select-none rounded-lg bg-[#2b2925] px-[14px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      >
        {/* Scale: fine ticks, a station mark and its initials per artist. */}
        <div className="absolute inset-x-[14px] top-2 h-3 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.28)_0_1px,transparent_1px_7px)]" />
        {options.map((o, i) => (
          <span
            key={o.slug ?? "all"}
            title={o.name}
            onMouseEnter={() => setPreview(i)}
            onMouseLeave={() => setPreview(null)}
            className={`absolute top-[22px] flex -translate-x-1/2 flex-col items-center text-[9.5px] tracking-wide ${
              i === value ? "text-[#f3c86b]" : "text-white/55"
            }`}
            style={{ left: `calc(14px + (100% - 28px) * ${fracOf(i)})` }}
          >
            <span className="mb-1 h-2 w-px bg-current" />
            {initialsOf(o)}
          </span>
        ))}
        {/* The needle. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-1 w-[2px] -translate-x-1/2 rounded-full bg-[#e5482f] shadow-[0_0_8px_rgba(229,72,47,0.8)] ${
            frac === null ? "transition-[left] duration-300 ease-out" : ""
          }`}
          style={{ left: `calc(14px + (100% - 28px) * ${f})` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Floating: a small dial you can drag anywhere; click to fan out.   */
/* ------------------------------------------------------------------ */

const FLOAT_KEY = "dial:float-at";

function Floating({ options, value, onChange }: Props) {
  const count = options.length;
  const SIZE = 60;
  const [mounted, setMounted] = useState(false);
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [hoverI, setHoverI] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number; x: number; y: number; moved: boolean } | null>(null);

  // Start where the visitor last left it, or near the top-right corner.
  useEffect(() => {
    // Client only: the portal and the saved place both need the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    let saved: { x: number; y: number } | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(FLOAT_KEY) || "null");
    } catch {}
    const w = window.innerWidth;
    const h = window.innerHeight;
    setAt(
      saved
        ? { x: clamp(saved.x, 8, w - SIZE - 8), y: clamp(saved.y, 8, h - SIZE - 8) }
        : { x: w - SIZE - 32, y: Math.min(200, h - SIZE - 8) },
    );
  }, []);

  // Close the fan on a click elsewhere, or Escape.
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  if (!mounted || !at) return null;

  // The fan opens towards the middle of the screen, so it never runs off an edge.
  const cx = at.x + SIZE / 2;
  const cy = at.y + SIZE / 2;
  const toward =
    Math.atan2(window.innerWidth / 2 - cx, -(window.innerHeight / 2 - cy)) *
    (180 / Math.PI);
  const SPREAD = 170;
  const RADIUS = 112;
  // Shut: the chosen name under the dial. Open: the name pointed at, if any.
  const label = open
    ? hoverI !== null
      ? options[hoverI]
      : undefined
    : options[value];
  // Where each fan bubble lands, kept on screen.
  const spot = (i: number) => {
    const a =
      ((toward - SPREAD / 2 + (SPREAD * i) / Math.max(1, count - 1)) *
        Math.PI) /
      180;
    const x = clamp(cx + Math.sin(a) * RADIUS, 22, window.innerWidth - 22);
    const y = clamp(cy - Math.cos(a) * RADIUS, 22, window.innerHeight - 22);
    return { x: Math.round(x - cx), y: Math.round(y - cy) };
  };

  return createPortal(
    <div
      ref={root}
      className="fixed z-50 select-none"
      style={{ left: at.x, top: at.y, width: SIZE, height: SIZE }}
    >
      {options.map((o, i) => {
        const s = spot(i);
        return (
          <button
            key={o.slug ?? "all"}
            type="button"
            aria-label={o.name}
            title={o.name}
            tabIndex={open ? 0 : -1}
            onClick={() => {
              onChange(i);
              setOpen(false);
            }}
            onMouseEnter={() => setHoverI(i)}
            onMouseLeave={() => setHoverI(null)}
            onFocus={() => setHoverI(i)}
            onBlur={() => setHoverI(null)}
            className={`absolute left-1/2 top-1/2 grid h-[34px] w-[34px] place-items-center rounded-full text-[11px] font-medium shadow-[0_6px_16px_-6px_rgba(0,0,0,0.4)] transition-[transform,opacity] duration-300 ease-out ${
              i === value ? "bg-ink text-white" : "bg-white text-ink hover:bg-[#efece5]"
            } ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
            style={{
              transform: open
                ? `translate(-50%,-50%) translate(${s.x}px,${s.y}px)`
                : "translate(-50%,-50%) scale(0.4)",
              transitionDelay: open ? `${i * 18}ms` : "0ms",
            }}
          >
            {initialsOf(o)}
          </button>
        );
      })}

      <button
        type="button"
        aria-label={`Artist: ${options[value]?.name}. Drag to move, click to choose.`}
        aria-expanded={open}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = {
            dx: e.clientX - at.x,
            dy: e.clientY - at.y,
            x: e.clientX,
            y: e.clientY,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
          d.moved = true;
          setOpen(false);
          setAt({
            x: clamp(e.clientX - d.dx, 8, window.innerWidth - SIZE - 8),
            y: clamp(e.clientY - d.dy, 8, window.innerHeight - SIZE - 8),
          });
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (!d) return;
          if (d.moved) {
            try {
              localStorage.setItem(FLOAT_KEY, JSON.stringify(at));
            } catch {}
          } else setOpen((v) => !v);
        }}
        className="relative grid h-full w-full cursor-grab touch-none place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#3a3732,#1f1d1a_75%)] text-[13px] font-medium tracking-wide text-white shadow-[0_12px_28px_-10px_rgba(0,0,0,0.6)] ring-4 ring-white/80 active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        {initialsOf(options[value])}
        {/* A small count badge. */}
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] tabular-nums text-ink shadow">
          {options[value]?.n}
        </span>
      </button>

      {/* The name, under the dial (or the one pointed at in the fan). */}
      {label && (
        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-[12px] text-ink shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)]">
          {label.name}
        </span>
      )}
    </div>,
    document.body,
  );
}

export default function ArtistDial({
  variant = "knob",
  ...props
}: Props & { variant?: DialVariant }) {
  switch (variant) {
    case "ring":
      return <Ring {...props} />;
    case "drum":
      return <Drum {...props} />;
    case "tuner":
      return <Tuner {...props} />;
    case "float":
      return <Floating {...props} />;
    default:
      return <Knob {...props} />;
  }
}
