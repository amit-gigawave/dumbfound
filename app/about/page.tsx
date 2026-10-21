import type { Metadata } from "next";
import { site } from "@/lib/site";
import SectionHeader from "@/components/gallery/SectionHeader";
import Manifesto from "@/components/about/Manifesto";
import StaggerStory from "@/components/about/StaggerStory";
import { ABOUT_LINE, MANIFESTO, STORY } from "@/lib/about";

const plainLine = ABOUT_LINE.replaceAll("**", "");

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

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
          {plainLine}
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
