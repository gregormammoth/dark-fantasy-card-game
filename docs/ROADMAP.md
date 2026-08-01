# Game Development Roadmap (Beta → Vertical Slice)

## Vision

The Beta is **not** the entire game.

It delivers **one complete, polished adventure** — a **playable vertical slice** — that proves the game identity:

**Cards define the character.** Classes, XP, deckbuilding, exploration, and combat form one continuous run.

```text
START
  ↓
Prison Cell
  ↓
Explore
  ↓
Encounter
  ↓
Battle
  ↓
Earn Class XP
  ↓
Improve Deck
  ↓
Explore more
  ↓
Battle
  ↓
Boss
  ↓
Escape
  ↓
World Map
```

The product is a **web platform**: public marketing/content site plus the game at `/play`. The game engine, XState machines, and gameplay logic stay **framework-independent**; Next.js is the application shell.

After Hollowfort Prison ships, remaining work should be **mostly new content**, not system redesign — and **not** a premature full backend.

---

## Development horizons

Use this as the primary compass. Systems work still matters; horizons decide *when*.

### Now — Beta-critical

- Shared **Run** state (one continuous playthrough)
- Exploration ↔ Battle with the same run
- Class XP → levels → unlocks → deck changes
- **Reward loop** (action → reward → progression → new options)
- Versioned **save / load** (`localStorage` first)
- **Seeded RNG** (required before Beta)
- Hollowfort Prison story vertical slice
- ~24–32 excellent player cards + 10–12 locations
- Small **analytics foundation** (instrument as mechanics stabilize)
- E2E + polish enough to ship the slice

### Yellow — Beta-supporting (already largely done or light)

- Next.js shell + `/play`
- SEO + public content SSG
- Documentation
- Vercel deploy
- Audio / settings basics

### Green — Post-Beta (architecture seams only until then)

- Authentication / player profiles
- Cloud saves (NestJS + Postgres)
- Leaderboards / achievements / admin
- Full inventory expansion (weapons, armour, potions, trinkets)
- Advanced analytics store (ClickHouse etc.)
- Large card / enemy content expansion

**Do not** build the full NestJS modular monolith for Beta. Enough for Beta:

```text
Next.js
  └── /play  →  local run + localStorage save
  └── (optional) analytics events → NestJS → Postgres
```

After the game proves fun:

```text
Next.js → NestJS → Auth / Saves / Analytics → PostgreSQL
```

---

## Target architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the long-term DDD modular monolith target.

```text
Presentation Layer (React + Next.js App Router)
        ↓
Application Layer (XState + shared Run)
        ↓
Game Engine (Pure TypeScript)
        ↓
Content Layer (JSON / Markdown)
        ↓
Persistence Layer (localStorage → later NestJS + PostgreSQL)
```

| Layer | Owns | Must not own |
|-------|------|----------------|
| Presentation | Website pages, `/play` client UI, SEO, animations | Combat / deck / progression math |
| Application (XState) | Screen & turn flow, run orchestration | Damage formulas, loot rolls |
| Game Engine | Battle, exploration, deck, effects, RNG, progression | React, Next.js, NestJS, JSX |
| Content | Cards, regions, lore, blog, patch notes (SSG) | Runtime game rules |
| Persistence | Versioned save/load, settings, future cloud profiles | Gameplay calculations |

---

## Architecture Principles

1. The game engine is framework-independent.
2. React renders the game but never implements game rules.
3. XState orchestrates gameplay but does not calculate mechanics.
4. All gameplay rules live in the Game Engine.
5. Content is data-driven and stored outside engine logic.
6. Every system should be independently testable.
7. **Deterministic seeded RNG is required before Beta** — same seed ⇒ same random sequence.
8. Save files must be **versioned** (`schemaVersion` / `gameVersion` / `contentVersion`).
9. New regions should require minimal engine changes and primarily consist of new content.
10. Prefer incremental, testable refactoring over large architectural rewrites.
11. Prefer proving the **vertical slice** over building platform/backend early.
12. Inventory is secondary to cards, classes, XP, and deckbuilding for Beta identity.

---

## Current status (snapshot)

