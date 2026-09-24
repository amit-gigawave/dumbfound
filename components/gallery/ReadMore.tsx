"use client";

import { useState } from "react";

/** Reveals the rest of a biography in place. */
export default function ReadMore({ paragraphs }: { paragraphs: string[] }) {
  const [open, setOpen] = useState(false);
  if (paragraphs.length === 0) return null;

  return (
    <>
      {open &&
        paragraphs.map((p) => (
          <p key={p.slice(0, 32)} className="mt-5">
            {p}
          </p>
        ))}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-link mt-4 block font-sans"
      >
        {open ? "Read less" : "Read more"}
      </button>
    </>
  );
}
