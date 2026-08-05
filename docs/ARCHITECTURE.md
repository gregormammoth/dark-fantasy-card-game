# Architecture

Target platform architecture for the Beta and beyond: a **DDD modular monolith**, not microservices.

Related: [ROADMAP.md](./ROADMAP.md) (milestones), [MECHANICS.md](./MECHANICS.md) (game rules).

---

## Recommendation (summary)

| Concern | Choice |
|---------|--------|
| Architecture style | DDD + modular monolith |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL (separate schemas per bounded context) |
| Flexible data | PostgreSQL JSONB |
| Cache | Redis, only when actually needed |
| Game rules | Pure TypeScript game engine |
| Orchestration | XState |
| Frontend / platform | Next.js (App Router) |
| Repository | Turborepo monorepo |
| Deployment | Docker + GitHub Actions |
| Infra scale | One backend deploy + managed PostgreSQL; no Kubernetes / microservices yet |

---

## Domain vs game engine

Keep these **separate**. This is the critical boundary.

### Game engine — `packages/game-engine/`

Owns pure game rules:

- Combat
- Cards
- Deck
- Exploration
- Progression (rule math / XP formulas)
- RNG

It must run in:

- Browser
- Simulator
- Tests
- Server (when authoritative checks are needed)

No NestJS, no React, no Next.js imports.

### Backend domain — `apps/api` (e.g. `game` module)

Owns the player's **persistent game experience**:

- Sessions
- Saves
- Player progression persistence
- Authentication

The backend manages accounts, cloud state, and online services — **not** fundamental combat rules.

---

## Target repository layout

```text
game/
│
├── apps/
│   ├── web/                 # Next.js: website + /play client
│   └── api/                 # NestJS modular monolith
│
├── packages/
│   ├── game-engine/         # Pure TS rules + XState machines
│   ├── shared/              # Shared game types / contracts
│   ├── content/             # Game JSON packs + portrait refs
│   └── api-client/          # Typed client for the API (future)
│
├── docs/
│
└── infra/
    ├── docker/
    └── github/
```

Current repo state:

- `apps/web` — Next.js 15 App Router: public site + `/play` game client
- `apps/api` — NestJS thin Beta API (guest players, versioned saves, analytics, feedback) + Prisma/Postgres
- `packages/game-engine` — battle / exploration engine + XState machines
- `packages/shared` — shared TypeScript types
- `packages/content` — card / map / encounter JSON + portraits
- `packages/api-client` is future work
- `docker-compose.yml` — local Postgres for `apps/api`

---

## NestJS modular monolith (DDD without microservices)

If / when NestJS is adopted:

```text
apps/
  web/
  api/

packages/
  game-engine/
  content/
  shared/

apps/api/src/
  modules/
    identity/
      domain/
      application/
      infrastructure/
      presentation/
    game/
      domain/
      application/
      infrastructure/
      presentation/
    content/
      domain/
      application/
      infrastructure/
      presentation/
    social/
      domain/
      application/
      infrastructure/
      presentation/
    analytics/
      domain/
      application/
      infrastructure/
      presentation/
```

Each module is a **bounded context** inside one deployable API. Prefer separate **PostgreSQL schemas** per major context rather than separate databases or services.

---

## Runtime shape (target)

```text
                 Next.js
                    │
          ┌─────────┴─────────┐
          │                   │
        Game UI             Website
          │
          ▼
     Game Engine
          │
       XState
          │
          ▼
      NestJS API
          │
    ┌─────┼─────┐
    │     │     │
  Game  Player Social
    │     │     │
    └─────┼─────┘
          │
      PostgreSQL
          │
     ┌────┴────┐
     │         │
   Redis    Analytics
```

- **Next.js** hosts marketing/content pages and the `/play` client.
- **Game UI** talks to the **game engine** locally for rules; XState orchestrates flow.
- **NestJS API** owns persistence, analytics ingest, feedback, and later identity / online features.
- **Redis / warehouse analytics** only when there is a concrete need.

Beta ships the thin API (guest saves, events, feedback). Full auth and profiles attach later at the same boundary without rewriting the engine.

---

## Evolution path (do not start here)

If the product succeeds, modules can later become services:

- Identity Service
- Game Service
- Social Service
- Content Service
- Analytics Service

each with its own Postgres (or schema → database split).

**Do not start there.**

Grow in this order:

```text
DDD boundaries
      ↓
Modules
      ↓
Separate Postgres schemas
      ↓
One deployable application
```

Extraction then becomes an optimization, not a rewrite.

---

## Layer checklist

| Layer | Owns | Must not own |
|-------|------|----------------|
| Next.js presentation | Website, `/play` UI, SEO | Combat / deck math |
| XState | Screen & turn orchestration | Damage formulas, loot rolls |
| `game-engine` | Rules, RNG, battle / exploration math | HTTP, DB, React |
| NestJS modules | Auth, saves, sessions, online progression | Card resolution formulas (call the engine instead) |
| Content packages | Cards, regions, lore, MDX | Runtime rule code |
| PostgreSQL | Durable player / account / save data | Transient battle animation state |

---

## Principles (backend + platform)

1. Modular monolith first; microservices only after clear scale or team boundaries.
2. Bounded contexts map to NestJS modules and Postgres schemas.
3. Game engine stays reusable outside the API.
4. Prefer JSONB for evolving save / content-shaped documents; use relational tables for identity and queries you must join.
5. Add Redis when caching or ephemeral session load justifies it — not by default.
6. One API deployment + managed Postgres until operational complexity demands more.
