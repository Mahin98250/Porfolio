"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";
import { Suspense, useEffect, useRef, useState } from "react";

type ScrollProgress = { current: number };

function SculpturalCore() {
  const core = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!core.current) return;
    const step = Math.min(delta, 0.045);
    core.current.rotation.x += step * (0.1 + state.pointer.y * 0.02);
    core.current.rotation.y += step * (0.16 + state.pointer.x * 0.035);
  });

  return (
    <Float speed={1.05} rotationIntensity={0.18} floatIntensity={0.28}>
      <mesh ref={core} scale={1.08}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#c6abff"
          roughness={0.13}
          metalness={0.52}
          transparent
          opacity={0.78}
          distort={0.19}
          speed={1.15}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>
      <mesh scale={1.17}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#eee0ff" wireframe transparent opacity={0.18} />
      </mesh>
      <mesh scale={0.48}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial color="#f1ce9d" metalness={0.6} roughness={0.16} clearcoat={1} />
      </mesh>
    </Float>
  );
}

function OrbitalStructure() {
  return (
    <>
      <mesh rotation={[0.7, 0.25, 0.2]}>
        <torusGeometry args={[1.48, 0.018, 8, 180]} />
        <meshPhysicalMaterial color="#eac18b" metalness={0.86} roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh rotation={[1.15, -0.8, 0.58]}>
        <torusGeometry args={[1.72, 0.011, 8, 180]} />
        <meshBasicMaterial color="#c4a4ff" transparent opacity={0.72} />
      </mesh>
      <mesh rotation={[0.25, 1.05, -0.3]}>
        <torusGeometry args={[1.9, 0.008, 6, 180]} />
        <meshBasicMaterial color="#9edecf" transparent opacity={0.54} />
      </mesh>
      <mesh rotation={[0.5, 0.2, 1.1]} scale={0.78}>
        <torusKnotGeometry args={[1.45, 0.014, 160, 8, 2, 5]} />
        <meshPhysicalMaterial color="#d4c4ff" metalness={0.8} roughness={0.22} clearcoat={1} />
      </mesh>
    </>
  );
}

function Satellite({ position, color, scale = 0.07 }: { position: [number, number, number]; color: string; scale?: number }) {
  return (
    <mesh position={position} scale={scale}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} metalness={0.5} roughness={0.22} />
    </mesh>
  );
}

function SceneContent({ scrollProgress }: { scrollProgress: ScrollProgress }) {
  const structure = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!structure.current) return;
    const step = Math.min(delta, 0.045);
    const scroll = MathUtils.clamp(scrollProgress.current / 0.82, 0, 1);
    const targetX = state.pointer.y * -0.09 + Math.sin(state.clock.elapsedTime * 0.21) * 0.025;
    const targetY = state.pointer.x * 0.12 + state.clock.elapsedTime * 0.055 + scroll * 0.22;
    structure.current.rotation.x = MathUtils.damp(structure.current.rotation.x, targetX, 2.5, step);
    structure.current.rotation.y = MathUtils.damp(structure.current.rotation.y, targetY, 2.5, step);
    structure.current.rotation.z = MathUtils.damp(
      structure.current.rotation.z,
      Math.sin(state.clock.elapsedTime * 0.16) * 0.035 - scroll * 0.08,
      2,
      step,
    );
    structure.current.position.x = MathUtils.damp(structure.current.position.x, state.pointer.x * 0.12, 2, step);
    structure.current.scale.setScalar(1 - scroll * 0.075);
  });

  return (
    <>
      <fog attach="fog" args={["#0a0710", 5.4, 11]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[4, 5, 4]} intensity={2.1} color="#f0e6ff" />
      <pointLight position={[-3.5, 1.4, 2.3]} intensity={3.1} color="#9f78ff" />
      <pointLight position={[2.8, -2.2, -2]} intensity={2.2} color="#eeb77b" />
      <pointLight position={[0, 3, -2]} intensity={1.1} color="#8bd9cc" />
      <group ref={structure}>
        <OrbitalStructure />
        <SculpturalCore />
        <Satellite position={[1.86, 0.7, 0.15]} color="#eac18b" scale={0.075} />
        <Satellite position={[-1.57, -0.74, 0.45]} color="#9edecf" scale={0.052} />
        <Satellite position={[0.7, -1.75, -0.3]} color="#c4a4ff" scale={0.065} />
      </group>
      <Sparkles count={105} scale={[5.3, 4.8, 3.4]} size={1.35} speed={0.16} color="#e5d6ff" opacity={0.66} />
    </>
  );
}

export function HeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const [inView, setInView] = useState(true);
  // Keep server and first client render identical; preferences are synchronized after hydration.
  const [documentVisible, setDocumentVisible] = useState(true);
  const [motionAllowed, setMotionAllowed] = useState(true);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setMotionAllowed(!motionPreference.matches);
    const syncDocumentVisibility = () => setDocumentVisible(!document.hidden);
    const syncScrollProgress = () => {
      scrollProgress.current = Math.min(1, window.scrollY / Math.max(window.innerHeight, 1));
    };

    const preferenceSyncFrame = window.requestAnimationFrame(() => {
      syncMotionPreference();
      syncDocumentVisibility();
      syncScrollProgress();
    });
    const supportsMediaChangeEvent = typeof motionPreference.addEventListener === "function";
    if (supportsMediaChangeEvent) {
      motionPreference.addEventListener("change", syncMotionPreference);
    } else {
      motionPreference.addListener(syncMotionPreference);
    }
    document.addEventListener("visibilitychange", syncDocumentVisibility);
    window.addEventListener("scroll", syncScrollProgress, { passive: true });
    window.addEventListener("resize", syncScrollProgress, { passive: true });

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
      window.removeEventListener("scroll", syncScrollProgress);
      window.removeEventListener("resize", syncScrollProgress);
      window.cancelAnimationFrame(preferenceSyncFrame);
      observer?.disconnect();
    };
  }, []);

  const shouldAnimate = motionAllowed && inView && documentVisible;

  return (
    <div ref={sceneRef} className="hero-scene" aria-label="Interactive 3D orbital sculpture" role="img">
      {motionAllowed ? (
        <Canvas
          dpr={[1, 1.45]}
          camera={{ position: [0, 0, 5.8], fov: 39 }}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          frameloop={shouldAnimate ? "always" : "never"}
          fallback={<div className="scene-fallback scene-static" aria-hidden="true" />}
        >
          <Suspense fallback={null}><SceneContent scrollProgress={scrollProgress} /></Suspense>
        </Canvas>
      ) : (
        <div className="scene-fallback scene-static" aria-hidden="true" />
      )}
      <span className="scene-label">
        {motionAllowed ? (shouldAnimate ? "LIVE SPATIAL STUDY / POINTER + SCROLL" : "3D SCENE PAUSED / PERFORMANCE SAVING") : "STATIC PREVIEW / REDUCED MOTION"}
      </span>
    </div>
  );
}
