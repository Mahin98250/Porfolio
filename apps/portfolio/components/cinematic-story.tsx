"use client";

import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { ACESFilmicToneMapping, AdditiveBlending, BufferGeometry, DataTexture, DoubleSide, Float32BufferAttribute, LinearFilter, LinearMipmapLinearFilter, MathUtils, RepeatWrapping, SRGBColorSpace, type Group, InstancedMesh, Mesh, Object3D, IcosahedronGeometry, MeshStandardMaterial, MeshPhysicalMaterial, Points, PointsMaterial, Vector2, Vector3, CatmullRomCurve3, Color, CylinderGeometry } from "three";
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

function caveAlcoveAt(t: number, angle: number): number {
  // Localized side chambers are directional, not full rings around the passage.
  // Each tuple is [depth-position, angle, length spread, angular spread, depth].
  const pockets: Array<[number, number, number, number, number]> = [
    [0.105, 0.25, 0.052, 0.48, 0.72],
    [0.275, 2.35, 0.065, 0.58, 0.64],
    [0.405, 5.25, 0.043, 0.43, 0.58],
    [0.515, 1.05, 0.060, 0.64, 0.92],
    [0.655, 3.28, 0.064, 0.52, 0.76],
    [0.775, 4.80, 0.052, 0.47, 0.62],
  ];
  let depth = 0;
  for (const [centerT, centerAngle, spreadT, spreadAngle, strength] of pockets) {
    const dt = (t - centerT) / spreadT;
    const da = Math.atan2(Math.sin(angle - centerAngle), Math.cos(angle - centerAngle)) / spreadAngle;
    depth += strength * Math.exp(-0.5 * (dt * dt + da * da));
  }
  return depth;
}

function caveShelfAt(t: number, angle: number): number {
  // Broad, overlapping limestone shoulders break the tunnel silhouette.
  // These belong to the shell itself, not floating props or repeated rings.
  const shelves: Array<[number, number, number, number, number]> = [
    [0.145, 1.10, 0.070, 0.66, 0.48],
    [0.235, 4.95, 0.052, 0.58, 0.40],
    [0.355, 2.00, 0.060, 0.62, 0.43],
    [0.495, 5.72, 0.052, 0.52, 0.46],
    [0.585, 1.75, 0.074, 0.72, 0.56],
    [0.735, 3.82, 0.050, 0.60, 0.38],
    [0.855, 1.28, 0.060, 0.56, 0.42],
  ];
  let shelf = 0;
  for (const [centerT, centerAngle, spreadT, spreadAngle, height] of shelves) {
    const dt = (t - centerT) / spreadT;
    const da = Math.atan2(Math.sin(angle - centerAngle), Math.cos(angle - centerAngle)) / spreadAngle;
    const patch = Math.exp(-0.5 * (dt * dt + da * da));
    shelf += height * patch * (0.72 + 0.28 * Math.cos(Math.min(Math.PI, Math.abs(da)) * 0.5));
  }
  return shelf;
}

function caveOverhangAt(t: number, angle: number): number {
  // Heavy, uneven roof and wall masses distort the silhouette over several
  // metres instead of adding another repeated ring around the passage.
  const masses: Array<[number, number, number, number, number]> = [
    [0.185, 1.62, 0.082, 0.56, 0.54],
    [0.325, 1.18, 0.061, 0.48, 0.38],
    [0.455, 2.05, 0.088, 0.62, 0.62],
    [0.605, 1.42, 0.072, 0.52, 0.47],
    [0.705, 2.22, 0.066, 0.50, 0.43],
    [0.825, 1.02, 0.082, 0.57, 0.51],
    [0.915, 2.42, 0.047, 0.44, 0.34],
  ];
  let mass = 0;
  for (const [centerT, centerAngle, spreadT, spreadAngle, depth] of masses) {
    const dt = (t - centerT) / spreadT;
    const da = Math.atan2(Math.sin(angle - centerAngle), Math.cos(angle - centerAngle)) / spreadAngle;
    const patch = Math.exp(-0.5 * (dt * dt + da * da));
    // A small directional variation gives each lip a less uniform edge.
    const edge = 0.82 + 0.18 * Math.sin(da * 2.7 + dt * 1.8);
    mass += depth * patch * edge;
  }
  return mass;
}

function caveBeddingRelief(t: number, aroundX: number, aroundY: number, coarse: number, medium: number): number {
  // Broken bedding planes add shallow shelves that follow the cave's curve.
  // Their phase drifts with the local rock mass, avoiding clean repeating rings.
  const phaseWarp = noise3(aroundX * 2.2 + 4.7, aroundY * 2.2 - 6.1, t * 11.5);
  const phase = t * 28 + aroundY * 2.65 + coarse * 1.9 + medium * 0.5 + phaseWarp * 0.9;
  const bedWave = Math.sin(phase) * 0.014;
  const chippedEdge = Math.pow(Math.max(0, Math.cos(phase + phaseWarp * 0.45)), 8)
    * (0.018 + Math.abs(aroundX) * 0.012);
  return bedWave + chippedEdge;
}

function caveSurfacePoint(t: number, angle: number): [number, number] {
  const [cx, cy] = caveCenter(t);
  const radiusAt = caveRadiusAt(t);
  const aroundX = Math.cos(angle);
  const aroundY = Math.sin(angle);
  const coarse = noise3(aroundX * 1.7 + 8, aroundY * 1.7 - 4, t * 7.5);
  const medium = noise3(aroundX * 5.2 - 2, aroundY * 5.2 + 6, t * 23);
  const fine = noise3(aroundX * 15.5, aroundY * 15.5, t * 48);
  const angularBreakup = noise3(aroundX * 3.1 + t * 1.2, aroundY * 3.1, t * 14);
  const beddingRelief = caveBeddingRelief(t, aroundX, aroundY, coarse, medium);
  const radius = radiusAt * (1 + coarse * 0.145 + medium * 0.064 + angularBreakup * 0.038)
    + caveAlcoveAt(t, angle) + caveShelfAt(t, angle) + caveOverhangAt(t, angle) + beddingRelief + fine * 0.045;
  const floorRidge = Math.max(0, -aroundY) * Math.sin(t * 31 + aroundX * 5.7 + coarse) * 0.105;
  return [
    cx + aroundX * radius * (0.98 + medium * 0.045),
    cy + aroundY * radius * (aroundY >= 0 ? 1.08 : 0.73) + floorRidge,
  ];
}

