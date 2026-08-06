# Dark Fantasy Card Game

pnpm + Turborepo monorepo. `apps/web` is a Next.js 15 App Router platform: public marketing site plus the game at `/play`. Shared packages live under `packages/`. End-to-end tests live in `tests/e2e`.

## Install

Requires [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/) 9+.

```bash
pnpm install
pnpm e2e:install
```

The second command installs the Chromium browser used by Playwright (run once per machine, or after upgrading `@playwright/test`).

## Development

Start the Next.js app:

```bash
pnpm dev
```

Open `http://localhost:3000` for the site, and `http://localhost:3000/play` for the game.

Filter to the web app:

```bash
pnpm --filter @dark-fantasy/web dev
```

Copy `apps/web/.env.example` to `apps/web/.env.local` to override site URL / name.

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

Run the full suite (builds `@dark-fantasy/web`, then serves `next start` and runs Chromium headless):

```bash
pnpm e2e
```

Run a single test file:

```bash
pnpm --filter @dark-fantasy/e2e exec playwright test tests/home.spec.ts
```

Interactive UI mode:

```bash
pnpm e2e:ui
```

Open the HTML report after a run:

```bash
pnpm e2e:report
```

## Layout

```text
apps/web/          Next.js site + /play client
packages/
  game-engine/     Pure TS rules + XState machines
  shared/          Shared types
  content/         Game JSON + portrait refs
tests/e2e/         Playwright smoke tests
docs/              Roadmap, positioning, architecture, mechanics
```

## Deploy (Vercel)

Set the Vercel project root to `apps/web`. Build command: `cd ../.. && pnpm --filter @dark-fantasy/web build` (or install from repo root and build the web package). Output: Next.js default.
