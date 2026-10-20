"use client";

import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, MathUtils, type Group, InstancedMesh, Mesh, Object3D, IcosahedronGeometry, MeshStandardMaterial } from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

type ProgressRef = { current: number };

function CaveRocks() {
  const geometry = useMemo(() => new IcosahedronGeometry(1, 1), []);
  const material = useMemo(() => new MeshStandardMaterial({ color: "#30252f", roughness: 0.98, metalness: 0.02, flatShading: true }), []);
  const rocks = useMemo(() => Array.from({ length: 230 }, (_, i) => {
    const angle = i * 2.399963;
    const z = 7.5 - ((i * 37) % 290) / 10;
    const radius = 2.05 + ((i * 19) % 41) / 30;
    const size = 0.12 + ((i * 13) % 17) / 100;
    return {
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, z] as [number, number, number],
      scale: [size * (1 + (i % 3) * 0.45), size * (0.7 + (i % 4) * 0.2), size * (0.9 + (i % 5) * 0.14)] as [number, number, number],
      rotation: [angle * 0.8, angle * 0.43, angle * 0.27] as [number, number, number],
    };
  }), []);
  const rockMesh = useMemo(() => {
    const mesh = new InstancedMesh(geometry, material, rocks.length);
    const dummy = new Object3D();
    rocks.forEach((rock, index) => {
      dummy.position.set(...rock.position);
      dummy.rotation.set(...rock.rotation);
      dummy.scale.set(...rock.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    return mesh;
  }, [geometry, material, rocks]);

  return <primitive object={rockMesh as unknown as Object3D} dispose={null} />;
}

function caveCenter(t: number): [number, number] {
  // A hand-shaped cave spline: a broad left bend, a right-hand dogleg, then a
  // subtle vertical drop. The same curve drives the rock shell and camera rail.
  const p = MathUtils.clamp(t, 0, 1);
  return [
    Math.sin(p * Math.PI * 2.05) * 1.08 + Math.sin(p * Math.PI * 5.1 + 0.45) * 0.22,
    Math.sin(p * Math.PI * 3.1 - 0.3) * 0.34 + Math.sin(p * Math.PI * 7.0) * 0.09,
  ];
}

function CaveShell() {
  const shell = useMemo(() => {
    const radialSegments = 88;
    const axialSegments = 156;
    const positions: number[] = [];
    const colors: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let row = 0; row <= axialSegments; row++) {
      const t = row / axialSegments;
      const z = 9 - t * 63;
      const [cx, cy] = caveCenter(t);
      const [nextX, nextY] = caveCenter(Math.min(1, t + 0.002));
      const tangentX = nextX - cx;
      const tangentY = nextY - cy;
      const yaw = Math.atan2(tangentX, 1);
      const pitch = Math.atan2(tangentY, 1);
      const baseRadius = 3.12 + Math.sin(t * 15.2) * 0.16 + Math.sin(t * 33.7 + 0.8) * 0.08;

      for (let segment = 0; segment <= radialSegments; segment++) {
        const u = segment / radialSegments;
        const angle = u * Math.PI * 2;
        const broadRock = Math.sin(angle * 3.0 + t * 11.0) * 0.27
          + Math.sin(angle * 5.0 - t * 18.0 + 0.8) * 0.16
          + Math.cos(angle * 8.0 + t * 27.0) * 0.075;
        const fracturedRock = Math.sin(angle * 17.0 + t * 47.0) * 0.032
          + Math.sin(angle * 29.0 - t * 69.0) * 0.014;
        const strata = Math.sin(t * 52 + Math.sin(angle * 2.0) * 1.8) * 0.055;
        const radius = baseRadius + broadRock + fracturedRock + strata;
        const localX = Math.cos(angle) * radius;
        const localY = Math.sin(angle) * radius * (0.78 + Math.sin(angle * 2.0 + t * 6.0) * 0.035);
        // Slightly rotate the tunnel cross-section through each bend, avoiding a
        // uniform cylindrical pipe silhouette.
        const x = cx + localX * Math.cos(yaw) - localY * Math.sin(yaw);
        const y = cy + localX * Math.sin(pitch) + localY * Math.cos(pitch);
        positions.push(x, y, z);
        uvs.push(u * 3.8, t * 7.5);

        const mineral = Math.sin(angle * 2.7 + t * 18.0) * 0.5 + 0.5;
        const damp = Math.max(0, Math.sin(angle + 0.6) * 0.5 + 0.5);
        const roughness = Math.max(0.08, Math.min(0.95, 0.32 + broadRock * 0.6 + fracturedRock * 1.5 + mineral * 0.16));
        const shadowPocket = Math.max(0, Math.sin(angle * 6.0 + t * 38.0) * Math.cos(t * 91.0)) * 0.08;
        colors.push(
          0.105 + roughness * 0.14 + mineral * 0.025 - shadowPocket,
          0.075 + roughness * 0.105 + damp * 0.018 - shadowPocket * 0.7,
          0.068 + roughness * 0.092 + mineral * 0.045 - shadowPocket * 0.5,
        );
      }
    }

    for (let row = 0; row < axialSegments; row++) {
      for (let segment = 0; segment < radialSegments; segment++) {
        const a = row * (radialSegments + 1) + segment;
        const b = a + radialSegments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const material = useMemo(() => new MeshStandardMaterial({
    color: "#ffffff",
    vertexColors: true,
    roughness: 0.99,
    metalness: 0.005,
    side: DoubleSide,
  }), []);
  const mesh = useMemo(() => new Mesh(shell, material), [shell, material]);
  return <primitive object={mesh as unknown as Object3D} dispose={null} />;
}

function CaveGuideDots() {
  const dots = useMemo(() => Array.from({ length: 96 }, (_, i) => {
    const t = 0.025 + (i / 95) * 0.94;
    const [cx, cy] = caveCenter(t);
    const z = 9 - t * 63;
    // A subtle dotted bioluminescent seam sits low on the cave wall/floor.
    const side = i % 2 === 0 ? -1 : 1;
    return {
      position: [cx + side * (1.55 + Math.sin(t * 34) * 0.18), cy - 1.78 + Math.sin(t * 19) * 0.08, z] as [number, number, number],
      size: 0.018 + (i % 5) * 0.004,
      opacity: 0.22 + (i % 4) * 0.08,
    };
  }), []);
  return <group>
    {dots.map((dot, i) => (
      <mesh key={i} position={dot.position} scale={dot.size}>
        <sphereGeometry args={[1, 7, 6]} />
        <meshBasicMaterial color={i % 7 === 0 ? "#d8b98c" : "#8bbfc4"} transparent opacity={dot.opacity} />
      </mesh>
    ))}
  </group>;
}
function CaveTunnel() {
  return (
    <group>
      <CaveShell />
      <CaveGuideDots />
      <mesh position={[0, 0, 8.65]} rotation={[0.035, -0.02, 0.08]}>
        <torusGeometry args={[2.72, 0.2, 10, 84]} />
        <meshStandardMaterial color="#51414f" roughness={0.98} metalness={0.015} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={"stalactite-" + i} position={[-2.05 + i * 0.67, 2.05 + Math.sin(i * 1.3) * 0.18, 6.8 - (i % 3) * 1.45]} rotation={[Math.PI, 0.08 * Math.sin(i), 0.12 * Math.cos(i)]} scale={[0.72 + (i % 2) * 0.3, 0.85 + (i % 3) * 0.35, 0.72 + (i % 2) * 0.25]}>
          <coneGeometry args={[0.24, 0.9, 6, 1]} />
          <meshStandardMaterial color="#493947" roughness={0.99} flatShading />
        </mesh>
      ))}
      <CaveRocks />
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={"crystal-" + i} position={[Math.sin(i * 2.4) * 1.65, Math.cos(i * 1.37) * 1.8, 2 - i * 1.65]} rotation={[i * 0.51, i * 0.29, i * 0.7]}>
          <octahedronGeometry args={[0.12 + (i % 3) * 0.055, 0]} />
          <meshStandardMaterial color={i % 2 ? "#9b7d9f" : "#bb926d"} emissive={i % 2 ? "#2b1437" : "#3b2110"} emissiveIntensity={0.8} roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function DataChamber() {
  const chamber = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!chamber.current) return;
    const p = state.clock.elapsedTime;
    chamber.current.rotation.z = MathUtils.damp(chamber.current.rotation.z, Math.sin(p * 0.19) * 0.025, 1.3, Math.min(delta, 0.045));
    chamber.current.scale.setScalar(0.98 + Math.sin(p * 0.4) * 0.018);
  });
  return (
    <group ref={chamber}>
      {Array.from({ length: 18 }, (_, i) => {
        const z = -15.5 - i * 1.23;
        const radius = 2.3 + Math.sin(i * 1.37) * 0.14;
        return (
          <group key={i} position={[Math.sin(i * 0.35) * 0.12, Math.cos(i * 0.41) * 0.12, z]} rotation={[0.06 * Math.sin(i), 0.08 * Math.cos(i * 0.71), i * 0.13]}>
            <mesh>
              <torusGeometry args={[radius, 0.018, 6, 72]} />
              <meshStandardMaterial color={i % 3 === 0 ? "#e4bd8a" : "#9982d3"} emissive={i % 3 === 0 ? "#7d4e26" : "#33205d"} emissiveIntensity={0.65} roughness={0.28} metalness={0.72} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[radius * 0.72, 0.009, 5, 64]} />
              <meshBasicMaterial color="#8bbfc4" transparent opacity={0.56} />
            </mesh>
            {Array.from({ length: 4 }, (_, j) => (
              <mesh key={j} position={[Math.cos(j * Math.PI / 2 + i * 0.21) * radius, Math.sin(j * Math.PI / 2 + i * 0.21) * radius, 0]} scale={0.055 + (j % 2) * 0.025}>
                <octahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color={j % 2 ? "#e6c795" : "#b29bff"} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function ProjectRelics() {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    const step = Math.min(delta, 0.045);
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 0.16) * 0.07, 1.2, step);
  });
  const relics = [
    { position: [-2.2, 0.45, -22.4] as [number, number, number], color: "#e4b77c", scale: 0.58 },
    { position: [0.15, -0.35, -27.3] as [number, number, number], color: "#a9d4ff", scale: 0.66 },
    { position: [2.15, 0.45, -32.2] as [number, number, number], color: "#a5d7be", scale: 0.62 },
  ];
  return (
    <group ref={group}>
      {relics.map((relic, i) => (
        <group key={i} position={relic.position}>
          <mesh scale={relic.scale}>
            <icosahedronGeometry args={[1, 2]} />
            <meshPhysicalMaterial color={relic.color} metalness={0.55} roughness={0.19} clearcoat={1} emissive={relic.color} emissiveIntensity={0.16} />
          </mesh>
          <mesh rotation={[0.42 + i * 0.31, 0.25, 0.8]}>
            <torusGeometry args={[relic.scale * 1.55, 0.012, 6, 80]} />
            <meshBasicMaterial color={relic.color} transparent opacity={0.85} />
          </mesh>
          <mesh rotation={[1.18, -0.4, i * 0.6]}>
            <torusGeometry args={[relic.scale * 1.88, 0.009, 6, 72]} />
            <meshBasicMaterial color="#a98cf4" transparent opacity={0.55} />
          </mesh>
          <pointLight color={relic.color} intensity={2.5} distance={5} />
        </group>
      ))}
    </group>
  );
}

function RobotArm() {
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  useFrame((state, delta) => {
    const step = Math.min(delta, 0.045);
    const beat = Math.sin(state.clock.elapsedTime * 0.42);
    if (shoulder.current) shoulder.current.rotation.z = MathUtils.damp(shoulder.current.rotation.z, -0.42 + beat * 0.12, 1.1, step);
    if (elbow.current) elbow.current.rotation.z = MathUtils.damp(elbow.current.rotation.z, 0.74 + Math.sin(state.clock.elapsedTime * 0.31) * 0.16, 1.0, step);
  });
  return (
    <group position={[0.55, -1.15, -40.5]} rotation={[0, -0.25, 0]}>
      <mesh position={[0, -0.18, 0]}><cylinderGeometry args={[0.72, 0.86, 0.32, 32]} /><meshStandardMaterial color="#302b36" metalness={0.86} roughness={0.29} /></mesh>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.48, 0.56, 0.3, 32]} /><meshStandardMaterial color="#b18b62" metalness={0.84} roughness={0.24} /></mesh>
      <mesh position={[0, 0.4, 0]}><sphereGeometry args={[0.34, 22, 22]} /><meshPhysicalMaterial color="#77727e" metalness={0.92} roughness={0.2} clearcoat={0.8} /></mesh>
      <group ref={shoulder} position={[0, 0.42, 0]}>
        <mesh position={[0.16, 0.86, 0]} rotation={[0, 0, -0.24]}><boxGeometry args={[0.42, 1.8, 0.42]} /><meshStandardMaterial color="#b8a17d" metalness={0.86} roughness={0.22} /></mesh>
        <mesh position={[0.28, 1.62, 0]}><sphereGeometry args={[0.3, 22, 22]} /><meshPhysicalMaterial color="#4c4a55" metalness={0.94} roughness={0.18} /></mesh>
        <group ref={elbow} position={[0.28, 1.62, 0]}>
          <mesh position={[0.22, 0.78, 0]} rotation={[0, 0, 0.28]}><boxGeometry args={[0.34, 1.58, 0.34]} /><meshStandardMaterial color="#8f90a4" metalness={0.9} roughness={0.2} /></mesh>
          <mesh position={[0.35, 1.47, 0]}><sphereGeometry args={[0.23, 20, 20]} /><meshPhysicalMaterial color="#d4b58c" metalness={0.92} roughness={0.18} /></mesh>
          <group position={[0.35, 1.55, 0]}>
            <mesh position={[0.1, 0.18, 0]}><boxGeometry args={[0.46, 0.22, 0.34]} /><meshStandardMaterial color="#c6b59a" metalness={0.88} roughness={0.2} /></mesh>
            <mesh position={[0.28, -0.02, 0.09]} rotation={[0, 0, -0.32]}><boxGeometry args={[0.08, 0.4, 0.08]} /><meshStandardMaterial color="#e2c18d" metalness={0.9} roughness={0.23} /></mesh>
            <mesh position={[0.28, -0.02, -0.09]} rotation={[0, 0, -0.32]}><boxGeometry args={[0.08, 0.4, 0.08]} /><meshStandardMaterial color="#e2c18d" metalness={0.9} roughness={0.23} /></mesh>
          </group>
        </group>
      </group>
      <pointLight position={[0.3, 1.7, 1.2]} color="#e4b77c" intensity={2.8} distance={7} />
    </group>
  );
}

function World({ progressRef }: { progressRef: ProgressRef }) {
  const world = useRef<Group>(null);
  useFrame((state, delta) => {
    const step = Math.min(delta, 0.045);
    const progress = MathUtils.clamp(progressRef.current, 0, 1);
    const camera = state.camera;
    const targetZ = 14 - progress * 54;
    const [pathX, pathY] = caveCenter(progress);
    const [aheadX, aheadY] = caveCenter(Math.min(1, progress + 0.035));
    const bendStrength = MathUtils.clamp((aheadX - pathX) * 0.9, -0.62, 0.62);
    camera.position.z = MathUtils.damp(camera.position.z, targetZ, 4.7, step);
    camera.position.x = MathUtils.damp(camera.position.x, pathX, 3.2, step);
    camera.position.y = MathUtils.damp(camera.position.y, pathY, 3.0, step);
    // Look through the next section of the passage, so the camera visibly banks
    // into each dogleg instead of staring down an endless straight tube.
    camera.lookAt(aheadX + bendStrength, aheadY + (aheadY - pathY) * 1.8, camera.position.z - 8.5);
    camera.rotation.z = MathUtils.damp(camera.rotation.z, -bendStrength * 0.18, 2.2, step);
    if (world.current) {
      world.current.rotation.z = MathUtils.damp(world.current.rotation.z, Math.sin(progress * Math.PI * 3) * 0.012, 1.8, step);
    }
  });

  return (
    <>
      <color attach="background" args={["#09070c"]} />
      <fog attach="fog" args={["#09070c", 7, 31]} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[4, 5, 3]} intensity={1.35} color="#f3e6d7" />
      <pointLight position={[0, 0, 5]} intensity={5.5} distance={14} color="#c8a27d" />
      <pointLight position={[-3, 1.8, -11]} intensity={4.2} distance={17} color="#9d70bb" />
      <pointLight position={[2.8, -1.4, -25]} intensity={3.6} distance={14} color="#7d9eb9" />
      <pointLight position={[-1.8, 2.5, -43]} intensity={5.4} distance={15} color="#e3b477" />
      <group ref={world}>
        <CaveTunnel />
        <DataChamber />
        <ProjectRelics />
        <RobotArm />
        <group position={[0, 0, -52]}>
          <mesh><torusGeometry args={[2.15, 0.045, 8, 100]} /><meshPhysicalMaterial color="#e8c38e" metalness={0.82} roughness={0.2} emissive="#604224" emissiveIntensity={0.9} /></mesh>
          <mesh rotation={[0.5, 0.35, 0.75]}><torusGeometry args={[1.66, 0.017, 8, 90]} /><meshBasicMaterial color="#a690e9" transparent opacity={0.9} /></mesh>
          <mesh><icosahedronGeometry args={[0.76, 3]} /><meshPhysicalMaterial color="#d9c4ed" metalness={0.48} roughness={0.16} transparent opacity={0.78} transmission={0.18} clearcoat={1} emissive="#47245f" emissiveIntensity={0.6} /></mesh>
          <pointLight intensity={9} distance={15} color="#e2bc88" />
        </group>
      </group>
    </>
  );
}

const scenes = [
  { id: "opening", from: -0.035, to: 0.15 },
  { id: "identity", from: 0.105, to: 0.30 },
  { id: "approach", from: 0.265, to: 0.435 },
  { id: "code", from: 0.40, to: 0.535 },
  { id: "opticode", from: 0.50, to: 0.60 },
  { id: "learning", from: 0.575, to: 0.68 },
  { id: "marketplace", from: 0.655, to: 0.755 },
  { id: "robotics", from: 0.725, to: 0.89 },
  { id: "ending", from: 0.855, to: 1.04 },
] as const;

export function CinematicStory() {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const sceneProgress = useRef(0);
  const [motionAllowed, setMotionAllowed] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setMotionAllowed(!reduceMotion.matches);
    const onVisibility = () => setVisible(!document.hidden);
    onMotion();
    onVisibility();
    reduceMotion.addEventListener?.("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);

    const storyScenes = Array.from(document.querySelectorAll<HTMLElement>("[data-story-scene]"));
    const hint = document.querySelector<HTMLElement>("[data-scroll-hint]");
    const update = () => {
      const track = trackRef.current;
      if (!track) return;
      const scrollRoot = scrollRootRef.current;
      if (!scrollRoot) return;
      // A dedicated full-screen scroll surface keeps the sticky camera rail deterministic
      // across desktop browsers, mobile address-bar changes, and static GitHub Pages exports.
      const scrollable = Math.max(1, track.offsetHeight - scrollRoot.clientHeight);
      const progress = MathUtils.clamp(scrollRoot.scrollTop / scrollable, 0, 1);
      sceneProgress.current = progress;
      track.style.setProperty("--story-progress", progress.toFixed(4));
      storyScenes.forEach((panel) => {
        const from = Number(panel.dataset.from ?? 0);
        const to = Number(panel.dataset.to ?? 1);
        const fade = 0.038;
        const enter = MathUtils.clamp((progress - from) / fade, 0, 1);
        const leave = 1 - MathUtils.clamp((progress - (to - fade)) / fade, 0, 1);
        const opacity = Math.min(enter, leave);
        panel.style.opacity = String(opacity);
        panel.style.transform = "translate3d(0,calc(-50% + " + ((1 - opacity) * 24) + "px),0) scale(" + (0.986 + opacity * 0.014) + ")";
        panel.style.pointerEvents = opacity > 0.55 ? "auto" : "none";
        panel.setAttribute("aria-hidden", opacity > 0.3 ? "false" : "true");
        panel.inert = opacity <= 0.3;
      });
      if (hint) {
        const hintOpacity = 1 - MathUtils.clamp(progress / 0.10, 0, 1);
        hint.style.opacity = String(hintOpacity);
      }
      const activeId = scenes.find((scene) => progress >= scene.from && progress < scene.to)?.id ?? "ending";
      track.dataset.chapter = activeId;
      const chapterLabel = document.querySelector<HTMLElement>("[data-chapter-label]");
      if (chapterLabel) chapterLabel.textContent = String(scenes.findIndex((scene) => scene.id === activeId) + 1).padStart(2, "0");
    };

    let raf = 0;
    const queueUpdate = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => { raf = 0; update(); });
    };
    update();
    const scrollRoot = scrollRootRef.current;
    scrollRoot?.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate, { passive: true });
    return () => {
      reduceMotion.removeEventListener?.("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      scrollRoot?.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={scrollRootRef} className="cinematic-story-scroll">
    <section ref={trackRef} className="cinematic-story-track" aria-label="Mahin Patel — a cinematic journey through code, systems, and robotics" data-chapter="opening">
      <div className="cinematic-story-stage">
        {motionAllowed ? (
          <Canvas
            dpr={[1, 1.35]}
            camera={{ position: [0, 0, 14], fov: 67, near: 0.1, far: 100 }}
            gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
            frameloop={visible ? "always" : "never"}
            fallback={<div className="cinema-cave-fallback" aria-hidden="true" />}
          >
            <Suspense fallback={null}><World progressRef={sceneProgress} /></Suspense>
          </Canvas>
        ) : <div className="cinema-cave-fallback" aria-hidden="true" />}
        <div className="cinema-vignette" aria-hidden="true" />
        <div className="cinema-atmosphere" aria-hidden="true" />
        <div className="cinema-film-grain" aria-hidden="true" />
        <div className="cinema-frame-lines" aria-hidden="true" />

        <div className="cinema-scene-copy cinema-copy-opening" data-story-scene data-from="-0.035" data-to="0.15" aria-hidden="false">
          <span className="cinema-scene-kicker"><i /> AN INTERACTIVE FILM / 001</span>
          <h1>STEP INTO<br /><span>THE UNKNOWN.</span></h1>
          <p>A journey from curiosity to code — and from code to the physical world.</p>
          <span className="cinema-scene-micro">SCROLL TO DESCEND <b>↓</b></span>
        </div>

        <div className="cinema-scene-copy cinema-copy-identity" data-story-scene data-from="0.105" data-to="0.30" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> THE PERSON BEHIND THE BUILDS</span>
          <h2>MAHIN<br /><span>PATEL.</span></h2>
          <p>Student programmer. Independent builder. Future robotics and automation engineer.</p>
          <div className="cinema-chips"><span>AHMEDABAD, INDIA</span><span>LEARN / BUILD / REPEAT</span></div>
        </div>

        <div className="cinema-scene-copy cinema-copy-approach" data-story-scene data-from="0.265" data-to="0.435" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> CHAPTER 02 / THE APPROACH</span>
          <h2>CURIOSITY<br />BECOMES<br /><span>SOMETHING REAL.</span></h2>
          <p>Ask better questions. Build a rough version. Test what breaks. Improve what matters. Every project is another step from an idea to a working system.</p>
          <div className="cinema-wordline">OBSERVE <b>✳</b> EXPERIMENT <b>✳</b> REFINE</div>
        </div>

        <div className="cinema-scene-copy cinema-copy-code" data-story-scene data-from="0.40" data-to="0.535" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> CHAPTER 03 / THE DIGITAL FRONTIER</span>
          <h2>CODE IS<br />THE FIRST <span>DOOR.</span></h2>
          <p>Interfaces, applications and connected systems — the starting point for turning abstract ideas into something people can use.</p>
          <div className="cinema-chips"><span>HTML / CSS / JS</span><span>REACT</span><span>PYTHON / SYSTEMS</span></div>
        </div>

        <div className="cinema-project-reveal" data-story-scene data-from="0.50" data-to="0.60" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> PROJECT WORLD / 001</span>
          <span className="cinema-project-counter">01 — 03</span>
          <h2>OPTICODE<br /><span>STUDIO.</span></h2>
          <p>Moving information through light. Exploring optical file transfer, QR streams, frame reconstruction and offline-first communication.</p>
          <a href="https://github.com/Mahin98250/OptiCode-Studio" target="_blank" rel="noreferrer">ENTER PROJECT <span>↗</span></a>
        </div>

        <div className="cinema-project-reveal cinema-project-reveal-right" data-story-scene data-from="0.575" data-to="0.68" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> PROJECT WORLD / 002</span>
          <span className="cinema-project-counter">02 — 03</span>
          <h2>LEARNER’S<br /><span>GUIDE.</span></h2>
          <p>A student-focused learning platform designed to make study resources and everyday learning workflows easier to navigate.</p>
          <a href="https://github.com/Mahin98250/Final-Learner-s-Guide" target="_blank" rel="noreferrer">ENTER PROJECT <span>↗</span></a>
        </div>

        <div className="cinema-project-reveal" data-story-scene data-from="0.655" data-to="0.755" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> PROJECT WORLD / 003</span>
          <span className="cinema-project-counter">03 — 03</span>
          <h2>DUDHWALA<br /><span>MARKETPLACE.</span></h2>
          <p>Connecting customers with independent local milk sellers through a marketplace built around distinct journeys and useful everyday interactions.</p>
          <a href="https://github.com/Mahin98250/Dudh-Wallah" target="_blank" rel="noreferrer">ENTER PROJECT <span>↗</span></a>
        </div>

        <div className="cinema-scene-copy cinema-copy-robotics" data-story-scene data-from="0.725" data-to="0.89" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> CHAPTER 05 / THE PHYSICAL WORLD</span>
          <h2>FROM<br />CODE TO<br /><span>MACHINES.</span></h2>
          <p>The long game: robotics, sensors, control systems and automation — where software starts interacting with the real world.</p>
          <div className="cinema-chips"><span>ENGINEERING</span><span>CONTROL</span><span>ROBOTICS</span></div>
        </div>

        <div className="cinema-scene-copy cinema-copy-ending" data-story-scene data-from="0.855" data-to="1.04" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> THE NEXT CHAPTER IS YOURS TO EXPLORE</span>
          <h2>BUILD WHAT’S<br /><span>NEXT.</span></h2>
          <p>Still learning. Still experimenting. Working toward a future in robotics and automation, one real project at a time.</p>
          <div className="cinema-ending-actions">
            <Link href="/projects">EXPLORE THE WORK <span>↗</span></Link>
            <Link href="/journey">FOLLOW THE JOURNEY <span>↗</span></Link>
            <Link href="/contact">GET IN TOUCH <span>↗</span></Link>
          </div>
          <span className="cinema-end-note">MAHIN PATEL / ALWAYS IN PROGRESS</span>
        </div>

        <div className="cinema-hud-top"><span>MP<span className="hud-dot">●</span></span><span>AN ORIGINAL INTERACTIVE STORY</span><span>AHMEDABAD / IN</span></div>
        <div className="cinema-hud-bottom"><span data-scroll-hint>SCROLL TO TRAVEL <b>↓</b></span><span className="cinema-chapter-status">CINEMATIC MODE / <b data-chapter-label>01</b></span></div>
        <div className="cinema-progress-track"><span data-progress-bar /></div>
      </div>
    </section>
    </div>
  );
}
