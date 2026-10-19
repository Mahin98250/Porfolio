# Mahin Patel — Programmer Portfolio

This repository currently contains the existing Vite portfolio and an in-progress Next.js App Router workspace for the planned multi-page Liquid Glass redesign. The current GitHub Pages workflow still builds the existing root Vite app; the new Next.js app must pass CI and deployment checks before the production cutover.

## Current architecture

- Root app: React + Vite, retained to protect the currently deployed experience during migration.
- `apps/portfolio`: Next.js App Router portfolio migration with real routes, strict TypeScript, a lazy-loaded React Three Fiber hero scene, responsive Liquid Glass styling and authentic Simple Icons brand marks.
- `packages/marketplace-data`: Zod schemas and a typed fetch boundary for seller inventory and customer profiles.
- `turbo.json`: shared build, lint, typecheck, test and dev task graph.
- `tsconfig.base.json`: strict shared TypeScript compiler baseline.
- `.github/workflows/ci.yml`: parallel build/typecheck, Playwright route regression, dependency audit and config-format checks.
- `.github/workflows/deploy.yml`: existing Vite GitHub Pages deployment. It has not been switched to the Next.js app yet.

## Next.js portfolio routes

- `/` — 3D home and featured projects
- `/about` — programmer profile and direction
- `/projects` — project index
- `/projects/opticode-studio`, `/projects/learners-guide`, `/projects/dudhwala`, `/projects/velocitytype`, `/projects/weather-status` — project details
- `/skills` — learning-focused skills snapshot with authentic technology logos
- `/journey` — learning roadmap
- `/contact` — public profile links

The visual language uses translucent glass layers, restrained highlights, perspective, GPU-accelerated CSS and a WebGL hero scene. The scene caps device pixel ratio, loads as a client-only component, and has a static fallback. Reduced-motion preferences disable the animated canvas.

## Local development

The currently deployed Vite app:

```bash
npm install
npm run dev
npm run build
```

The Next.js portfolio workspace:

```bash
npm install
npm run dev --workspace=@mahin/portfolio-next
npm run build --workspace=@mahin/portfolio-next
npm run typecheck:shared
npm run test:e2e --workspace=@mahin/portfolio-next
```

Playwright tests require the built Next.js app and Chromium. CI installs Chromium and starts the app automatically.

## Marketplace data boundary

The marketplace package validates incoming JSON with Zod. It returns a discriminated result rather than throwing validation details into UI code. Privileged credentials must stay in server-only route handlers; never put tokens in `NEXT_PUBLIC_*` variables or commit real secrets. See `docs/enterprise-monorepo-architecture.md` for boundaries and the staged migration.

## Important release note

This is a staged migration, not a claim that all standalone apps have already moved into the monorepo. OptiCode Studio, Learner’s Guide and DudhWala remain independent projects until their code, offline requirements, environment configuration and deployment contracts are audited. The Next.js portfolio is not considered live until its build, browser tests and target hosting deployment have all been verified.

## Links

- GitHub profile: https://github.com/Mahin98250
- Repository: https://github.com/Mahin98250/Porfolio
