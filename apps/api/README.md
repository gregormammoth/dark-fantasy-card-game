# @dark-fantasy/api

Thin NestJS + Postgres Beta API: guest players, versioned run saves, analytics ingest, feedback.

## Local setup

```bash
docker compose up -d
cp apps/api/.env.example apps/api/.env
pnpm install
pnpm --filter @dark-fantasy/api prisma:generate
pnpm --filter @dark-fantasy/api prisma:migrate
pnpm --filter @dark-fantasy/api dev
```

API listens on `http://localhost:3001`.

## Endpoints

- `GET /health`
- `POST /players` — create guest `playerId`
- `GET /saves/:playerId` — load latest save
- `PUT /saves/:playerId` — upsert save (`{ schemaVersion, savedAt?, state }`)
- `POST /analytics/events` — `{ name, playerId?, payload? }`
- `POST /feedback` — `{ message, playerId?, contact? }`
