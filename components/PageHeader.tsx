/**
 * Top of a main page (About, Artists, Artworks, Events, Enquiry), laid out
 * like the home page's About section: a small label and the title on the
 * left, the description on the right, aligned along the bottom. Normal case
 * throughout, on a faint green band with a rule below. Stacks on phones.
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
      <div className="mx-auto grid max-w-[1200px] gap-5 px-[clamp(16px,4vw,40px)] pb-[clamp(40px,5vw,64px)] pt-[clamp(48px,7vw,96px)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end md:gap-[clamp(28px,5vw,80px)]">
        <div>
          <span className="text-[14px] text-accent">{label}</span>
          <h1 className="font-display mt-3 text-[clamp(40px,5.6vw,72px)] leading-[1.05] tracking-[0.005em]">
            {title}
          </h1>
        </div>
        <p className="font-text max-w-[46ch] text-[18px] leading-[1.8] text-stone md:pb-2">
          {line}
        </p>
      </div>
    </section>
  );
}