| Area | Status |
|------|--------|
| pnpm + Turborepo monorepo | In place |
| Next.js 15 + `/play` + SEO/SSG | In place (M1 done) |
| `game-engine` / `shared` / `content` | Extracted; framework-independent |
| World / Exploration / Battle screens | Present, still largely separate runtimes |
| Shared **Run** state | Not started |
| Exploration ↔ Battle continuity | Not started (high priority) |
| Battle core | Partial — playable |
| Class XP award + UI | In place |
| Class levels / unlock curve | Not started |
| Reward loop | Fragmented — XP only so far |
| Save / load + save schema | Not started |
| Seeded RNG | Not started (now **required** for Beta) |
| Analytics foundation | Not started |
| Inventory | Post-Beta / optional light later |
| Automated tests | E2E smoke; XP unit tests |

Update this table as milestones land.

---

## Primary target — Playable Vertical Slice

**This is the primary development target.** System milestones below serve this journey.

### Player journey checklist

- [ ] Start a new run from `/play`
- [ ] Wake / begin in Prison Cell
- [ ] Explore the prison on a shared run
- [ ] Trigger an encounter from exploration
- [ ] Enter battle with the same run state
- [ ] Earn class XP from successful card plays
- [ ] Improve deck (unlock / rebuild) mid-run
- [ ] Return to exploration with progression intact
- [ ] Fight again with a meaningfully different deck
- [ ] Defeat the prison boss
- [ ] Escape Hollowfort
- [ ] Reach the world map

### Slice success

A new player can finish the prison in ~60–90 minutes, understand cards-as-identity within ~15 minutes, and leave wanting the next region — without major bugs or disconnected “demo screens.”

---

## Near-term build order (Now)

Work in this order unless a dependency forces otherwise. Analytics may be instrumented earlier as each mechanic stabilizes.

```text
CURRENT
  │
  ▼
1. XP + progression (levels / unlocks)     ← XP award+UI done; levels next
  │
  ▼
2. Shared Run State
  │
  ▼
3. Exploration ↔ Battle (same run)
  │
  ▼
4. Save / Load + versioned schema (localStorage)
  │
  ▼
5. Seeded RNG (required)
  │
  ▼
6. Reward loop
  │
  ▼
7. Prison story vertical slice
  │
  ▼
8. Content: ~24–32 cards · 10–12 locations
  │
  ▼
9. Analytics foundation + instrumentation
  │
  ▼
10. Polish + E2E
  │
  ▼
BETA
```

Inventory and the full NestJS backend stay **after** this path (or very lightweight if a single relic reward is needed for the loop).

---

## Milestone 1 — Platform Architecture

**Horizon:** Yellow (Beta-supporting) · **Status:** Complete

**Goal:** Next.js App Router shell with SEO public pages and the game at `/play`, engine still pure TypeScript.

### Adopt Next.js 15

- [x] Create Next.js app with App Router
- [x] Configure TypeScript
- [x] Configure ESLint
- [x] Configure Prettier
- [x] Configure absolute imports
- [x] Configure environment variables
- [x] Configure production build

### Separate website and game

- [x] Home, Play, About, Blog, Roadmap, Lore, Regions, Cards, Classes, Enemies, Patch Notes, Privacy, Terms
- [x] Mount the game under **`/play`**
- [x] Keep World → Exploration → Battle flows working inside `/play`

### Preserve existing game (framework-independent)

- [x] Game Engine / Battle / Exploration / Deck / XState / Content packs
- [ ] Save System (when added — see M4)

### SEO & content SSG

- [x] Metadata, sitemap, robots, OpenGraph, Twitter, canonical, JSON-LD
- [x] Lore, Regions, Cards, Classes, Enemies, Blog, Patch Notes, Roadmap
- [ ] Items / Relics marketing pages (post-inventory)

### Deployment

- [x] Vercel-ready production build
- [ ] Production deploy live

### Future services (Green — seams only, not Beta work)

- [ ] Authentication
- [ ] Player profiles
- [ ] Cloud saves
- [ ] Leaderboards
- [ ] Achievements
- [ ] Admin panel

---

## Milestone 2 — Shared Run State

