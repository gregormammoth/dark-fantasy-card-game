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

## Compress GLB

Requires a global [`@gltf-transform/cli`](https://gltf-transform.dev/) installed under Node 24 (Volta). Meshopt + WebP:

```bash
pnpm compress:glb -- 3.glb output3.glb
```

Same as:

```bash
volta run --node 24.18.1 gltf-transform optimize 3.glb output3.glb --compress meshopt --texture-compress webp
```

Copy the result to `apps/web/public/characters/` when you want it in the game (for example `dead_anarchist.glb`).

Render loading stills from each GLB (Playwright + Chromium):

```bash
pnpm stills:glb
```

Writes WebP files to `apps/web/public/characters/stills/`. Dialog and battle portraits show the still only until the GLB has loaded once; later opens skip it.

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
| `pnpm compress:glb -- in.glb out.glb` | Meshopt + WebP GLB via gltf-transform (Node 24) |
| `pnpm stills:glb` | Render WebP stills from character GLBs |

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

## Deploy with Docker

Requires Docker and Docker Compose.

### Local (build on the machine)

```bash
cp .env.example .env
# set NEXT_PUBLIC_SITE_URL to your public URL, and a strong POSTGRES_PASSWORD
docker compose up -d --build
```

Services:

| Service | Role |
|---------|------|
| `nginx` | Public entry on `HTTP_PORT` (default 80); proxies `/` → web, `/api/` → API |
| `web` | Next.js frontend (standalone) |
| `api` | NestJS API + Prisma migrations on start |
| `postgres` | Postgres 16 |

Open `http://localhost` (or your `NEXT_PUBLIC_SITE_URL`). API health: `http://localhost/api/health`.

Rebuild after env changes that affect the web build args (`NEXT_PUBLIC_*`):

```bash
docker compose up -d --build web
```

### AWS ECR (build locally, run on the server)

Repositories:

- Frontend: `048266892585.dkr.ecr.eu-north-1.amazonaws.com/dark-fantasy-frontend`
- Backend: `048266892585.dkr.ecr.eu-north-1.amazonaws.com/dark-fantasy-backend`

#### 1. Log in to ECR

```bash
aws ecr get-login-password --region eu-north-1 \
  | docker login --username AWS --password-stdin 048266892585.dkr.ecr.eu-north-1.amazonaws.com
```

#### 2. Build and tag

Set `NEXT_PUBLIC_SITE_URL` to the real public URL before building the frontend (it is baked into the image).

On Apple Silicon, target the EC2 architecture (`linux/amd64`):

```bash
export AWS_ACCOUNT=048266892585
export AWS_REGION=eu-north-1
export ECR=$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com
export TAG=latest

# Backend
docker build \
  --platform linux/amd64 \
  -f apps/api/Dockerfile \
  -t $ECR/dark-fantasy-backend:$TAG \
  .

# Frontend
docker build \
  --platform linux/amd64 \
  -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.example \
  --build-arg NEXT_PUBLIC_SITE_NAME=Hollowfort \
  -t $ECR/dark-fantasy-frontend:$TAG \
  .
```

Or build both via Compose (uses the same ECR image names from `docker-compose.yml`):

```bash
export NEXT_PUBLIC_SITE_URL=https://your-domain.example
docker compose build web api
```

#### 3. Push

```bash
docker push $ECR/dark-fantasy-backend:$TAG
docker push $ECR/dark-fantasy-frontend:$TAG
```

#### 4. On the EC2 host

Install Docker + Compose, copy the repo (or at least `docker-compose.yml`, `deploy/nginx/`, `.env`), then:

```bash
aws ecr get-login-password --region eu-north-1 \
  | docker login --username AWS --password-stdin 048266892585.dkr.ecr.eu-north-1.amazonaws.com

cp .env.example .env
# set POSTGRES_PASSWORD and NEXT_PUBLIC_SITE_URL (SITE_URL is only needed if you rebuild on the server)

docker compose pull web api
docker compose up -d
```

`nginx` and `postgres` still pull from Docker Hub. Only `web` and `api` come from ECR.
