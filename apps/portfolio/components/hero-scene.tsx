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

function CaveTunnel() {
  const rings = Array.from({ length: 24 }, (_, index) => {
    const z = 5 - index * 1.05;
    const radius = 2.15 + Math.sin(index * 1.71) * 0.23 + Math.cos(index * 0.63) * 0.16;
    return { z, radius, rotation: index * 0.19, tint: index % 3 === 0 ? "#b28bca" : index % 3 === 1 ? "#4c3b59" : "#79617f" };
  });
  const rocks = Array.from({ length: 92 }, (_, index) => {
    const angle = index * 2.39996;
    const z = 4.5 - (index % 31) * 0.79;
    const radius = 1.55 + ((index * 17) % 31) / 31 * 0.95;
    const size = 0.12 + ((index * 7) % 13) / 100;
    return { position: [Math.cos(angle) * radius, Math.sin(angle) * radius, z] as [number, number, number], scale: [size * (1 + (index % 3)), size * (0.7 + (index % 4) * 0.2), size * (0.8 + (index % 5) * 0.18)] as [number, number, number], rotation: [angle, angle * 0.7, angle * 0.4] as [number, number, number], index };
  });
  return (
    <group>
      {rings.map((ring, index) => (
        <mesh key={index} position={[0, 0, ring.z]} rotation={[0, 0, ring.rotation]}>
          <torusGeometry args={[ring.radius, 0.14 + (index % 4) * 0.035, 8, 72]} />
          <meshStandardMaterial color={ring.tint} roughness={0.96} metalness={0.04} />
        </mesh>
      ))}
      {rocks.map((rock) => (
        <mesh key={rock.index} position={rock.position} scale={rock.scale} rotation={rock.rotation}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={rock.index % 4 === 0 ? "#4a354f" : "#211a2a"} roughness={1} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0, -22]}>
        <sphereGeometry args={[0.72, 24, 24]} />
        <meshBasicMaterial color="#f2c995" />
      </mesh>
    </group>
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
  const tunnel = useRef<Group>(null);
  useFrame((state, delta) => {
    const step = Math.min(delta, 0.045);
    const progress = MathUtils.clamp(scrollProgress.current, 0, 1);
    const camera = state.camera;
    // Scroll is the camera rail: the viewer travels into the cave, not past a floating object.
    const targetZ = 5.2 - progress * 23.5;
    const targetX = Math.sin(progress * Math.PI * 2) * 0.28 + state.pointer.x * 0.035;
    const targetY = Math.sin(progress * Math.PI * 1.35) * 0.19 + state.pointer.y * -0.035;
    camera.position.z = MathUtils.damp(camera.position.z, targetZ, 3.4, step);
    camera.position.x = MathUtils.damp(camera.position.x, targetX, 2.6, step);
    camera.position.y = MathUtils.damp(camera.position.y, targetY, 2.6, step);
    camera.lookAt(targetX * 0.35, targetY * 0.35, targetZ - 8);
    if (tunnel.current) {
      tunnel.current.rotation.z = MathUtils.damp(tunnel.current.rotation.z, Math.sin(progress * Math.PI * 2) * 0.035, 2, step);
    }
  });
  return (
    <>
      <color attach="background" args={["#08060b"]} />
      <fog attach="fog" args={["#08060b", 4, 24]} />
      <ambientLight intensity={0.24} />
      <pointLight position={[0, 0, -20]} intensity={18} distance={30} color="#eac18b" />
      <pointLight position={[-2, 1, -8]} intensity={3.5} distance={13} color="#a77bd3" />
      <pointLight position={[2, -1, 2]} intensity={1.8} distance={8} color="#6f526f" />
      <group ref={tunnel}>
        <CaveTunnel />
      </group>
      <Sparkles count={150} scale={[4.4, 4.4, 27]} position={[0, 0, -9]} size={1.1} speed={0.12} color="#e6c7f5" opacity={0.5} />
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
      const host = sceneRef.current?.closest<HTMLElement>(".cinema-hero");
      const top = host?.getBoundingClientRect().top ?? -window.scrollY;
      const span = Math.max(host?.offsetHeight ?? window.innerHeight, window.innerHeight, 1);
      // Normalize progress over the opening chapter so the camera tracks the scene leaving the frame.
      scrollProgress.current = MathUtils.clamp(-top / span, 0, 1);
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
    <div ref={sceneRef} className="hero-scene" aria-label="Scroll-driven 3D cave journey" role="img">
      {motionAllowed ? (
        <Canvas
          dpr={[1, 1.45]}
          camera={{ position: [0, 0, 5.2], fov: 67 }}
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
        {motionAllowed ? (shouldAnimate ? "SCROLL TO ENTER / LIVE 3D CAVE" : "3D SCENE PAUSED / PERFORMANCE SAVING") : "STATIC PREVIEW / REDUCED MOTION"}
      </span>
    </div>
  );
}