**Horizon:** Red (Beta-critical) · **Priority:** #2 after progression levels

**Goal:** One continuous **Run** that World, Exploration, and Battle all operate on — not separate demos glued by React screen state.

### Run model

```text
Game
 └── Run
      ├── player (progression, deck, unlocks, …)
      ├── world (location, discovered, flags)
      ├── exploration
      ├── battle (when active)
      └── meta (seed, rng cursor, …)
```

### Tasks

- [ ] Define `Run` / `GameState` types in shared or engine packages
- [ ] App-level orchestration machine (World ↔ Exploration ↔ Battle) owning the Run
- [ ] Carry progression, deck, and flags across screen transitions
- [ ] End battle → return to exploration with the same Run
- [ ] New game creates a fresh Run; continue restores one

### Deliverable

Exploration and battle are no longer separate runtimes.

---

## Milestone 3 — Exploration ↔ Battle Loop

**Horizon:** Red · **Priority:** #3

**Goal:** Wire the real game loop on top of the shared Run.

### Tasks

- [x] Exploration map + action types present
- [x] Encounter deck (basic)
- [ ] Wire exploration fights into the battle machine with shared Run
- [ ] Battle result returns to exploration (not a dead-end modal island)
- [ ] Polish outcomes, locks, and once-flags as needed for the prison slice
- [ ] Locked locations (keys / quests) as story requires

### Deliverable

```text
Exploration → Fight → Battle → Result → Exploration
```

with one run state throughout.

---

## Milestone 4 — Save Schema & Save / Load

**Horizon:** Red · **Priority:** #4 (ahead of inventory and most content expansion)

**Goal:** Versioned local saves before progression pain becomes acute.

### Game state / save schema (define before implementing I/O)

```text
GameState
├── player
│   ├── progression
│   ├── deck
│   ├── unlocks
│   └── inventory? (optional / empty for Beta)
├── world
│   ├── location
│   ├── discovered
│   └── flags
├── exploration
├── battle?          # omit or snapshot only if mid-fight resume is in scope
└── meta
    ├── seed
    ├── rngCursor
    ├── gameVersion
    └── contentVersion

SaveFile
├── schemaVersion
├── gameVersion
├── contentVersion
├── savedAt
└── state: GameState
```

### Tasks

- [ ] Spec `GameState` + `SaveFile` types (version fields mandatory)
- [ ] Serialize / deserialize in the engine or a thin persistence helper (no NestJS required)
- [ ] `localStorage` save / load / continue
- [ ] Migration stub or reject incompatible `schemaVersion`
- [ ] Autosave at safe checkpoints (location change, battle end, unlock)

### Later (Green)

```text
local save → NestJS API → Postgres → cloud save
```

### Deliverable

A player can close the tab and continue the same Hollowfort run.

---

## Milestone 5 — Seeded RNG

**Horizon:** Red · **Priority:** #5 · **Required before Beta** (not optional)

**Goal:** Deterministic randomness for draws, encounters, enemies, loot, and tests.

### Tasks

- [ ] Engine RNG module with explicit seed
- [ ] Store seed + cursor on the Run / save
- [ ] Route card draws, encounters, enemy picks, loot through seeded RNG
- [ ] Debug / QA: enter seed → reproduce exact run sequence
- [ ] Playwright: fixed seeds for flaky-prone flows

### Example

```text
Seed 1234 → encounter X → enemy Y → draw Z → reproducible outcome
```

### Deliverable

Same seed ⇒ same random sequence ⇒ reproducible bugs and E2E scenarios.

---

## Milestone 6 — Progression & Reward Loop

**Horizon:** Red · **Priority:** #1 (levels) and #6 (full reward loop)

**Goal:** Cards define the character — XP becomes levels, unlocks, and a satisfying loop. Do **not** rush level balance; gather play data first.

### Class experience

- [x] +1 class XP per successful player card play (Fighter / Rogue / Wizard / Survivor)
- [x] Progression carried across battles in the current session
- [x] Character screen shows live class XP and total XP
- [x] Battle results show XP gained this fight
- [ ] Persist via save / load (M4)

### Level system (next progression step)

```text
XP → Class Level → Unlockable cards → Spend XP → Deck changes
```

