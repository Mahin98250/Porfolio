"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";
import { Suspense, useEffect, useRef, useState } from "react";

type ScrollProgress = { current: number };


