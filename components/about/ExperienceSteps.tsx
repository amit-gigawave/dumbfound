import Link from "next/link";
import { Mail, Rotate3d, Search, Smartphone } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Browse",
    line: "Artists and their works, each presented with the care of a museum catalogue.",
    href: "/artworks",
  },
  {
    icon: Rotate3d,
    title: "View in the round",
    line: "Turn a sculpture and look at it from every side, as you would in a gallery.",
  },
  {
    icon: Smartphone,
    title: "See it in your space",
    line: "On a phone, place the work in your room through the camera, at its real size.",
  },
  {
    icon: Mail,
    title: "Enquire",
    line: "Ask about availability, editions and viewing, and we will put you in touch.",
    href: "/contact",
  },
];

/** "From screen to your room": the four ways to experience a work on the site. */
export default function ExperienceSteps() {
  return (
    <ol data-reveal-stagger className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => {
        const body = (
          <>
            {i < STEPS.length - 1 && (
              // Connector to the next step (desktop row only)
              <span aria-hidden className="absolute left-14 right-[-20px] top-6 hidden h-px bg-rule lg:block" />
            )}
            <span className="relative grid h-12 w-12 place-items-center rounded-full border border-rule bg-paper text-accent transition-[transform,background-color,border-color,color] duration-500 group-hover:scale-110 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
              <s.icon size={20} strokeWidth={1.6} />
            </span>
            <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-stone">Step {i + 1}</p>
            <h3 className="font-display mt-1 text-[22px] tracking-[0.03em] transition-colors group-hover:text-accent">
              {s.title}
              {s.href && <span className="nudge ml-1.5 text-base">→</span>}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-stone">{s.line}</p>
          </>
        );
        return (
          <li key={s.title} className="group relative">
            {s.href ? (
              <Link href={s.href} className="block">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}
