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
    question: "What is the gallery?",
    answer:
      "A place to discover artists and their work — established names and new voices, in every medium — with each work presented as it would be in a museum catalogue: its story, its maker, its material.",
  },
  {
    question: "How do I enquire about a work?",
    answer:
      "Open the work and choose “Enquire about this work”, or write to us through the contact page. We will put you in touch about availability, editions and viewing.",
  },
  {
    question: "What does “View in the round” mean?",
    answer:
      "Some works exist in three dimensions. For those, “View in the round” lets you turn the work and look at it from every side, as you would in the gallery.",
  },
  {
    question: "What does “See it in your space” do?",
    answer:
      "On a phone, it places the work in your room through the camera, at its real size, so you can see how it sits in your home. On a computer it shows a code to scan with your phone.",
  },
  {
    question: "I am an artist. Can my work be shown here?",
    answer:
      "We are always glad to hear from artists. Write to us through the contact page with a short introduction and a few images of your work.",
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
        <span className="label">About</span>
        <h1 className="mt-5 max-w-[18ch] text-[clamp(36px,5.2vw,68px)] leading-[1.06] tracking-[-0.01em]">
          Every work has a maker, <em className="text-accent">and a story.</em>
        </h1>
        <div className="font-text mt-8 grid max-w-[62ch] gap-5 text-lg leading-[1.75] text-stone">
          <p>
            {site.name} brings together artists and their work — established
            names and new voices, in every medium — and presents each piece with
            the care of a catalogue: who made it, what it is made of, and the
            story it carries.
          </p>
          <p>
            Where a work exists in three dimensions, you can also turn it in the
            round and place it in your own space.
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
