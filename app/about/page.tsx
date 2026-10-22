import type { Metadata } from "next";
import { site } from "@/lib/site";
import Manifesto from "@/components/about/Manifesto";
import StaggerStory from "@/components/about/StaggerStory";
import PageHeader from "@/components/PageHeader";
import { MANIFESTO, STORY } from "@/lib/about";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

const wrap = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]";

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        label="The Initiative"
        title="About"
        line="Placing sculpture at the centre of contemporary cultural discourse."
      />

      <section className="border-b border-rule bg-white py-[clamp(70px,10vw,140px)]">
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
    </main>
  );
}
