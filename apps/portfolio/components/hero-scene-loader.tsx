"use client";

import dynamic from "next/dynamic";

const HeroSceneCanvas = dynamic(
  () => import("./hero-scene").then((module) => module.HeroScene),
  {
    ssr: false,
    loading: () => <div className="hero-scene scene-fallback" aria-hidden="true" />,
  },
);

export function HeroSceneLoader() {
  return <HeroSceneCanvas />;
}
