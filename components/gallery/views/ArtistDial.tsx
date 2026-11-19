"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Ways to pick one artist (or all of them) for True scale. Every variant takes
 * the same options and reports the chosen index; /lab/dials shows them side
 * by side so one can be chosen for the site.
 */
export type DialVariant =
  | "rotary"
  | "rotary-gallery"
  | "rotary-orbit"
  | "rotary-bronze"
  | "rotary-inline"
  | "knob"
  | "ring"
  | "drum"
  | "tuner"
  | "float";

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

/**
 * How the turning dial looks. Every skin works the same way (the place at
 * the top is the choice; drag to turn, or click a face); only the drawing
 * differs. Compared side by side on /lab/dials?dial=compare.
 */
export type RotarySkin = "disc" | "gallery" | "orbit" | "bronze";

/** Each skin's geometry (px, before scaling). The faces turn round (cx, cy). */
type Geo = {
  W: number;
  H: number;
  cx: number;
  cy: number;
  /** Where the faces sit, from the centre. */
  RING: number;
  /** A face, and how much larger the chosen one (at the top) is. */
  PIC: number;
  TOP: number;
  /** The turning plate under the faces (0: none). */
  DISC: number;
  /** The fixed label in the middle (0: none). */
  HUB: number;
  /** Where each surname goes: outside the circle, under its face, or none. */
  label: "outside" | "below" | "none";
};
const GEO: Record<RotarySkin, Geo> = {
  disc: { W: 524, H: 412, cx: 262, cy: 206, RING: 124, PIC: 54, TOP: 1.3, DISC: 168, HUB: 74, label: "outside" },
  bronze: { W: 524, H: 412, cx: 262, cy: 206, RING: 124, PIC: 54, TOP: 1.3, DISC: 168, HUB: 74, label: "outside" },
  gallery: { W: 500, H: 470, cx: 250, cy: 232, RING: 168, PIC: 62, TOP: 1.45, DISC: 0, HUB: 0, label: "below" },
  orbit: { W: 620, H: 300, cx: 310, cy: 330, RING: 250, PIC: 70, TOP: 1.4, DISC: 0, HUB: 0, label: "none" },
};
/** Skins drawn on a light card (the others float over a dark veil). */
const ON_CARD: Record<RotarySkin, boolean> = { disc: false, bronze: false, gallery: true, orbit: true };

/** One easing for the turn, so the disc, faces and names move together. */
const TURN = "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)";
const ACCENT = "#396046";
const BRONZE_RIM =
  "conic-gradient(from 210deg, #6b4f2a, #c9a56a 15%, #7d5f35 30%, #e6cc95 45%, #6b4f2a 60%, #b38c55 78%, #6b4f2a)";

/**
 * The dial itself. The faces turn round a centre; the place at the top
 * holds the choice. Drag anywhere to turn (it settles with the nearest face
 * at the top), or click a face to turn it there.
 */