- [ ] Independent class levels from XP thresholds
- [ ] Unlock new cards by class level / XP spend (tighten rules vs current demo unlock UI)
- [ ] Passive bonuses (only if they serve the slice — keep lean)
- [ ] Avoid heavy level-curve tuning until analytics / playtests inform pace

### Deck growth

- [x] Character screen deck composition (add / remove, deck cap)
- [x] Unlock cards by spending class XP (UI exists — bind to real rules)
- [ ] Permanent card removal (optional for Beta)
- [ ] Card upgrades (post-Beta unless one upgrade proves the loop)

### Reward loop (explicit system)

Fragmented today across battle XP, character UI, and future loot. Make it one loop:

```text
ACTION → REWARD → PROGRESSION → NEW OPTIONS
```

Example:

```text
Win battle
  → + Fighter XP (+ optional card opportunity / story flag)
  → Unlock Heavy Strike
  → Modify deck
  → Next battle feels different
```

- [ ] Define reward grant API on the Run (XP, unlocks, flags, optional card offers)
- [ ] Battle end applies rewards into the Run (not only UI counters)
- [ ] At least one non-XP reward path for the prison slice (card offer or story unlock)
- [ ] Reward reveal UX (can be simple for Beta)

### Deliverable

Players specialise or hybridise through cards — and each fight changes what they can do next.

---

## Milestone 7 — Hollowfort Vertical Slice (Story + Places)

**Horizon:** Red · **Priority:** #7

**Goal:** One complete adventure (~60–90 minutes) on the shared Run.

### Story flow

- [ ] Wake in prison cell
- [ ] Escape first cell
- [ ] Explore prison
- [ ] Discover monster invasion
- [ ] Rescue survivor (optional)
- [ ] Find equipment **or** card reward (prefer cards over full inventory)
- [ ] Reach courtyard
- [ ] Defeat prison boss
- [ ] Escape Hollowfort
- [ ] Reach world map

### Locations (handcrafted, ~10–12)

- [ ] Prison Cell
- [ ] Main Corridor
- [ ] Storage
- [ ] Kitchen
- [ ] Armory
- [ ] Chapel
- [ ] Courtyard
- [ ] Guard Tower
- [ ] Warden Office
- [ ] Secret Tunnel
- [ ] Main Gate

### Per-location (as needed for the slice)

- [ ] Artwork
- [ ] Description
- [ ] Enemies / encounters
- [ ] Loot or card opportunities
- [ ] Interactions
- [ ] Story events

Public Regions / Lore site pages may mirror this via SSG without embedding engine code.

### Deliverable

A finished narrative vertical slice of Hollowfort Prison.

---

## Milestone 8 — Card Content for Beta

**Horizon:** Red · **Priority:** #8

**Goal:** Prove class identity with a **tight** set of excellent cards — not a large mediocre pile.

### Target for Beta

| Class | Cards |
|-------|------:|
| Fighter | ~8 |
| Rogue | ~8 |
| Wizard | ~8 |
| Survivor | ~8 |
| **Total** | **~24–32** |

Then expand: 32 → 50 → 80 → 120 after the system feels right.

### Tasks

- [x] Fighter, Rogue, Wizard, Survivor as class ids + XP paths
- [x] Attack / defence effects + combos
- [ ] Balance ~24–32 cards so classes feel distinct
- [ ] Utility / event / equipment categories only if the slice needs them
- [ ] Synergies / rarity / upgrades — lean for Beta; expand post-Beta

### Deliverable

Four readable class identities players can feel within one prison run.

---

## Milestone 9 — Analytics Foundation

**Horizon:** Red/Yellow · **Priority:** #9 (instrument earlier when events stabilize)

**Goal:** Tiny, useful telemetry — not a data platform.

### Beta shape

```text
game client → NestJS (minimal) → Postgres analytics.events
```

No ClickHouse, Kafka, or heavy pipeline for Beta.

### Events (start here)

- [ ] `game_started`
- [ ] `battle_started`
- [ ] `battle_finished`
- [ ] `card_played` — `{ cardId, classId, locationId, battleId }`
- [ ] `card_unlocked`
- [ ] `location_entered`
- [ ] `player_died`
- [ ] `boss_defeated`
- [ ] `game_completed`

