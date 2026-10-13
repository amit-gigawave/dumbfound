/*
 * Home hero headline: the lines rise out of a mask one after another, then the
 * red italic "hands" draws its underline as they land. `.hero-fade` brings in
 * the label, intro and buttons after it (set `animationDelay` per element).
 *
 * Pure CSS, so the text is readable even without JavaScript. Reduced motion:
 * everything is shown at once with the underline already drawn. The keyframes
 * live here rather than in globals.css, next to the only markup that uses them.
 */

const CSS = `
@keyframes hero-rise { from { transform: translateY(140%); } to { transform: none; } }
@keyframes hero-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes hero-draw { to { stroke-dashoffset: 0; } }
/* Roomy mask: italic descenders and the underline stay inside it. */
.hero-line { display: block; overflow: hidden; padding: .16em 0 .24em; margin: -.16em 0 -.24em; }
.hero-line > span { display: block; animation: hero-rise 1.1s cubic-bezier(.2,.7,.1,1) both; }
.hero-fade { animation: hero-fade .9s ease both; }
.hero-underline { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hero-draw 1.1s cubic-bezier(.6,0,.2,1) forwards; }
@media (prefers-reduced-motion: reduce) {
  .hero-line > span, .hero-fade { animation: none; }
  .hero-underline { animation: none; stroke-dashoffset: 0; }
}
`;

/** Delay before each line rises, and before the underline draws, in ms. */
const LINE_DELAYS = [150, 290, 430];
const UNDERLINE_DELAY = 1050;

export default function HeroHeading() {
  const line = (i: number, children: React.ReactNode) => (
    <span className="hero-line" aria-hidden>
      <span style={{ animationDelay: `${LINE_DELAYS[i]}ms` }}>{children}</span>
    </span>
  );

  return (
    <>
      <style>{CSS}</style>
      <h1
        aria-label="Art, and the hands that made it."
        className="heading-caps mt-[22px] text-center text-[clamp(44px,7.6vw,108px)] leading-[1] tracking-[0.02em]"
      >
        {/* Centred and balanced: "hands" alone on the middle line is the focal
            point, with the long last line as a base. */}
        {line(0, "Art, and the")}
        {line(
          1,
          <span className="relative inline-block font-text normal-case italic tracking-[-0.01em] text-accent">
            hands
            <svg
              viewBox="0 0 200 20"
              preserveAspectRatio="none"
              aria-hidden
              className="absolute -bottom-[0.12em] left-0 h-[0.22em] w-full"
            >
              <path
                d="M3 14 C 50 4, 120 4, 197 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={1}
                className="hero-underline"
                style={{ animationDelay: `${UNDERLINE_DELAY}ms` }}
              />
            </svg>
          </span>,
        )}
        {line(2, "that made it.")}
      </h1>
    </>
  );
}