function RotaryDial({
  options,
  value,
  onChoose,
  active = true,
  skin = "disc",
  centerAll = false,
}: {
  options: DialOption[];
  value: number;
  onChoose: (i: number) => void;
  /** Whether it can take keyboard focus (false while a popup is shut). */
  active?: boolean;
  skin?: RotarySkin;
  /**
   * The first option ("All artists") becomes a button in the middle instead
   * of a face on the wheel, which then carries only the artists. While it's
   * chosen, no face is at the top.
   */
  centerAll?: boolean;
}) {
  const g = GEO[skin];
  const dark = !ON_CARD[skin]; // text colours: light over the dark veil
  const total = options.length;
  // The faces on the wheel, and the wheel position of the choice (null: All, in the middle).
  const off = centerAll ? 1 : 0;
  const wheel = centerAll ? options.slice(1) : options;
  const wv = centerAll ? (value === 0 ? null : value - 1) : value;
  const count = wheel.length;
  const seg = 360 / count;
  const [hoverI, setHoverI] = useState<number | null>(null);

  // The turn: face i sits at i·seg + rot degrees (0 = the top). Kept
  // continuous, so going from the last artist to the first turns one step on
  // rather than all the way back round. Choosing All leaves the wheel where it is.
  const [rot, setRot] = useState(-(wv ?? 0) * seg);
  const [seen, setSeen] = useState(wv);
  if (seen !== wv) {
    setSeen(wv);
    if (wv !== null)
      setRot((cur) => cur + ((((-wv * seg - cur) % 360) + 540) % 360) - 180);
  }
  const [dragRot, setDragRot] = useState<number | null>(null);
  const drag = useRef<{
    a: number;
    rot: number;
    moved: boolean;
    target: number | null;
  } | null>(null);
  const atTop = (r: number) => wrap(Math.round(-r / seg), count);

  // The angle of the pointer round the dial's own centre (not the box's: the
  // orbit's centre sits below its visible arc).
  const area = useRef<HTMLDivElement>(null);
  const pointerAngle = (x: number, y: number) => {
    const r = area.current!.getBoundingClientRect();
    const k = r.width / g.W; // the dial may be drawn scaled
    return (Math.atan2(x - (r.left + g.cx * k), -(y - (r.top + g.cy * k))) * 180) / Math.PI;
  };
  useWheelStep(area, (d) => onChoose(wrap(value + d, total)));

  const turn = dragRot ?? rot;
  // The face at the top (none while All, in the middle, is the choice).
  const top = dragRot !== null ? atTop(dragRot) : wv;
  const shown =
    hoverI !== null ? wheel[hoverI] : top !== null ? wheel[top] : options[0];
  const ease = dragRot === null ? TURN : "none";
  const big = g.PIC * g.TOP;

  // The name and count of the chosen (or pointed-at) artist. With All in the
  // middle, its button names it, so the caption gives the totals instead.
  const caption = (nameCls: string, countCls: string) =>
    centerAll && shown?.slug === null ? (
      <>
        <p className={`font-display leading-[1.12] tabular-nums ${nameCls}`}>
          {shown.n} works
        </p>
        <p className={`mt-1 ${countCls}`}>by {count} artists</p>
      </>
    ) : (
      <>
        <p className={`font-display leading-[1.12] [text-wrap:balance] ${nameCls}`}>{shown?.name}</p>
        <p className={`mt-1 tabular-nums ${countCls}`}>
          {shown?.n} {shown?.n === 1 ? "work" : "works"}
        </p>
      </>
    );

  return (
    <div
      ref={area}
      role="slider"
      tabIndex={active ? 0 : -1}
      aria-label="Choose an artist: turn the dial, or pick a face"
      aria-valuemin={0}
      aria-valuemax={total - 1}
      aria-valuenow={value}
      aria-valuetext={`${options[value]?.name}, ${options[value]?.n} works`}
      onKeyDown={keyStep((d) => onChoose(wrap(value + d, total)), onChoose, total - 1)}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        // The All button in the middle is an ordinary button, not part of the turn.
        if ((e.target as HTMLElement).closest("[data-all]")) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const hit = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
        drag.current = {
          a: pointerAngle(e.clientX, e.clientY),
          rot,
          moved: false,
          target: hit ? Number(hit.dataset.i) : null,
        };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        let da = pointerAngle(e.clientX, e.clientY) - d.a;
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
          onChoose(atTop(snapped) + off);
        } else if (d.target !== null) onChoose(d.target + off);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragRot(null);
      }}
      className={`relative cursor-grab touch-none select-none rounded-[28px] outline-none active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 ${
        dark ? "focus-visible:outline-white/70" : "focus-visible:outline-[#22201c]/50"
      } ${skin === "orbit" ? "overflow-hidden" : ""}`}
      style={{ width: g.W, height: g.H }}
    >
      {/* Behind the faces, fixed: the gallery's hairline track, the orbit's pool of light. */}
      {skin === "gallery" && (
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-full border border-[#22201c]/12"
          style={{ left: g.cx - g.RING, top: g.cy - g.RING, width: g.RING * 2, height: g.RING * 2 }}
        />
      )}
      {skin === "orbit" && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute rounded-full border border-[#22201c]/10"
            style={{ left: g.cx - g.RING, top: g.cy - g.RING, width: g.RING * 2, height: g.RING * 2 }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),rgba(255,255,255,0))]"
            style={{ left: g.cx - 120, top: g.cy - g.RING - 120, width: 240, height: 240 }}
          />
        </>
      )}

      {/* The turning part: a plate (disc, bronze) or just the faces. Each face
          and name turns back to stay upright. */}
      <div
        className="absolute rounded-full motion-reduce:!transition-none"
        style={{
          left: g.cx - (g.DISC || g.RING),
          top: g.cy - (g.DISC || g.RING),
          width: (g.DISC || g.RING) * 2,
          height: (g.DISC || g.RING) * 2,
          transform: `rotate(${turn}deg)`,
          transition: ease,
          ...(skin === "disc" && {
            background:
              "repeating-radial-gradient(circle at 50% 50%, rgba(34,32,28,0.035) 0 1px, transparent 1px 5px), radial-gradient(circle at 50% 35%, #fdfcf9, #f1eee7 70%, #e8e3d9)",
            boxShadow:
              "0 30px 60px -24px rgba(28,22,14,0.55), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -10px 24px -14px rgba(60,45,25,0.25)",
          }),
          ...(skin === "bronze" && {
            background:
              "radial-gradient(circle at 50% 50%, #2a2520 0 62%, transparent 62.5%), repeating-radial-gradient(circle at 50% 50%, rgba(255,235,200,0.03) 0 1px, transparent 1px 6px), radial-gradient(circle at 40% 30%, #3b342c, #1c1915 75%)",
            boxShadow: "0 0 0 5px #8a6a3f, 0 0 0 6px #e6cc95, 0 40px 80px -30px rgba(0,0,0,0.8)",
          }),
        }}
      >
        {wheel.map((o, i) => {
          const R0 = g.DISC || g.RING;
          const p = onCircle(R0, R0, g.RING, i * seg);
          const on = top !== null && i === top;
          const hot = i === hoverI;
          // Where this face is on screen now (0 = top), for names and the orbit's fade.
          const now = i * seg + turn;
          const a = (now * Math.PI) / 180;
          const sx = Math.sin(a);
          const cy = -Math.cos(a);
          // The orbit's faces shrink and fade as they turn away from the top
          // (up: 1 at the top, 0 at the sides, below 0 under the centre).
          const up = Math.cos(a);
          const orbitScale = skin === "orbit" ? 0.62 + 0.38 * Math.max(0, up) ** 1.2 : 1;
          const orbitFade = skin === "orbit" ? Math.max(0, Math.min(1, (up - 0.2) / 0.3)) : 1;
          const scale = (on ? g.TOP : hot ? 1.08 : 1) * (on ? 1 : orbitScale);
          const ring =
            skin === "bronze"
              ? { background: on ? BRONZE_RIM : "#8a6a3f", padding: on ? 3 : 2 }
              : skin === "gallery"
                ? { background: on ? ACCENT : "#ffffff", padding: 3 }
                : skin === "orbit"
                  ? { background: on ? "#22201c" : "#ffffff", padding: 3 }
                  : { background: "#ffffff", padding: 3 };
          return (
            <div
              key={o.slug ?? "all"}
              className="absolute motion-reduce:!transition-none"
              style={{ left: p.left, top: p.top, transform: `rotate(${-turn}deg)`, transition: ease }}
            >
              <button
                type="button"
                data-i={i}
                tabIndex={active && orbitFade > 0 ? 0 : -1}
                aria-label={`${o.name}, ${o.n} works`}
                aria-pressed={i + off === value}
                // Pointer picks are handled by the dial (it holds the pointer);
                // this is Enter / Space.
                onClick={(e) => e.detail === 0 && onChoose(i + off)}
                onMouseEnter={() => setHoverI(i)}
                onMouseLeave={() => setHoverI(null)}
                onFocus={() => setHoverI(i)}
                onBlur={() => setHoverI(null)}
                className={`pointer-events-auto absolute rounded-full transition-[transform,opacity,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${
                  dark ? "focus-visible:outline-white" : "focus-visible:outline-[#22201c]"
                } ${
                  on
                    ? "shadow-[0_12px_26px_-10px_rgba(28,22,14,0.6)]"
                    : "shadow-[0_4px_10px_-4px_rgba(28,22,14,0.45)]"
                }`}
                style={{
                  left: -g.PIC / 2,
                  top: -g.PIC / 2,
                  width: g.PIC,
                  height: g.PIC,
                  transform: `scale(${scale})`,
                  opacity: orbitFade,
                  pointerEvents: orbitFade > 0.2 ? "auto" : "none",
                  ...ring,
                }}
              >
                <Face o={o} mono={skin === "disc" && !(on || hot)} />
              </button>
              {g.label !== "none" && (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-0 top-0 whitespace-nowrap motion-reduce:!transition-none ${
                    skin === "bronze"
                      ? `text-[13px] ${on ? "text-[#f3e2b8]" : "text-[#e6cc95]/75"}`
                      : skin === "gallery"
                        ? `text-[12.5px] ${hot ? "text-[#22201c]" : "text-[#6f6a5f]"}`
                        : `text-[13px] ${on ? "font-medium text-white" : "text-white/70"}`
                  } ${on && g.label === "below" ? "opacity-0" : "opacity-100"}`}
                  style={
                    g.label === "below"
                      ? {
                          transform: `translate(-50%, ${g.PIC / 2 + 8}px)`,
                          transition: "opacity 200ms",
                        }
                      : {
                          transform: `translate(${Math.round(-50 + sx * 50)}%, ${Math.round(-50 + cy * 50)}%) translate(${Math.round(sx * ((g.DISC || g.RING) + 14 - g.RING))}px, ${Math.round(cy * ((g.DISC || g.RING) + 14 - g.RING))}px)`,
                          transition: ease,
                        }
                  }
                >
                  {surnameOf(o)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* The place at the top, fixed: where the chosen face turns to. */}
      {skin === "disc" && (
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-full border-2 border-[#22201c]/80"
          style={{ left: g.cx - (big + 14) / 2, top: g.cy - g.RING - (big + 14) / 2, width: big + 14, height: big + 14 }}
        />
      )}
      {skin === "bronze" && (
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-full border border-[#e6cc95]/80"
          style={{ left: g.cx - (big + 16) / 2, top: g.cy - g.RING - (big + 16) / 2, width: big + 16, height: big + 16 }}
        />
      )}
      {skin === "gallery" && (
        <span
          aria-hidden
          className="pointer-events-none absolute h-[7px] w-[7px] -translate-x-1/2 rounded-full"
          style={{ left: g.cx, top: g.cy - g.RING - big / 2 - 16, background: ACCENT }}
        />
      )}

      {/* Naming the choice (or the face pointed at). */}
      {(skin === "disc" || skin === "bronze") && (
        <div
          className="pointer-events-none absolute grid place-items-center rounded-full px-5 text-center"
          style={{
            left: g.cx - g.HUB,
            top: g.cy - g.HUB,
            width: g.HUB * 2,
            height: g.HUB * 2,
            ...(skin === "disc"
              ? { background: "#22201c", boxShadow: "0 8px 20px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)" }
              : {
                  background: "radial-gradient(circle at 40% 30%, #3a332a, #191612 80%)",
                  boxShadow: "0 0 0 2px #b08d57, 0 0 0 3px #3a2d1a, 0 10px 24px -10px rgba(0,0,0,0.8)",
                }),
          }}
        >
          <div>
            {caption(
              skin === "bronze" ? "text-[18px] text-[#f3e2b8]" : "text-[18px] text-white",
              skin === "bronze" ? "text-[12px] text-[#e6cc95]/70" : "text-[12px] text-white/60",
            )}
          </div>
        </div>
      )}
      {skin === "gallery" && (
        <div
          className="pointer-events-none absolute text-center"
          style={{ left: g.cx - 105, top: g.cy - 34, width: 210 }}
        >
          {caption("text-[27px] text-[#22201c]", "text-[13px] text-[#6f6a5f]")}
        </div>
      )}
      {skin === "orbit" && (
        <div
          className="pointer-events-none absolute text-center"
          style={{ left: g.cx - 160, top: g.cy - g.RING + big / 2 + 26, width: 320 }}
        >
          {caption("text-[28px] text-[#22201c]", "text-[13px] text-[#6f6a5f]")}
        </div>
      )}

      {/* All artists, in the middle: filled while it's the choice. */}
      {centerAll && (
        <button
          type="button"
          data-all
          tabIndex={active ? 0 : -1}
          aria-pressed={value === 0}
          onClick={() => onChoose(0)}
          className={`absolute -translate-x-1/2 whitespace-nowrap rounded-full px-5 py-2 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
            dark ? "focus-visible:outline-white" : "focus-visible:outline-[#22201c]"
          } ${
            value === 0
              ? dark
                ? "bg-white text-[#22201c]"
                : "bg-[#22201c] text-white"
              : dark
                ? "border border-white/50 text-white hover:bg-white/10"
                : "border border-[#22201c]/30 bg-white text-[#22201c] hover:border-[#22201c]"
          }`}
          style={
            skin === "orbit"
              ? { left: g.cx, top: g.cy - g.RING + big / 2 + 100 }
              : { left: g.cx, top: g.cy + g.HUB + 8 }
          }
        >
          All artists
        </button>
      )}
    </div>
  );
}

/**
 * A button in the page, with the chosen artist's name and face; clicking it
 * opens the dial over the page, centred on the button.
 */
function Rotary({ options, value, onChange, skin = "disc" }: Props & { skin?: RotarySkin }) {
  const g = GEO[skin];
  const card = ON_CARD[skin];
  const PAD = card ? 28 : 0; // the light card round the dial
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

  // Choosing closes the dial once it has turned, so the choice is seen to land.
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
    dialog.current?.querySelector<HTMLElement>('[role="slider"]')?.focus({ preventScroll: true });
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
      <span
        className="block h-[60px] w-[60px] shrink-0 rounded-full p-[3px] shadow-[0_12px_24px_-12px_rgba(40,25,8,0.7)] transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none"
        style={{ background: skin === "bronze" ? BRONZE_RIM : skin === "gallery" ? ACCENT : "#22201c" }}
      >
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
  const w = g.W + PAD * 2;
  const h = g.H + PAD * 2;
  const k = Math.min(1, (vw - 16) / w, (vh - 90) / h);
  const ccx = clamp(at.x, (w * k) / 2 + 8, vw - (w * k) / 2 - 8);
  const ccy = clamp(at.y, (h * k) / 2 + 8, vh - (h * k) / 2 - 56);

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
            className={`absolute inset-0 ${
              skin === "bronze"
                ? "bg-[#0f0d0a]/80 backdrop-blur-[4px]"
                : card
                  ? "bg-[#f3f2ee]/70 backdrop-blur-[6px]"
                  : "bg-[#1c1a17]/70 backdrop-blur-[4px]"
            }`}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              left: ccx - w / 2,
              top: ccy - h / 2,
              transformOrigin: "center",
              transform: `scale(${open ? k : k * 0.92})`,
            }}
          >
            <div
              className={card ? "rounded-[32px] bg-[#fbfaf7] shadow-[0_40px_90px_-30px_rgba(28,22,14,0.45),0_0_0_1px_rgba(34,32,28,0.06)]" : ""}
              style={{ padding: PAD }}
            >
              <RotaryDial options={options} value={value} onChoose={choose} active={open} skin={skin} centerAll={skin === "orbit"} />
            </div>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[13px] underline-offset-4 hover:underline focus-visible:outline-2 ${
                card
                  ? "text-[#22201c]/70 hover:text-[#22201c] focus-visible:outline-[#22201c]"
                  : "text-white/75 hover:text-white focus-visible:outline-white"
              }`}
              style={{ top: h + 6 }}
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
  skin = "disc",
}: Props & { width?: number; skin?: RotarySkin }) {
  const g = GEO[skin];
  const k = width / g.W;
  return (
    <div className="relative shrink-0" style={{ width, height: g.H * k }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${k})` }}>
        <RotaryDial options={options} value={value} onChoose={onChange} skin={skin} centerAll={skin === "orbit"} />
      </div>
    </div>
  );
}

/**
 * Every look of the turning dial, open side by side (each works on its own),
 * for choosing one on /lab/dials?dial=compare.
 */
export function RotaryCompare({ options }: { options: DialOption[] }) {
  const [picks, setPicks] = useState<Record<RotarySkin, number>>({
    disc: 0,
    gallery: 0,
    orbit: 0,
    bronze: 0,
  });
  const looks: { skin: RotarySkin; name: string; about: string }[] = [
    { skin: "gallery", name: "Gallery", about: "Light card, colour faces on a fine circle, the name large in the middle." },
    { skin: "orbit", name: "Orbit", about: "The top of a large wheel: the chosen face large, the rest turning away." },
    { skin: "bronze", name: "Bronze", about: "A dark disc with a bronze rim, gold-ringed faces, a bronze-edged centre." },
    { skin: "disc", name: "Disc (current)", about: "Pale turning plate, black-and-white faces, dark centre label." },
  ];
  return (
    <div className="grid gap-x-10 gap-y-14 px-[clamp(16px,4vw,48px)] py-12 lg:grid-cols-2">
      {looks.map(({ skin, name, about }) => (
        <section key={skin}>
          <h2 className="font-display text-[24px] leading-none">{name}</h2>
          <p className="mt-2 max-w-[48ch] text-[13px] text-stone">{about}</p>
          <div
            className={`mt-5 grid place-items-center overflow-hidden rounded-[28px] p-6 ${
              ON_CARD[skin] ? "bg-[#fbfaf7] shadow-[0_30px_70px_-34px_rgba(28,22,14,0.45),0_0_0_1px_rgba(34,32,28,0.06)]" : skin === "bronze" ? "bg-[#14120f]" : "bg-[#3a3631]"
            }`}
          >
            <RotaryInline
              skin={skin}
              width={Math.min(GEO[skin].W, 520)}
              options={options}
              value={picks[skin]}
              onChange={(i) => setPicks((p) => ({ ...p, [skin]: i }))}
            />
          </div>
        </section>
      ))}
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
    case "rotary-gallery":
      return <Rotary {...props} skin="gallery" />;
    case "rotary-orbit":
      return <Rotary {...props} skin="orbit" />;
    case "rotary-bronze":
      return <Rotary {...props} skin="bronze" />;
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