function makeRockTextures(size = 512): { color: DataTexture; height: DataTexture; normal: DataTexture; roughness: DataTexture } {
  const colorData = new Uint8Array(size * size * 4);
  const heightData = new Uint8Array(size * size * 4);
  const roughnessData = new Uint8Array(size * size * 4);

  // A tileable Voronoi fracture field creates thin, irregular cracks in the
  // limestone. Jitter is precomputed so the per-pixel texture pass stays light.
  const crackCellSize = size / 8; // keep the same geological scale at every texture resolution
  const crackGridCount = size / crackCellSize;
  const crackSites = new Float32Array(crackGridCount * crackGridCount * 2);
  for (let gy = 0; gy < crackGridCount; gy++) {
    for (let gx = 0; gx < crackGridCount; gx++) {
      const site = (gy * crackGridCount + gx) * 2;
      crackSites[site] = 0.18 + hash01(gx * 53.17 + gy * 17.91 + 1.2) * 0.64;
      crackSites[site + 1] = 0.18 + hash01(gx * 29.73 + gy * 67.31 + 8.4) * 0.64;
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const broad = noise2(x / 118, y / 118);
      const mid = noise2(x / 39, y / 39);
      const fine = noise2(x / 11, y / 11);
      const grain = noise2(x / 3.2, y / 3.2);
      const bedding = Math.sin(y / 27 + noise2(x / 58, y / 43) * 2.4) * 0.07;
      const pore = noise2(x / 1.6, y / 1.6) * 0.035;
      // Hairline fractures and small solution pits add close-up scale cues.
      const hairline = Math.pow(Math.max(0, Math.sin(x * 0.061 + noise2(x / 22, y / 17) * 2.8) * Math.sin(y * 0.047 + noise2(x / 19, y / 31) * 2.2)), 18);
      const solutionPits = Math.pow(Math.max(0, noise2(x / 2.4 + 19, y / 2.4 - 7) - 0.56), 2) * 0.16;

      // Find the two closest fracture sites in a wrapping 3x3 cell window.
      // The difference between their distances isolates narrow, chipped seams.
      const cellX = x / crackCellSize;
      const cellY = y / crackCellSize;
      const gx0 = Math.floor(cellX);
      const gy0 = Math.floor(cellY);
      let nearestDistanceSq = Infinity;
      let secondNearestDistanceSq = Infinity;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const gx = gx0 + ox;
          const gy = gy0 + oy;
          const wrappedX = (gx % crackGridCount + crackGridCount) % crackGridCount;
          const wrappedY = (gy % crackGridCount + crackGridCount) % crackGridCount;
          const site = (wrappedY * crackGridCount + wrappedX) * 2;
          const siteX = gx + (crackSites[site] ?? 0.5);
          const siteY = gy + (crackSites[site + 1] ?? 0.5);
          const dx = cellX - siteX;
          const dy = cellY - siteY;
          const distanceSq = dx * dx + dy * dy;
          if (distanceSq < nearestDistanceSq) {
            secondNearestDistanceSq = nearestDistanceSq;
            nearestDistanceSq = distanceSq;
          } else if (distanceSq < secondNearestDistanceSq) {
            secondNearestDistanceSq = distanceSq;
          }
        }
      }
      // Only take square roots once per texel, not once per candidate site.
      const distanceGap = Math.sqrt(secondNearestDistanceSq) - Math.sqrt(nearestDistanceSq);
      const crackEdge = Math.pow(MathUtils.clamp(1 - distanceGap / (1.9 / crackCellSize), 0, 1), 1.35);

      // Irregular damp patches read as seepage stains, not a glossy wet shader.
      const damp = Math.pow(MathUtils.clamp((noise2(x / 73 + 6.4, y / 101 - 3.2) - 0.05) * 1.55, 0, 1), 1.5);

      // Thin, wavy mineral beds break up the generic noise look and give the
      // limestone a believable sedimentary structure without regular stripes.
      const strataSignal = Math.sin(y / 18 + noise2(x / 88, y / 62) * 3.6 + broad * 1.2);
      const strata = Math.sign(strataSignal) * Math.pow(Math.abs(strataSignal), 9) * 0.075;
      // Water tracks run downslope through porous bands; they are long and
      // broken rather than circular, helping the texture read as a cave wall.
      const flowLineSignal = Math.sin(x * 0.115 + broad * 2.7 + mid * 0.8);
      const seepageTrail = Math.pow(Math.max(0, flowLineSignal), 12) * (0.22 + damp * 0.78);
      // Fine, broken calcite seams: thin branching-looking mineral traces that
      // follow the noise field instead of reading as straight decorative lines.
      const calciteSignal = Math.sin(x / 31 + noise2(x / 47, y / 71) * 2.4 + broad * 1.3 + mid * 0.55);
      const calciteVein = Math.pow(MathUtils.clamp(1 - Math.abs(calciteSignal) / 0.19, 0, 1), 2)
        * MathUtils.clamp((mid + 0.34) * 1.35, 0, 1)
        * (0.72 + fine * 0.28);
      const ironOxide = Math.pow(MathUtils.clamp((noise2(x / 79 - 11, y / 91 + 6) - 0.44) * 1.8, 0, 1), 1.6);
      const value = MathUtils.clamp(0.5 + broad * 0.24 + mid * 0.15 + fine * 0.075 + grain * 0.035 + bedding + pore + solutionPits + strata * 0.22 + calciteVein * 0.035 - crackEdge * 0.045 - damp * 0.025 - hairline * 0.018, 0, 1);
      // Erosion pockets and scallops cluster along broken limestone bedding.
      const scallop = Math.pow(MathUtils.clamp((noise2(x / 10.5 + broad * 1.6, y / 8.2 - mid * 1.4) - 0.12) * 1.6, 0, 1), 1.7) * (0.35 + Math.abs(strataSignal) * 0.65);
      const solutionPocket = Math.pow(MathUtils.clamp((noise2(x / 5.8 + 21.3, y / 6.7 - 14.1) - 0.28) * 1.9, 0, 1), 2);
      const i = (y * size + x) * 4;

      // Crack edges darken slightly while seepage cools and stains the stone.
      // The exact same fracture field is also cut into the height map below.
      colorData[i] = Math.round(MathUtils.clamp(39 + value * 37 + strata * 34 + calciteVein * 10 + ironOxide * 13 - crackEdge * 10 - damp * 5 - seepageTrail * 7, 0, 255));
      colorData[i + 1] = Math.round(MathUtils.clamp(35 + value * 32 + strata * 24 + calciteVein * 8 + ironOxide * 3 - crackEdge * 8 - damp * 3 - seepageTrail * 5, 0, 255));
      // Fine iron/mineral flecks add subtle warm/cool variation, not obvious speckles.
      const mineralTint = Math.max(0, noise2(x / 21 + 17.2, y / 33 - 5.1) - 0.16) * 7;
      colorData[i + 2] = Math.round(MathUtils.clamp(31 + value * 29 + strata * 14 - crackEdge * 7 + damp * 1.5 - mineralTint * 0.24, 0, 255));
      colorData[i] = Math.round(MathUtils.clamp((colorData[i] ?? 0) + mineralTint, 0, 255));
      colorData[i + 3] = 255;

      // Moisture changes the response to light: damp seams are smoother, while
      // dry exposed limestone stays chalky and highly rough.
      const wetFilm = Math.pow(MathUtils.clamp((noise2(x / 24 - 7, y / 29 + 4) - 0.16) * 1.8, 0, 1), 2) * damp;
      const roughness = MathUtils.clamp(0.94 - damp * 0.43 - wetFilm * 0.12 - seepageTrail * 0.08 + crackEdge * 0.04 + grain * 0.035, 0.32, 1);
      const roughnessByte = Math.round(roughness * 255);
      roughnessData[i] = roughnessByte;
      roughnessData[i + 1] = roughnessByte;
      roughnessData[i + 2] = roughnessByte;
      roughnessData[i + 3] = 255;

      const relief = MathUtils.clamp(0.5 + broad * 0.25 + mid * 0.2 + fine * 0.11 + grain * 0.06 + bedding + strata * 0.58 + calciteVein * 0.045 - scallop * 0.065 - solutionPocket * 0.055 - crackEdge * 0.12 - damp * 0.02, 0, 1);
      const h = Math.round(255 * relief);
      heightData[i] = h;
      heightData[i + 1] = h;
      heightData[i + 2] = h;
      heightData[i + 3] = 255;
    }
  }

  // Derive a tangent-space normal map from the same high-frequency relief.
  // This catches grazing light across pores and fracture edges far better than
  // a bump map alone, while keeping all material data generated locally.
  const normalData = new Uint8Array(size * size * 4);
  const normalStrength = 3.2;
  for (let y = 0; y < size; y++) {
    const up = ((y - 1 + size) % size) * size * 4;
    const down = ((y + 1) % size) * size * 4;
    for (let x = 0; x < size; x++) {
      const left = (y * size + (x - 1 + size) % size) * 4;
      const right = (y * size + (x + 1) % size) * 4;
      const index = (y * size + x) * 4;
      const dx = ((heightData[right] ?? 128) - (heightData[left] ?? 128)) / 255 * normalStrength;
      const dy = ((heightData[down + x * 4] ?? 128) - (heightData[up + x * 4] ?? 128)) / 255 * normalStrength;
      let nx = -dx;
      let ny = -dy;
      let nz = 1;
      const length = Math.hypot(nx, ny, nz) || 1;
      nx /= length;
      ny /= length;
      nz /= length;
      normalData[index] = Math.round((nx * 0.5 + 0.5) * 255);
      normalData[index + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normalData[index + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      normalData[index + 3] = 255;
    }
  }

  const normal = new DataTexture(normalData, size, size);
  normal.wrapS = RepeatWrapping;
  normal.wrapT = RepeatWrapping;
  normal.magFilter = LinearFilter;
  normal.minFilter = LinearMipmapLinearFilter;
  normal.generateMipmaps = true;
  normal.anisotropy = 8;
  normal.needsUpdate = true;

  const roughness = new DataTexture(roughnessData, size, size);
  roughness.wrapS = RepeatWrapping;
  roughness.wrapT = RepeatWrapping;
  roughness.magFilter = LinearFilter;
  roughness.minFilter = LinearMipmapLinearFilter;
  roughness.generateMipmaps = true;
  roughness.anisotropy = 8;
  roughness.needsUpdate = true;

  const color = new DataTexture(colorData, size, size);
  color.colorSpace = SRGBColorSpace;
  color.wrapS = RepeatWrapping;
  color.wrapT = RepeatWrapping;
  color.magFilter = LinearFilter;
  color.minFilter = LinearMipmapLinearFilter;
  color.generateMipmaps = true;
  // Higher anisotropy keeps the procedural stone legible at grazing angles.
  color.anisotropy = 8;
  color.needsUpdate = true;

  const height = new DataTexture(heightData, size, size);
  height.wrapS = RepeatWrapping;
  height.wrapT = RepeatWrapping;
  height.magFilter = LinearFilter;
  height.minFilter = LinearMipmapLinearFilter;
  height.generateMipmaps = true;
  height.anisotropy = 8;
  height.needsUpdate = true;

  return { color, height, normal, roughness };
}

function CaveRocks({ maps }: { maps: { color: DataTexture; height: DataTexture; normal: DataTexture; roughness: DataTexture } }) {
  const geometry = useMemo(() => {
    const shape = new IcosahedronGeometry(1, 2);
    const vertices = shape.getAttribute("position");
    // Deform the instanced rubble mesh itself, so wall chips have broken,
    // asymmetrical facets instead of repeating smooth pebble silhouettes.
    for (let vertex = 0; vertex < vertices.count; vertex++) {
      const x = vertices.getX(vertex);
      const y = vertices.getY(vertex);
      const z = vertices.getZ(vertex);
      const broad = noise3(x * 3.4 + 8.2, y * 3.4 - 4.8, z * 3.4 + 1.4);
      const chipped = noise3(x * 8.6 - 2.1, y * 8.6 + 5.3, z * 8.6);
      const scale = 0.88 + broad * 0.15 + chipped * 0.085;
      vertices.setXYZ(vertex, x * scale, y * scale, z * scale);
    }
    vertices.needsUpdate = true;
    shape.computeVertexNormals();
    const uv = shape.getAttribute("uv");
    for (let index = 0; index < uv.count; index++) {
      uv.setXY(index, uv.getX(index) * 2.45, uv.getY(index) * 2.45);
    }
    uv.needsUpdate = true;
    return shape;
  }, []);
  const material = useMemo(() => new MeshStandardMaterial({
    color: "#c2aa8d",
    map: maps.color,
    bumpMap: maps.height,
    bumpScale: 0.072,
    normalMap: maps.normal,
    normalScale: new Vector2(0.48, 0.48),
    roughnessMap: maps.roughness,
    roughness: 0.99,
    metalness: 0,
    flatShading: false,
  }), [maps]);
  // Wall dressing should read as fractured limestone, not boulders floating
  // through the camera path. Use fewer, smaller pieces and sink them further.
  const rocks = useMemo(() => Array.from({ length: 280 }, (_, i) => {
    const t = 0.025 + hash01(i * 23.91 + 5.3) * 0.93;
    const angle = hash01(i * 61.17 + 1.7) * Math.PI * 2;
    const [cx, cy] = caveCenter(t);
    const [surfaceX, surfaceY] = caveSurfacePoint(t, angle);
    const z = 9 - t * 63;
    const size = 0.052 + Math.pow(hash01(i * 14.31 + 2.1), 1.55) * 0.158;
    // Anchor rubble to the actual noisy wall field and sink it slightly into
    // the rock so pieces do not float in the middle of the passage.
    const dx = surfaceX - cx;
    const dy = surfaceY - cy;
    const radialLength = Math.hypot(dx, dy) || 1;
    return {
      position: [surfaceX - (dx / radialLength) * size * 1.12, surfaceY - (dy / radialLength) * size * 1.12, z] as [number, number, number],
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
      const tint = 0.72 + hash01(index * 17.13 + 3.6) * 0.32;
      mesh.setColorAt(index, new Color(tint, tint * (0.93 + hash01(index * 4.3) * 0.07), tint * (0.85 + hash01(index * 8.7) * 0.13)));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    return mesh;
  }, [geometry, material, rocks]);

  return <primitive object={rockMesh as unknown as Object3D} dispose={null} />;
}

function CaveFloorRubble({ maps }: { maps: { color: DataTexture; height: DataTexture; normal: DataTexture; roughness: DataTexture } }) {
  const geometry = useMemo(() => {
    const shape = new IcosahedronGeometry(1, 1);
    const vertices = shape.getAttribute("position");
    // Low-poly chips keep their broken silhouette even when seen close to
    // the camera; the mesh is shared by every instanced stone.
    for (let vertex = 0; vertex < vertices.count; vertex++) {
      const x = vertices.getX(vertex);
      const y = vertices.getY(vertex);
      const z = vertices.getZ(vertex);
      const broad = noise3(x * 3.8 + 7.3, y * 3.8 - 3.1, z * 3.8 + 1.7);
      const chipped = noise3(x * 9.4 - 1.5, y * 9.4 + 4.2, z * 9.4);
      const scale = 0.86 + broad * 0.16 + chipped * 0.10;
      vertices.setXYZ(vertex, x * scale, y * scale, z * scale);
    }
    vertices.needsUpdate = true;
    shape.computeVertexNormals();
    const uv = shape.getAttribute("uv");
    for (let index = 0; index < uv.count; index++) {
      uv.setXY(index, uv.getX(index) * 2.8, uv.getY(index) * 2.8);
    }
    uv.needsUpdate = true;
    return shape;
  }, []);

  const material = useMemo(() => new MeshStandardMaterial({
    color: "#c1a98b",
    map: maps.color,
    bumpMap: maps.height,
    bumpScale: 0.065,
    normalMap: maps.normal,
    normalScale: new Vector2(0.42, 0.42),
    roughnessMap: maps.roughness,
    roughness: 0.99,
    metalness: 0,
    flatShading: true,
  }), [maps]);

  const stones = useMemo(() => Array.from({ length: 520 }, (_, i) => {
    const t = 0.028 + hash01(i * 31.71 + 2.6) * 0.944;
    // Keep the fragments around the lower shoulders of the floor. That adds
    // scale cues without filling the camera's central path with large rocks.
    const angle = Math.PI * 1.5 + (hash01(i * 7.13 + 9.2) - 0.5) * 0.92;
    const [surfaceX, surfaceY] = caveSurfacePoint(t, angle);
    const [cx, cy] = caveCenter(t);
    const dx = surfaceX - cx;
    const dy = surfaceY - cy;
    const radialLength = Math.hypot(dx, dy) || 1;
    const size = 0.018 + Math.pow(hash01(i * 19.17 + 4.3), 2.15) * 0.13;
    return {
      position: [
        surfaceX - (dx / radialLength) * size * 0.82,
        surfaceY - (dy / radialLength) * size * 0.82,
        9 - t * 63,
      ] as [number, number, number],
      scale: [
        size * (0.72 + hash01(i * 3.41 + 5.7) * 1.55),
        size * (0.28 + hash01(i * 11.23 + 8.1) * 0.46),
        size * (0.68 + hash01(i * 13.37 + 6.2) * 1.45),
      ] as [number, number, number],
      rotation: [
        (hash01(i * 17.19 + 3.2) - 0.5) * 0.34,
        hash01(i * 23.83 + 7.9) * Math.PI * 2,
        (hash01(i * 29.41 + 1.8) - 0.5) * 0.72,
      ] as [number, number, number],
    };
  }), []);

  const rubbleMesh = useMemo(() => {
    const mesh = new InstancedMesh(geometry, material, stones.length);
    const dummy = new Object3D();
    stones.forEach((stone, index) => {
      dummy.position.set(...stone.position);
      dummy.rotation.set(...stone.rotation);
      dummy.scale.set(...stone.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      const tint = 0.66 + hash01(index * 21.17 + 5.8) * 0.34;
      mesh.setColorAt(index, new Color(tint, tint * (0.94 + hash01(index * 3.8) * 0.06), tint * (0.87 + hash01(index * 9.1) * 0.12)));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    return mesh;
  }, [geometry, material, stones]);

  return <primitive object={rubbleMesh as unknown as Object3D} dispose={null} />;
}

function CaveShell({ maps }: { maps: { color: DataTexture; height: DataTexture; normal: DataTexture; roughness: DataTexture } }) {
  const shell = useMemo(() => {
    // A denser, non-uniform shell. Large-scale chambers and constrictions are
    // sculpted into the cross-section before rock detail is added.
    // ~62k shell vertices preserve the large silhouette and add smoother, finer erosion ridges.
    const highDetail = typeof window !== "undefined" && window.innerWidth >= 1920;
    const radialSegments = highDetail ? 256 : 192;
    const axialSegments = highDetail ? 448 : 320;
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
        const micro = noise3(aroundX * 31 + 4.7, aroundY * 31 - 2.6, t * 91);
        const angularBreakup = noise3(aroundX * 3.1 + t * 1.2, aroundY * 3.1, t * 14);
        // The entrance lip is not a clean cut plane: its edge breaks forward
        // and backward by angle, with a stronger chipped silhouette near the roof.
        const entranceWeight = Math.pow(Math.max(0, 1 - t / 0.115), 1.65);
        // Stronger, multi-scale erosion at the mouth creates a broken limestone
        // silhouette instead of a clean tunnel cut. The variation fades quickly
        // into the passage so the entrance reads as a distinct geological threshold.
        const entranceChip = (
          Math.sin(angle * 3.0 + 0.4) * 0.43
          + Math.sin(angle * 5.0 + 1.7) * 0.25
          + Math.sin(angle * 8.0 - 0.6) * 0.09
          + noise3(aroundX * 4.2 + 2.1, aroundY * 4.2 - 0.8, 1.4) * 0.34
        ) * entranceWeight;
        const entranceBulge = entranceWeight * (
          Math.max(0, aroundY) * 0.42
          + Math.max(0, -aroundY) * 0.13
          + Math.sin(angle * 2.0 - 0.7) * 0.16
          + noise3(aroundX * 5.8 + 1, aroundY * 5.8 - 3, 2.4) * 0.12
        );
        const entranceMicro = entranceWeight * micro * 0.045;
        const beddingRelief = caveBeddingRelief(t, aroundX, aroundY, coarse, medium);
        const radius = radiusAt * (1 + coarse * 0.145 + medium * 0.064 + angularBreakup * 0.038)
          + caveAlcoveAt(t, angle) + caveShelfAt(t, angle) + caveOverhangAt(t, angle)
          + entranceBulge + beddingRelief + fine * 0.052 + micro * 0.018 + entranceMicro;

        // The floor is lower and flatter than the roof; upper surfaces have
        // more headroom and uneven overhangs. This deliberately avoids a
        // symmetric oval cross-section.
        const verticalScale = aroundY >= 0 ? 1.08 : 0.73;
        const floorRidge = Math.max(0, -aroundY) * Math.sin(t * 31 + aroundX * 5.7 + coarse) * 0.105;
        const x = cx + aroundX * radius * (0.98 + medium * 0.045);
        const y = cy + aroundY * radius * verticalScale + floorRidge;
        const entranceEdgeZ = entranceChip * 1.9 + entranceWeight * Math.sin(angle * 2.7 + 0.8) * 0.30 + entranceWeight * noise3(aroundX * 7.4, aroundY * 7.4, 3.1) * 0.10;
        positions.push(x, y, z + entranceEdgeZ);
        uvs.push(u * 2.7, t * 4.8); // larger, less repetitive rock strata across the shell

        const mineral = Math.max(0, Math.sin(angle * 2.3 + coarse * 2.2 + t * 8.7)) * 0.5;
        const mineralVein = Math.max(0, Math.sin(angle * 4.7 + coarse * 4.1 + t * 19 + medium * 2.2));
        const shade = MathUtils.clamp(0.82 + coarse * 0.10 + medium * 0.07 + fine * 0.035 + micro * 0.022 - mineral * 0.035 - mineralVein * 0.018, 0.56, 1.02);
        colors.push(shade * (0.99 - mineralVein * 0.018), shade * (0.97 + mineral * 0.025 + mineralVein * 0.012), shade * (0.92 + mineral * 0.08 + mineralVein * 0.025));
      }
    }

    // Carve two real apertures into the shell where the story forks.
    // Omitting shell faces (rather than placing tubes against a closed wall)
    // lets the branch mouths read as openings into the surrounding rock.
    const portalT = 31 / 63; // the branch group is positioned at z = -22
    const portalTSpread = 0.052;
    const portalAngleSpread = 0.58;
    for (let row = 0; row < axialSegments; row++) {
      for (let segment = 0; segment < radialSegments; segment++) {
        const t = (row + 0.5) / axialSegments;
        const angle = ((segment + 0.5) / radialSegments) * Math.PI * 2;
        const tDistance = (t - portalT) / portalTSpread;
        const rightAngleDistance = Math.atan2(Math.sin(angle), Math.cos(angle));
        const leftAngleDistance = Math.atan2(Math.sin(angle - Math.PI), Math.cos(angle - Math.PI));
        const insideRightPortal = tDistance * tDistance + (rightAngleDistance / portalAngleSpread) ** 2 < 1;
        const insideLeftPortal = tDistance * tDistance + (leftAngleDistance / portalAngleSpread) ** 2 < 1;
        if (insideRightPortal || insideLeftPortal) continue;

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
    color: "#e1d4c0",
    map: maps.color,
    bumpMap: maps.height,
    bumpScale: 0.068,
    normalMap: maps.normal,
    normalScale: new Vector2(0.58, 0.58),
    roughnessMap: maps.roughness,
    vertexColors: true,
    roughness: 0.98,
    metalness: 0,
    side: DoubleSide,
  }), [maps]);
  const mesh = useMemo(() => new Mesh(shell, material), [shell, material]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
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
        <meshBasicMaterial color={i % 9 === 0 ? "#bba68b" : "#9b907e"} transparent opacity={dot.opacity * 0.78} depthWrite={false} />
      </mesh>
    ))}
  </group>;
}

function CaveDust({ junctionX, junctionY }: { junctionX: number; junctionY: number }) {
  const elapsed = useRef(0);
  const dust = useMemo(() => {
    const mainCount = 960;
    const branchCount = 144;
    const count = mainCount + branchCount * 2;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const leftCurve = makeBranchCurve(-1);
    const rightCurve = makeBranchCurve(1);

    for (let i = 0; i < count; i++) {
      const offset = i * 3;
      if (i < mainCount) {
        const t = 0.035 + hash01(i * 19.37 + 5.4) * 0.93;
        const angle = hash01(i * 43.71 + 3.8) * Math.PI * 2;
        const radial = 0.12 + hash01(i * 11.13 + 6.2) * 0.72;
        const [cx, cy] = caveCenter(t);
        const radius = caveRadiusAt(t);
        // Keep dust suspended within the walkable void, never on the rock skin.
        positions[offset] = cx + Math.cos(angle) * radius * radial;
        positions[offset + 1] = cy + Math.sin(angle) * radius * (Math.sin(angle) >= 0 ? 1.08 : 0.73) * radial;
        positions[offset + 2] = 9 - t * 63;
      } else {
        // Add motes to both selected arms as well as the main tunnel, sampling
        // the authored branch curves so the atmosphere follows either choice.
        const branchIndex = i - mainCount;
        const side = branchIndex < branchCount ? -1 : 1;
        const localIndex = branchIndex % branchCount;
        const branchT = 0.055 + hash01(localIndex * 37.19 + (side < 0 ? 2.2 : 9.1)) * 0.89;
        const curve = side < 0 ? leftCurve : rightCurve;
        const point = curve.getPointAt(branchT);
        const angle = hash01(localIndex * 17.83 + side * 5.7) * Math.PI * 2;
        const radial = 0.12 + hash01(localIndex * 7.93 + side * 3.1) * 0.75;
        positions[offset] = junctionX + point.x + Math.cos(angle) * 0.82 * radial;
        positions[offset + 1] = junctionY + point.y + Math.sin(angle) * 0.68 * radial;
        positions[offset + 2] = -22 + point.z;
      }
      phases[i] = hash01(i * 29.41 + 1.6) * Math.PI * 2;
      const brightness = 0.78 + hash01(i * 47.13 + 3.7) * 0.38;
      colors[offset] = brightness;
      colors[offset + 1] = brightness * (0.92 + hash01(i * 13.91 + 8.2) * 0.08);
      colors[offset + 2] = brightness * (0.80 + hash01(i * 7.27 + 4.6) * 0.18);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    // A tiny radial-alpha sprite prevents square particles and gives the dust
    // a soft edge even against the cave's almost-black background.
    const spriteSize = 16;
    const spriteData = new Uint8Array(spriteSize * spriteSize * 4);
    for (let y = 0; y < spriteSize; y++) {
      for (let x = 0; x < spriteSize; x++) {
        const nx = (x + 0.5) / spriteSize * 2 - 1;
        const ny = (y + 0.5) / spriteSize * 2 - 1;
        const falloff = Math.max(0, 1 - Math.hypot(nx, ny));
        const index = (y * spriteSize + x) * 4;
        spriteData[index] = 255;
        spriteData[index + 1] = 255;
        spriteData[index + 2] = 255;
        spriteData[index + 3] = Math.round(255 * falloff * falloff);
      }
    }
    const sprite = new DataTexture(spriteData, spriteSize, spriteSize);
    sprite.magFilter = LinearFilter;
    sprite.minFilter = LinearFilter;
    sprite.generateMipmaps = false;
    sprite.needsUpdate = true;

    const material = new PointsMaterial({
      color: "#d8c29f",
      map: sprite,
      size: 0.045,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.17,
      vertexColors: true,
      depthWrite: false,
    });
    const object = new Points(geometry, material);
    object.frustumCulled = false;
    return { object, basePositions: positions.slice(), phases };
  }, [junctionX, junctionY]);

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 0.05);
    const attribute = dust.object.geometry.getAttribute("position") as Float32BufferAttribute;
    const positions = attribute.array as Float32Array;
    for (let i = 0; i < dust.phases.length; i++) {
      const offset = i * 3;
      const phase = dust.phases[i] ?? 0;
      positions[offset] = (dust.basePositions[offset] ?? 0) + Math.cos(elapsed.current * 0.27 + phase) * 0.022;
      positions[offset + 1] = (dust.basePositions[offset + 1] ?? 0) + Math.sin(elapsed.current * 0.31 + phase) * 0.035;
      positions[offset + 2] = (dust.basePositions[offset + 2] ?? 0) + Math.sin(elapsed.current * 0.18 + phase) * 0.015;
    }
    attribute.needsUpdate = true;
  });

  return <primitive object={dust.object as unknown as Object3D} dispose={null} />;
}

function makeFormationGeometry(seed: number, length: number, hanging: boolean): BufferGeometry {
  // Higher radial and axial detail removes the brittle, low-poly shard look.
  const radialSegments = 16;
  const axialSegments = 12;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const profile = [0.27, 0.33, 0.34, 0.31, 0.285, 0.255, 0.222, 0.19, 0.15, 0.115, 0.077, 0.045, 0.012];

  for (let row = 0; row <= axialSegments; row++) {
    const u = row / axialSegments;
    const base = profile[row] ?? 0.01;
    const taper = length * u;
    for (let segment = 0; segment <= radialSegments; segment++) {
      const angle = (segment / radialSegments) * Math.PI * 2;
      const irregular = 1
        + Math.sin(angle * 2.4 + seed * 1.7 + u * 2.7) * 0.105
        + Math.sin(angle * 4.8 - seed * 0.8 + u * 5.6) * 0.055
        + noise3(Math.cos(angle) * 2.2 + seed, Math.sin(angle) * 2.2, u * 4.2) * 0.09
        + noise3(Math.cos(angle) * 6.3 - seed, Math.sin(angle) * 6.3 + seed * 0.4, u * 10.5) * 0.035;
      const radius = Math.max(0.006, base * irregular * (0.94 + hash01(seed * 11 + row) * 0.12));
      const lean = Math.sin(u * Math.PI * 0.85 + seed) * u * 0.09;
      positions.push(
        Math.cos(angle) * radius + lean,
        hanging ? -taper : taper,
        Math.sin(angle) * radius * (0.91 + Math.sin(seed) * 0.045),
      );
      // Repeat the rock maps across the small formation so its surface has
      // the same limestone grain and damp response as the surrounding shell.
      uvs.push((segment / radialSegments) * 1.6, u * 2.2);
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
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function CaveFormations({ maps }: { maps: { color: DataTexture; height: DataTexture; normal: DataTexture; roughness: DataTexture } }) {
  const geometry = useMemo(() => {
    // Bake individual irregular formations into one geometry. This gives each
    // one a unique silhouette but keeps the whole formation field to one draw call.
    const positions: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const count = 112;

    for (let i = 0; i < count; i++) {
      const t = 0.05 + hash01(i * 17.31 + 8.1) * 0.90;
      const choice = hash01(i * 9.73 + 2.4);
      const hanging = choice < 0.64;
      const wall = choice >= 0.64 && choice < 0.83;
      const side = hash01(i * 13.61 + 4.2) > 0.5 ? 1 : -1;
      const angle = hanging
        ? 0.38 + hash01(i * 14.3 + 7.1) * (Math.PI - 0.76)
        : wall
          ? (side > 0 ? 0 : Math.PI) + (hash01(i * 3.77 + 2.1) - 0.5) * 0.16
          : Math.PI + 0.30 + hash01(i * 8.91 + 6.8) * (Math.PI - 0.60);
      const [surfaceX, surfaceY] = caveSurfacePoint(t, angle);
      const [cx, cy] = caveCenter(t);
      const dx = surfaceX - cx;
      const dy = surfaceY - cy;
      const radialLength = Math.hypot(dx, dy) || 1;
      const length = 0.28 + hash01(i * 23.71 + 3.3) * (hanging ? 0.84 : 0.54);
      const anchorInset = 0.14 + length * 0.12;
      const position: [number, number, number] = [
        surfaceX - (dx / radialLength) * anchorInset,
        surfaceY - (dy / radialLength) * anchorInset,
        9 - t * 63,
      ];
      const rotationX = wall ? (hash01(i * 5.7) - 0.5) * 0.18 : (hash01(i * 2.71) - 0.5) * 0.07;
      const rotationY = (hash01(i * 3.9) - 0.5) * 0.12;
      const rotationZ = (hanging ? angle - Math.PI / 2 : Math.PI / 2 + angle)
        + (hash01(i * 21.7) - 0.5) * 0.12;
      const scale: [number, number, number] = [
        0.62 + hash01(i * 4.2) * 0.43,
        0.64 + hash01(i * 12.5) * 0.40,
        0.62 + hash01(i * 8.6) * 0.42,
      ];

      const source = makeFormationGeometry(i * 1.73 + 0.4, length, hanging);
      const sourcePositions = source.getAttribute("position");
      const sourceUvs = source.getAttribute("uv");
      const sourceIndices = source.getIndex();
      const offset = positions.length / 3;
      const tint = 0.78 + hash01(i * 31.7 + 6.2) * 0.28;

      const sx = Math.sin(rotationX), cxr = Math.cos(rotationX);
      const sy = Math.sin(rotationY), cyr = Math.cos(rotationY);
      const sz = Math.sin(rotationZ), czr = Math.cos(rotationZ);
      for (let vertex = 0; vertex < sourcePositions.count; vertex++) {
        const x = sourcePositions.getX(vertex) * scale[0];
        const y = sourcePositions.getY(vertex) * scale[1];
        const z = sourcePositions.getZ(vertex) * scale[2];
        const y1 = y * cxr - z * sx;
        const z1 = y * sx + z * cxr;
        const x2 = x * cyr + z1 * sy;
        const z2 = -x * sy + z1 * cyr;
        const x3 = x2 * czr - y1 * sz;
        const y3 = x2 * sz + y1 * czr;
        positions.push(position[0] + x3, position[1] + y3, position[2] + z2);
        uvs.push(sourceUvs.getX(vertex), sourceUvs.getY(vertex));
        colors.push(tint, tint * (0.94 + hash01(i * 8.9) * 0.06), tint * (0.86 + hash01(i * 9.7) * 0.1));
      }
      if (sourceIndices) {
        for (let index = 0; index < sourceIndices.count; index++) indices.push(offset + sourceIndices.getX(index));
      }
      source.dispose();
    }

    const merged = new BufferGeometry();
    merged.setAttribute("position", new Float32BufferAttribute(positions, 3));
    merged.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    merged.setAttribute("color", new Float32BufferAttribute(colors, 3));
    merged.setIndex(indices);
    merged.computeVertexNormals();
    return merged;
  }, []);

  const material = useMemo(() => new MeshStandardMaterial({
    color: "#e9d8bd",
    map: maps.color,
    bumpMap: maps.height,
    bumpScale: 0.052,
    normalMap: maps.normal,
    normalScale: new Vector2(0.38, 0.38),
    roughnessMap: maps.roughness,
    roughness: 0.98,
    metalness: 0,
    vertexColors: true,
    side: DoubleSide,
  }), [maps]);
  const mesh = useMemo(() => new Mesh(geometry, material), [geometry, material]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;

  return <primitive object={mesh as unknown as Object3D} dispose={null} />;
}

function makeBranchCurve(side: -1 | 1): CatmullRomCurve3 {
  const wallRadius = caveRadiusAt(31 / 63);
  return new CatmullRomCurve3([
    new Vector3(side * (wallRadius - 0.04), 0, 0),
    new Vector3(side * (wallRadius + 0.28), 0.03, -0.32),
    new Vector3(side * (wallRadius + 0.82), 0.08, -0.9),
    new Vector3(side * 5.05, 0.12, -1.9),
    new Vector3(side * 6.25, 0.12, -3.6),
    new Vector3(side * 7.25, 0.01, -5.5),
    new Vector3(side * 8.0, -0.09, -7.7),
    new Vector3(side * 8.5, -0.16, -10.8),
    new Vector3(side * 8.62, -0.19, -12.8),
    new Vector3(side * 8.65, -0.21, -16.2),
    new Vector3(side * 8.68, -0.24, -20.8),
  ], false, "centripetal");
}

// Pre-sample each branch once. The camera asks for three look-ahead points
// on every rendered frame; rebuilding a Catmull-Rom curve and evaluating 160
// samples for every query created avoidable CPU work exactly during turns.
const branchDepthSamples: Record<"-1" | "1", Vector3[]> = {
  "-1": makeBranchCurve(-1).getSpacedPoints(160),
  "1": makeBranchCurve(1).getSpacedPoints(160),
};

function branchPointAtDepth(side: -1 | 1, localZ: number): Vector3 {
  const samples = branchDepthSamples[String(side) as "-1" | "1"];
  const depth = MathUtils.clamp(localZ, -20.8, 0);
  let best = samples[0] ?? new Vector3();
  let bestDistance = Math.abs(best.z - depth);
  for (let sample = 1; sample < samples.length; sample++) {
    const point = samples[sample];
    if (!point) continue;
    const distance = Math.abs(point.z - depth);
    if (distance < bestDistance) {
      best = point;
      bestDistance = distance;
    }
  }
  return best;
}

function CaveBranch({ side, material }: { side: -1 | 1; material: MeshStandardMaterial }) {
  const geometry = useMemo(() => {
    // Cross-sections use the same authored centreline as the cinematic camera.
    const curve = makeBranchCurve(side);
    const highDetail = typeof window !== "undefined" && window.innerWidth >= 1920;
    const tubularSegments = highDetail ? 224 : 176;
    const radialSegments = highDetail ? 72 : 56;
    const frames = curve.computeFrenetFrames(tubularSegments, false);
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let row = 0; row <= tubularSegments; row++) {
      const u = row / tubularSegments;
      const center = curve.getPointAt(u);
      const flare = u < 0.105 ? MathUtils.lerp(1.12, 1, u / 0.105) : 1 + Math.sin(u * 7.4 + side) * 0.018;
      for (let segment = 0; segment <= radialSegments; segment++) {
        const v = segment / radialSegments;
        const angle = v * Math.PI * 2;
        const nx = Math.cos(angle);
        const ny = Math.sin(angle);
        const broad = noise3(nx * 2.1 + side * 1.7, ny * 2.0 - 0.8, u * 7.5);
        const chipped = noise3(nx * 5.6 - 1.3, ny * 5.1 + 2.4, u * 20);
        const ridges = Math.sin(angle * 5 + u * 15 + side * 0.8) * 0.035
          + Math.sin(angle * 9 - u * 23) * 0.018;
        const uneven = MathUtils.clamp(1 + broad * 0.12 + chipped * 0.045 + ridges, 0.76, 1.23);
        const radiusX = 1.62 * flare * uneven;
        const radiusY = 1.62 * 0.79 * flare * uneven * (1 + 0.035 * Math.sin(u * 9 + angle * 3));
        const point = center.clone()
          .addScaledVector(frames.normals[row]!, nx * radiusX)
          .addScaledVector(frames.binormals[row]!, ny * radiusY);
        positions.push(point.x, point.y, point.z);
        uvs.push(u * 5.4, v * 3.4);
      }
    }

    for (let row = 0; row < tubularSegments; row++) {
      for (let segment = 0; segment < radialSegments; segment++) {
        const a = row * (radialSegments + 1) + segment;
        const b = a + radialSegments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const result = new BufferGeometry();
    result.setAttribute("position", new Float32BufferAttribute(positions, 3));
    result.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }, [side]);
  const mesh = useMemo(() => new Mesh(geometry, material), [geometry, material]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return <primitive object={mesh as unknown as Object3D} dispose={null} />;
}

function CaveLightShafts() {
  // A small alpha-gradient texture fakes soft volumetric scatter without a
  // full-screen raymarch. Multiple depth layers make the shafts feel embedded
  // in the cave rather than like a single overlay in front of the camera.
  const beamTexture = useMemo(() => {
    const width = 48;
    const height = 128;
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      const v = y / (height - 1);
      const vertical = MathUtils.smoothstep(v, 0.02, 0.18) * (1 - MathUtils.smoothstep(v, 0.72, 0.99));
      for (let x = 0; x < width; x++) {
        const u = x / (width - 1);
        const center = 0.5 + Math.sin(v * 6.4) * 0.065;
        const distance = Math.abs(u - center);
        const widthFade = Math.max(0, 1 - distance / 0.43);
        const irregularity = 0.78 + 0.22 * Math.sin(v * 19 + u * 5.5);
        const alpha = Math.pow(widthFade, 2.2) * vertical * irregularity;
        const index = (y * width + x) * 4;
        data[index] = 255;
        data[index + 1] = 255;
        data[index + 2] = 255;
        data[index + 3] = Math.round(255 * alpha);
      }
    }
    const texture = new DataTexture(data, width, height);
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  }, []);

  const shafts = [
    { key: "outer-blue", position: [-2.2, 1.9, 10.3] as [number, number, number], scale: [4.8, 8.4, 1] as [number, number, number], rotation: [0, 0, -0.23] as [number, number, number], color: "#b8d9ff", opacity: 0.28 },
    { key: "outer-gold", position: [1.7, 1.4, 8.2] as [number, number, number], scale: [3.0, 7.2, 1] as [number, number, number], rotation: [0, 0, 0.16] as [number, number, number], color: "#ffe2b2", opacity: 0.22 },
    { key: "inner-blue", position: [-0.8, 1.5, 3.3] as [number, number, number], scale: [3.8, 7.7, 1] as [number, number, number], rotation: [0, 0, -0.13] as [number, number, number], color: "#b4d5f5", opacity: 0.13 },
    { key: "inner-amber", position: [1.3, 1.0, -5.8] as [number, number, number], scale: [3.2, 6.8, 1] as [number, number, number], rotation: [0, 0, 0.18] as [number, number, number], color: "#edc995", opacity: 0.09 },
  ];

  return (
    <group renderOrder={2}>
      {shafts.map((shaft) => (
        <mesh key={shaft.key} position={shaft.position} rotation={shaft.rotation} scale={shaft.scale} renderOrder={2}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={beamTexture as never}
            color={shaft.color}
            transparent
            opacity={shaft.opacity}
            blending={AdditiveBlending}
            depthWrite={false}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function CaveEntranceMist() {
  const elapsed = useRef(0);
  const mist = useMemo(() => {
    const count = 196;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const offset = i * 3;
      // Mist stays low around the threshold; it is not spread uniformly
      // through the tunnel, where it would flatten the distant geology.
      positions[offset] = (hash01(i * 19.13 + 2.7) - 0.5) * 7.8;
      positions[offset + 1] = -1.15 + hash01(i * 31.7 + 5.2) * 1.35;
      positions[offset + 2] = 6.8 + hash01(i * 43.1 + 9.6) * 6.3;
      phases[i] = hash01(i * 53.9 + 1.8) * Math.PI * 2;
      const coolness = 0.78 + hash01(i * 61.2 + 4.4) * 0.22;
      colors[offset] = coolness * 0.80;
      colors[offset + 1] = coolness * 0.90;
      colors[offset + 2] = coolness;
    }

    const size = 32;
    const spriteData = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = ((x + 0.5) / size) * 2 - 1;
        const ny = ((y + 0.5) / size) * 2 - 1;
        const radiusSq = nx * nx + ny * ny;
        const alpha = Math.exp(-radiusSq * 3.9) * Math.max(0, 1 - radiusSq * 0.12);
        const offset = (y * size + x) * 4;
        spriteData[offset] = 255;
        spriteData[offset + 1] = 255;
        spriteData[offset + 2] = 255;
        spriteData[offset + 3] = Math.round(255 * alpha);
      }
    }
    const sprite = new DataTexture(spriteData, size, size);
    sprite.magFilter = LinearFilter;
    sprite.minFilter = LinearFilter;
    sprite.generateMipmaps = false;
    sprite.needsUpdate = true;

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    const material = new PointsMaterial({
      color: "#d5e1e8",
      map: sprite,
      size: 0.92,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.075,
      vertexColors: true,
      depthWrite: false,
    });
    const object = new Points(geometry, material);
    object.frustumCulled = false;
    object.renderOrder = 1;
    return { object, basePositions: positions.slice(), phases };
  }, []);

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 0.04);
    const attribute = mist.object.geometry.getAttribute("position") as Float32BufferAttribute;
    const positions = attribute.array as Float32Array;
    for (let i = 0; i < mist.phases.length; i++) {
      const offset = i * 3;
      const phase = mist.phases[i] ?? 0;
      positions[offset] = (mist.basePositions[offset] ?? 0) + Math.sin(elapsed.current * 0.16 + phase) * 0.13;
      positions[offset + 1] = (mist.basePositions[offset + 1] ?? 0) + Math.sin(elapsed.current * 0.23 + phase * 0.7) * 0.045;
      positions[offset + 2] = (mist.basePositions[offset + 2] ?? 0) + Math.cos(elapsed.current * 0.12 + phase) * 0.035;
    }
    attribute.needsUpdate = true;
  });

  return <primitive object={mist.object as unknown as Object3D} dispose={null} />;
}

function CaveTunnel() {
  const branchMaps = useMemo(() => {
    const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
    const textureSize = viewportWidth >= 3000 ? 1024 : 512;
    return makeRockTextures(textureSize);
  }, []);
  const branchMaterial = useMemo(() => new MeshStandardMaterial({
    color: "#d0bea4",
    map: branchMaps.color,
    bumpMap: branchMaps.height,
    bumpScale: 0.085,
    normalMap: branchMaps.normal,
    normalScale: new Vector2(0.62, 0.62),
    roughnessMap: branchMaps.roughness,
    roughness: 0.99,
    metalness: 0,
    side: DoubleSide,
  }), [branchMaps]);
  const [junctionX, junctionY] = caveCenter(31 / 63);
  return (
    <group>
      <CaveExterior maps={branchMaps} />
      <CaveShell maps={branchMaps} />
      <CaveGuideDots />
      <CaveFormations maps={branchMaps} />
      <CaveRocks maps={branchMaps} />
      <CaveFloorRubble maps={branchMaps} />
      <CaveEntranceMist />
      <CaveLightShafts />
      <CaveDust junctionX={junctionX} junctionY={junctionY} />
      <group position={[junctionX, junctionY, -22]}>
        <CaveBranch side={-1} material={branchMaterial} />
        <CaveBranch side={1} material={branchMaterial} />
      </group>
    </group>
  );
}

function CaveExterior({ maps }: { maps: { color: DataTexture; height: DataTexture; normal: DataTexture; roughness: DataTexture } }) {
  // Fractured cliff shoulders extend the entrance into a real landscape instead
  // of leaving a clean pipe-like mouth floating in darkness.
  const scene = useMemo(() => {
    const highDetail = typeof window !== "undefined" && window.innerWidth >= 1920;
    const geometry = new IcosahedronGeometry(1, highDetail ? 3 : 2);
    const vertices = geometry.getAttribute("position");
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i), y = vertices.getY(i), z = vertices.getZ(i);
      const broad = noise3(x * 3.2 + 4, y * 3.2 - 2, z * 3.2 + 7);
      const chipped = noise3(x * 8.5 - 3, y * 8.5 + 1, z * 8.5);
      const scale = 0.84 + broad * 0.18 + chipped * 0.08;
      vertices.setXYZ(i, x * scale, y * scale, z * scale);
    }
    vertices.needsUpdate = true;
    geometry.computeVertexNormals();
    const material = new MeshStandardMaterial({ color: "#b9a188", map: maps.color, bumpMap: maps.height, bumpScale: 0.12, normalMap: maps.normal, normalScale: new Vector2(0.8, 0.8), roughnessMap: maps.roughness, roughness: 0.99, flatShading: false });
    const pieces: Array<{ p: [number,number,number]; s: [number,number,number]; r: [number,number,number] }> = [];
    for (const side of [-1, 1]) for (let i = 0; i < 42; i++) {
      const seed = (side + 2) * 100 + i;
      const size = 0.8 + hash01(seed * 7.13) * 2.25;
      pieces.push({
        p: [side * (3.7 + hash01(seed * 2.71) * 4.1), -0.15 + hash01(seed * 3.17) * 5.8, 5 + hash01(seed * 5.31) * 16],
        s: [size * (0.75 + hash01(seed * 8.3)), size * (0.7 + hash01(seed * 9.7)), size * (0.8 + hash01(seed * 10.9))],
        r: [hash01(seed * 11.1) * 2.8, hash01(seed * 12.3) * 2.8, hash01(seed * 13.5) * 2.8],
      });
    }
    for (let i = 0; i < 30; i++) {
      const seed = 500 + i;
      const size = 0.8 + hash01(seed * 4.1) * 2;
      pieces.push({
        p: [(hash01(seed * 2.3) - 0.5) * 12, 3.8 + hash01(seed * 5.3) * 3.2, 5 + hash01(seed * 3.7) * 12],
        s: [size * 1.4, size * 0.8, size * 1.15],
        r: [hash01(seed * 6.7) * 1.4, hash01(seed * 7.9) * 2.6, hash01(seed * 8.1) * 1.4],
      });
    }
    for (let i = 0; i < 84; i++) {
      const seed = 800 + i;
      const side = hash01(seed * 2.1) > 0.5 ? 1 : -1;
      const size = 0.12 + hash01(seed * 3.3) * 0.62;
      pieces.push({
        p: [side * (2.6 + hash01(seed * 4.7) * 5.2), -2.0 + hash01(seed * 5.9) * 0.8, 7 + hash01(seed * 6.1) * 14],
        s: [size * 1.4, size * 0.38, size * 0.9],
        r: [hash01(seed * 9.7) * 0.3, hash01(seed * 10.9) * 6.2, hash01(seed * 11.1) * 0.4],
      });
    }
    // Moss islands sit on the cliff shoulders and damp scree edges.
    // Instancing keeps environmental dressing to a small number of draw calls.
    const mossGeometry = new IcosahedronGeometry(1, 2);
    const mossVertices = mossGeometry.getAttribute("position");
    for (let i = 0; i < mossVertices.count; i++) {
      const x = mossVertices.getX(i), y = mossVertices.getY(i), z = mossVertices.getZ(i);
      const warp = noise3(x * 3.2 + 2, y * 3.2 - 5, z * 3.2 + 1);
      mossVertices.setXYZ(i, x * (1 + warp * 0.13), y * (1 + warp * 0.09), z * (1 + warp * 0.13));
    }
    mossGeometry.computeVertexNormals();
    const mossMaterial = new MeshStandardMaterial({ color: "#58724a", roughness: 1, metalness: 0, flatShading: true });
    const mossPieces: Array<{ p: [number,number,number]; s: [number,number,number]; r: [number,number,number]; tint: number }> = [];
    for (let i = 0; i < 144; i++) {
      const seed = 1200 + i * 3.17;
      const nearGround = i < 60;
      let position: [number, number, number];
      let rotation: [number, number, number];
      let scale: [number, number, number];
      if (nearGround) {
        // Follow the same height field as the scree mesh so moss hugs the earth.
        const side = hash01(seed) > 0.5 ? 1 : -1;
        const x = side * (2.8 + hash01(seed * 1.7) * 7.6);
        const z = 8.8 + hash01(seed * 3.1) * 17.2;
        const broad = noise3(x * 0.19 + 2, z * 0.19 - 1, 2.5);
        const broken = noise3(x * 0.62 - 4, z * 0.62 + 2, 7);
        const sideSlope = Math.pow(Math.abs(x) / 12.5, 1.45) * 0.82;
        const groundY = -2.2 + broad * 0.38 + broken * 0.12 - sideSlope;
        position = [x, groundY + 0.028, z];
        rotation = [0, (hash01(seed * 7.1) - 0.5) * 0.7, (hash01(seed * 8.1) - 0.5) * 0.12];
        scale = [0.22 + hash01(seed * 4.1) * 0.52, 0.05 + hash01(seed * 4.7) * 0.08, 0.26 + hash01(seed * 5.3) * 0.62];
      } else {
        // Anchor the patch to the outer shoulder of an existing cliff boulder
        // instead of scattering green blobs through empty space.
        const host = pieces[Math.floor(hash01(seed * 1.31) * 84)];
        const side = (host?.p[0] ?? 1) >= 0 ? 1 : -1;
        const hostPosition = host?.p ?? [side * 5, 2, 12];
        const hostScale = host?.s ?? [1.5, 1.5, 1.5];
        position = [
          hostPosition[0] + side * hostScale[0] * 0.78,
          hostPosition[1] + (hash01(seed * 2.3) - 0.5) * hostScale[1] * 0.78,
          hostPosition[2] + (hash01(seed * 3.1) - 0.5) * hostScale[2] * 0.78,
        ];
        rotation = [(hash01(seed * 6.1) - 0.5) * 0.26, (hash01(seed * 7.1) - 0.5) * 0.25, side > 0 ? -Math.PI / 2 : Math.PI / 2];
        scale = [0.26 + hash01(seed * 4.1) * 0.64, 0.075 + hash01(seed * 4.7) * 0.13, 0.24 + hash01(seed * 5.3) * 0.55];
      }
      mossPieces.push({
        p: position,
        s: scale,
        r: rotation,
        tint: 0.72 + hash01(seed * 9.1) * 0.55,
      });
    }
    const mossMesh = new InstancedMesh(mossGeometry, mossMaterial, mossPieces.length);
    const detailDummy = new Object3D();
    mossPieces.forEach((piece, index) => {
      detailDummy.position.set(...piece.p);
      detailDummy.scale.set(...piece.s);
      detailDummy.rotation.set(...piece.r);
      detailDummy.updateMatrix();
      mossMesh.setMatrixAt(index, detailDummy.matrix);
      mossMesh.setColorAt(index, new Color("#63844b").multiplyScalar(piece.tint));
    });
    mossMesh.instanceMatrix.needsUpdate = true;
    if (mossMesh.instanceColor) mossMesh.instanceColor.needsUpdate = true;
    mossMesh.frustumCulled = false;

    // Fine roots hang from the upper lip and crack-lines as low-poly tapered strands.
    const rootGeometry = new CylinderGeometry(0.052, 0.012, 1, 5, 2, true);
    const rootMaterial = new MeshStandardMaterial({ color: "#49372a", roughness: 1, metalness: 0 });
    const rootPieces: Array<{ p: [number,number,number]; s: [number,number,number]; r: [number,number,number] }> = [];
    for (let i = 0; i < 46; i++) {
      const seed = 1800 + i * 4.17;
      const host = pieces[84 + Math.floor(hash01(seed * 1.31) * 30)];
      const hostPosition = host?.p ?? [0, 5, 12];
      const hostScale = host?.s ?? [1.5, 1.5, 1.5];
      const length = 0.48 + hash01(seed * 1.7) * 1.8;
      rootPieces.push({
        // Start at the underside of an overhead boulder and hang into space.
        p: [
          hostPosition[0] + (hash01(seed * 2.1) - 0.5) * hostScale[0] * 0.9,
          hostPosition[1] - hostScale[1] * 0.42 - length * 0.46,
          hostPosition[2] + (hash01(seed * 4.1) - 0.5) * hostScale[2] * 0.8,
        ],
        s: [0.55 + hash01(seed * 5.1) * 1.3, length, 0.55 + hash01(seed * 6.1) * 1.3],
        r: [(hash01(seed * 7.1) - 0.5) * 0.45, (hash01(seed * 8.1) - 0.5) * 0.3, (hash01(seed * 9.1) - 0.5) * 0.28],
      });
    }
    const rootsMesh = new InstancedMesh(rootGeometry, rootMaterial, rootPieces.length);
    rootPieces.forEach((piece, index) => {
      detailDummy.position.set(...piece.p);
      detailDummy.scale.set(...piece.s);
      detailDummy.rotation.set(...piece.r);
      detailDummy.updateMatrix();
      rootsMesh.setMatrixAt(index, detailDummy.matrix);
    });
    rootsMesh.instanceMatrix.needsUpdate = true;
    rootsMesh.frustumCulled = false;

    // Shallow dark pools break up uniformly rough scree. This restrained gloss
    // avoids expensive screen-space reflections and remains viable on phones.
    // A radial mesh with several rings gives the puddles real low-amplitude
    // surface relief. The ripple height is subtle enough to avoid a cartoon
    // water effect but catches warm highlights when the camera moves.
    const puddleGeometry = new BufferGeometry();
    const puddlePositions: number[] = [0, 0, 0];
    const puddleUvs: number[] = [0.5, 0.5];
    const puddleIndices: number[] = [];
    const puddleRings = 9;
    const puddleSegments = 56;
    for (let ring = 1; ring <= puddleRings; ring++) {
      const radius = ring / puddleRings;
      for (let segment = 0; segment < puddleSegments; segment++) {
        const angle = (segment / puddleSegments) * Math.PI * 2;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        // Natural pools have broken, mineral-defined shorelines rather than
        // perfect ellipses. Keep the centre calm and let the edge wander.
        const shorelineNoise = noise3(x * 2.8 + 7.4, y * 2.8 - 3.6, 5.2) * 0.105
          + Math.sin(angle * 5.0 + 0.8) * 0.028
          + Math.sin(angle * 9.0 - 1.3) * 0.014;
        const shorelineRadius = radius * (1 + shorelineNoise * Math.pow(radius, 1.7));
        const ripple = Math.sin(radius * 34 + Math.sin(angle * 3.1) * 0.65) * 0.012 * (1 - radius * 0.32)
          + noise3(x * 3.5 + 2.1, y * 3.5 - 4.2, radius * 13) * 0.0035;
        puddlePositions.push(x * shorelineRadius, y * shorelineRadius, ripple);
        puddleUvs.push(0.5 + x * shorelineRadius * 0.5, 0.5 + y * shorelineRadius * 0.5);
      }
    }
    const firstRing = 1;
    for (let segment = 0; segment < puddleSegments; segment++) {
      const next = (segment + 1) % puddleSegments;
      puddleIndices.push(0, firstRing + segment, firstRing + next);
    }
    for (let ring = 1; ring < puddleRings; ring++) {
      const innerStart = 1 + (ring - 1) * puddleSegments;
      const outerStart = 1 + ring * puddleSegments;
      for (let segment = 0; segment < puddleSegments; segment++) {
        const next = (segment + 1) % puddleSegments;
        const inner = innerStart + segment;
        const innerNext = innerStart + next;
        const outer = outerStart + segment;
        const outerNext = outerStart + next;
        puddleIndices.push(inner, outer, innerNext, outer, outerNext, innerNext);
      }
    }
    puddleGeometry.setAttribute("position", new Float32BufferAttribute(puddlePositions, 3));
    puddleGeometry.setAttribute("uv", new Float32BufferAttribute(puddleUvs, 2));
    puddleGeometry.setIndex(puddleIndices);
    puddleGeometry.computeVertexNormals();
    const puddleBasePositions = new Float32Array(puddlePositions);
    const puddleMaterial = new MeshPhysicalMaterial({
      color: "#263a40",
      roughness: 0.22,
      metalness: 0.06,
      clearcoat: 0.92,
      clearcoatRoughness: 0.13,
      ior: 1.333,
      emissive: "#0c1719",
      emissiveIntensity: 0.18,
      side: DoubleSide,
    });
    const groundHeight = (x: number, z: number) =>
      -2.2
      + noise3(x * 0.19 + 2, z * 0.19 - 1, 2.5) * 0.38
      + noise3(x * 0.62 - 4, z * 0.62 + 2, 7) * 0.12
      - Math.pow(Math.abs(x) / 12.5, 1.45) * 0.82;
    const puddleSpecs: Array<{ p: [number,number,number]; s: [number,number,number]; r: [number,number,number] }> = [
      { p: [-0.9, groundHeight(-0.9, 10.8) + 0.035, 10.8], s: [0.84, 1, 0.43], r: [-Math.PI / 2, 0, -0.08] },
      { p: [0.75, groundHeight(0.75, 13.7) + 0.035, 13.7], s: [1.18, 1, 0.38], r: [-Math.PI / 2, 0, 0.16] },
      { p: [-0.35, groundHeight(-0.35, 17.6) + 0.035, 17.6], s: [0.58, 1, 0.28], r: [-Math.PI / 2, 0, -0.12] },
      { p: [1.55, groundHeight(1.55, 19.2) + 0.035, 19.2], s: [0.72, 1, 0.34], r: [-Math.PI / 2, 0, 0.08] },
      { p: [-2.2, groundHeight(-2.2, 12.4) + 0.03, 12.4], s: [0.52, 1, 0.23], r: [-Math.PI / 2, 0, -0.24] },
      { p: [2.25, groundHeight(2.25, 16.0) + 0.03, 16.0], s: [0.62, 1, 0.25], r: [-Math.PI / 2, 0, 0.21] },
      { p: [-1.4, groundHeight(-1.4, 21.9) + 0.03, 21.9], s: [0.9, 1, 0.29], r: [-Math.PI / 2, 0, 0.12] },
    ];
    const puddlesMesh = new InstancedMesh(puddleGeometry, puddleMaterial, puddleSpecs.length);
    puddleSpecs.forEach((piece, index) => {
      detailDummy.position.set(...piece.p);
      detailDummy.scale.set(...piece.s);
      detailDummy.rotation.set(...piece.r);
      detailDummy.updateMatrix();
      puddlesMesh.setMatrixAt(index, detailDummy.matrix);
    });
    puddlesMesh.instanceMatrix.needsUpdate = true;
    puddlesMesh.receiveShadow = true;
    puddlesMesh.frustumCulled = false;

    // A triangulated scree apron joins the outside ground to the cave threshold.
    const groundPositions: number[] = [];
    const groundUvs: number[] = [];
    const groundIndices: number[] = [];
    const highDetailGround = typeof window !== "undefined" && window.innerWidth >= 1920;
    const groundX = highDetailGround ? 72 : 48;
    const groundZ = highDetailGround ? 54 : 38;
    for (let zi = 0; zi <= groundZ; zi++) {
      for (let xi = 0; xi <= groundX; xi++) {
        const x = (xi / groundX - 0.5) * 25;
        const z = 8.6 + (zi / groundZ) * 19.5;
        const broad = noise3(x * 0.19 + 2, z * 0.19 - 1, 2.5);
        const broken = noise3(x * 0.62 - 4, z * 0.62 + 2, 7);
        const sideSlope = Math.pow(Math.abs(x) / 12.5, 1.45) * 0.82;
        const y = -2.2 + broad * 0.38 + broken * 0.12 - sideSlope;
        groundPositions.push(x, y, z);
        groundUvs.push(x / 4, z / 4);
      }
    }
    for (let zi = 0; zi < groundZ; zi++) {
      for (let xi = 0; xi < groundX; xi++) {
        const a = zi * (groundX + 1) + xi;
        const b = a + groundX + 1;
        groundIndices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const groundGeometry = new BufferGeometry();
    groundGeometry.setAttribute("position", new Float32BufferAttribute(groundPositions, 3));
    groundGeometry.setAttribute("uv", new Float32BufferAttribute(groundUvs, 2));
    groundGeometry.setIndex(groundIndices);
    groundGeometry.computeVertexNormals();
    const groundMaterial = new MeshStandardMaterial({
      color: "#a38a6d", map: maps.color, bumpMap: maps.height, bumpScale: 0.095,
      normalMap: maps.normal, normalScale: new Vector2(0.7, 0.7),
      roughnessMap: maps.roughness, roughness: 1, side: DoubleSide,
    });
    const ground = new Mesh(groundGeometry, groundMaterial);
    ground.castShadow = true;
    ground.receiveShadow = true;
    ground.frustumCulled = false;

    const mesh = new InstancedMesh(geometry, material, pieces.length);
    const dummy = new Object3D();
    pieces.forEach((piece, index) => {
      dummy.position.set(...piece.p);
      dummy.scale.set(...piece.s);
      dummy.rotation.set(...piece.r);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      // Individual warm/cool albedo shifts stop the cliff from reading as
      // one repeated material stamp even when every boulder shares its maps.
      const tint = 0.74 + hash01(index * 13.91 + 4.6) * 0.31;
      mesh.setColorAt(index, new Color(tint, tint * (0.94 + hash01(index * 7.3) * 0.06), tint * (0.86 + hash01(index * 9.1) * 0.12)));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    return { mesh, ground, mossMesh, rootsMesh, puddlesMesh, puddleBasePositions };
  }, [maps]);
  const rippleTime = useRef(0);
  useFrame((_, delta) => {
    rippleTime.current += Math.min(delta, 0.04);
    const geometry = scene.puddlesMesh.geometry;
    const attribute = geometry.getAttribute("position") as Float32BufferAttribute;
    const base = scene.puddleBasePositions;
    for (let i = 0; i < attribute.count; i++) {
      const offset = i * 3;
      const x = base[offset] ?? 0;
      const y = base[offset + 1] ?? 0;
      const radius = Math.hypot(x, y);
      const angle = Math.atan2(y, x);
      const waveA = Math.sin(radius * 31 - rippleTime.current * 1.25 + Math.sin(angle * 2.1)) * 0.0032;
      const waveB = Math.sin(radius * 53 + angle * 2.8 + rippleTime.current * 0.88) * 0.0011;
      attribute.setZ(i, (base[offset + 2] ?? 0) + waveA + waveB);
    }
    attribute.needsUpdate = true;
    geometry.computeVertexNormals();
  });
  return <group>
    <primitive object={scene.ground as unknown as Object3D} dispose={null} />
    <primitive object={scene.mesh as unknown as Object3D} dispose={null} />
    <primitive object={scene.mossMesh as unknown as Object3D} dispose={null} />
    <primitive object={scene.rootsMesh as unknown as Object3D} dispose={null} />
    <primitive object={scene.puddlesMesh as unknown as Object3D} dispose={null} />
  </group>;
}

function World({ progressRef, branchChoice }: { progressRef: ProgressRef; branchChoice: { current: "left" | "right" | null } }) {
  const world = useRef<Group>(null);
  const enableSceneShadows = typeof window !== "undefined" && window.innerWidth >= 1280;
  const shadowMapResolution = typeof window !== "undefined" && window.innerWidth >= 2560 ? 2048 : 1024;
  // Smooth the branch route itself, not only the lens direction. A choice
  // therefore becomes a gradual steering input rather than a one-frame jump.
  const branchBlend = useRef(0);
  // Keep the look target between frames so both translation and rotation ease.
  const smoothLookTarget = useRef(new Vector3(0, 0, 6.2));
  useFrame((state, delta) => {
    const step = Math.min(delta, 0.045);
    const progress = MathUtils.clamp(progressRef.current, 0, 1);
    const camera = state.camera;
    const targetZ = 14 - progress * 68;
    // Drive the camera from world depth, not the story-panel percentages.
    // This keeps the camera aligned with the actual shell and branch openings.
    const routeT = MathUtils.clamp((9 - targetZ) / 63, 0, 1);
    const selectedBranch = branchChoice.current === "left" ? -1 : branchChoice.current === "right" ? 1 : 0;
    branchBlend.current = MathUtils.damp(branchBlend.current, selectedBranch === 0 ? 0 : 1, 1.65, step);
    const branchOffset = selectedBranch;
    const junctionT = 31 / 63;
    const [junctionX, junctionY] = caveCenter(junctionT);
    const junctionRadius = caveRadiusAt(junctionT);
    const routePoint = (atT: number): [number, number] => {
      const t = MathUtils.clamp(atT, 0, 1);
      const [x, y] = caveCenter(t);
      if (branchOffset === 0) return [x, y];

      // Build the desired path, then blend into it gradually after selection.
      // The pre-junction steering aims for the mouth; beyond it the path uses
      // the exact centreline shared with the selected branch geometry.
      let desiredX: number;
      let desiredY: number;
      if (t < junctionT) {
        const approach = MathUtils.smoothstep(t, 0.35, junctionT);
        desiredX = MathUtils.lerp(x, junctionX + branchOffset * (junctionRadius - 0.12), approach);
        desiredY = MathUtils.lerp(y, junctionY, approach);
      } else {
        // Each look-ahead sample uses its own depth, so heading follows the
        // curve rather than pointing at a single cross-section.
        const localDepth = MathUtils.clamp(31 - 63 * t, -20.8, 0);
        const point = branchPointAtDepth(branchOffset as -1 | 1, localDepth);
        desiredX = junctionX + point.x;
        desiredY = junctionY + point.y;
      }
      return [
        MathUtils.lerp(x, desiredX, branchBlend.current),
        MathUtils.lerp(y, desiredY, branchBlend.current),
      ];
    };
    const [pathX, pathY] = routePoint(routeT);
    const [aheadX, aheadY] = routePoint(routeT + 0.075);
    const [farX, farY] = routePoint(routeT + 0.12);
    const bendStrength = MathUtils.clamp((aheadX - pathX) * 0.8, -0.95, 0.95);
    camera.position.z = MathUtils.damp(camera.position.z, targetZ, 4.7, step);
    camera.position.x = MathUtils.damp(camera.position.x, pathX, 2.15, step);
    camera.position.y = MathUtils.damp(camera.position.y, pathY, 3.0, step);
    // Ease the viewing direction as well as the camera position. This is
    // especially important when a player taps LEFT/RIGHT at the fork: the
    // destination changes immediately, but the lens glides toward it over
    // several frames instead of whipping around to the new passage.
    const desiredLookX = aheadX * 0.62 + farX * 0.38 + bendStrength * 0.45;
    const desiredLookY = aheadY * 0.62 + farY * 0.38 + (aheadY - pathY) * 1.4;
    const desiredLookZ = camera.position.z - 7.8;
    smoothLookTarget.current.x = MathUtils.damp(smoothLookTarget.current.x, desiredLookX, 2.7, step);
    smoothLookTarget.current.y = MathUtils.damp(smoothLookTarget.current.y, desiredLookY, 2.7, step);
    smoothLookTarget.current.z = MathUtils.damp(smoothLookTarget.current.z, desiredLookZ, 3.8, step);
    // Numeric arguments avoid a duplicate-Three Vector3 type collision in
    // the workspace while retaining the same smoothed look-at target.
    camera.lookAt(smoothLookTarget.current.x, smoothLookTarget.current.y, smoothLookTarget.current.z);
    camera.rotation.z = MathUtils.damp(camera.rotation.z, -bendStrength * 0.13, 2.2, step);
    if (world.current) {
      world.current.rotation.z = MathUtils.damp(world.current.rotation.z, Math.sin(progress * Math.PI * 3) * 0.012, 1.8, step);
    }
  });

  return (
    <>
      <color attach="background" args={["#17130e"]} />
      {/* Push the visibility range deeper so distant cave features do not vanish into fog. */}
      <fog attach="fog" args={["#17130e", 18, 68]} />
      {/* Lift shadow detail substantially: cave texture must remain readable on mobile screens. */}
      <ambientLight intensity={0.62} color="#d5c7b2" />
      <hemisphereLight args={["#f0e4d0", "#51402f", 0.92]} />
      <directionalLight position={[4, 5, 3]} intensity={1.75} color="#f4e3c6" />
      {/* Exterior skylight: cool daylight spills over the cave lip and contrasts with the warm interior. */}
      <directionalLight
        position={[-8, 8, 15]}
        intensity={2.1}
        color="#b8d8ff"
        castShadow={enableSceneShadows}
        shadow-mapSize-width={shadowMapResolution}
        shadow-mapSize-height={shadowMapResolution}
        shadow-camera-near={0.1}
        shadow-camera-far={90}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.00018}
        shadow-normalBias={0.025}
      />
      <spotLight position={[-5.5, 5.2, 14]} target-position={[0, 0.1, 2]} intensity={48} distance={38} angle={0.68} penumbra={1} decay={1.35} color="#c7e3ff" />
      {/* Broad amber bounce gives the wet-looking limestone a cinematic warm/cool split. */}
      <pointLight position={[0.1, 1.1, 5.4]} intensity={13} distance={29} decay={1.25} color="#ffe0ad" />
      {/* Grazing key light shows the chipped entrance lip without an overblown hotspot. */}
      <spotLight position={[-1.8, 3.4, 11.5]} intensity={62} distance={30} angle={0.78} penumbra={0.9} decay={1.35} color="#ffe1b4" />
      {/* A low amber rim skims the foreground rock; a soft blue fill preserves shadow depth. */}
      <spotLight position={[5.8, 0.8, 9]} target-position={[0, -0.7, 1]} intensity={24} distance={25} angle={0.62} penumbra={1} decay={1.5} color="#ffb86b" />
      <pointLight position={[-5.5, 0.2, 1.5]} intensity={4.2} distance={16} decay={1.6} color="#82bfff" />
      {/* Overlapping, lower-intensity fill pools prevent long stretches from becoming unreadable. */}
      <pointLight position={[-2.5, 1.0, -4.5]} intensity={6.5} distance={23} decay={1.35} color="#edc99a" />
      <pointLight position={[2.2, 1.0, -12.5]} intensity={7.2} distance={25} decay={1.35} color="#f2dfbd" />
      <pointLight position={[-2.8, -0.3, -23.5]} intensity={6.6} distance={24} decay={1.35} color="#d8d9ca" />
      <pointLight position={[1.6, 1.3, -34.5]} intensity={7.0} distance={25} decay={1.35} color="#f0d3a5" />
      <pointLight position={[-1.2, 0.8, -45.5]} intensity={7.4} distance={27} decay={1.3} color="#f5ddb4" />
      <pointLight position={[0.4, -0.2, -53.5]} intensity={5.8} distance={22} decay={1.35} color="#d9d5c6" />
      <group ref={world}>
        <CaveTunnel />
      </group>
    </>
  );
}

const scenes = [
  // A non-overlapping timeline prevents two full-size headings from crossing
  // through each other on small screens. Their fades meet at chapter boundaries.
  { id: "opening", from: -0.035, to: 0.15 },
  { id: "identity", from: 0.15, to: 0.27 },
  { id: "approach", from: 0.27, to: 0.38 },
  { id: "code", from: 0.38, to: 0.49 },
  { id: "branch", from: 0.49, to: 0.56 },
  { id: "opticode", from: 0.56, to: 0.65 },
  { id: "learning", from: 0.65, to: 0.74 },
  { id: "marketplace", from: 0.74, to: 0.82 },
  { id: "robotics", from: 0.82, to: 0.92 },
  { id: "ending", from: 0.92, to: 1.04 },
] as const;

const chapterNumbers: Record<string, string> = {
  opening: "01",
  identity: "01",
  approach: "02",
  code: "03",
  branch: "04",
  opticode: "04",
  learning: "05",
  marketplace: "06",
  robotics: "07",
  ending: "08",
};

export function CinematicStory() {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const sceneProgress = useRef(0);
  const branchChoice = useRef<"left" | "right" | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<"left" | "right" | null>(null);
  // Read the preference before mounting Three.js. Otherwise a reduced-motion
  // browser briefly builds the full cave scene before the effect swaps to fallback.
  const [motionAllowed, setMotionAllowed] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [visible, setVisible] = useState(true);
  const [renderDpr, setRenderDpr] = useState<[number, number]>([1, 1.35]);
  const [shadowQuality, setShadowQuality] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setMotionAllowed(!reduceMotion.matches);
    const onVisibility = () => setVisible(!document.hidden);
    // Spend more GPU resolution where there is room, while keeping mobile
    // devices on a restrained cap to avoid trading smooth motion for pixels.
    const onViewport = () => {
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      const ultraWide = window.matchMedia("(min-width: 2560px)").matches;
      // High pixel density on large displays, but cap 4K rendering to protect
      // GPU memory and keep camera motion smooth instead of allocating a full
      // 2× render buffer across an entire 3840×2160 canvas.
      setRenderDpr([1, mobile ? 1.25 : ultraWide ? 1.35 : 1.8]);
      // Real shadow maps improve contact and depth on desktop, while phones
      // keep the cheaper no-shadow renderer for more stable camera motion.
      setShadowQuality(!mobile && window.matchMedia("(min-width: 1280px)").matches);
    };
    onMotion();
    onVisibility();
    onViewport();
    reduceMotion.addEventListener?.("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onViewport, { passive: true });

    const storyScenes = Array.from(document.querySelectorAll<HTMLElement>("[data-story-scene]"));
    const hint = document.querySelector<HTMLElement>("[data-scroll-hint]");
    const branchPanel = document.querySelector<HTMLElement>(".cinema-branch-choice");
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
      // The passage choice is a deliberate pause, not another translucent chapter.
      const branchWindow = Math.min(
        MathUtils.clamp((progress - 0.49) / 0.025, 0, 1),
        1 - MathUtils.clamp((progress - 0.535) / 0.025, 0, 1),
      );
      storyScenes.forEach((panel) => {
        const from = Number(panel.dataset.from ?? 0);
        const to = Number(panel.dataset.to ?? 1);
        const fade = 0.038;
        const enter = MathUtils.clamp((progress - from) / fade, 0, 1);
        const leave = 1 - MathUtils.clamp((progress - (to - fade)) / fade, 0, 1);
        const chapterOpacity = Math.min(enter, leave);
        const opacity = chapterOpacity * (1 - branchWindow);
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
      if (branchPanel) {
        branchPanel.style.opacity = String(branchWindow);
        branchPanel.style.pointerEvents = branchWindow > 0.55 && !branchChoice.current ? "auto" : "none";
        branchPanel.setAttribute("aria-hidden", branchWindow > 0.3 ? "false" : "true");
        branchPanel.inert = branchWindow <= 0.3;
      }
      const activeId = scenes.find((scene) => progress >= scene.from && progress < scene.to)?.id ?? "ending";
      track.dataset.chapter = activeId;
      const chapterLabel = document.querySelector<HTMLElement>("[data-chapter-label]");
      if (chapterLabel) chapterLabel.textContent = chapterNumbers[activeId] ?? "01";
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
    // Signal only after the scene's own scroll listener is ready. This avoids
    // losing the very first programmatic scroll when the scene hydrates lazily.
    document.documentElement.dataset.cinematicStoryReady = "true";
    return () => {
      delete document.documentElement.dataset.cinematicStoryReady;
      reduceMotion.removeEventListener?.("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onViewport);
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
            shadows={shadowQuality}
            dpr={renderDpr}
            camera={{ position: [0, 0, 14], fov: 67, near: 0.1, far: 100 }}
            gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
            onCreated={({ gl }) => {
              // Filmic shoulder keeps wet highlights from clipping to white,
              // while preserving shadow texture in the darker limestone.
              gl.toneMapping = ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.08;
              gl.outputColorSpace = SRGBColorSpace;
            }}
            frameloop={visible ? "always" : "never"}
            fallback={<div className="cinema-cave-fallback" aria-hidden="true" />}
          >
            <Suspense fallback={null}><World progressRef={sceneProgress} branchChoice={branchChoice} /></Suspense>
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

        <div className="cinema-scene-copy cinema-copy-identity" data-story-scene data-from="0.15" data-to="0.27" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> THE PERSON BEHIND THE BUILDS</span>
          <h2>MAHIN<br /><span>PATEL.</span></h2>
          <p>Student programmer. Independent builder. Future robotics and automation engineer.</p>
          <div className="cinema-chips"><span>AHMEDABAD, INDIA</span><span>LEARN / BUILD / REPEAT</span></div>
        </div>

        <div className="cinema-scene-copy cinema-copy-approach" data-story-scene data-from="0.27" data-to="0.38" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> CHAPTER 02 / THE APPROACH</span>
          <h2>CURIOSITY<br />BECOMES<br /><span>SOMETHING REAL.</span></h2>
          <p>Ask better questions. Build a rough version. Test what breaks. Improve what matters. Every project is another step from an idea to a working system.</p>
          <div className="cinema-wordline">OBSERVE <b>✳</b> EXPERIMENT <b>✳</b> REFINE</div>
        </div>

        <div className="cinema-scene-copy cinema-copy-code" data-story-scene data-from="0.38" data-to="0.49" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> CHAPTER 03 / THE DIGITAL FRONTIER</span>
          <h2>CODE IS<br />THE FIRST <span>DOOR.</span></h2>
          <p>Interfaces, applications and connected systems — the starting point for turning abstract ideas into something people can use.</p>
          <div className="cinema-chips"><span>HTML / CSS / JS</span><span>REACT</span><span>PYTHON / SYSTEMS</span></div>
        </div>

        <div className="cinema-project-reveal" data-story-scene data-from="0.56" data-to="0.65" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> PROJECT WORLD / 001</span>
          <span className="cinema-project-counter">01 — 03</span>
          <h2>OPTICODE<br /><span>STUDIO.</span></h2>
          <p>Moving information through light. Exploring optical file transfer, QR streams, frame reconstruction and offline-first communication.</p>
          <button className="cinema-world-enter" type="button" onClick={() => window.dispatchEvent(new CustomEvent("portfolio:enter-world", { detail: { id: "optical" } }))}>ENTER WORLD <span>↗</span></button><a className="cinema-repository-link" href="https://github.com/Mahin98250/OptiCode-Studio" target="_blank" rel="noreferrer">REPOSITORY ↗</a>
        </div>

        <div className="cinema-project-reveal cinema-project-reveal-right" data-story-scene data-from="0.65" data-to="0.74" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> PROJECT WORLD / 002</span>
          <span className="cinema-project-counter">02 — 03</span>
          <h2>LEARNER’S<br /><span>GUIDE.</span></h2>
          <p>A student-focused learning platform designed to make study resources and everyday learning workflows easier to navigate.</p>
          <button className="cinema-world-enter" type="button" onClick={() => window.dispatchEvent(new CustomEvent("portfolio:enter-world", { detail: { id: "learning" } }))}>ENTER WORLD <span>↗</span></button><a className="cinema-repository-link" href="https://github.com/Mahin98250/Final-Learner-s-Guide" target="_blank" rel="noreferrer">REPOSITORY ↗</a>
        </div>

        <div className="cinema-project-reveal" data-story-scene data-from="0.74" data-to="0.82" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> PROJECT WORLD / 003</span>
          <span className="cinema-project-counter">03 — 03</span>
          <h2>DUDHWALA<br /><span>MARKETPLACE.</span></h2>
          <p>Connecting customers with independent local milk sellers through a marketplace built around distinct journeys and useful everyday interactions.</p>
          <button className="cinema-world-enter" type="button" onClick={() => window.dispatchEvent(new CustomEvent("portfolio:enter-world", { detail: { id: "milk" } }))}>ENTER WORLD <span>↗</span></button><a className="cinema-repository-link" href="https://github.com/Mahin98250/Dudh-Wallah" target="_blank" rel="noreferrer">REPOSITORY ↗</a>
        </div>

        <div className="cinema-scene-copy cinema-copy-robotics" data-story-scene data-from="0.82" data-to="0.92" aria-hidden="true">
          <span className="cinema-scene-kicker"><i /> CHAPTER 05 / THE PHYSICAL WORLD</span>
          <h2>FROM<br />CODE TO<br /><span>MACHINES.</span></h2>
          <p>The long game: robotics, sensors, control systems and automation — where software starts interacting with the real world.</p>
          <div className="cinema-chips"><span>ENGINEERING</span><span>CONTROL</span><span>ROBOTICS</span></div>
        </div>

        <div className="cinema-scene-copy cinema-copy-ending" data-story-scene data-from="0.92" data-to="1.04" aria-hidden="true">
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

        <div className="cinema-branch-choice" aria-live="polite">
          <span className="cinema-scene-kicker"><i /> THE PASSAGE DIVIDES</span>
          <h2>Which way<br />will you <em>explore?</em></h2>
          <p>Two paths. Two different chapters. Choose your direction.</p>
          <div className="cinema-branch-actions">
            <button type="button" onClick={() => { branchChoice.current = "left"; setSelectedBranch("left"); const root = scrollRootRef.current; const track = trackRef.current; if (root && track) root.scrollTo({ top: (track.offsetHeight - root.clientHeight) * 0.68, behavior: motionAllowed ? "smooth" : "auto" }); }}>← TAKE THE LEFT PASSAGE</button>
            <button type="button" onClick={() => { branchChoice.current = "right"; setSelectedBranch("right"); const root = scrollRootRef.current; const track = trackRef.current; if (root && track) root.scrollTo({ top: (track.offsetHeight - root.clientHeight) * 0.68, behavior: motionAllowed ? "smooth" : "auto" }); }}>TAKE THE RIGHT PASSAGE →</button>
          </div>
          {selectedBranch && <span className="cinema-branch-confirm">PATH SELECTED · {selectedBranch.toUpperCase()} · KEEP SCROLLING</span>}
        </div>

        <div className="cinema-hud-top"><span>MP<span className="hud-dot">●</span></span><span>AN ORIGINAL INTERACTIVE STORY</span><span>AHMEDABAD / IN</span></div>
        <div className="cinema-hud-bottom"><span data-scroll-hint>SCROLL TO TRAVEL <b>↓</b></span><span className="cinema-chapter-status">CINEMATIC MODE / <b data-chapter-label>01</b></span></div>
        <div className="cinema-progress-track"><span data-progress-bar /></div>
      </div>
    </section>
    </div>
  );
}
