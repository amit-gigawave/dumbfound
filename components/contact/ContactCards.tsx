"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle, Phone } from "lucide-react";

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-accent hover:text-accent";

/** Email (copy / write) and people to call or WhatsApp. */
export default function ContactCards({
  email,
  people,
}: {
  email: string;
  people: readonly { name: string; phone: string }[];
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="grid gap-px overflow-hidden rounded-[14px] border border-rule bg-rule">
      <div className="bg-white p-5">
        <span className="label">Write to us</span>
        <a
          href={`mailto:${email}`}
          className="mt-2 block text-[17px] transition-colors hover:text-accent"
        >
          {email}
        </a>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`mailto:${email}`} className={chip}>
            <Mail size={13} /> Email
          </a>
          <button
            type="button"
            onClick={copy}
            className={chip}
            aria-live="polite"
          >
            {copied ? (
              <Check size={13} className="text-accent" />
            ) : (
              <Copy size={13} />
            )}
            {copied ? "Copied" : "Copy address"}
          </button>
        </div>
      </div>

      {people.map((p) => {
        const digits = p.phone.replace(/\D/g, "");
        return (
          <div
            key={p.name}
            className="flex flex-wrap items-center justify-between gap-3 bg-white p-5"
          >
            <div>
              <span className="label">{p.name}</span>
              <a
                href={`tel:+${digits}`}
                className="mt-1.5 block text-[15px] transition-colors hover:text-accent"
              >
                {p.phone}
              </a>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:+${digits}`}
                className={chip}
                aria-label={`Call ${p.name}`}
              >
                <Phone size={13} /> Call
              </a>
              <a
                href={`https://wa.me/${digits}`}
                target="_blank"
                rel="noopener noreferrer"
                className={chip}
                aria-label={`WhatsApp ${p.name}`}
              >
                <MessageCircle size={13} /> WhatsApp
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
