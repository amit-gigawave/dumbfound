/**
 * Top of a main page (About, Artists, Artworks, Events): a small label, the
 * page title in capitals, and one line under it, on a faint green band with a
 * rule below.
 */
export default function PageHeader({
  label,
  title,
  line,
}: {
  label: string;
  title: string;
  line: string;
}) {
  return (
    <section className="border-b border-rule bg-accent-light/5">
      <div
        data-reveal-stagger
        className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-[clamp(48px,7vw,90px)] pt-[clamp(56px,9vw,120px)]"
      >
        <span className="label">{label}</span>
        <h1 className="heading-caps mt-5 max-w-[16ch] text-[clamp(34px,5.2vw,64px)] leading-[1.1] tracking-[0.04em]">
          {title}
        </h1>
        <p className="font-display mt-5 max-w-[48ch] text-[clamp(18px,2.4vw,24px)] leading-[1.5] text-stone">
          {line}
        </p>
      </div>
    </section>
  );
}
