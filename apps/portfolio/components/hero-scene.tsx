"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Mesh } from "three";

function GlassCore() {
  const mesh = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    // Cap long frame gaps so resuming from a hidden tab never causes a rotation jump.
    const frameDelta = Math.min(delta, 0.05);
    mesh.current.rotation.x += frameDelta * (0.12 + state.pointer.y * 0.035);
    mesh.current.rotation.y += frameDelta * (0.18 + state.pointer.x * 0.05);
    mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.65) * 0.08;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.28} floatIntensity={0.5}>
      <mesh ref={mesh} scale={1.45}>
        <icosahedronGeometry args={[1, 5]} />
        <MeshDistortMaterial color="#9acbff" roughness={0.12} metalness={0.55} transparent opacity={0.78} distort={0.22} speed={1.4} />
      </mesh>
    </Float>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 5, 3]} intensity={2.4} color="#d7eaff" />
      <pointLight position={[-4, -1, 2]} intensity={2.6} color="#7868ff" />
      <pointLight position={[2, -3, -3]} intensity={1.8} color="#52e5d2" />
      <GlassCore />
      <mesh position={[1.75, -0.85, -1.5]} rotation={[0.4, 0.6, 0.2]}>
        <torusGeometry args={[0.64, 0.055, 16, 100]} />
        <meshPhysicalMaterial color="#c1dfff" metalness={0.8} roughness={0.18} clearcoat={1} />
      </mesh>
      <mesh position={[-1.65, 0.8, -1.2]} rotation={[0.2, 0.3, 0.7]}>
        <torusGeometry args={[0.38, 0.035, 12, 80]} />
        <meshPhysicalMaterial color="#a69bff" metalness={0.8} roughness={0.16} />
      </mesh>
      <Sparkles count={75} scale={5.2} size={1.7} speed={0.22} color="#b7d8ff" />
    </>
  );
}

export function HeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );
  const [motionAllowed, setMotionAllowed] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setMotionAllowed(!motionPreference.matches);
    const syncDocumentVisibility = () => setDocumentVisible(!document.hidden);

    const supportsMediaChangeEvent = typeof motionPreference.addEventListener === "function";
    if (supportsMediaChangeEvent) {
      motionPreference.addEventListener("change", syncMotionPreference);
    } else {
      motionPreference.addListener(syncMotionPreference);
    }
    document.addEventListener("visibilitychange", syncDocumentVisibility);

    const sceneElement = sceneRef.current;
    let observer: IntersectionObserver | undefined;

    if (sceneElement && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
        { rootMargin: "100px 0px" },
      );
      observer.observe(sceneElement);
    }

    return () => {
      if (supportsMediaChangeEvent) {
        motionPreference.removeEventListener("change", syncMotionPreference);
      } else {
        motionPreference.removeListener(syncMotionPreference);
      }
      document.removeEventListener("visibilitychange", syncDocumentVisibility);
      observer?.disconnect();
    };
  }, []);

  const shouldAnimate = motionAllowed && inView && documentVisible;

  return (
    <div ref={sceneRef} className="hero-scene" aria-label="Interactive 3D glass sculpture" role="img">
      {motionAllowed ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5.6], fov: 40 }}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          frameloop={shouldAnimate ? "always" : "never"}
          fallback={<div className="scene-fallback scene-static" aria-hidden="true" />}
        >
          <Suspense fallback={null}><SceneContent /></Suspense>
        </Canvas>
      ) : (
        <div className="scene-fallback scene-static" aria-hidden="true" />
      )}
      <span className="scene-label">
        {motionAllowed ? (shouldAnimate ? "INTERACTIVE 3D / REAL-TIME LIGHT" : "3D SCENE PAUSED / PERFORMANCE SAVING") : "STATIC PREVIEW / REDUCED MOTION"}
      </span>
    </div>
  );
}
