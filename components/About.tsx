"use client";

const stats = [
  { value: "600+", label: "Works at auction" },
  { value: "80+", label: "Years of artistry" },
  { value: "1993", label: "National Award" },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-background px-6 py-28 text-black lg:px-16"
    >
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-black/50">
          The Artist
        </p>
        <h2 className="font-display text-4xl font-medium tracking-[-0.03em] text-black sm:text-5xl lg:text-[3.5rem] leading-[1.1]">
          &ldquo;I am a part of what I paint.&rdquo;
        </h2>
        <p className="mt-8 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
          Born in 1942 in Burugupalli, Telangana, Thota Vaikuntam has spent over
          eight decades capturing the dignity, beauty, and vibrant spirit of
          rural Telangana women — translating bold primary colours and folk
          traditions into paintings, serigraphs, and striking bronze sculptures
          exhibited across New York, London, Dubai, and beyond.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
          Trained under K.G. Subramanyan at M.S. University of Baroda, his
          visual language is unmistakable: almond-shaped eyes, vermilion bindis,
          ornate jewellery, and rich primary colours that celebrate Telangana
          heritage with unflinching authenticity.
        </p>

        <div className="mt-14 grid max-w-xl grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl text-black">
                {stat.value}
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-black/50">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
