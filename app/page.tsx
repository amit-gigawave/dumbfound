"use client";

import dynamic from "next/dynamic";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Hero = dynamic(() => import("@/components/Hero"), { ssr: false });
const SculptureCards = dynamic(() => import("@/components/SculptureCards"), {
  ssr: false,
});

export default function Home() {
  return (
    <div
      className="relative min-h-screen font-sans text-foreground page-gradient"
      style={{ overflowX: "clip" }}
    >
      <Hero />
      <SculptureCards />
      <About />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
