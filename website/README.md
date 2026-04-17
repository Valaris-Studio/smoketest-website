# @valaris/website

Public-facing marketing + product site for Valaris — the agentic software factory platform. Built with Astro 5, Tailwind CSS v4, and TypeScript (strict).

## Commands

Run from the repo root with pnpm:

```bash
pnpm install
pnpm --filter @valaris/website dev      # start dev server on http://localhost:4321
pnpm --filter @valaris/website build    # production build to website/dist
pnpm --filter @valaris/website preview  # preview the production build
pnpm --filter @valaris/website check    # type-check via astro check
```

## Layout

```
website/
├── astro.config.mjs
├── package.json
├── tsconfig.json        # strict, extends astro/tsconfigs/strict
├── public/              # static assets served as-is
└── src/
    ├── components/      # shared atomic components
    ├── content/         # Markdown/MDX collections (zod-validated)
    ├── features/        # feature folders: components/, content/, utils/
    ├── layouts/         # BaseLayout, future DocsLayout
    ├── pages/           # Astro file-based routing
    └── styles/          # Tailwind entry + tokens
```

## Deployment

The site ships through Cloud Build into a Cloud Run service named `valaris-website` in `us-central1`. Pipeline definition lives in [`cloudbuild.yaml`](./cloudbuild.yaml).

### Pipeline stages

1. **install** — `pnpm install` inside `website/`.
2. **typecheck** — `pnpm check` (Astro + TypeScript strict diagnostics).
3. **test** — `pnpm test` when a test script is defined (no-op otherwise so the pipeline doesn't block scaffold cards).
4. **build-site** — `pnpm build` → static output in `website/dist/`.
5. **lighthouse** — runs Lighthouse CI against `dist/` using [`lighthouserc.json`](./lighthouserc.json). Budgets:
   - Performance ≥ 0.95
   - Accessibility ≥ 0.95
   - Best Practices ≥ 0.95
   - SEO = 1.00
   The build **fails** if any category regresses below its budget.
6. **build-image** — Kaniko builds the production container from [`Dockerfile`](./Dockerfile) (nginx serving `dist/`).
7. **deploy** — `gcloud run deploy valaris-website` (public, port 8080, 256Mi, 0–3 instances).

### First-time setup (manual, done once per project)

- Create the Cloud Run service `valaris-website` in `us-central1` (one-time; subsequent deploys update the existing service).
- Connect a Cloud Build trigger pointing at `website/cloudbuild.yaml` on the branch(es) you want to deploy from. This card intentionally does **not** create the trigger — that's a user action.
- Ensure the Artifact Registry repository `valaris` exists in `us-central1`.

### Local equivalents

```bash
pnpm --filter @valaris/website check                       # same as typecheck step
pnpm --filter @valaris/website build                       # same as build-site step
pnpm --filter @valaris/website dlx @lhci/cli@0.14.x autorun --config=website/lighthouserc.json
docker build -t valaris-website -f website/Dockerfile website
docker run --rm -p 8080:8080 valaris-website
```

## Board

Tracked on the Valaris internal board: **Smoke Test 8 — Phase I — Valaris Website**.
