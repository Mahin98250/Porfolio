"use client";

import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { BufferGeometry, DataTexture, DoubleSide, Float32BufferAttribute, LinearFilter, LinearMipmapLinearFilter, MathUtils, RepeatWrapping, SRGBColorSpace, type Group, InstancedMesh, Mesh, Object3D, IcosahedronGeometry, MeshStandardMaterial } from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

type ProgressRef = { current: number };

function hash01(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function hash3(x: number, y: number, z: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return (value - Math.floor(value)) * 2 - 1;
}

function fadeNoise(value: number): number {
  return value * value * (3 - 2 * value);
}

function noise3(x: number, y: number, z: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const fx = fadeNoise(x - x0);
  const fy = fadeNoise(y - y0);
  const fz = fadeNoise(z - z0);
  const x00 = MathUtils.lerp(hash3(x0, y0, z0), hash3(x0 + 1, y0, z0), fx);
  const x10 = MathUtils.lerp(hash3(x0, y0 + 1, z0), hash3(x0 + 1, y0 + 1, z0), fx);
  const x01 = MathUtils.lerp(hash3(x0, y0, z0 + 1), hash3(x0 + 1, y0, z0 + 1), fx);
  const x11 = MathUtils.lerp(hash3(x0, y0 + 1, z0 + 1), hash3(x0 + 1, y0 + 1, z0 + 1), fx);
  return MathUtils.lerp(MathUtils.lerp(x00, x10, fy), MathUtils.lerp(x01, x11, fy), fz);
}

function noise2(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = fadeNoise(x - x0);
  const fy = fadeNoise(y - y0);
  const a = MathUtils.lerp(hash3(x0, y0, 0), hash3(x0 + 1, y0, 0), fx);
  const b = MathUtils.lerp(hash3(x0, y0 + 1, 0), hash3(x0 + 1, y0 + 1, 0), fx);
  return MathUtils.lerp(a, b, fy);
}

function caveCenter(t: number): [number, number] {
  // A wider, more deliberate route: bends are part of the rock volume, not
  // just a banking camera laid over a straight corridor.
  const p = MathUtils.clamp(t, 0, 1);
  return [
    Math.sin(p * Math.PI * 2.65) * 1.62
      + Math.sin(p * Math.PI * 5.15) * 0.44
      + Math.sin(p * Math.PI * 8.1) * 0.13,
    Math.sin(p * Math.PI * 1.9) * 0.48
      + Math.sin(p * Math.PI * 5.6) * 0.16,
  ];
}

function caveRadiusAt(t: number): number {
  const bell = (center: number, width: number) => {
    const d = (t - center) / width;
    return Math.exp(-d * d * 0.5);
  };
  // Broad rooms alternate with deliberately pinched rock gates. A radius
  // envelope like this creates visible changes in scale instead of one tube.
  return 2.58
    + 1.12 * bell(0.205, 0.075)
    + 1.72 * bell(0.565, 0.092)
    + 0.82 * bell(0.805, 0.062)
    - 0.58 * bell(0.415, 0.043)
    - 0.39 * bell(0.704, 0.037);
}

function makeRockTextures(): { color: DataTexture; height: DataTexture } {
  const size = 384;
  const colorData = new Uint8Array(size * size * 4);
  const heightData = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const broad = noise2(x / 118, y / 118);
      const mid = noise2(x / 39, y / 39);
      const fine = noise2(x / 11, y / 11);
      const grain = noise2(x / 3.2, y / 3.2);
      const bedding = Math.sin(y / 27 + noise2(x / 58, y / 43) * 2.4) * 0.07;
      const pore = noise2(x / 1.6, y / 1.6) * 0.035;
      const value = MathUtils.clamp(0.5 + broad * 0.24 + mid * 0.15 + fine * 0.075 + grain * 0.035 + bedding + pore, 0, 1);
      const i = (y * size + x) * 4;

      // Muted mineral grey, umber and limestone tones; contrast is kept
      // restrained so the lighting, not a painted pattern, defines the rock.
      colorData[i] = Math.round(39 + value * 37);
      colorData[i + 1] = Math.round(35 + value * 32);
      colorData[i + 2] = Math.round(31 + value * 29);
      colorData[i + 3] = 255;

      const relief = MathUtils.clamp(0.5 + broad * 0.25 + mid * 0.2 + fine * 0.11 + grain * 0.06 + bedding, 0, 1);
      const h = Math.round(255 * relief);
      heightData[i] = h;
      heightData[i + 1] = h;
      heightData[i + 2] = h;
      heightData[i + 3] = 255;
    }
  }

  const color = new DataTexture(colorData, size, size);
  color.colorSpace = SRGBColorSpace;
  color.wrapS = RepeatWrapping;
  color.wrapT = RepeatWrapping;
  color.magFilter = LinearFilter;
  color.minFilter = LinearMipmapLinearFilter;
  color.generateMipmaps = true;
  color.needsUpdate = true;

  const height = new DataTexture(heightData, size, size);
  height.wrapS = RepeatWrapping;
  height.wrapT = RepeatWrapping;
  height.magFilter = LinearFilter;
  height.minFilter = LinearMipmapLinearFilter;
  height.generateMipmaps = true;
  height.needsUpdate = true;

  return { color, height };
}

