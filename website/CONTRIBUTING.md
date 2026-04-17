# Contributing to @valaris/website

This site is built end-to-end by the Valaris agent pipeline. Humans and agents share the same workflow: claim a card, branch, open a PR, pass review, merge. This document is the living reference for how to do that well.

For stack, commands, and deployment details see the [README](./README.md).

## TL;DR

- One card = one branch = one PR. PR under ~400 lines of diff when possible.
- Branch name: `feat/ST8-<card-slug>` (or `fix/`, `chore/`, `docs/`).
- Conventional commits: `feat(landing): add hero`, `fix(seo): correct canonical`, `docs: …`.
- Strict TypeScript. No `any`. No `@ts-ignore` without a `// reason: …` comment.
- Astro components by default; React islands only where interactivity is required.
- Tokens via `@theme` in `src/styles/global.css`. No raw palette classes (`bg-gray-100`), no inline `style=`.
- Every interactive element is keyboard-reachable with a visible focus ring. WCAG 2.2 AA is a hard gate.
- Lighthouse budgets (Perf/A11y/BP ≥ 0.95, SEO = 1.00) are enforced in CI.
- Tests belong with the code — unit for utilities and islands, Playwright smokes for navigation.
- Always squash-merge.

## Coding standards

The authoritative coding standards live on the project board as the note **“Agent Directives — Coding Standards.”** The rules below summarise that note and MUST be honoured by every implementer and reviewer.

### Code philosophy

- The code IS the documentation. Prefer semantic names over comments.
- Comment only non-obvious logic: regex, domain gotchas, async traps, magic thresholds.
- Never comment the obvious. No `// return the result`. No docstrings that repeat the function name.
- When improving clarity: rename variables, extract named constants, add one-line comments on tricky sections — don’t restructure working code for cleanliness alone.

### TypeScript

- Strict mode on. No `any`. No `@ts-ignore` without a `// reason: …` comment.
- `type` for unions, `interface` for object shapes.
- Exported functions have explicit return types.
- Content collections validated with zod schemas.

### Components

- Single-purpose. Keep them under ~200 lines; split when larger.
- Props are typed, destructured at the top, with defaults inline.
- Prefer `.astro` components. Use React islands only when interactivity is needed (forms, dynamic filters, animated diagrams, focus traps).
- Feature code lives under `src/features/{name}/` with `components/`, `content/`, `utils/`.

### Styling

- Tailwind CSS v4. All tokens defined in `src/styles/global.css` via `@theme`.
- No inline `style=` except for dynamic values that cannot be expressed in classes.
- Use semantic color tokens (`bg-surface`, `text-muted`) — not raw palette (`bg-gray-100`).
- Dark mode via `prefers-color-scheme` plus explicit class toggle. No FOUC. The inline theme script in `BaseLayout.astro` runs before paint.

### Accessibility (hard gate)

- Every interactive element is keyboard-reachable and has a visible focus ring.
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text.
- All images have meaningful `alt`. Decorative images use `alt=""`.
- Headings form a logical outline. No skipping levels.
- Forms have labels (visible or `aria-label`); errors are announced.

### Performance (hard gate)

- No JS on pages that don’t need it (Astro’s default). Islands opt-in only.
- All content images go through Astro’s `<Image>` component. No raw `<img>` for content.
- Fonts are self-hosted, preloaded, and use `font-display: swap`.
- No client-side routing for static pages.

## How to add a page

1. Create `src/pages/<route>.astro`.
2. Wrap the content in `BaseLayout` and pass `title` and `description`. These drive `<title>`, `<meta description>`, canonical, Open Graph, Twitter, and JSON-LD via `src/components/SEO.astro`.
3. Compose with existing shared components (`TopNav`, `Footer`, `CTABlock`, …) and feature components (`src/features/<name>/components/`).
4. If the page surfaces long-form content, add it to a content collection instead of hand-writing markup — see below.
5. Verify the page renders with JavaScript disabled. Islands should be additive, not required.
6. Add a Playwright smoke test if the page adds a new top-level route.

## How to add a component

1. Decide where it lives:
   - Used across features and features are not meaningful yet → `src/components/`.
   - Only used inside one feature → `src/features/<name>/components/`.
