# Cinematic Cave Upgrade — Phased Delivery Plan

This plan upgrades the portfolio's opening cave into a cinematic, explorable 3D environment while preserving usability on lower-powered devices. “8K quality” is treated as an artistic target for detail and composition, not a promise that every browser can render at native 8K.

## Phase 1 — Visual baseline and reliable pipeline
- Establish a cinematic exterior-to-interior lighting palette.
- Keep the cave's existing procedural geometry and camera story intact.
- Fix end-to-end tests that incorrectly target the React Three Fiber wrapper instead of its nested canvas.
- Require production build and browser regression checks before claiming deployment.
**Status:** In progress. Lighting pass committed; regression selector corrected. CI verification pending.

## Phase 2 — Entrance silhouette and geology
- Improve the first camera view: more irregular cave lip, layered rock strata, fractured edges, moss/roots and readable foreground scale.
- Increase material detail without relying on a single flat texture.
- Keep geometry and texture generation bounded for mobile memory.

## Phase 3 — Cinematic atmosphere
- Add restrained, depth-aware mist, drifting dust and light shafts where technically feasible.
- Tune exposure, fog, warm/cool contrast and wet-rock highlights to avoid washed-out shadows.
- Avoid expensive full-screen effects on low-tier devices.

## Phase 4 — Surface detail and environmental storytelling
- Refine rock roughness, micro-relief, fractures, damp areas, mineral variation, and foreground puddle reflections.
- Add details that support the scene composition rather than decorative clutter.
- Use deterministic procedural generation to avoid noisy visual changes between renders.

## Phase 5 — Camera and interaction polish
- Smoothly transition from exterior to the cave interior.
- Make left/right branch choices feel deliberate, with easing, feedback and keyboard/touch support.
- Respect reduced-motion settings and keep UI controls reachable.

## Phase 6 — Adaptive performance
- Use device capability and viewport-aware render budgets, then add cautious runtime frame-time adaptation if measurable.
- Cap pixel count and expensive effects to avoid memory spikes on mobile.
- Pause rendering when hidden and honor reduced motion.

## Phase 7 — Validation and release
- Run production build, strict checks, route/E2E tests and deployment workflow.
- Inspect the live page on desktop and mobile when available.
- Record verified results and remaining limitations. Do not claim native 8K, photorealism, or cross-device validation without evidence.

## Definition of done
The entrance communicates believable scale, material and depth; movement feels smooth; project navigation works; low-power fallbacks remain usable; and automated checks pass. Visual quality is evaluated in real browsers, not inferred from code changes alone.
