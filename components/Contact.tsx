"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Field = { name: string; label: string; type?: "text" | "url" | "work" };

const TOPICS: { id: string; label: string; fields: Field[] }[] = [
  {
    id: "artwork",
    label: "An artwork",
    fields: [{ name: "work", label: "Which work?", type: "work" }],
  },
  {
    id: "exhibitions",
    label: "Exhibitions",
    fields: [
      { name: "venue", label: "Venue or organisation" },
      { name: "dates", label: "Dates, if known" },
    ],
  },
  {
    id: "collaborations",
    label: "Collaborations",
    fields: [
      { name: "organisation", label: "Organisation" },
      { name: "website", label: "Website", type: "url" },
    ],
  },
  {
    id: "patronage",
    label: "Patronage",
    fields: [{ name: "organisation", label: "Organisation, if any" }],
  },
  {
    id: "artist",
    label: "I'm an artist",
    fields: [
      { name: "portfolio", label: "Portfolio or website link", type: "url" },
      { name: "medium", label: "Your medium" },
    ],
  },
  { id: "other", label: "Something else", fields: [] },
];

const EASE = "ease-[cubic-bezier(.3,.7,.3,1)]";
const field =
  "w-full border-b border-rule bg-transparent py-2.5 text-[15px] caret-accent outline-none transition-colors placeholder:text-stone/60 focus:border-accent";

interface Enquiry {
  topic: string;
  name: string;
  email: string;
  lines: string[];
  message: string;
}

type Via = "mail" | "whatsapp";

const subjectOf = (e: Enquiry) => `Enquiry: ${e.topic} — ${e.name}`;
const bodyOf = (e: Enquiry) =>
  [`Name: ${e.name}`, `Email: ${e.email}`, ...e.lines, "", e.message].join(
    "\n",
  );

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
 * Enquiry form: topic buttons, extra fields that slide in for the chosen topic,
 * then a confirmation. Arriving from an artwork preselects "An artwork" and it.
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
  const [topic, setTopic] = useState(work ? "artwork" : "exhibitions");
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
    const t = TOPICS.find((x) => x.id === topic)!;
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const lines = t.fields
      .map((f) => {
        const v = get(`${t.id}.${f.name}`);
        const shown =
          f.type === "work"
            ? (works.find((w) => w.slug === v)?.label ?? "")
            : v;
        return shown ? `${f.label.replace(/[?,].*$/, "")}: ${shown}` : "";
      })
      .filter(Boolean);
    if (get("phone")) lines.push(`Phone: ${get("phone")}`);
    const enquiry: Enquiry = {
      topic: t.label,
      name: get("name"),
      email: get("email"),
      lines,
      message: get("message"),
    };
    setLast(enquiry);
    setStatus(via);
    sendEnquiry(via, { email, whatsapp }, enquiry);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      {/* Topics and their fields form one block, so closed groups add no spacing. */}
      <div>
        <fieldset>
          <legend className="label">I&apos;m writing about</legend>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {TOPICS.map((t) => (
              <label key={t.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="topic"
                  value={t.id}
                  checked={topic === t.id}
                  onChange={() => setTopic(t.id)}
                  className="peer sr-only"
                />
                <span
                  className={`inline-block rounded-full border px-4 py-2 text-[13px] transition-[background-color,border-color,color,transform] duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 peer-active:scale-95 ${
                    topic === t.id
                      ? "border-ink bg-ink text-paper"
                      : "border-rule text-ink hover:border-accent hover:text-accent"
                  }`}
                >
                  {t.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Extra fields for the chosen topic slide open; the rest stay closed and inert. */}
        {TOPICS.filter((t) => t.fields.length).map((t) => {
          const open = topic === t.id;
          return (
            <div
              key={t.id}
              inert={!open}
              className={`grid transition-[grid-template-rows,opacity] duration-500 ${EASE} ${
                open
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid gap-7 pt-8 sm:grid-cols-2">
                  {t.fields.map((f) => (
                    <label
                      key={f.name}
                      className={`grid gap-1.5 ${f.type === "work" ? "sm:col-span-2" : ""}`}
                    >
                      <span className="label">{f.label}</span>
                      {f.type === "work" ? (
                        <select
                          name={`${t.id}.${f.name}`}
                          defaultValue={work?.slug ?? ""}
                          className={field}
                        >
                          <option value="">Not sure yet / several</option>
                          {works.map((w) => (
                            <option key={w.slug} value={w.slug}>
                              {w.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          name={`${t.id}.${f.name}`}
                          type={f.type ?? "text"}
                          className={field}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
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
        <label className="grid gap-1.5 sm:col-span-2 lg:col-span-1">
          <span className="label">
            Phone{" "}
            <span className="normal-case tracking-normal text-stone/70">
              (optional)
            </span>
          </span>
          <input name="phone" type="tel" autoComplete="tel" className={field} />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="label">Message</span>
        <textarea
          name="message"
          required
          rows={4}
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
          <button type="submit" value="mail" className="btn justify-center">
            Send by email <span className="nudge">→</span>
          </button>
        </div>
      </div>
    </form>
  );
}
