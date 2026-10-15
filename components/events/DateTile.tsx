import type { GalleryEvent } from "@/lib/events";

/** Calendar-style date block: "12–15" over "Oct 2026". */
const DateTile = ({ e, dark }: { e: GalleryEvent; dark?: boolean }) => {
  if (!e.start || !e.end) return null;
  const s = new Date(`${e.start}T00:00:00`);
  const t = new Date(`${e.end}T00:00:00`);
  const month = (d: Date) => d.toLocaleDateString("en-GB", { month: "short" });
  const sameMonth = s.getMonth() === t.getMonth();
  return (
    <div
      className={`shrink-0 self-start justify-self-start rounded-[14px] border px-5 py-4 text-center ${
        dark ? "border-white/25" : "border-rule bg-paper"
      }`}
    >
      <div className="font-display text-[clamp(30px,3.6vw,44px)] leading-none tracking-[0.02em]">
        {sameMonth
          ? s.getDate() === t.getDate()
            ? s.getDate()
            : `${s.getDate()}–${t.getDate()}`
          : `${s.getDate()} ${month(s)} – ${t.getDate()}`}
      </div>
      <div
        className={`mt-2 text-[11px] uppercase tracking-[0.18em] ${dark ? "text-[#bdbdbd]" : "text-stone"}`}
      >
        {month(t)} {t.getFullYear()}
      </div>
    </div>
  );
};

export default DateTile;
