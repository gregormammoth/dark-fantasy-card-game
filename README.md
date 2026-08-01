# Dark Fantasy Card Game

pnpm + Turborepo monorepo. The playable Vite client lives in `apps/web`. End-to-end tests live in `tests/e2e`. Shared libraries will go under `packages/` as they are extracted.

## Install

Requires [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/) 9+.

```bash
pnpm install
pnpm e2e:install
```

The second command installs the Chromium browser used by Playwright (run once per machine, or after upgrading `@playwright/test`).

## Development

Start the Vite game app (Turbo fans out `dev` to workspace packages):

```bash
pnpm dev
```

Open the URL Vite prints (default `http://localhost:5173`).

Filter to a single app:

```bash
pnpm --filter @dark-fantasy/web dev
```

## Turbo tasks

From the repo root:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start persistent `dev` tasks |
| `pnpm build` | Production build (`dependsOn: ["^build"]`) |
| `pnpm lint` | Lint / static checks per package |
| `pnpm typecheck` | TypeScript `--noEmit` |
| `pnpm test` | Unit / package tests |
| `pnpm e2e` | Playwright E2E (builds first, then runs tests) |

Turbo caches build, lint, test, and typecheck. `dev` and `e2e` are not cached.

## End-to-end tests (Playwright)

E2E config: `tests/e2e/playwright.config.ts`.

Run the full suite (builds `@dark-fantasy/web`, then serves `vite preview` and runs Chromium headless in CI):

```bash
pnpm e2e
```

Run a single test file:

```bash
pnpm --filter @dark-fantasy/e2e exec playwright test tests/home.spec.ts
```

Run a single test by title:

```bash
pnpm --filter @dark-fantasy/e2e exec playwright test -g "loads the world map home screen"
```

Interactive UI mode:

```bash
pnpm e2e:ui
```

Open the HTML report after a run:

```bash
pnpm e2e:report
```

## Workspace layout

```text
apps/
  web/          Vite + React game client
packages/       Shared packages (reserved)
tests/
  e2e/          Playwright project
docs/           Design / roadmap docs
```

## Docs

- [Roadmap](./docs/ROADMAP.md)
- [Mechanics](./docs/MECHANICS.md)
- [Audio](./docs/AUDIO.md)
