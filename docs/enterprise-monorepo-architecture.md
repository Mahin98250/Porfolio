# Enterprise Monorepo Architecture

## Target workspace

```text
.
├── apps/
│   ├── portfolio/              # Next.js App Router; mahin.runs-on.dev
│   ├── opticode-studio/        # Offline-first QR/optical transfer client
│   ├── learners-guide/         # Learning workflow platform
│   └── dudhwala/               # Customer and independent-seller marketplace
├── packages/
│   ├── ui/                     # Accessible shared UI primitives and tokens
│   ├── eslint-config/          # Shared ESLint presets
│   ├── tsconfig/               # Strict TypeScript presets
│   ├── marketplace-data/       # Zod schemas and safe API client contracts
│   └── shared/                 # Framework-agnostic helpers only
├── docs/
├── .github/workflows/
├── package.json
├── package-lock.json
├── turbo.json
└── tsconfig.base.json
```

## Dependency boundaries

- Portfolio consumes shared UI and generic helpers; it never imports marketplace secrets or server-only modules.
- OptiCode keeps local file processing and optical decoding on-device. Shared UI must not introduce network requirements into offline flows.
- Learner's Guide owns learning workflow state and authentication integration.
- DudhWala uses server-side route handlers for privileged requests. The browser receives only public configuration and validated response DTOs.
- Shared marketplace packages contain schemas and typed contracts, never credentials.
- No app imports another app's source directory. Cross-app code belongs in a workspace package.

## Safe migration sequence

1. Record current build, navigation, metadata, external links, and deployment behavior.
2. Add npm workspaces, Turbo, strict TypeScript presets, lint/format rules, and CI while preserving the deployed Vite build.
3. Create `apps/portfolio` with Next.js App Router; migrate design tokens and content, then add real routes for Home, About, Projects, project details, Skills, Journey, and Contact.
4. Migrate leaf utilities first. Replace implicit `any` with `unknown` plus type guards; validate all external data at runtime.
5. Put credentials only in server route handlers/server actions. Validate request input and upstream responses with Zod; return stable, non-sensitive error codes.
6. Move each standalone app only after its build, offline behavior, environment variables, and release process are documented.
7. Run build, lint, typecheck, unit/integration tests, accessibility smoke tests, dependency audit, and Playwright route smoke tests before cutover.

## Liquid glass and 3D constraints

- Use authentic vendor logos from official brand assets or Simple Icons; generic UI icons are not brand marks.
- Use CSS perspective and GPU-friendly transforms for decorative depth. Reserve Three.js/WebGL for the hero or project visualizations that benefit from actual 3D.
- Lazy-load 3D code, cap device pixel ratio, pause rendering off-screen, honor `prefers-reduced-motion`, and provide a static fallback.
- Apply `backdrop-filter` selectively to protect contrast and avoid excessive GPU compositing.
- Multi-page navigation must support refresh and deep links; test direct navigation to every route.
- Do not claim production readiness without evidence from the code and operational behavior.

## Security and operations

- Never commit `.env`, tokens, private keys, or service-role credentials.
- Treat browser input and third-party API responses as untrusted.
- Use timeouts, bounded retries only for idempotent requests, request IDs, and safe error mapping.
- Use least-privilege workflow permissions; pin third-party actions to reviewed immutable SHAs when hardening CI.
- Dependency auditing complements lockfile review and secret scanning; it does not replace them.
