"use client";

import { useState } from "react";

/**
 * Newsletter sign-up. Not connected to a mailing service yet — submitting only
 * shows the confirmation. TODO: post to the chosen provider.
 */
export default function NewsletterForm() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="text-sm text-stone">Thank you — you&apos;re on the list.</p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="flex w-full max-w-[360px] border-b border-ink"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="Your email address"
        className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-stone/70"
      />
      <button
        type="submit"
        className="text-[12px] uppercase tracking-[0.14em] hover:text-accent"
      >
        Subscribe
      </button>
    </form>
  );
}
