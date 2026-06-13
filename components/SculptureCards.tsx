"use client";

import dynamic from "next/dynamic";
import FadeContent from "./FadeContent";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGLTF } from "@react-three/drei";


const SculptureScene = dynamic(() => import("./SculptureScene"), {
  ssr: false,
});
const ScrollFloat = dynamic(() => import("./ScrollFloat"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    id: 1,
    title: "Dancing Shiva",
    description:
      "Nataraja, the cosmic dancer, representing the rhythmic cycle of creation, preservation, and destruction.",
    modelUrl: "/sculptures/DancingShiva.glb",
    accent: "#8ea4ff",
    offsetY: 0,
    offsetX: 0,
    defaultZoom: 2.8,
  },
  {
    id: 2,
    title: "Lady Sculpture",
    description:
      "A classical rendering of elegant form, celebrating proportion, posture, and natural drapery.",
    modelUrl: "/sculptures/Lady.glb",
    accent: "#ff8d76",
    offsetY: -0.1,
    offsetX: 0,
    defaultZoom: 2.2,
  },
  {
    id: 3,
    title: "Lord Krishna",
    description:
      "An artistic capture of traditional heritage, capturing poise, peace, and celestial grace.",
    modelUrl: "/sculptures/LordKrishna.glb",
    accent: "#62d4c8",
    offsetY: 0,
    offsetX: 0,
    defaultZoom: 3,
  },
  {
    id: 4,
    title: "Pandit Bust",
    description:
      "A detailed portrait bust of a scholar, highlighting the subtle interplay of light and shadow on stone textures.",
    modelUrl: "/sculptures/Pandit.glb",
    accent: "#facc15",
    offsetY: 0,
    offsetX: 0,
    defaultZoom: 2.2,
  },
];

const SculptureCardItem = ({
  card,
  index,
}: {
  card: (typeof cards)[0];
  index: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: "20% 0px" },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="w-full h-screen flex flex-col items-center justify-center"
    >
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
        <FadeContent
          blur={true}
          duration={1500}
          ease="power4.out"
          threshold={0.5}
          yOffset={80}
          className={`flex-1 space-y-6 px-6 lg:px-0 text-center lg:text-left ${isEven ? "lg:order-1" : "lg:order-2"}`}
        >
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: card.accent }}
            />
            <span className="text-[10px] uppercase tracking-[0.4em] text-black/30">
              Specimen {card.id.toString().padStart(2, "0")}
            </span>
          </div>
          <h3 className="text-4xl lg:text-7xl font-display uppercase tracking-[-0.03em] text-black">
            {card.title}
          </h3>
          <p className="max-w-md mx-auto lg:mx-0 text-base lg:text-lg leading-relaxed text-black/50">
            {card.description}
          </p>
          <div className="pt-4">
            <button className="text-[10px] uppercase tracking-[0.3em] text-black/30 hover:text-black transition-colors border-b border-black/10 pb-1">
              Explore Details
            </button>
          </div>
        </FadeContent>

        <FadeContent
          blur={true}
          duration={1800}
          delay={200}
          threshold={0.5}
          yOffset={80}
          className={`flex-1 cursor-target w-full h-[500px] lg:h-[700px] relative ${isEven ? "lg:order-2" : "lg:order-1"}`}
        >
          <div ref={parallaxRef} className="w-full h-full">
            {isVisible && (
              <SculptureScene
                url={card.modelUrl}
                offsetX={card.offsetX}
                offsetY={card.offsetY}
                defaultZoom={card.defaultZoom}
              />
            )}
          </div>
        </FadeContent>
      </div>
    </div>
  );
};

const SculptureCards = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      cards.forEach((c) => {
        try {
          useGLTF.preload(c.modelUrl);
        } catch (e) {}
      });
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative mt-20 z-10 w-full"
      id="collection"
    >
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="mb-24 px-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.42em] text-black/40 mb-4">
            Curated Collection
          </p>
          <ScrollFloat
            animationDuration={1.2}
            ease="back.inOut(2)"
            stagger={0.03}
            containerClassName="text-center"
            textClassName="font-display block text-4xl font-semibold uppercase tracking-[-0.05em] text-black sm:text-5xl lg:text-[5.4rem]"
          >
            Sculptural Masterpieces
          </ScrollFloat>
        </div>

        <div className="flex flex-col pb-64">
          {cards.map((card, index) => (
            <SculptureCardItem key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SculptureCards;
