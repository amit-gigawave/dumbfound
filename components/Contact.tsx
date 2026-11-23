"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const field =
  "w-full border-b border-rule bg-transparent py-2.5 text-[15px] caret-accent outline-none transition-colors placeholder:text-stone/60 focus:border-accent";

interface Enquiry {
  /** The artwork asked about, or "" when the visitor hasn't picked one. */
  work: string;
  name: string;
  email: string;
  message: string;
}

type Via = "mail" | "whatsapp";

const subjectOf = (e: Enquiry) =>
  `Artwork enquiry${e.work ? `: ${e.work}` : ""} — ${e.name}`;
const bodyOf = (e: Enquiry) =>
  [
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    ...(e.work ? [`Artwork: ${e.work}`] : []),
    "",
    e.message,
  ].join("\n");

const mailto = (to: string, e: Enquiry) =>
  `mailto:${to}?subject=${encodeURIComponent(subjectOf(e))}&body=${encodeURIComponent(bodyOf(e))}`;

/**
 * Gmail compose window with the enquiry pre-filled, for visitors whose
 * computer has no email app set up (mailto: then silently does nothing).
 */
const gmailLink = (to: string, e: Enquiry) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subjectOf(e))}&body=${encodeURIComponent(bodyOf(e))}`;

/** wa.me link with the enquiry pre-filled; `phone` may contain spaces and "+". */
const whatsappLink = (phone: string, e: Enquiry) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`${subjectOf(e)}\n\n${bodyOf(e)}`)}`;

/**
 * Hands the enquiry to the visitor's own email app or WhatsApp, written out
 * and ready to send. Nothing is sent from the site itself.
 */
function sendEnquiry(
  via: Via,
  to: { email: string; whatsapp: string },
  e: Enquiry,
) {
  if (via === "whatsapp")
    window.open(whatsappLink(to.whatsapp, e), "_blank", "noopener");
  else window.location.href = mailto(to.email, e);
}

/** Tick that draws itself in a circle. */
const Tick = () => {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const stroke = (delay: number) => ({
    strokeDasharray: 1,
    strokeDashoffset: drawn ? 0 : 1,
    transition: `stroke-dashoffset .7s cubic-bezier(.6,0,.2,1) ${delay}ms`,
  });
  return (
    <svg viewBox="0 0 52 52" className="h-14 w-14 text-accent" aria-hidden>
      <circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        pathLength={1}
        style={stroke(0)}
      />
      <path
        d="M15 27 l7 7 l15 -16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={stroke(450)}
      />
    </svg>
  );
};

/**
 * Artwork enquiry: which work (optional), name, email and a message, handed to
 * WhatsApp or the visitor's email app, then a confirmation. Arriving from an
 * artwork's page preselects it.
 */
export default function Contact({
  email,
  whatsapp,
  works,
  workSlug,
}: {
  email: string;
  /** Number that WhatsApp enquiries go to, e.g. "+91 98716 63259". */
  whatsapp: string;
  works: { slug: string; label: string }[];
  workSlug?: string;
}) {
  const work = works.find((w) => w.slug === workSlug);
  const [status, setStatus] = useState<"idle" | Via>("idle");
  const [last, setLast] = useState<Enquiry | null>(null);
  const [copied, setCopied] = useState(false);

  if (status !== "idle" && last) {
    const onWhatsApp = status === "whatsapp";
    return (
      <div
        // The confirmation is much shorter than the form; bring it into view.
        ref={(el) => el?.scrollIntoView({ block: "center", behavior: "smooth" })}
        className="grid justify-items-start gap-5 py-6"
        aria-live="polite"
      >
        <Tick />
        <p className="font-display text-[clamp(28px,3.4vw,38px)] leading-tight">
          Almost there.
        </p>
        <p className="font-text max-w-[46ch] text-[17px] leading-[1.75] text-stone">
          {onWhatsApp ? "WhatsApp" : "Your email app"} should now open with
          your message written out to{" "}
          <span className="text-ink">{onWhatsApp ? whatsapp : email}</span> —
          just press send. If it didn&apos;t open,{" "}
          <a
            href={onWhatsApp ? whatsappLink(whatsapp, last) : mailto(email, last)}
            target={onWhatsApp ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="text-link"
          >
            open it again
          </a>{" "}
          or write to us directly.
        </p>
        {!onWhatsApp && (
          <p className="text-[13px] text-stone">
            No email app?{" "}
            <a
              href={gmailLink(email, last)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Open in Gmail
            </a>{" "}
            or{" "}
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `To: ${email}
Subject: ${subjectOf(last)}

${bodyOf(last)}`,
                  );
                  setCopied(true);
                } catch {}
              }}
              className="text-link"
              aria-live="polite"
            >
              {copied ? "Copied" : "Copy message"}
            </button>
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-6">
          <Link href="/artworks" className="btn">
            View the artworks
          </Link>
          <Link href="/artists" className="text-link">
            Meet the artists
          </Link>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setCopied(false);
            }}
            className="text-[11px] uppercase tracking-[0.16em] text-stone transition-colors hover:text-accent"
          >
            Write another
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    // Which of the two send buttons was pressed.
    const submitter = (ev.nativeEvent as SubmitEvent).submitter;
    const via: Via =
      submitter?.getAttribute("value") === "whatsapp" ? "whatsapp" : "mail";
    const data = new FormData(ev.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const enquiry: Enquiry = {
      work: works.find((w) => w.slug === get("work"))?.label ?? "",
      name: get("name"),
      email: get("email"),
      message: get("message"),
    };
    setLast(enquiry);
    setStatus(via);
    sendEnquiry(via, { email, whatsapp }, enquiry);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      <label className="grid gap-1.5">
        <span className="label">Artwork</span>
        <select name="work" defaultValue={work?.slug ?? ""} className={field}>
          <option value="">Not sure yet, or several</option>
          {works.map((w) => (
            <option key={w.slug} value={w.slug}>
              {w.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-7 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="label">Name</span>
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="label">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="label">Message</span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="What would you like to know?"
          defaultValue={
            work ? `I would like to know more about “${work.label}”.` : ""
          }
          className={`${field} resize-y`}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-5">
        <p className="max-w-[40ch] text-[12px] leading-relaxed text-stone">
          We only use your details to reply.
        </p>
        <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <button type="submit" value="whatsapp" className="btn justify-center">
            Send on WhatsApp <span className="nudge">→</span>
          </button>
          <button type="submit" value="mail" className="btn btn-hollow justify-center">
            Send by email <span className="nudge">→</span>
          </button>
        </div>
      </div>
    </form>
  );
}
