"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Ways to pick one artist (or all of them) for True scale. Every variant takes
 * the same options and reports the chosen index; /lab/dials shows them side
 * by side so one can be chosen for the site.
 */
export type DialVariant =
  "rotary" | "rotary-inline" | "knob" | "ring" | "drum" | "tuner" | "float";

export type DialOption = {
  slug: string | null;
  name: string;
  n: number;
  /** The artist's portrait under /public, if there is one. */
  portrait?: string;
};

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

const sliderProps = (
  { options, value }: Props,
  label = "Choose an artist",
) => ({
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
      <Readout
        o={options[preview ?? (dragRot !== null ? at(dragRot) : value)]}
      />
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
          const hit = (e.target as HTMLElement).closest<HTMLElement>(
            "[data-i]",
          );
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
                pos === null
                  ? "transition-[transform,opacity] duration-300 ease-out"
                  : ""
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
  const nearest = (f: number) =>
    clamp(Math.round(f * (count - 1)), 0, count - 1);
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

/**
 * A round button that floats over the page and can be dragged anywhere on
 * the screen; it remembers where it was left (per browser). A press without
 * moving (or Enter / Space) calls `onTap`; starting a drag calls `onMove`.
 * `at` is null until the browser is known (it renders in a portal).
 */
function useFab(size: number, onTap: () => void, onMove: () => void) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{
    dx: number;
    dy: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  // A drag just ended: the click that follows it is not a tap.
  const dragged = useRef(false);

  // Start where the visitor last left it, or near the top-right corner.
  useEffect(() => {
    let saved: { x: number; y: number } | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(FLOAT_KEY) || "null");
    } catch {}
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Client only: the portal and the saved place both need the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAt(
      saved
        ? {
            x: clamp(saved.x, 8, w - size - 8),
            y: clamp(saved.y, 8, h - size - 8),
          }
        : { x: w - size - 32, y: Math.min(200, h - size - 8) },
    );
  }, [size]);

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0 || !at) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = {
        dx: e.clientX - at.x,
        dy: e.clientY - at.y,
        x: e.clientX,
        y: e.clientY,
        moved: false,
      };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
      if (!d.moved) onMove();
      d.moved = true;
      setAt({
        x: clamp(e.clientX - d.dx, 8, window.innerWidth - size - 8),
        y: clamp(e.clientY - d.dy, 8, window.innerHeight - size - 8),
      });
    },
    onPointerUp: () => {
      const d = drag.current;
      drag.current = null;
      if (!d?.moved) return;
      dragged.current = true;
      try {
        localStorage.setItem(FLOAT_KEY, JSON.stringify(at));
      } catch {}
    },
    onPointerCancel: () => {
      drag.current = null;
    },
    // Opening on the click itself (not on pointer-up) matters on touch
    // screens: a tap's click arrives after pointer-up, and would otherwise
    // land on whatever the opened dial put under the finger.
    onClick: () => {
      if (dragged.current) dragged.current = false;
      else onTap();
    },
  };
  return { at, handlers };
}

function Floating({ options, value, onChange }: Props) {
  const count = options.length;
  const SIZE = 60;
  const [open, setOpen] = useState(false);
  const [hoverI, setHoverI] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const { at, handlers } = useFab(
    SIZE,
    () => setOpen((v) => !v),
    () => setOpen(false),
  );

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

  if (!at) return null;

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
              i === value
                ? "bg-ink text-white"
                : "bg-white text-ink hover:bg-[#efece5]"
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
        {...handlers}
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

/* ------------------------------------------------------------------ */
/* 6. Rotary: the artists' faces in a circle. The place at the top is   */
/*    the choice: turn the circle to bring an artist there, or click a  */
/*    face and the circle turns it to the top. As a popup (from a       */
/*    floating button) or set straight into the page.                   */
/* ------------------------------------------------------------------ */

/** "Krishen Khanna" → "Khanna", as a catalogue names an artist. */
const surnameOf = (o: DialOption) =>
  o.slug === null ? "All" : (o.name.trim().split(/\s+/).pop() ?? o.name);

/**
 * An artist's face, or a dark disc for "All". `mono` shows the photo in
 * black and white: the portraits come from many sources, and grey makes
 * them read as one set; the chosen or pointed-at face turns to colour.
 */
function Face({ o, mono = false }: { o?: DialOption; mono?: boolean }) {
  if (!o) return null;
  return o.portrait ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={o.portrait}
      alt=""
      draggable={false}
      className={`h-full w-full rounded-full object-cover transition-[filter] duration-300 ${
        mono ? "grayscale contrast-[1.05]" : ""
      }`}
    />
  ) : (
    <span className="grid h-full w-full place-items-center rounded-full bg-[#2a2620] font-display text-[13px] text-[#f6f3ec]">
      All
    </span>
  );
}