2. Default to a `.astro` component. Only reach for a React island when you need interactivity.
3. Keep it under ~200 lines and single-purpose. If it grows beyond that, split it.
4. Type props at the top and destructure with inline defaults.
5. Style with Tailwind v4 utilities driven by tokens in `src/styles/global.css`. Don’t reach for raw palette utilities.
6. For React islands, add tests under the same folder as `*.test.tsx` using `@testing-library/react`. Cover open/close, keyboard, and focus management at minimum.
7. For Astro components, if they contain non-trivial logic (SEO normalisation, content resolution), extract the logic into `src/lib/` or `src/features/<name>/utils/` and unit-test that.

## How to add content

Long-form content (landing copy, docs, case studies) lives under `src/content/` as Markdown or MDX and is validated by a zod schema in `src/content/config.ts`.

1. Pick or create a collection (e.g., `landing`, `docs`, `blog`).
2. If the collection is new, add its zod schema to `src/content/config.ts` and export it from the `collections` object.
3. Add the `.mdx` file under `src/content/<collection>/<slug>.mdx` with the frontmatter the schema requires.
4. Read the entry in a component with `getEntry("<collection>", "<slug>")` and render fields explicitly.
5. Never duplicate content in markup — if a string will appear on the page, it should come from a content entry so the brand voice review applies.

Follow the brand voice from the board note **“Design Philosophy & Brand Voice”**: direct, technically confident, show-don’t-assert. No hype words.

## Testing

Commands:

```bash
pnpm --filter @valaris/website test         # one-shot
pnpm --filter @valaris/website test:watch   # watch
```

Conventions:

- Name tests `*.test.ts` / `*.test.tsx` next to the file they cover.
- Unit tests for utilities in `src/lib/` (see `src/lib/seo.test.ts` for the pattern).
- React-island tests use `@testing-library/react` + `@testing-library/user-event` with the setup from `src/test/setup.ts`.
- Keep each test independent. Don’t rely on module-level mutable state.

Lighthouse CI runs against every Cloud Build. The build fails if the category budgets regress — fix the regression rather than raising the budget.

## Git & PR workflow

### Branching

- `main` is the protected trunk. Every change goes through a PR.
- Branch from `main` using the card slug: `feat/ST8-<slug>`, `fix/ST8-<slug>`, `docs/ST8-<slug>`, `chore/ST8-<slug>`.

### Commits

- Conventional commits: `<type>(<scope>): <subject>`.
- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `build`, `ci`.
- Scope is the top-level area (e.g., `landing`, `seo`, `infra`, `a11y`).
- Subject is imperative and lower-case: `feat(landing): add hero section`.

### Pull requests

- One card = one PR. Keep the diff under ~400 lines when you can.
- PR description must include:
  - A one-line summary of the change.
  - The card link (board URL or card id).
  - Acceptance criteria checklist copied from the card, with each item checked off.
  - Screenshots or Lighthouse notes for user-visible changes.
- Squash-merge only. No merge commits.

### Review

Every PR is reviewed by the reviewer role (agent or human) against:

- Acceptance criteria from the card.
- Coding standards (this document + the board note).
- Accessibility and performance gates.
- Tests cover the behaviour that mattered.

Reviewers cite specific `file:line` references. Implementers respond to each comment before re-requesting review.

## Agent pipeline flow

Cards on the project board are written for one of five roles. Labels (`role:*`) indicate which:

- **researcher** — investigates open questions and produces a board note with structured findings. No code.
- **planner** — decomposes large cards into smaller ones or adds follow-up cards based on what has merged. No code.
- **implementer** — claims a card in “To Do”, writes code, opens a PR. Must follow every rule above.
- **reviewer** — reviews the PR. Approves or requests changes with `file:line` citations.
- **documentator** — after a card is merged, updates README, this file, and any feature-level docs.

Card lifecycle on the board:

```
Backlog → To Do → In Progress → Review → Done
                       ↓            ↓
                    Blocked      (request changes returns to In Progress)
```

The orchestrator handles git operations on the agents’ behalf — branching, committing, pushing, and moving cards. When you work as a human, perform those steps yourself and keep the card state in sync.

## References

Board notes (source of truth for everything above):

- **Project Charter — Read First**
- **Design Philosophy & Brand Voice**
- **Agent Directives — Coding Standards**
- **Pipeline Roles & Card Conventions**

Local docs:

- [README.md](./README.md) — stack, commands, deployment.
- [LICENSE](./LICENSE)
