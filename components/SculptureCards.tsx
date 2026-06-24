"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import BlurText from "./BlurText";

const SculptureScene = dynamic(() => import("./SculptureScene"), {
  ssr: false,
});

const cards = [
  {
    id: 1,
    title: "Telangana Woman",
    description:
      "The iconic subject of Vaikuntam's world — a rural woman adorned with vermilion bindi, almond eyes, and traditional jewellery, capturing the dignity and sensuality of Telangana heritage in three dimensions.",
    modelUrl: "/sculptures/Lady.glb",
    accent: "#d4a574",
    offsetY: -0.1,
    offsetX: 0,
    defaultZoom: 2.2,
  },
  {
    id: 2,
    title: "Lord Krishna",
    description:
      "Rooted in the mythology that shaped his childhood village theatre, Vaikuntam brings celestial grace and folk intimacy together — poise, peace, and primary colours meeting bronze patina.",
    modelUrl: "/sculptures/LordKrishna.glb",
    accent: "#e67e22",
    offsetY: 0,
    offsetX: 0,
    defaultZoom: 3,
  },
  {
    id: 3,
    title: "Sacred Gaze",
    description:
      "From Vaikuntam's celebrated series of sculptural heads in patinated bronze — almond eyes and ornate adornments embodying what curator Uma Nair calls 'Dravidian dignity in tone and tenor.'",
    modelUrl: "/sculptures/Pandit.glb",
    accent: "#8b6914",
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
      className="w-full flex flex-col items-center justify-center py-10 lg:min-h-screen lg:py-16"
    >
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-20">
        <div
          className={`w-full lg:flex-1 space-y-5 px-6 lg:px-0 text-center lg:text-left ${isEven ? "lg:order-1" : "lg:order-2"}`}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-black/40">
            {card.id.toString().padStart(2, "0")}
          </span>
          <h3 className="text-3xl lg:text-6xl font-display tracking-[-0.03em] text-black">
            <BlurText
              text={card.title}
              animateBy="words"
              delay={90}
              stepDuration={0.4}
            />
          </h3>
          <p className="max-w-md mx-auto lg:mx-0 text-base leading-relaxed text-black/50">
            {card.description}
          </p>
        </div>

        <div
          className={`w-full h-[58vh] min-h-[380px] lg:h-[850px] lg:flex-1 ${isEven ? "lg:order-2" : "lg:order-1"}`}
        >
          {isVisible ? (
            <SculptureScene
              url={card.modelUrl}
              offsetX={card.offsetX}
              offsetY={card.offsetY}
              defaultZoom={card.defaultZoom}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SculptureCards = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative mt-20 z-10 w-full"
      id="collection"
    >
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col pb-24 lg:pb-64">
          {cards.map((card, index) => (
            <SculptureCardItem key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SculptureCards;
