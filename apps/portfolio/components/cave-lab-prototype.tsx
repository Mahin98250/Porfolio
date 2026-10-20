"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, MeshStandardMaterial, DoubleSide, Color, Mesh, DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace } from "three";

type V3 = [number, number, number];
const NX = 30, NY = 26, NZ = 82;
const BOUNDS = { minX: -7, maxX: 7, minY: -6, maxY: 6, minZ: -31, maxZ: 9 };
const TETS = [[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]];
const CORNERS: V3[] = [[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];

function centerAt(t: number): [number, number] {
  return [Math.sin(t * Math.PI * 2.15) * 1.6 + Math.sin(t * Math.PI * 4.7) * 0.45,
    Math.sin(t * Math.PI * 2.8) * 0.38 + Math.sin(t * Math.PI * 5.2) * 0.18];
}
function radiusAt(t: number): number {
  const bell = (c: number, w: number) => Math.exp(-0.5 * ((t - c) / w) ** 2);
  return 2.15 + 1.25 * bell(0.28, 0.085) + 2.05 * bell(0.61, 0.105) + 0.85 * bell(0.84, 0.065)
    - 0.42 * bell(0.46, 0.04) - 0.32 * bell(0.75, 0.035);
}
function hash(x: number, y: number, z: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}
function smoothNoise(x: number, y: number, z: number) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fade = (v: number) => v * v * (3 - 2 * v);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const fx = fade(x - ix), fy = fade(y - iy), fz = fade(z - iz);
  const z0 = lerp(
    lerp(hash(ix, iy, iz), hash(ix + 1, iy, iz), fx),
    lerp(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), fx), fy
  );
  const z1 = lerp(
    lerp(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), fx),
    lerp(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), fx), fy
  );
  return lerp(z0, z1, fz);
}
function at<T>(items: readonly T[], index: number): T {
  const value = items[index];
  if (value === undefined) throw new Error("Invalid cave polygon index");
  return value;
}
function field(x: number, y: number, z: number): number {
  const t = (BOUNDS.maxZ - z) / (BOUNDS.maxZ - BOUNDS.minZ);
  const [cx, cy] = centerAt(Math.max(0, Math.min(1, t)));
  const r = radiusAt(Math.max(0, Math.min(1, t)));
  const dx = (x - cx) * (1 + 0.055 * Math.sin(y * 1.7 + z * 0.32));
  const dy = y - cy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const broad = smoothNoise(x * 0.7, y * 0.7, z * 0.35) * 0.34;
  const medium = smoothNoise(x * 1.9, y * 1.9, z * 1.05) * 0.13;
  const fine = smoothNoise(x * 4.1, y * 4.1, z * 2.3) * 0.045;
  const ridges = Math.sin(x * 1.35 + z * 0.23) * Math.sin(y * 1.1 - z * 0.19) * 0.075;
  // Positive is open air. The zero surface is the boundary between the passage and solid rock.
  let air = r - distance + broad + medium + fine + ridges;
  // A side chamber is carved as an overlapping ellipsoid, not a decorative ring.
  const pocketX = x - (cx + (t > 0.33 ? -2.6 : 2.55));
  const pocketY = (y - cy) * 0.9;
  const pocketZ = (z - (t > 0.33 ? -7.5 : -18.5)) * 0.38;
  const pocket = 1.15 - Math.sqrt(pocketX * pocketX + pocketY * pocketY + pocketZ * pocketZ);
  air = Math.max(air, pocket);
  return air;
}
function makeCaveMaps() {
  const size = 256;
  const colorData = new Uint8Array(size * size * 4);
  const heightData = new Uint8Array(size * size * 4);
  const fade = (v: number) => v * v * (3 - 2 * v);
  const valueNoise = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = fade(x - Math.floor(x)), fy = fade(y - Math.floor(y));
    const a = hash(ix, iy, 0), b = hash(ix + 1, iy, 0), c = hash(ix, iy + 1, 0), d = hash(ix + 1, iy + 1, 0);
    return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fy;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const broad = valueNoise(x / 76, y / 76);
    const medium = valueNoise(x / 25, y / 25);
    const fine = valueNoise(x / 7, y / 7);
    const grain = valueNoise(x / 2.2, y / 2.2);
    const strata = Math.sin(y / 17 + valueNoise(x / 45, y / 37) * 2.6) * 0.08;
    const v = Math.max(0, Math.min(1, 0.52 + broad * 0.22 + medium * 0.14 + fine * 0.09 + grain * 0.035 + strata));
    const i = (y * size + x) * 4;
    colorData[i] = Math.round(43 + v * 47);
    colorData[i + 1] = Math.round(39 + v * 42);
    colorData[i + 2] = Math.round(34 + v * 36);
    colorData[i + 3] = 255;
    const h = Math.round(255 * Math.max(0, Math.min(1, 0.5 + broad * 0.24 + medium * 0.22 + fine * 0.11 + grain * 0.05 + strata)));
    heightData[i] = h; heightData[i + 1] = h; heightData[i + 2] = h; heightData[i + 3] = 255;
  }
  const color = new DataTexture(colorData, size, size);
  color.colorSpace = SRGBColorSpace; color.wrapS = RepeatWrapping; color.wrapT = RepeatWrapping;
  color.magFilter = LinearFilter; color.minFilter = LinearMipmapLinearFilter; color.generateMipmaps = true; color.needsUpdate = true;
  const height = new DataTexture(heightData, size, size);
  height.wrapS = RepeatWrapping; height.wrapT = RepeatWrapping;
  height.magFilter = LinearFilter; height.minFilter = LinearMipmapLinearFilter; height.generateMipmaps = true; height.needsUpdate = true;
  return { color, height };
}
function interpolate(a: V3, b: V3, va: number, vb: number): V3 {
  const denom = va - vb;
  const t = Math.abs(denom) < 1e-6 ? 0.5 : Math.max(0, Math.min(1, va / denom));
  return [a[0]! + (b[0]! - a[0]!) * t, a[1]! + (b[1]! - a[1]!) * t, a[2]! + (b[2]! - a[2]!) * t];
}
function polygoniseTet(points: V3[], values: number[], out: number[]) {
  const inside = [0,1,2,3].filter(i => values[i] >= 0);
  const outside = [0,1,2,3].filter(i => values[i] < 0);
  if (inside.length === 0 || inside.length === 4) return;
  const edge = (a: number, b: number) => interpolate(at(points, a), at(points, b), at(values, a), at(values, b));
  const pushTri = (a: V3, b: V3, c: V3) => { out.push(...a, ...b, ...c); };
  if (inside.length === 1) {
    pushTri(edge(at(inside, 0), at(outside, 0)), edge(at(inside, 0), at(outside, 1)), edge(at(inside, 0), at(outside, 2)));
  } else if (inside.length === 3) {
    pushTri(edge(at(outside, 0), at(inside, 0)), edge(at(outside, 0), at(inside, 2)), edge(at(outside, 0), at(inside, 1)));
  } else {
    const a = edge(at(inside, 0), at(outside, 0)), b = edge(at(inside, 0), at(outside, 1));
    const c = edge(at(inside, 1), at(outside, 0)), d = edge(at(inside, 1), at(outside, 1));
    pushTri(a, b, c); pushTri(b, d, c);
  }
}
function buildCaveGeometry() {
  const values = new Float32Array((NX + 1) * (NY + 1) * (NZ + 1));
  const strideY = NX + 1, strideZ = (NX + 1) * (NY + 1);
  const index = (x: number, y: number, z: number) => z * strideZ + y * strideY + x;
  const point = (x: number, y: number, z: number): V3 => [
    BOUNDS.minX + (BOUNDS.maxX - BOUNDS.minX) * x / NX,
    BOUNDS.minY + (BOUNDS.maxY - BOUNDS.minY) * y / NY,
    BOUNDS.minZ + (BOUNDS.maxZ - BOUNDS.minZ) * z / NZ,
  ];
  for (let z = 0; z <= NZ; z++) for (let y = 0; y <= NY; y++) for (let x = 0; x <= NX; x++) {
    const p = point(x, y, z); values[index(x,y,z)] = field(...p);
  }
  const vertices: number[] = [];
  for (let z = 0; z < NZ; z++) for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
    const cubePoints = CORNERS.map(([dx,dy,dz]) => point(x+dx,y+dy,z+dz));
    const cubeValues = CORNERS.map(([dx,dy,dz]) => values[index(x+dx,y+dy,z+dz)]!);
    if (cubeValues.every(v => v >= 0) || cubeValues.every(v => v < 0)) continue;
    for (const tet of TETS) polygoniseTet(tet.map(i => at(cubePoints, i)), tet.map(i => at(cubeValues, i)), vertices);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function CaveMesh() {
  const geometry = useMemo(() => buildCaveGeometry(), []);
  const maps = useMemo(() => makeCaveMaps(), []);
  const material = useMemo(() => new MeshStandardMaterial({
    color: new Color("#d0c3b2"), map: maps.color, bumpMap: maps.height, bumpScale: 0.12,
    roughness: 0.98, metalness: 0, side: DoubleSide, flatShading: false,
  }), [maps]);
  const mesh = useMemo(() => new Mesh(geometry, material), [geometry, material]);
  return <primitive object={mesh} dispose={null} />;
}

export default function CaveLabPrototype() {
  return <main className="cave-lab">
    <header className="cave-lab-header">
      <a href="/">← BACK TO PORTFOLIO</a>
      <span>GEOMETRY LAB / 001</span>
      <span>PROTOTYPE — NOT FINAL ART</span>
    </header>
    <section className="cave-lab-copy">
      <p>PROCEDURAL ENVIRONMENT STUDY</p>
      <h1>Beyond the <em>pipe.</em></h1>
      <span>A volumetric cave boundary with a winding passage, variable chambers and a carved side pocket. Drag to inspect the geometry.</span>
    </section>
    <div className="cave-lab-view">
      <Canvas camera={{ position: [0, 1.2, 5.5], fov: 57, near: 0.1, far: 120 }}
        dpr={[1, 1.35]} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#080a0c"]} />
        <fog attach="fog" args={["#080a0c", 10, 39]} />
        <ambientLight intensity={0.17} />
        <hemisphereLight args={["#a9b5c1", "#19110c", 0.8]} />
        <directionalLight position={[3, 6, 4]} intensity={1.15} />
        <pointLight position={[-2, 1, -8]} color="#e4c49a" intensity={5} distance={13} decay={2} />
        <pointLight position={[2, -1, -20]} color="#8da9c1" intensity={2.2} distance={10} decay={2} />
        <CaveMesh />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} rotateSpeed={0.55}
          minDistance={2.5} maxDistance={26} target={[0, 0, -11]} />
      </Canvas>
      <div className="cave-lab-view-label">DRAG TO ORBIT · SCROLL TO ZOOM</div>
    </div>
    <footer className="cave-lab-footer">
      <span>01 / VOLUMETRIC BOUNDARY</span><span>02 / VARIABLE PASSAGE WIDTH</span><span>03 / CHAMBER TRANSITION</span>
    </footer>
  </main>;
}