function CaveRocks() {
  const geometry = useMemo(() => new IcosahedronGeometry(1, 1), []);
  const material = useMemo(() => new MeshStandardMaterial({
    color: "#5d5148",
    roughness: 0.99,
    metalness: 0,
    flatShading: true,
  }), []);
  const rocks = useMemo(() => Array.from({ length: 154 }, (_, i) => {
    const t = 0.025 + hash01(i * 23.91 + 5.3) * 0.93;
    const angle = hash01(i * 61.17 + 1.7) * Math.PI * 2;
    const [cx, cy] = caveCenter(t);
    const z = 8.35 - t * 62.2;
    const roomRadius = caveRadiusAt(t);
    const size = 0.13 + hash01(i * 14.31 + 2.1) * 0.25;
    // Rocks sit partially embedded at the wall surface; they are not scattered
    // through the middle of the viewer's path.
    const radius = roomRadius * (1 + noise3(Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, t * 5) * 0.045) - size * 0.72;
    const verticalScale = Math.sin(angle) > 0 ? 1.04 : 0.74;
    return {
      position: [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * verticalScale, z] as [number, number, number],
      scale: [
        size * (0.8 + hash01(i * 2.13) * 1.1),
        size * (0.65 + hash01(i * 7.31) * 0.95),
        size * (0.75 + hash01(i * 11.71) * 1.0),
      ] as [number, number, number],
      rotation: [
        hash01(i * 3.97) * Math.PI,
        hash01(i * 4.83) * Math.PI,
        hash01(i * 9.13) * Math.PI,
      ] as [number, number, number],
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

function CaveShell() {
  const shell = useMemo(() => {
    // A denser, non-uniform shell. Large-scale chambers and constrictions are
    // sculpted into the cross-section before rock detail is added.
    const radialSegments = 144;
    const axialSegments = 224;
    const positions: number[] = [];
    const colors: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let row = 0; row <= axialSegments; row++) {
      const t = row / axialSegments;
      const z = 9 - t * 63;
      const [cx, cy] = caveCenter(t);
      const radiusAt = caveRadiusAt(t);

      for (let segment = 0; segment <= radialSegments; segment++) {
        const u = segment / radialSegments;
        const angle = u * Math.PI * 2;
        const aroundX = Math.cos(angle);
        const aroundY = Math.sin(angle);
        // Noise is sampled in circular 3D coordinates so the seam at 0/2π
        // matches. Broad noise creates natural masses; finer octaves add
        // broken ledges and erosion instead of repeated sinusoidal rings.
        const coarse = noise3(aroundX * 1.7 + 8, aroundY * 1.7 - 4, t * 7.5);
        const medium = noise3(aroundX * 5.2 - 2, aroundY * 5.2 + 6, t * 23);
        const fine = noise3(aroundX * 15.5, aroundY * 15.5, t * 48);
        const angularBreakup = noise3(aroundX * 3.1 + t * 1.2, aroundY * 3.1, t * 14);
        const radius = radiusAt * (1 + coarse * 0.145 + medium * 0.064 + angularBreakup * 0.038) + fine * 0.045;

        // The floor is lower and flatter than the roof; upper surfaces have
        // more headroom and uneven overhangs. This deliberately avoids a
        // symmetric oval cross-section.
        const verticalScale = aroundY >= 0 ? 1.08 : 0.73;
        const floorRidge = Math.max(0, -aroundY) * Math.sin(t * 31 + aroundX * 5.7 + coarse) * 0.105;
        const x = cx + aroundX * radius * (0.98 + medium * 0.045);
        const y = cy + aroundY * radius * verticalScale + floorRidge;
        positions.push(x, y, z);
        uvs.push(u * 3.8, t * 7.5);

        const mineral = Math.max(0, Math.sin(angle * 2.3 + coarse * 2.2 + t * 8.7)) * 0.5;
        const shade = MathUtils.clamp(0.82 + coarse * 0.10 + medium * 0.07 + fine * 0.035 - mineral * 0.035, 0.58, 1.0);
        colors.push(shade, shade * (0.97 + mineral * 0.025), shade * (0.93 + mineral * 0.08));
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

  const maps = useMemo(() => makeRockTextures(), []);
  const material = useMemo(() => new MeshStandardMaterial({
    color: "#d4c7b3",
    map: maps.color,
    bumpMap: maps.height,
    bumpScale: 0.17,
    vertexColors: true,
    roughness: 0.98,
    metalness: 0,
    side: DoubleSide,
  }), [maps]);
  const mesh = useMemo(() => new Mesh(shell, material), [shell, material]);
  return <primitive object={mesh as unknown as Object3D} dispose={null} />;
}

function CaveGuideDots() {
  const dots = useMemo(() => Array.from({ length: 62 }, (_, i) => {
    const t = 0.025 + (i / 61) * 0.94;
    const [cx, cy] = caveCenter(t);
    const radius = caveRadiusAt(t);
    const z = 9 - t * 63;
    // A single quiet trail follows the actual cave route near the floor rather
    // than alternating left/right and making a decorative zig-zag.
    return {
      position: [cx + 0.17 + Math.sin(t * 17) * 0.045, cy - radius * 0.69, z] as [number, number, number],
      size: 0.012 + hash01(i * 7.43 + 2.8) * 0.012,
      opacity: 0.15 + hash01(i * 12.7 + 1.4) * 0.16,
    };
  }), []);
  return <group>
    {dots.map((dot, i) => (
      <mesh key={i} position={dot.position} scale={dot.size}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshBasicMaterial color={i % 9 === 0 ? "#bba68b" : "#91b1b4"} transparent opacity={dot.opacity} depthWrite={false} />
      </mesh>
    ))}
  </group>;
}

function makeFormationGeometry(seed: number, length: number, hanging: boolean): BufferGeometry {
  const radialSegments = 9;
  const axialSegments = 7;
  const positions: number[] = [];
  const indices: number[] = [];
  const profile = [0.29, 0.34, 0.275, 0.22, 0.155, 0.105, 0.055, 0.012];

  for (let row = 0; row <= axialSegments; row++) {
    const u = row / axialSegments;
    const base = profile[row];
    const taper = length * u;
    for (let segment = 0; segment <= radialSegments; segment++) {
      const angle = (segment / radialSegments) * Math.PI * 2;
      const irregular = 1
        + Math.sin(angle * 3.0 + seed * 1.7 + u * 3.1) * 0.19
        + Math.sin(angle * 5.0 - seed * 0.8 + u * 7.2) * 0.10
        + noise3(Math.cos(angle) * 2.4 + seed, Math.sin(angle) * 2.4, u * 4.2) * 0.13;
      const radius = Math.max(0.006, base * irregular * (0.9 + hash01(seed * 11 + row) * 0.2));
      const lean = Math.sin(u * Math.PI * 0.85 + seed) * u * 0.14;
      positions.push(
        Math.cos(angle) * radius + lean,
        hanging ? -taper : taper,
        Math.sin(angle) * radius * (0.84 + Math.sin(seed) * 0.08),
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
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function CaveFormations() {
  const formations = useMemo(() => Array.from({ length: 35 }, (_, i) => {
    const t = 0.045 + hash01(i * 17.31 + 8.1) * 0.91;
    const [cx, cy] = caveCenter(t);
    const radius = caveRadiusAt(t);
    const choice = hash01(i * 9.73 + 2.4);
    const hanging = choice < 0.64;
    const wall = choice >= 0.64 && choice < 0.83;
    const side = hash01(i * 13.61 + 4.2) > 0.5 ? 1 : -1;
    const length = 0.55 + hash01(i * 23.71 + 3.3) * (hanging ? 1.25 : 0.95);
    const z = 8.35 - t * 61.8;
    const x = wall ? cx + side * radius * 0.80 : cx + (hash01(i * 19.1 + 5.2) - 0.5) * radius * 0.55;
    const y = wall
      ? cy + (hash01(i * 7.7 + 6.2) - 0.48) * radius * 0.78
      : cy + (hanging ? radius * 0.99 : -radius * 0.67);
    const geometry = makeFormationGeometry(i * 1.73 + 0.4, length, hanging);
    return {
      position: [x, y, z] as [number, number, number],
      rotation: [wall ? (hash01(i * 5.7) - 0.5) * 0.8 : 0, (hash01(i * 3.9) - 0.5) * 0.8, wall ? side * Math.PI * 0.42 : (hash01(i * 21.7) - 0.5) * 0.25] as [number, number, number],
      scale: [0.68 + hash01(i * 4.2) * 0.82, 0.7 + hash01(i * 12.5) * 0.95, 0.72 + hash01(i * 8.6) * 0.8] as [number, number, number],
      geometry,
      color: i % 7 === 0 ? "#5b4b40" : i % 3 === 0 ? "#403a35" : "#4b4038",
    };
  }), []);
  return <group>
    {formations.map((formation, i) => (
      <mesh key={i} geometry={formation.geometry} position={formation.position} rotation={formation.rotation} scale={formation.scale}>
        <meshStandardMaterial color={formation.color} roughness={0.99} metalness={0} flatShading />
      </mesh>
    ))}
  </group>;
}

function CaveTunnel() {
  return (
    <group>
      <CaveShell />
      <CaveGuideDots />
      <CaveFormations />
      <CaveRocks />
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
    // Convert camera depth into the cave mesh's own spline parameter. The
    // camera used to follow the same percentage as the scroll story, which
    // made it drift away from the newly sculpted route.
    const routeT = MathUtils.clamp((9 - targetZ) / 63, 0, 1);
    const [pathX, pathY] = caveCenter(routeT);
    const [aheadX, aheadY] = caveCenter(Math.min(1, routeT + 0.055));
    const bendStrength = MathUtils.clamp((aheadX - pathX) * 1.45, -0.82, 0.82);
    camera.position.z = MathUtils.damp(camera.position.z, targetZ, 4.7, step);
    camera.position.x = MathUtils.damp(camera.position.x, pathX, 3.2, step);
    camera.position.y = MathUtils.damp(camera.position.y, pathY, 3.0, step);
    // Look through the next section of the passage, so the camera visibly banks
    // into each dogleg instead of staring down an endless straight tube.
    camera.lookAt(aheadX + bendStrength * 0.72, aheadY + (aheadY - pathY) * 2.0, camera.position.z - 7.8);
    camera.rotation.z = MathUtils.damp(camera.rotation.z, -bendStrength * 0.13, 2.2, step);
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
