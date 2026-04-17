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

## Board

Tracked on the Valaris internal board: **Smoke Test 8 — Phase I — Valaris Website**.