/** Rotary sizes (px, before scaling). */
const R = {
  DISC: 168, // the turning disc's radius
  RING: 124, // where the faces sit on it
  PIC: 54, // a face
  TOP: 1.3, // the chosen face, in the slot at the top, is this much larger
  HUB: 74, // the fixed label in the middle
  /** Room needed either side of the centre: names stick out at the sides. */
  EXT_X: 262,
  EXT_Y: 206,
};
/** One easing for the turn, so the disc, faces and names move together. */
const TURN = "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * The dial itself, drawn in a box 2·EXT_X × 2·EXT_Y. A disc carries the
 * artists' faces round; the slot at the top holds the choice and a fixed
 * label in the middle names it. Drag anywhere to turn the disc (it settles
 * with the nearest face in the slot), or click a face to turn it there.
 */
function RotaryDial({
  options,
  value,
  onChoose,
  active = true,
  onDark = false,
}: {
  options: DialOption[];
  value: number;
  onChoose: (i: number) => void;
  /** Whether it can take keyboard focus (false while a popup is shut). */
  active?: boolean;
  /** Set over the dark veil (the popup): the names outside the disc are light. */
  onDark?: boolean;
}) {
  const count = options.length;
  const seg = 360 / count;
  const W = R.EXT_X * 2;
  const H = R.EXT_Y * 2;
  const [hoverI, setHoverI] = useState<number | null>(null);

  // The disc's turn: face i sits at i·seg + rot degrees (0 = the slot at the
  // top). Kept continuous, so going from the last artist to the first turns
  // one step on rather than all the way back round.
  const [rot, setRot] = useState(-value * seg);
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    setSeen(value);
    setRot((cur) => cur + ((((-value * seg - cur) % 360) + 540) % 360) - 180);
  }
  const [dragRot, setDragRot] = useState<number | null>(null);
  const drag = useRef<{
    a: number;
    rot: number;
    moved: boolean;
    target: number | null;
  } | null>(null);
  const atTop = (r: number) => wrap(Math.round(-r / seg), count);

  const area = useRef<HTMLDivElement>(null);
  useWheelStep(area, (d) => onChoose(wrap(value + d, count)));

  const turn = dragRot ?? rot;
  const top = dragRot !== null ? atTop(dragRot) : value;
  const shown = options[hoverI ?? top];
  const ease = dragRot === null ? TURN : "none";
  const slot = R.PIC * R.TOP + 14;

  return (
    <div
      ref={area}
      role="slider"
      tabIndex={active ? 0 : -1}
      aria-label="Choose an artist: turn the dial, or pick a face"
      aria-valuemin={0}
      aria-valuemax={count - 1}
      aria-valuenow={value}
      aria-valuetext={`${options[value]?.name}, ${options[value]?.n} works`}
      onKeyDown={keyStep(
        (d) => onChoose(wrap(value + d, count)),
        onChoose,
        count - 1,
      )}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const hit = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
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
        if (!d.moved && Math.abs(d.rot + da - rot) < 4) return;
        d.moved = true;
        d.rot += da;
        d.a += da;
        setDragRot(d.rot);
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        if (d.moved) {
          const snapped = Math.round(d.rot / seg) * seg;
          setRot(snapped);
          setDragRot(null);
          onChoose(atTop(snapped));
        } else if (d.target !== null) onChoose(d.target);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragRot(null);
      }}
      className="relative cursor-grab touch-none select-none outline-none active:cursor-grabbing [&:focus-visible>.disc]:outline-2 [&:focus-visible>.disc]:outline-offset-4"
      style={{ width: W, height: H }}
    >
      {/* The disc: it turns, carrying the faces; each face and name turns back to stay upright. */}
      <div
        className={`disc absolute rounded-full shadow-[0_30px_60px_-24px_rgba(28,22,14,0.55),0_1px_0_rgba(255,255,255,0.6)_inset,0_-10px_24px_-14px_rgba(60,45,25,0.25)_inset] motion-reduce:!transition-none ${
          onDark ? "outline-white/70" : "outline-[#22201c]/50"
        }`}
        style={{
          left: R.EXT_X - R.DISC,
          top: R.EXT_Y - R.DISC,
          width: R.DISC * 2,
          height: R.DISC * 2,
          // A pale plate with the faintest turned grooves, so it reads as something that turns.
          background:
            "repeating-radial-gradient(circle at 50% 50%, rgba(34,32,28,0.035) 0 1px, transparent 1px 5px), radial-gradient(circle at 50% 35%, #fdfcf9, #f1eee7 70%, #e8e3d9)",
          transform: `rotate(${turn}deg)`,
          transition: ease,
        }}
      >
        {options.map((o, i) => {
          const p = onCircle(R.DISC, R.DISC, R.RING, i * seg);
          const on = i === top;
          const hot = i === hoverI;
          // Where this face is on screen now: its name sits just outside the
          // disc there, its near edge towards the face.
          const a = ((i * seg + turn) * Math.PI) / 180;
          const sx = Math.sin(a);
          const cy = -Math.cos(a);
          const out = R.DISC + 12 - R.RING;
          return (
            <div
              key={o.slug ?? "all"}
              className="absolute motion-reduce:!transition-none"
              style={{
                left: p.left,
                top: p.top,
                transform: `rotate(${-turn}deg)`,
                transition: ease,
              }}
            >
              <button
                type="button"
                data-i={i}
                tabIndex={active ? 0 : -1}
                aria-label={`${o.name}, ${o.n} works`}
                aria-pressed={i === value}
                // Pointer picks are handled by the dial (it holds the pointer);
                // this is Enter / Space.
                onClick={(e) => e.detail === 0 && onChoose(i)}
                onMouseEnter={() => setHoverI(i)}
                onMouseLeave={() => setHoverI(null)}
                onFocus={() => setHoverI(i)}
                onBlur={() => setHoverI(null)}
                className={`pointer-events-auto absolute rounded-full bg-white p-[3px] transition-[transform,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22201c] motion-reduce:transition-none ${
                  on
                    ? "shadow-[0_10px_22px_-8px_rgba(28,22,14,0.55)]"
                    : "shadow-[0_3px_8px_-3px_rgba(28,22,14,0.45),inset_0_0_0_1px_rgba(34,32,28,0.06)]"
                }`}
                style={{
                  left: -R.PIC / 2,
                  top: -R.PIC / 2,
                  width: R.PIC,
                  height: R.PIC,
                  transform: `scale(${on ? R.TOP : hot ? 1.08 : 1})`,
                }}
              >
                <Face o={o} mono={!(on || hot)} />
              </button>
              <span
                aria-hidden
                className={`pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[13px] motion-reduce:!transition-none ${
                  on
                    ? onDark
                      ? "font-medium text-white"
                      : "font-medium text-[#22201c]"
                    : onDark
                      ? "text-white/70"
                      : "text-[#6f6a5f]"
                }`}
                style={{
                  transform: `translate(${Math.round(-50 + sx * 50)}%, ${Math.round(-50 + cy * 50)}%) translate(${Math.round(sx * out)}px, ${Math.round(cy * out)}px)`,
                  transition: ease,
                }}
              >
                {surnameOf(o)}
              </span>
            </div>
          );
        })}
      </div>

      {/* The slot at the top: fixed; the chosen face turns into it. */}
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full border-2 border-[#22201c]/80"
        style={{
          left: R.EXT_X - slot / 2,
          top: R.EXT_Y - R.RING - slot / 2,
          width: slot,
          height: slot,
        }}
      />

      {/* The label in the middle: fixed, naming the choice (or the face pointed at). */}
      <div
        className="pointer-events-none absolute grid place-items-center rounded-full bg-[#22201c] px-5 text-center shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={{
          left: R.EXT_X - R.HUB,
          top: R.EXT_Y - R.HUB,
          width: R.HUB * 2,
          height: R.HUB * 2,
        }}
      >
        <div>
          <p className="font-display text-[18px] leading-[1.15] text-white [text-wrap:balance]">
            {shown?.name}
          </p>
          <p className="mt-1 text-[12px] tabular-nums text-white/60">
            {shown?.n} {shown?.n === 1 ? "work" : "works"}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * A button in the page, with the chosen artist's name and face; clicking it
 * opens the dial over a darkened page, centred on the button.
 */
