# Desktop App (Electron)

Plan and implementation guide for wrapping the existing Next.js web app in an Electron shell as a native desktop release (macOS, Windows, Linux).

Related: [ARCHITECTURE.md](./ARCHITECTURE.md) (overall stack), [ROADMAP.md](./ROADMAP.md) (milestones).

---

## Decision summary

| Concern | Web | Desktop |
|---------|-----|---------|
| Runtime | Next.js 15 in browser | Electron + Chromium renderer |
| Database | PostgreSQL via NestJS API | SQLite via Prisma (same schema) |
| Saves | Cloud: `PUT /saves/:id` | Local: SQLite file in `userData` |
| Player profile | Cloud: `POST /players` | Local: SQLite file in `userData` |
| Analytics / feedback | NestJS endpoints | Omitted (offline; optionally batch-sync later) |
| Asset serving | Next.js static serving + rewrites | Electron `protocol.handle` for GLB rewrite fallbacks |
| Game engine / UI code | Unchanged | Unchanged — runs in Chromium renderer as-is |

---

## Why not a single database for both

- Browsers have no filesystem access; native SQLite is impossible without WASM
- SQLite WASM has no Prisma support, requires OPFS (limited browser compatibility), and adds ~2 MB to the bundle
- The existing PostgreSQL + NestJS path works well for web; adding desktop does not require changing it
- For desktop the save data is **one JSON blob per player** — SQLite is a natural fit and Prisma already supports it with zero schema changes

---

## Repository layout after desktop work

```
apps/
  web/          # unchanged — Next.js 15
  api/          # unchanged — NestJS + PostgreSQL
  desktop/      # new — Electron shell
    src/
      main.ts           # Electron main process
      preload.ts        # contextBridge IPC surface
      protocol.ts       # file:// rewrite handler (GLB fallbacks)
    package.json
    electron-builder.yml
    tsconfig.json

packages/
  game-engine/  # unchanged
  shared/       # unchanged
  content/      # unchanged
  desktop-storage/  # new — SQLite storage implementation
    src/
      index.ts          # GameStorage interface
      sqlite.ts         # Better-SQLite3 + Prisma implementation
    prisma/
      schema.prisma     # sqlite datasource, same models as apps/api
      migrations/
```

---

## Storage interface

Create `packages/desktop-storage` with a shared interface so `GameApp.tsx` can be storage-agnostic:

```typescript
// packages/desktop-storage/src/index.ts
export interface GameStorage {
  createPlayer(name: string, gender: 'man' | 'woman'): Promise<PlayerProfile>;
  loadSave(playerId: string): Promise<LocalSaveFile | null>;
  writeSave(playerId: string, state: LocalRunState): Promise<void>;
  clearSave(playerId: string, runSeed: number): Promise<void>;
}
```

Two concrete implementations:

| Class | Used by | Transport |
|-------|---------|-----------|
| `WebStorage` | `apps/web` | `apiFetch` → NestJS → PostgreSQL |
| `DesktopStorage` | `apps/desktop` | IPC → main process → SQLite |

Inject the correct one at the root of `GameApp.tsx` via React context — no conditional `apiFetch` calls scattered through components.

### Current call sites to migrate

```
apps/web/src/lib/playerProfile.ts   createPlayerProfile()  → POST /players
apps/web/src/lib/runSave.ts         loadCloudRun()         → GET  /saves/:id
                                    saveCloudRun()         → PUT  /saves/:id
                                    clearCloudRun()        → PUT  /saves/:id (reset)
apps/web/src/GameApp.tsx            calls all of the above
```

---

## Prisma schema for SQLite

The `apps/api/prisma/schema.prisma` models (`Player`, `Save`) translate directly to SQLite. Only the datasource block changes:

```prisma
// packages/desktop-storage/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider = "sqlite"
  url      = env("DESKTOP_DATABASE_URL")
}

model Player {
  id        String   @id
  name      String
  gender    String
  createdAt DateTime @default(now())
  saves     Save[]

  @@map("players")
}

model Save {
  id            String   @id @default(uuid())
  playerId      String   @unique
  player        Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  schemaVersion Int
  state         String   // SQLite has no Json type — serialize/deserialize JSON manually
  savedAt       DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([playerId])
  @@map("saves")
}
```

> Note: Prisma SQLite does not support the `Json` column type. Store `state` as `String` and `JSON.parse` / `JSON.stringify` in the service layer.

Set `DESKTOP_DATABASE_URL` in the main process:

```typescript
// apps/desktop/src/main.ts
import { app } from 'electron';
import path from 'node:path';

process.env.DESKTOP_DATABASE_URL =
  `file:${path.join(app.getPath('userData'), 'hollowfort.db')}`;
```

---

## Electron main process

### Recommended tooling

Use **Electron Forge** with the `@electron-forge/plugin-vite` plugin or **Nextron** (wraps Next.js inside Electron). Either works; Nextron is simpler because it preserves the Next.js dev server and the `/characters/*.glb` rewrites continue working unchanged.

### Nextron approach (recommended)

```
apps/desktop/
  renderer/     # symlink or copy of apps/web/src (or import as a workspace dep)
  main.ts       # electron entry
  next.config.js  # Nextron-specific Next.js config
```

Nextron runs the Next.js server inside Electron so all existing rewrites (`prisoner.glb` → `enemy.glb`, `guard_captain.glb`, etc.) continue to work without any additional protocol handler.

### Vanilla Electron approach (alternative)

Build `apps/web` with `output: 'export'` (static HTML/CSS/JS). Serve with `loadFile()`. Add a `protocol.handle` to replicate the GLB rewrite fallbacks from `next.config.ts`:

