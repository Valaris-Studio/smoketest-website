# @valaris/website

Public-facing marketing + product site for Valaris — the agentic software factory platform. Built with Astro 5, Tailwind CSS v4, TypeScript (strict), and React 19 islands.

## Tech stack

- **Framework**: Astro 5 (content-first, zero-JS by default, islands for interactivity)
- **Language**: TypeScript (strict), `~/*` path alias → `src/*`
- **Styling**: Tailwind CSS v4 (CSS-first, tokens defined in `src/styles/global.css` via `@theme`)
- **Interactive islands**: React 19 (used only where interactivity is required)
- **Content**: Markdown/MDX under `src/content/` validated by zod schemas
- **Testing**: Vitest + Testing Library (unit) — Playwright smoke tests tracked separately
- **Package manager**: pnpm 9 (workspaces; monorepo lockfile lives beside `website/` at the repo root)
- **Runtime**: Node 22 LTS

## Commands

All commands run from the repo root via pnpm's `--filter`:

```bash
pnpm install                              # install deps (uses the repo-root lockfile)
pnpm --filter @valaris/website dev        # dev server on http://localhost:4321
pnpm --filter @valaris/website build      # production build → website/dist
pnpm --filter @valaris/website preview    # preview the production build
pnpm --filter @valaris/website check      # type-check via astro check
pnpm --filter @valaris/website test       # run vitest unit tests once
pnpm --filter @valaris/website test:watch # vitest watch mode
```

Inside `website/` you can also run the same scripts directly with `pnpm run <script>`.

## Directory layout

```
website/
├── astro.config.mjs          # site URL, integrations (mdx, react, sitemap), Tailwind v4 via Vite
├── tsconfig.json             # strict; extends astro/tsconfigs/strict; ~/* → src/*
├── vitest.config.ts          # jsdom env, includes src/**/*.test.{ts,tsx}
├── package.json
├── Dockerfile                # production nginx image (serves dist/)
├── nginx.conf                # security headers, immutable cache for /_astro/ assets
├── cloudbuild.yaml           # Cloud Build pipeline (install → check → test → build → lighthouse → deploy)
├── lighthouserc.json         # Lighthouse CI budgets (Perf/A11y/BP ≥ 0.95, SEO = 1.0)
├── public/                   # static assets served as-is
└── src/
    ├── components/           # shared atomic components (SEO, TopNav, MobileMenu, …)
    ├── content/              # content collections (Markdown/MDX + zod schemas in content/config.ts)
    │   └── landing/          # hero.mdx, pillars.mdx, cta.mdx
    ├── features/             # feature folders: features/{name}/components|content|utils
    │   └── landing/
    │       └── components/   # Hero.astro, …
    ├── layouts/              # BaseLayout.astro (SEO, theming, skip link)
    ├── lib/                  # framework-agnostic helpers (e.g., seo.ts + tests)
    ├── pages/                # Astro file-based routing
    ├── styles/               # global.css — Tailwind entry and design tokens
    └── test/                 # test setup (testing-library/jest-dom matchers)
```

Tailwind v4 is CSS-first: there is **no** `tailwind.config.*` file. Tokens and dark-mode overrides live in `src/styles/global.css`.

## Testing

```bash
pnpm --filter @valaris/website test         # one-shot
pnpm --filter @valaris/website test:watch   # watch
```

Test conventions:

- Unit tests for utilities and content-schema logic live next to the code as `*.test.ts`.
- Component tests for React islands use `@testing-library/react` + `jsdom`.
- Every interactive island must have tests covering open/close, focus management, and keyboard interaction where applicable.
- Playwright end-to-end tests (landing + /product + /docs navigation) are tracked on the board and will land in a separate PR.

## Deployment

The site ships through Cloud Build into a Cloud Run service named `valaris-website` in `us-central1`. Pipeline definition lives in [`cloudbuild.yaml`](./cloudbuild.yaml).

### Pipeline stages

1. **install** — `pnpm install` inside `website/`.
2. **typecheck** — `pnpm check` (Astro + TypeScript strict diagnostics).
3. **test** — `pnpm test` (vitest, no-op if no tests are present so scaffold cards don't block the pipeline).
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
- Grant the Cloud Build service account `roles/run.admin` and `roles/iam.serviceAccountUser` so the deploy step can update the service.
- Ensure the Artifact Registry repository `valaris` exists in `us-central1`.
- Connect a Cloud Build trigger pointing at `website/cloudbuild.yaml` on the branch(es) you want to deploy from. This is an intentional user action — the scaffold does **not** create the trigger.

### Local equivalents

```bash
pnpm --filter @valaris/website check         # typecheck step
pnpm --filter @valaris/website build         # build-site step

# lighthouse step: run from website/ so lighthouserc.json resolves correctly
cd website && pnpm dlx @lhci/cli@0.14.x autorun

# image step
docker build -t valaris-website -f website/Dockerfile website
docker run --rm -p 8080:8080 valaris-website
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to add pages, add components, the coding standards summary, and how PRs flow through the agent pipeline.

## License

See [`LICENSE`](./LICENSE).

## Board

Tracked on the Valaris internal board: **Smoke Test 8 — Phase I — Valaris Website**.
