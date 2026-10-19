# Mahin Patel — Programmer Portfolio

This repository contains the existing Vite portfolio plus a Next.js App Router multi-page portfolio. GitHub Pages deploys the Next.js static export only after the Enterprise CI build, strict typecheck, lint, Playwright routes, dependency audit, and formatting checks pass.

## Current architecture

- Root Vite app: retained as a separately build-checked legacy app during transition.
- `apps/portfolio`: Next.js App Router portfolio with real routes, strict TypeScript, a lazy-loaded React Three Fiber hero scene, responsive Liquid Glass styling, and authentic Simple Icons brand marks.
- `packages/ui`: accessible reusable glass-panel primitive.
- `packages/tsconfig`: shared strict TypeScript preset.
- `packages/eslint-config`: reusable flat ESLint configuration.
- `packages/marketplace-data`: Zod schemas and typed API boundary for seller inventory and customer profiles.
- `turbo.json`: cached workspace build, lint, typecheck, test, and dev task graph.
- `.github/workflows/ci.yml`: parallel build/typecheck, browser regression, dependency audit, formatting verification, and gated GitHub Pages deployment.
- `.github/workflows/deploy.yml`: manual-only deployment fallback. Normal deployments happen only after Enterprise CI passes.

## Next.js portfolio routes

- `/` — 3D home and featured projects
- `/about/` — programmer profile and direction
- `/projects/` — project index
- `/projects/opticode-studio/`, `/projects/learners-guide/`, `/projects/dudhwala/`, `/projects/velocitytype/`, `/projects/weather-status/` — project details
- `/skills/` — learning-focused skills snapshot with authentic technology logos
- `/journey/` — learning roadmap
- `/contact/` — public profile links

The visual language uses translucent glass layers, restrained highlights, perspective, GPU-accelerated CSS, and a WebGL hero scene. The scene caps device pixel ratio, loads as a client-only component, and has a static fallback. Reduced-motion preferences disable the animated canvas.

## Local development

The root Vite project can still be run with:

```bash
npm install
npm run dev
npm run build
```

Build and typecheck the Next.js workspace with:

```bash
npm install
npm run dev --workspace=@mahin/portfolio-next
npm run build --workspace=@mahin/portfolio-next
npm run typecheck
npm test
npm run test:e2e --workspace=@mahin/portfolio-next
```

The Playwright tests serve the generated static export and require Chromium. CI installs Chromium and runs the route tests automatically.

## Hosting and security boundaries

The GitHub Pages production URL for this repository is `https://mahin98250.github.io/Porfolio/`; the exported assets use the `/Porfolio` base path. The requested custom hostname `mahin.runs-on.dev` is not configured in this repository (there is no tracked CNAME), so it is not claimed as verified or switched over by these changes.

Static GitHub Pages hosting does not support arbitrary response headers or server-side API routes. The Next.js config retains security headers when built in server mode, while the Pages build uses static export. Privileged marketplace credentials must remain in server-side route handlers on a host that supports them; never commit secrets or put tokens in `NEXT_PUBLIC_*` variables.

## Marketplace data boundary

The marketplace package validates external JSON with Zod and returns a discriminated result instead of throwing raw validation details into UI code. Seller ownership and duplicate inventory IDs are checked as invariants. See `docs/enterprise-monorepo-architecture.md` for dependency boundaries and migration order.

## Staged application migration

OptiCode Studio, Learner’s Guide, and DudhWala remain independent projects until their source code, offline requirements, environment configuration, and deployment contracts are audited. The workspace foundation is in place, but it does not imply those applications have already been migrated.

## Links

- GitHub profile: https://github.com/Mahin98250
- Repository: https://github.com/Mahin98250/Porfolio
- Published portfolio: https://mahin98250.github.io/Porfolio/