```typescript
// apps/desktop/src/protocol.ts
import { protocol, net } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

const NPC_FALLBACKS = new Set(['dead_anarchist', 'sorcerer', 'smuggler', 'executioner']);
const ENEMY_FALLBACKS = new Set(['prisoner', 'giant_rat', 'crazy_prisoner', 'guard',
  'fat_prisoner', 'butcher', 'knight', 'inquisitor', 'prison_warden', 'resurrected_anarchist']);
const WOMAN_FALLBACKS = new Set(['player_woman_fighter', 'player_woman_rogue',
  'player_woman_wizard', 'player_woman_survivor']);
const PLAYER_FALLBACKS = new Set(['player_fighter', 'player_rogue', 'player_wizard', 'player_survivor']);

const FALLBACK_MAP: Array<[Set<string>, string]> = [
  [NPC_FALLBACKS,    'npc.glb'],
  [ENEMY_FALLBACKS,  'enemy.glb'],
  [WOMAN_FALLBACKS,  'player_woman.glb'],
  [PLAYER_FALLBACKS, 'player.glb'],
];

export function registerProtocol(publicDir: string) {
  protocol.handle('file', (request) => {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/characters/') && url.pathname.endsWith('.glb')) {
      const name = path.basename(url.pathname, '.glb');
      for (const [set, fallback] of FALLBACK_MAP) {
        if (set.has(name)) {
          const resolved = path.join(publicDir, 'characters', fallback);
          if (fs.existsSync(resolved)) {
            return net.fetch(`file://${resolved}`);
          }
        }
      }
    }
    return net.fetch(request.url);
  });
}
```

> Keep this list in sync with `apps/web/next.config.ts` whenever new characters are added.

---

## IPC bridge (save / player operations)

Define a typed IPC surface in `preload.ts` exposed via `contextBridge`:

```typescript
// apps/desktop/src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktopStorage', {
  createPlayer: (name: string, gender: string) =>
    ipcRenderer.invoke('storage:createPlayer', { name, gender }),
  loadSave: (playerId: string) =>
    ipcRenderer.invoke('storage:loadSave', playerId),
  writeSave: (playerId: string, state: unknown) =>
    ipcRenderer.invoke('storage:writeSave', { playerId, state }),
  clearSave: (playerId: string, runSeed: number) =>
    ipcRenderer.invoke('storage:clearSave', { playerId, runSeed }),
});
```

Handle in main process:

```typescript
// apps/desktop/src/main.ts
import { ipcMain } from 'electron';
import { DesktopStorageService } from '@dark-fantasy/desktop-storage';

const storage = new DesktopStorageService();

ipcMain.handle('storage:createPlayer', (_, body) => storage.createPlayer(body));
ipcMain.handle('storage:loadSave',     (_, playerId) => storage.loadSave(playerId));
ipcMain.handle('storage:writeSave',    (_, { playerId, state }) => storage.writeSave(playerId, state));
ipcMain.handle('storage:clearSave',    (_, { playerId, runSeed }) => storage.clearSave(playerId, runSeed));
```

Detect Electron at runtime in `GameApp.tsx`:

```typescript
const isDesktop = typeof window !== 'undefined' && 'desktopStorage' in window;
const storage: GameStorage = isDesktop
  ? new DesktopStorageAdapter(window.desktopStorage)
  : new WebStorageAdapter();
```

---

## Asset packaging

GLB files are large. Approximate sizes:

| File | Size |
|------|------|
| `player.glb` | ~58 MB |
| `player_woman.glb` | ~54 MB |
| `enemy.glb` | ~56 MB |
| `npc.glb` | ~54 MB |
| `demon.glb` | ~43 MB |
| `guard_captain.glb` | ~36 MB |
| other hardlinked GLBs | 0 (same inode — single copy on disk) |

Hardlinked files (e.g. `dead_anarchist.glb` → `npc.glb`) are the same file on disk, but Electron Builder will dereference hardlinks when building the installer. Each hardlink becomes a full copy. **Before packaging, replace hardlinks with symlinks, or configure Electron Builder's `asarUnpack` to exclude the `characters/` directory and bundle them as loose files.**

Recommended `electron-builder.yml`:

```yaml
asarUnpack:
  - 'public/characters/**/*.glb'
```

This avoids loading 50 MB+ files from inside an ASAR archive (slow) and lets the OS avoid hardlink duplication in the packed output.

---

## Build pipeline addition

Add to `turbo.json`:

```json
{
  "tasks": {
    "desktop#build": {
      "dependsOn": ["web#build"],
      "outputs": ["apps/desktop/dist/**"]
    }
  }
}
```

Add to root `package.json` scripts:

```json
"desktop": "pnpm --filter @dark-fantasy/desktop electron-forge start",
"desktop:build": "pnpm --filter @dark-fantasy/desktop electron-forge make"
```

---

## Analytics and feedback

These endpoints (`POST /analytics/events`, `POST /feedback`) are cloud-only features. For the desktop release:

- **Skip analytics** entirely, or queue events locally in SQLite and sync when the user is online
- **Feedback**: replace with a link that opens a GitHub issue / Discord in the system browser via `shell.openExternal()`

---

## Implementation order

1. Create `packages/desktop-storage` — SQLite Prisma schema + `DesktopStorageService`
2. Extract `GameStorage` interface; wrap existing `apiFetch` calls in `WebStorageAdapter`
3. Wire `GameApp.tsx` to receive `GameStorage` via context/props
4. Create `apps/desktop` — Electron shell (Nextron or vanilla)
5. Add IPC handlers + preload bridge
6. Handle GLB rewrite fallbacks (Nextron: already handled; vanilla: add `protocol.ts`)
7. Configure Electron Builder + `asarUnpack` for GLBs
8. Test on macOS, Windows, Linux
9. Set up code signing (Apple Developer ID, Windows Authenticode)
