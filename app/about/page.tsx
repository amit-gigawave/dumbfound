import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import FAQ, { type FaqItem } from "@/components/FAQ";
import SectionHeader from "@/components/gallery/SectionHeader";
import Manifesto from "@/components/about/Manifesto";
import ExperienceSteps from "@/components/about/ExperienceSteps";
import StaggerStory from "@/components/about/StaggerStory";

// Lights up word by word on scroll; **key words** turn the accent colour.
const MANIFESTO =
  "Sculpture has always been one of the most **powerful and enduring** forms of artistic expression — yet it has often remained on the **periphery** of India's art ecosystem. Sculpted India was founded to **change that.**";

// Rises in word by word; a marker then sweeps across the **key phrases**.
const STORY = [
  "Sculpted India is a pioneering public art initiative and dedicated platform committed to advancing modern and contemporary Indian sculpture by giving it the **visibility, recognition, and cultural presence** it has long deserved—placing sculpture at the **centre of contemporary cultural discourse** and creating a platform where the medium can be experienced at its fullest scale, ambition, and impact.",
  "More than an exhibition platform, Sculpted India serves as a **bridge** between artists, collectors, galleries, institutions, architects, designers, and art enthusiasts. It creates meaningful opportunities for **dialogue, collaboration, and patronage,** fostering a stronger ecosystem around sculpture and encouraging deeper engagement with three-dimensional artistic practice.",
  "What distinguishes Sculpted India is its **long-term commitment** to the medium. Rather than existing as a one-time exhibition, it is envisioned as a **sustained cultural initiative** dedicated to building visibility, accessibility, and patronage for sculpture across India.",
  "At its core, Sculpted India is founded on values of excellence, inclusivity, innovation, and cultural stewardship. The mission remains clear: to become **the leading platform** for modern and contemporary Indian sculpture, positioning the medium at the forefront of India's cultural imagination while creating a lasting legacy for artists, audiences, and future generations.",
];

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
      </section>

      <section className="border-y border-rule bg-white py-[clamp(70px,10vw,140px)]">
        <div className={wrap}>
          <Manifesto text={MANIFESTO} />
        </div>
      </section>

      <section className={`${wrap} py-[clamp(56px,8vw,100px)]`}>
        <div className="grid gap-[clamp(20px,5vw,72px)] md:grid-cols-[200px_1fr]">
          <span className="label md:sticky md:top-36 md:self-start">Our story</span>
          <StaggerStory paragraphs={STORY} />
        </div>
      </section>

      <section className="border-y border-rule bg-white py-[clamp(64px,8vw,110px)]">
        <div className={wrap}>
          <span className="label">Experience</span>
          <h2 className="heading-caps mt-4 text-[clamp(26px,3.4vw,42px)] leading-[1.15] tracking-[0.05em]">
            From screen to your room
          </h2>
          <ExperienceSteps />
        </div>
      </section>

      <section
        id="viewing"
        className={`${wrap} scroll-mt-28 pb-[clamp(64px,8vw,104px)] pt-[clamp(64px,8vw,104px)]`}
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
