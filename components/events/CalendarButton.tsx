"use client";

import { CalendarPlus } from "lucide-react";

/** YYYY-MM-DD → YYYYMMDD; `addDays` for the all-day end, which iCalendar treats as exclusive. */
const ics = (iso: string, addDays = 0) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + addDays);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
};
const esc = (s: string) =>
  s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

/** Downloads an all-day calendar entry (.ics) that any calendar app can import. */
export default function CalendarButton({
  slug,
  title,
  start,
  end,
  location,
  description,
  url,
  className,
}: {
  slug: string;
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
  url: string;
  className?: string;
}) {
  const download = () => {
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sculpted India//Events//EN",
      "BEGIN:VEVENT",
      `UID:${slug}@sculptedindia.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
      `DTSTART;VALUE=DATE:${ics(start)}`,
      `DTEND;VALUE=DATE:${ics(end, 1)}`,
      `SUMMARY:${esc(title)}`,
      `LOCATION:${esc(location)}`,
      `DESCRIPTION:${esc(description)}`,
      `URL:${url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const href = URL.createObjectURL(
      new Blob([body], { type: "text/calendar" }),
    );
    const a = Object.assign(document.createElement("a"), {
      href,
      download: `${slug}.ics`,
    });
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <button type="button" onClick={download} className={className}>
      <CalendarPlus size={15} strokeWidth={1.7} /> Add to calendar
    </button>
  );
}