function Rotary({ options, value, onChange }: Props) {
  const [open, setOpenState] = useState(false);
  // Where the button's centre was when the dial opened (the dial opens there).
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const setOpen = (v: boolean) => {
    if (v && btn.current) {
      const r = btn.current.getBoundingClientRect();
      // Centred on the face (the right end of the button).
      setAt({ x: r.right - r.height / 2, y: r.top + r.height / 2 });
      // A frame later, so a popup mounting for the first time still fades in.
      requestAnimationFrame(() => setOpenState(true));
      return;
    }
    setOpenState(v);
    if (!v) btn.current?.focus({ preventScroll: true });
  };

  // Choosing closes the dial once the disc has turned, so the choice is seen to land.
  const closer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const choose = (i: number) => {
    onChange(i);
    clearTimeout(closer.current);
    closer.current = setTimeout(() => setOpen(false), 700);
  };
  useEffect(() => () => clearTimeout(closer.current), []);

  // Escape closes; opening puts the focus on the dial.
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    dialog.current
      ?.querySelector<HTMLElement>('[role="slider"]')
      ?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);

  const chosen = options[value];
  const button = (
    <button
      ref={btn}
      type="button"
      aria-label={`Artist: ${chosen?.name}, ${chosen?.n} works. Choose another artist.`}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen(true)}
      className="group flex shrink-0 items-center gap-3 rounded-full py-1 pl-4 pr-1 text-right transition-colors hover:bg-[#22201c]/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22201c]"
    >
      <span className="min-w-0">
        <span className="block max-w-[16rem] truncate font-display text-[clamp(17px,1.6vw,21px)] leading-tight text-[#22201c]">
          {chosen?.name}
        </span>
        <span className="block text-[12px] tabular-nums text-[#6f6a5f]">
          {chosen?.n} {chosen?.n === 1 ? "work" : "works"}
          <span className="ml-2 underline decoration-[#6f6a5f]/40 underline-offset-[3px] group-hover:decoration-current">
            Change
          </span>
        </span>
      </span>
      <span className="block h-[60px] w-[60px] shrink-0 rounded-full bg-[#22201c] p-[3px] shadow-[0_12px_24px_-12px_rgba(40,25,8,0.7)] transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
        <span className="block h-full w-full rounded-full bg-white p-[2px]">
          <Face o={chosen} />
        </span>
      </span>
    </button>
  );

  // Until the dial has been opened once, there's only the button (and no
  // popup to render on the server).
  if (!at) return button;

  // The dial opens round the button, moved in and scaled down as needed to
  // stay whole on the screen.
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const k = Math.min(1, (vw - 8) / (2 * R.EXT_X), (vh - 80) / (2 * R.EXT_Y));
  const ccx = clamp(at.x, R.EXT_X * k + 4, vw - R.EXT_X * k - 4);
  const ccy = clamp(at.y, R.EXT_Y * k + 8, vh - R.EXT_Y * k - 56);

  return (
    <>
      {button}
      {createPortal(
        <div
          ref={dialog}
          role="dialog"
          aria-label="Choose an artist"
          aria-hidden={!open}
          className={`fixed inset-0 z-50 select-none transition-opacity duration-300 motion-reduce:transition-none ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-[#1c1a17]/70 backdrop-blur-[4px]"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              left: ccx - R.EXT_X,
              top: ccy - R.EXT_Y,
              transformOrigin: "center",
              transform: `scale(${open ? k : k * 0.88})`,
            }}
          >
            <RotaryDial
              options={options}
              value={value}
              onChoose={choose}
              active={open}
              onDark
            />
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[13px] text-white/75 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-white"
              style={{ top: R.EXT_Y * 2 + 4 }}
            >
              Close
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/** The dial set straight into the page, no popup: scaled to `width` px. */
function RotaryInline({
  options,
  value,
  onChange,
  width = 420,
}: Props & { width?: number }) {
  const k = width / (R.EXT_X * 2);
  return (
    <div
      className="relative shrink-0"
      style={{ width, height: R.EXT_Y * 2 * k }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `scale(${k})` }}
      >
        <RotaryDial options={options} value={value} onChoose={onChange} />
      </div>
    </div>
  );
}

export default function ArtistDial({
  variant = "rotary",
  ...props
}: Props & { variant?: DialVariant }) {
  switch (variant) {
    case "rotary":
      return <Rotary {...props} />;
    case "rotary-inline":
      return <RotaryInline {...props} />;
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
