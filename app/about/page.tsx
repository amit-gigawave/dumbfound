import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import FAQ, { type FaqItem } from "@/components/FAQ";
import SectionHeader from "@/components/gallery/SectionHeader";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

const faq: FaqItem[] = [
  {
    question: "What is Sculpted India?",
    answer:
      "Sculpted India is a pioneering public art initiative and dedicated platform committed to advancing modern and contemporary Indian sculpture by giving it the visibility, recognition, and cultural presence it has long deserved.",
  },
  {
    question: "How do I enquire about a work?",
    answer:
      'Open the work and choose "Enquire about this work", or write to us through the enquiry page. We will put you in touch about availability, editions and viewing.',
  },
  {
    question: 'What does "View in the round" mean?',
    answer:
      'Some works exist in three dimensions. For those, "View in the round" lets you turn the work and look at it from every side, as you would in a gallery.',
  },
  {
    question: 'What does "See it in your space" do?',
    answer:
      "On a phone, it places the work in your room through the camera, at its real size, so you can see how it sits in your home. On a computer it shows a code to scan with your phone.",
  },
  {
    question: "I am an artist. Can my work be shown here?",
    answer:
      "We are always glad to hear from artists. Write to us through the enquiry page with a short introduction and a few images of your work.",
  },
];

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

export default function AboutPage() {
  return (
    <main>
      <section
        data-reveal-stagger
        className={`${wrap} pb-[clamp(48px,7vw,90px)] pt-[clamp(56px,9vw,120px)]`}
      >
        <span className="label">The Initiative</span>
        <h1 className="heading-caps mt-5 max-w-[16ch] text-[clamp(34px,5.2vw,64px)] leading-[1.1] tracking-[0.04em]">
          About
        </h1>
        <p className="font-display mt-5 max-w-[48ch] text-[clamp(18px,2.4vw,24px)] leading-[1.5] text-stone">
          Placing sculpture at the centre of contemporary cultural discourse.
        </p>
        <div className="font-text mt-8 grid max-w-[62ch] gap-5 text-lg leading-[1.75] text-stone">
          <p>
            Sculpted India is a pioneering public art initiative and dedicated
            platform committed to advancing modern and contemporary Indian
            sculpture by giving it the visibility, recognition, and cultural
            presence it has long deserved. While sculpture has always been one of
            the most powerful and enduring forms of artistic expression, it has
            often remained on the periphery of India&apos;s broader art
            ecosystem. Sculpted India was founded to change that
            narrative&mdash;placing sculpture at the centre of contemporary
            cultural discourse and creating a platform where the medium can be
            experienced at its fullest scale, ambition, and impact.
          </p>
          <p>
            More than an exhibition platform, Sculpted India serves as a bridge
            between artists, collectors, galleries, institutions, architects,
            designers, and art enthusiasts. It creates meaningful opportunities
            for dialogue, collaboration, and patronage, fostering a stronger
            ecosystem around sculpture and encouraging deeper engagement with
            three-dimensional artistic practice.
          </p>
          <p>
            What distinguishes Sculpted India is its long-term commitment to the
            medium. Rather than existing as a one-time exhibition, it is
            envisioned as a sustained cultural initiative dedicated to building
            visibility, accessibility, and patronage for sculpture across India.
          </p>
          <p>
            At its core, Sculpted India is founded on values of excellence,
            inclusivity, innovation, and cultural stewardship. The mission
            remains clear: to become the leading platform for modern and
            contemporary Indian sculpture, positioning the medium at the
            forefront of India&apos;s cultural imagination while creating a
            lasting legacy for artists, audiences, and future generations.
          </p>
        </div>
      </section>

      <section
        id="viewing"
        className={`${wrap} scroll-mt-28 pb-[clamp(64px,8vw,104px)]`}
      >
        <SectionHeader title="Questions" />
        <div data-reveal>
          <FAQ items={faq} />
        </div>
        <p className="mt-8 text-sm text-stone">
          Something else?{" "}
          <Link href="/contact" className="text-link">
            Write to us
          </Link>
        </p>
      </section>

      <section
        id="privacy"
        className={`${wrap} scroll-mt-28 pb-[clamp(64px,8vw,104px)]`}
      >
        <SectionHeader title="Privacy" />
        <p className="font-text max-w-[62ch] text-[17px] leading-[1.75] text-stone">
          {/* TODO: replace with the approved privacy policy. */}
          We only use the details you send us to reply to your enquiry or, if
          you ask, to send our occasional letter. We do not sell or share them.
        </p>
      </section>
    </main>
  );
}
