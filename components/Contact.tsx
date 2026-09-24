"use client";

import { useState } from "react";

const TOPICS = ["A work", "An artist", "Showing my work", "Press", "Something else"] as const;

const field =
  "w-full border-b border-rule bg-transparent py-2.5 text-[15px] outline-none transition-colors placeholder:text-stone/60 focus:border-ink";

/**
 * Enquiry form. Not connected to email yet — submitting shows the thank-you
 * state only. TODO: send to the gallery inbox (e.g. a form service or API route).
 */
export default function Contact({ workTitle }: { workTitle?: string }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="border-t border-rule pt-8">
        <p className="font-display text-3xl">Thank you.</p>
        <p className="font-text mt-3 text-[17px] text-stone">
          We have your message and will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="grid gap-7"
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="label">Name</span>
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="label">Email</span>
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="label">I&apos;m writing about</span>
        <select name="topic" defaultValue={workTitle ? "A work" : TOPICS[0]} className={field}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="label">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          defaultValue={workTitle ? `I would like to know more about “${workTitle}”.` : ""}
          className={`${field} resize-y`}
        />
      </label>

      <div>
        <button
          type="submit"
          className="bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.16em] text-paper transition-colors hover:bg-accent"
        >
          Send message
        </button>
      </div>
    </form>
  );
}