### Why

Learn whether Survivor is ignored, whether everyone stacks Fighter, whether the boss is a wall — then tune XP and content.

### Tasks

- [ ] Event type union + emit helper (client-safe; no gameplay rules)
- [ ] Minimal API + `analytics.events` table (or deferred queue to local log until API exists)
- [ ] Instrument as corresponding mechanics stabilize
- [ ] Simple query / export for design decisions

### Deliverable

Enough signal to balance the slice without building a warehouse.

---

## Milestone 10 — Polish & QA

**Horizon:** Red · **Priority:** #10

### Audio / UX

- [x] Ambient beds, screen music, combat/UI SFX (see [AUDIO.md](./AUDIO.md))
- [x] Settings (audio)
- [x] Basic card play animation cues
- [ ] Reward reveal / exploration transitions
- [ ] Full mix pass
- [ ] Light VFX only where they sell the slice
- [ ] Basic accessibility

### Tests

- [x] XP / progression unit tests
- [x] E2E smoke: `/play` entry + marketing home
- [ ] Unit: damage, card effects, deck ops, status, RNG
- [ ] Integration: exploration ↔ battle, rewards, save/load
- [ ] E2E: new run → fight → XP → unlock → save/load → boss → escape (seeded)

### Deliverable

Stable Beta build on Vercel.

---

## Milestone 11 — Beta Release

**Horizon:** Red gate

### Required

- [ ] Hollowfort Prison vertical slice playable end-to-end
- [x] Public site + `/play` (repo ready)
- [ ] Deployed on Vercel
- [ ] Save / load working locally
- [ ] Seeded RNG in production builds
- [ ] ~24–32 player cards · ~10–12 locations · 1 memorable boss
- [ ] Reward loop + class progression readable without a tutorial wall

### Explicitly out of Beta scope (Green)

- [ ] Full inventory system (weapons / armour / potions / trinkets)
- [ ] Auth, cloud saves, profiles, leaderboards, achievements
- [ ] 40–60+ card library as a Beta gate
- [ ] Advanced backend / warehouse analytics

---

## Post-Beta — Inventory & backend (Green)

Inventory is cool but **not** required to prove “cards define the character.” Prefer card progression + story + rewards first.

### Inventory (when needed)

- [ ] Weapons / armour / trinkets
- [ ] Consumables (potions, scrolls, food)
- [ ] Relics (permanent passives)

### Backend platform

- [ ] NestJS modular monolith
- [ ] Postgres schemas for identity / saves / analytics
- [ ] Cloud saves replacing or syncing local saves
- [ ] Auth + profiles
- [ ] Leaderboards / achievements / admin as product demands

---

## Documentation (continuous)

- [ ] Game Vision
- [x] [Game Mechanics](./MECHANICS.md)
- [ ] Story
- [x] [Architecture](./ARCHITECTURE.md)
- [ ] Platform / Website notes
- [ ] Card Design Guide
- [ ] Content Pipeline
- [ ] Prompt Library
- [x] [Audio](./AUDIO.md)
- [ ] Testing Guide
- [x] **This roadmap**

---

## Success criteria

### Game vertical slice

1. Start a new game from `/play` without guidance.
2. Understand core mechanics within **10–15 minutes**.
3. Escape Hollowfort in about **60–90 minutes**.
4. Experiment with class combinations and feel progression.
5. Defeat the prison boss and return to the world map.
6. Finish without major bugs or disconnected systems.
7. Leave curious about the next region.

### Platform

1. Website and game coexist in one project.
2. Public pages are discoverable and SEO-ready.
3. Engine / machines / content packs remain usable without Next.js.
4. Marketing content can grow without gameplay changes.
5. Backend stays optional until the slice is fun.

---

## Anti-goals (Beta)

- Building full NestJS + auth + cloud saves before the prison loop is fun
- Expanding inventory before card progression and rewards feel good
- Inflating to 40–60 cards before ~24–32 feel distinct
- Treating Exploration and Battle as separate demos
- Shipping without seeded RNG or versioned saves
