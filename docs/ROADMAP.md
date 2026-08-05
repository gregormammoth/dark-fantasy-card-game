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

After Hollowfort Prison ships, remaining work should be **mostly new content**, not system redesign. Beta still needs a **minimal backend** (analytics, feedback, cloud saves) — not the full platform (auth profiles, leaderboards, admin suite).

---

## Development horizons

Use this as the primary compass. Systems work still matters; horizons decide *when*.

### Now — Beta-critical

- Shared **Run** state (one continuous playthrough)
- Exploration ↔ Battle with the same run
- Class XP → levels → unlocks → deck changes
- **Reward loop** (action → reward → progression → new options)
- **Quests** (engine logic + player-facing quest log / UI)
- **Money** in a light inventory (earn / spend; not full item loadout)
- Versioned **save / load** (schema in engine; **persist via NestJS + Postgres**)
- **Seeded RNG** (required before Beta)
- Hollowfort Prison story vertical slice
- ~24–32 excellent player cards + 10–12 locations
- **Enemy pacing** — early fights teach; later fights (elites / bosses) punish
- **Enemy diversity** — distinct card groups / archetypes (warrior, rogue, wizard, monster, undead, …)
- **Minimal NestJS API + Postgres** (saves, analytics events, feedback)
- **Product analytics** (players, sessions, play time, funnel)
- **Feedback form** (in-game / site → stored + reviewable)
- E2E + polish enough to ship the slice

### Yellow — Beta-supporting (already largely done or light)

- Next.js shell + `/play`
- SEO + public content SSG
- Documentation
- Vercel deploy (web + API)
- Audio / settings basics
- Optional `localStorage` cache / offline resume beside cloud save

### Green — Post-Beta (architecture seams only until then)

- Full authentication / player profiles (email, accounts)
- Leaderboards / achievements / rich admin UI
- Full inventory expansion (weapons, armour, potions, trinkets) — beyond Beta money + quest keys/flags
- Advanced analytics store (ClickHouse etc.)
- Large card / enemy content expansion

**Do** ship a thin NestJS service for Beta. **Do not** build the full modular platform yet.

```text
Next.js (/play + marketing)
  └── game client
        ├── engine (local rules)
        └── api client → NestJS
              ├── saves (versioned GameState)
              ├── analytics.events (+ simple rollups)
              └── feedback
              └── PostgreSQL
```

Anonymous / guest identity is enough for Beta (stable `playerId` + optional contact on feedback). Full auth comes later:

```text
Next.js → NestJS → Auth / Profiles / Leaderboards → PostgreSQL
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
Persistence Layer (NestJS + PostgreSQL; optional local cache)
```

| Layer | Owns | Must not own |
|-------|------|----------------|
| Presentation | Website pages, `/play` client UI, SEO, animations, feedback UI | Combat / deck / progression math |
| Application (XState) | Screen & turn flow, run orchestration | Damage formulas, loot rolls |
| Game Engine | Battle, exploration, deck, effects, RNG, progression | React, Next.js, NestJS, JSX |
| Content | Cards, regions, lore, blog, patch notes (SSG) | Runtime game rules |
| Persistence (API) | Versioned saves, analytics ingest, feedback, settings | Gameplay calculations |

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
11. Prefer proving the **vertical slice**; ship only the **thin** backend Beta needs (saves, analytics, feedback).
12. Cards, classes, XP, and deckbuilding stay primary; Beta inventory is **money + quest state**, not a full item RPG.
13. Analytics answers product questions (who played, how long, where they drop) — not vanity dashboards.

---

## Current status (snapshot)

| Area | Status |
|------|--------|
| pnpm + Turborepo monorepo | In place |
| Next.js 15 + `/play` + SEO/SSG | In place (M1 done) |
| `game-engine` / `shared` / `content` | Extracted; framework-independent |
| World / Exploration / Battle screens | Connected via `GameApp` + shared `RunState` |
| Shared **Run** state | Done — `RunState` owns progression/loadout/exploration/navigation; app XState machine deferred |
| Character creation | Done — name + gender → `POST /players` → guest `playerId` |
| Exploration ↔ Battle continuity | In place — location FIGHT → battle → `TO PRISON` |
| Battle core | Partial — playable |
| Class XP award + UI | In place |
| Class levels / unlock curve | In place (10 XP = 1 level; 12 improved cards; mid-run unlock → deck) |
| Reward loop | Fragmented — XP + level unlocks so far (no formal grant API yet) |
| Quests (logic + UI) | Run quests + Player quest log + map toasts; faction kill-quests + Escape → world |
| Money / light inventory | Not started |
| Save / load + save schema | Cloud save/load wired (`GET|PUT /saves/:playerId`); mid-battle snapshot still open |
| Seeded RNG | Engine seed+cursor; debug seed in Settings / `?seed=` |
| Guided tour (map + battle) | Not started |
| NestJS API + Postgres | Live locally (`apps/api` + Docker Compose); players / saves / analytics / feedback |
| Analytics + feedback | Core client events instrumented; feedback form UI still open; no rollup queries yet |
| Hollowfort map content | 13 locations + branch bosses + Exit Gate escape wired to world |
| Enemy balance / diversity | Not started — shared enemy card pool; no early→late curve or archetypes yet |
| Portraits / card art | Class+gender player portraits; 24 player card covers |
| Inventory | Money for Beta; full items post-Beta |
| Automated tests | E2E smoke + world→battle; XP / loadout unit tests (E2E needs guest+API bootstrap) |

Update this table as milestones land.

---

## Primary target — Playable Vertical Slice

**This is the primary development target.** System milestones below serve this journey.

### Player journey checklist

- [x] Start a new run from `/play` (character creation → cloud autosave resume)
- [x] Wake / begin in Prison Cell
- [x] Enter prison exploration from the world map
- [x] Trigger battle from exploration (location FIGHT / on-enter encounter)
- [x] Enter battle carrying app-level progression
- [x] Earn class XP from successful card plays
- [x] Improve deck (unlock / rebuild) mid-run
- [x] Return to exploration after battle (`TO PRISON`) with XP intact
- [x] Open Player and see updated class XP
- [x] Fight again with a meaningfully different deck
- [x] Track and complete at least one quest from the quest log
- [ ] Earn and spend money (light inventory)
- [x] Defeat a prison branch boss (Chapel / Warden’s Tower / Political Wing)
- [x] Escape Hollowfort (Exit Gate → world)
- [x] Reach the world map via escape

### Slice success

A new player can finish the prison in ~60–90 minutes, understand cards-as-identity within ~15 minutes, and leave wanting the next region — without major bugs or disconnected “demo screens.”

---

## Near-term build order (Now)

Work in this order unless a dependency forces otherwise. Analytics may be instrumented earlier as each mechanic stabilizes.

```text
CURRENT
  │
  ▼
1. XP + progression (levels / unlocks)     ← done (levels + 12 improved cards)
  │
  ▼
2. Shared Run State                        ← RunState done; app XState machine deferred
  │
  ▼
3. Exploration ↔ Battle (same run)         ← done for session
  │
  ▼
4. Minimal NestJS + Postgres scaffold      ← done (`apps/api` + Docker Postgres)
  │
  ▼
5. Save schema + cloud save / load (API)   ← done (guest player + client sync)
  │
  ▼
6. Seeded RNG (required)                   ← done
  │
  ▼
7. Reward loop                             ← XP/unlocks exist; formal grant API open
  │
  ▼
8. Quests (logic + UI) + money             ← quests done; money open
  │
  ▼
9. Prison story vertical slice             ← playable escape path done; polish open
  │
  ▼
10. Content: cards · locations · enemy pacing ← locations/cards present; enemy curve + archetypes open
  │
  ▼
11. Analytics events + product stats + feedback form ← core events live; feedback UI / queries open
  │
  ▼
12. Polish + guided tour (map / battle) + E2E
  │
  ▼
BETA
```

Full auth, profiles, leaderboards, and **full item inventory** stay **after** this path. Beta money + quests are in scope. The Beta API is intentionally thin.

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
- [x] Save System (cloud save / load via NestJS; see M4)

### SEO & content SSG

- [x] Metadata, sitemap, robots, OpenGraph, Twitter, canonical, JSON-LD
- [x] Lore, Regions, Cards, Classes, Enemies, Blog, Patch Notes, Roadmap
- [ ] Items / Relics marketing pages (post-inventory)

### Deployment

- [x] Vercel-ready production build
- [ ] Production deploy live

### Future services (Green — after thin Beta API)

- [ ] Authentication / email accounts
- [ ] Player profiles
- [ ] Leaderboards
- [ ] Achievements
- [ ] Rich admin panel

Beta API (saves / analytics / feedback) is Milestone 4 + 9 — not deferred to Green.

---

## Milestone 2 — Shared Run State

**Horizon:** Red (Beta-critical) · **Priority:** #2 after progression levels

**Goal:** One continuous **Run** that World, Exploration, and Battle all operate on — not separate demos glued by React screen state.

### Run model

```text
Game
 └── Run
      ├── player (progression, deck, unlocks, money, …)
      ├── world (location, discovered, flags)
      ├── exploration
      ├── quests (active / completed / failed)
      ├── battle (when active)
      └── meta (seed, rng cursor, …)
```

### Tasks

- [x] Define `Run` / `GameState` types in shared or engine packages
- [ ] App-level orchestration machine (World ↔ Exploration ↔ Battle) owning the Run — deferred; React `RunState` + child actors are enough for Beta
- [x] Carry progression, deck, and flags across screen transitions
- [x] End battle → return to exploration with the same Run
- [x] New game creates a fresh Run; continue restores one

### Deliverable

Exploration and battle are no longer separate runtimes.

---

## Milestone 3 — Exploration ↔ Battle Loop

**Horizon:** Red · **Priority:** #3

**Goal:** Wire the real game loop on top of the shared Run.

### Tasks

- [x] Exploration map + action types present
- [x] Encounter deck (basic)
- [x] Wire exploration fights into the battle machine (session progression; formal Run still M2)
- [x] Battle result returns to exploration (`TO PRISON`, not a dead-end modal island)
- [x] Polish outcomes, locks, and once-flags for the prison slice (`finalBranchId`, talked NPCs, remove defeated enemies)
- [x] Locked locations (sealed final branches + Exit Gate until chosen boss cleared)

### Deliverable

```text
Exploration → Fight → Battle → Result → Exploration
```

Session loop works. Formal shared **Run** ownership remains Milestone 2.

---

## Milestone 4 — Save Schema & Cloud Save / Load

**Horizon:** Red · **Priority:** #4–5 (with API scaffold)

**Goal:** Versioned saves persisted on the Beta backend so players can continue across devices/browsers and you can inspect stuck runs.

### Game state / save schema (define before implementing I/O)

```text
GameState
├── player
│   ├── progression
│   ├── deck
│   ├── unlocks
│   └── inventory
│       ├── money          # Beta currency (coins / crowns)
│       └── items?         # empty or quest keys only for Beta
├── world
│   ├── location
│   ├── discovered
│   └── flags
├── exploration
├── quests                 # active / completed journal
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
├── playerId         # anonymous guest id for Beta
└── state: GameState
```

### Tasks

- [x] Spec `GameState` + `SaveFile` types (version fields mandatory)
- [x] Serialize / deserialize in the engine or a thin persistence helper
- [x] Scaffold `apps/api` (NestJS) + Postgres + deploy target (Docker Compose local)
- [x] Guest `playerId` (character creation → `POST /players` with name/gender; store client-side; send on API calls)
- [x] API: create / update / get saves for a player (`POST /players`, `GET|PUT /saves/:playerId`)
- [x] Client continue flow against cloud save (`loadCloudRun` / `saveCloudRun`)
- [ ] Optional `localStorage` cache for faster resume / offline draft (deferred; cloud is primary)
- [x] Migration stub or reject incompatible `schemaVersion`
- [x] Autosave at safe checkpoints (debounced run changes + pre-battle flush)

### Resume / abandon

- [x] Persist exploration + progression + seed/cursor via cloud save
- [x] Resume mid-prison run on refresh (same browser / same `playerId`)
- [x] Settings → Abandon run clears cloud save (writes empty run)
- [ ] Mid-battle snapshot (refresh returns to fight prompt / exploration)
- [ ] Cross-device continue without copying guest `playerId` (post-auth)

### Deliverable

A player can close the tab (or switch browser) and continue the same Hollowfort run from the server.

---

## Milestone 5 — Seeded RNG

**Horizon:** Red · **Priority:** #5 · **Required before Beta** (not optional)

**Goal:** Deterministic randomness for draws, encounters, enemies, loot, and tests.

### Tasks

- [x] Engine RNG module with explicit seed
- [x] Store seed + cursor on the Run / save
- [x] Route card draws, encounters, enemy picks, loot through seeded RNG
- [x] Debug / QA: enter seed → reproduce exact run sequence
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
- [x] Persist via cloud save / load (M4)

### Level system (next progression step)

```text
XP → Class Level → Unlockable cards → Spend XP → Deck changes
```

- [x] Independent class levels from XP thresholds (10 XP = 1 level per class)
- [x] Unlock new cards by spending free class levels (1 level per improved card)
- [ ] Passive bonuses (only if they serve the slice — keep lean)
- [ ] Avoid heavy level-curve tuning until analytics / playtests inform pace

### Deck growth

- [x] Character screen deck composition (add / remove, deck cap)
- [x] Unlock cards by spending free class levels (bound to loadout + battles)
- [x] Twelve improved cards available on Character screen (1 level each)
- [x] Mid-run unlock rebuilds exploration/battle deck for the next fight
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

- [ ] Define reward grant API on the Run (XP, unlocks, flags, money, optional card offers)
- [ ] Battle end applies rewards into the Run (not only UI counters)
- [ ] At least one non-XP reward path for the prison slice (card offer, money, or story unlock)
- [ ] Reward reveal UX (can be simple for Beta)

### Deliverable

Players specialise or hybridise through cards — and each fight changes what they can do next.

---

## Milestone 6b — Quests & Money (Light Inventory)

**Horizon:** Red · **Priority:** with reward loop / prison slice

**Goal:** Players can accept, track, and complete quests, and earn/spend money — without building a full item RPG.

### Quests (engine + UI)

```text
Accept / discover → Active → Objectives progress → Complete / Fail
```

- [x] Quest definition content (id, title, description, objectives, rewards, prerequisites)
- [x] Run quest state: active / completed (failed still optional)
- [x] Engine: grant, progress (flags, talk, kill, reach location), complete
- [x] Wire NPC dialog / location interactions / battle results into quest progress
- [x] Player-facing **quest log UI** (Player screen list + detail + objectives; map toasts)
- [x] At least 3 Hollowfort faction quests (kill Warden / Inquisitor / Resurrected Anarchist)
- [x] Quests granted only after dialog with Dead Anarchist, Sorcerer (post-Demon), Guard Captain
- [x] Exit Gate shows the matching faction NPC when that quest’s boss is dead
- [ ] Fail states / pay-money quest progress (when money exists)
- [ ] Quest reward XP / money grants unified through Run reward API

### Money (light inventory)

- [ ] Currency field on player inventory (`money` / crowns)
- [ ] Earn from battles, loot, quests, NPC outcomes
- [ ] Spend on story choices, bribes, shops, or quest payments (as content needs)
- [ ] Show balance in Player / exploration HUD
- [ ] Persist with cloud save (M4)

Out of Beta scope for inventory: weapons, armour, potions, trinkets as a full equipment system (post-Beta). Quest keys/flags may live as flags or minimal item ids if a single key is needed.

### Deliverable

Quest log is usable mid-run (**done**). Money appears in inventory and matters for at least one prison choice or reward (**open**).

---

## Milestone 7 — Hollowfort Vertical Slice (Story + Places)

**Horizon:** Red · **Priority:** #7

**Goal:** One complete adventure (~60–90 minutes) on the shared Run.

### Story flow

- [x] Wake in prison cell
- [x] Escape first cell (travel to Cell Block)
- [x] Explore prison (12-location graph + encounter queue)
- [ ] Discover monster invasion (story beat polish)
- [ ] Rescue survivor (optional quest)
- [ ] Find money / card reward (full equipment inventory still post-Beta)
- [x] Reach courtyard
- [x] Defeat prison boss (one of three sealed branches)
- [x] Escape Hollowfort (Exit Gate OPEN → `escaped_hollowfort` → world)
- [x] Reach world map via escape

### Quests & economy in the slice

- [x] Quest log surfaces the three faction kill-quests ([HOLLOWFORT.md](./HOLLOWFORT.md))
- [x] Quests appear only after dialog (Dead Anarchist / Sorcerer / Guard Captain)
- [x] Exit Gate conditional NPCs after matching boss kills
- [ ] At least one paid / bribe / buy choice using money
- [ ] Quest completion grants XP, money, and/or unlocks (completion works; reward grant polish open)

### Locations (handcrafted, ~10–12)

Current roster in `prisonMap.json` (see also [HOLLOWFORT.md](./HOLLOWFORT.md) — may lag map):

- [x] Prison Cell
- [x] Cell Block
- [x] Ritual Room
- [x] Central Corridor
- [x] Kitchen
- [x] Infirmary
- [x] Torture Chamber
- [x] Guard Barracks
- [x] Central Courtyard
- [x] Chapel (final branch)
- [x] Warden’s Tower (final branch)
- [x] Political Wing (final branch)
- [x] Exit Gate

### Per-location (as needed for the slice)

- [x] Artwork (some rooms still reuse aliased art)
- [x] Description
- [x] Enemies / encounters
- [ ] Loot or card / money opportunities
- [x] Interactions
- [ ] Story events (dialog present; deeper beats pending)
- [ ] Quest hooks where the location owns an objective

### Enemy pacing & diversity (Hollowfort)

**Goal:** Early rooms teach the combat loop; later rooms and bosses feel like different threats, not the same deck with more HP.

#### Difficulty curve

- [ ] Tag enemies by power band (`intro` / `common` / `elite` / `boss`) mapped to prison depth
- [ ] Early fights (Prison Cell → Cell Block / early corridors): smaller decks, telegraphed attacks, low shield/barrier
- [ ] Mid prison: mixed threats, status effects, light defence
- [ ] Late / branch bosses: larger decks, stronger defence, signature tools
- [ ] Tune `deckSize`, starting shield/barrier, and card pools per band (not one global enemy deck for all)

#### Enemy card groups / archetypes

Ideally each enemy draws from a named group (or small mix), not one shared pool:

| Group | Feel | Examples in Hollowfort |
|-------|------|------------------------|
| Warrior / Guard | Shields, heavy strikes | Guard, Knight, Guard Captain |
| Rogue / Cutthroat | Poison, first-strike, evasion | Crazy Prisoner, Dead Anarchist |
| Wizard / Ritualist | Barrier, pierce, control | Sorcerer, Inquisitor |
| Monster / Beast | Raw damage, pack pressure | Giant Rat, Demon |
| Undead / Bound | Persist, drain, grim defence | Resurrected Anarchist |
| Brute / Survivor scrap | High HP trades, messy defence | Fat Prisoner, Butcher, Prison Warden |

- [ ] Content schema: `enemyGroup` / `cardPoolIds` on enemy definitions
- [ ] Split `enemyCards.json` into group pools (start lean: 4–6 cards per group)
- [ ] Assign each Hollowfort enemy a primary group (+ optional splash cards)
- [ ] Bosses get a unique signature card or two on top of their group
- [ ] Player-facing telegraph: intent / portrait / tier already hint the group

Public Regions / Lore site pages may mirror this via SSG without embedding engine code.

### Deliverable

A finished narrative vertical slice of Hollowfort Prison — with fights that ramp in power and feel distinct by enemy type.

---

## Milestone 8 — Card Content for Beta

**Horizon:** Red · **Priority:** #8

**Goal:** Prove class identity with a **tight** set of excellent player cards — and give enemies their own readable card identities (see M7 pacing).

### Target for Beta (player)

| Class | Cards |
|-------|------:|
| Fighter | ~8 |
| Rogue | ~8 |
| Wizard | ~8 |
| Survivor | ~8 |
| **Total** | **~24–32** |

Then expand: 32 → 50 → 80 → 120 after the system feels right.

### Tasks (player)

- [x] Fighter, Rogue, Wizard, Survivor as class ids + XP paths
- [x] Attack / defence effects + combos
- [ ] Balance ~24–32 cards so classes feel distinct
- [ ] Utility / event / equipment categories only if the slice needs them
- [ ] Synergies / rarity / upgrades — lean for Beta; expand post-Beta

### Tasks (enemy cards — pairs with M7)

- [ ] Replace the single shared enemy deck with group pools (warrior, rogue, wizard, monster, undead, brute, …)
- [ ] Early-pool cards are weaker / simpler than late-pool cards
- [ ] Bosses mix group identity + 1–2 exclusive cards
- [ ] Keep total enemy card count lean for Beta (~20–30 across groups, not a second player library)

### Deliverable

Four readable player class identities **and** enemies that play differently across the prison run.

---

## Milestone 9 — Analytics, Product Stats & Feedback

**Horizon:** Red · **Priority:** #10 (instrument earlier when events stabilize; API scaffold shares M4)

**Goal:** Know who played, how far they got, and what they think — without a data warehouse.

### Beta shape

```text
game client → NestJS → Postgres
  ├── analytics.events
  ├── analytics rollups / queries
  └── feedback.messages
```

No ClickHouse, Kafka, or heavy pipeline for Beta.

### Product stats (must answer)

- [ ] How many unique players / guest ids
- [ ] How many sessions / runs started
- [ ] How long people play (session duration, total play time)
- [ ] Funnel: started → first battle → boss → escape / abandon
- [ ] Where players drop (last location / last event)
- [ ] Class XP / card play mix (balance signal)

### Events (start here)

- [x] API ingest: `POST /analytics/events` (Postgres `analytics_events`)
- [x] `player_created` (character registry)
- [x] `session_started`
- [ ] `session_heartbeat` or duration derived from events
- [x] `battle_started`
- [x] `battle_finished`
- [ ] `card_played` — `{ cardId, classId, locationId, battleId }`
- [x] `card_unlocked`
- [ ] `location_entered`
- [ ] `player_died`
- [ ] `boss_defeated`
- [x] `escape_to_world` / `run_abandoned` (completion / drop signals)
- [ ] `feedback_submitted`

### Feedback form

- [ ] In-game and/or site form (message + optional email/contact)
- [ ] Attach `playerId`, build version, optional last location / screen
- [x] API stores rows (`POST /feedback`); simple list/export for review still open
- [ ] Rate-limit + basic spam guard

### Tasks

- [x] Event type union + emit helper (`apps/web/src/lib/analytics.ts`)
- [x] `analytics.events` + `feedback` tables
- [x] Instrument core funnel events (create / session / battle / unlock / escape / abandon)
- [ ] Deeper instrumentation (`card_played`, locations, boss, duration)
- [ ] Simple query / export / dashboard notes for design decisions

### Deliverable

You can answer “how many played, how much, where they quit” and read player feedback from Beta.

---

## Milestone 10 — Polish & QA

**Horizon:** Red · **Priority:** #10

### Guided tour (first-run coaching)

**Goal:** Players learn exploration + battle in the first minutes **without** a long tutorial wall. Short, dismissible coach marks that fire once per run (or until “Don’t show again”).

Keep lean: spotlight + one sentence + optional “Next”. No separate tutorial mode, no forced practice fight.

#### Exploration map (Hollowfort)

- [ ] First-enter coach: select a room on the map
- [ ] Select a card in the hand, then Travel / act
- [ ] End turn → encounter deck reminder
- [ ] Talk / Fight prompts when an NPC or enemy is present
- [ ] Quest log / Character entry once a quest or level is available
- [ ] Persist tour progress with local save (`tour` flags on the run)

#### Battle

- [ ] First-battle coach: add cards to the combo
- [ ] End turn to resolve
- [ ] Intent / enemy turn one-liner
- [ ] HP = cards left (deck as health) callout
- [ ] Victory / defeat next-step tip (return to prison / load save)

#### Rules

- [ ] Skip / dismiss anytime; “Don’t show again” option
- [ ] Never block combat input for more than one beat
- [ ] Seeded / resume-safe (don’t re-show completed steps after load)
- [ ] No multi-screen tutorial campaign in Beta

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
- [ ] E2E: first-run tour appears once, dismissible, does not block travel/fight

### Deliverable

Stable Beta build on Vercel — including a short guided tour for map + battle first steps.

---

## Milestone 11 — Beta Release

**Horizon:** Red gate

### Required

- [ ] Hollowfort Prison vertical slice playable end-to-end
- [x] Public site + `/play` (repo ready)
- [ ] Deployed web + API (Vercel / Railway / similar)
- [x] Cloud save / load working (guest player id + name/gender)
- [ ] Analytics ingest + product stats queries (ingest live; queries / duration still open)
- [ ] Feedback form live and stored
- [ ] Seeded RNG in production builds
- [x] ~24 player cards · ~13 locations · branch bosses (polish / balance open)
- [ ] Enemy difficulty curve (weak early → strong late) + archetype card groups
- [ ] Reward loop + class progression readable without a tutorial wall
- [ ] Guided tour: exploration map + first battle first-steps (dismissible coach marks)
- [x] Quest log + at least 2–3 prison quests
- [ ] Money in inventory (earn / spend in the slice)

### Explicitly out of Beta scope (Green)

- [ ] Full inventory system (weapons / armour / potions / trinkets)
- [ ] Full auth / profiles / leaderboards / achievements
- [ ] 40–60+ card library as a Beta gate
- [ ] Advanced warehouse analytics (ClickHouse etc.)
- [ ] Rich admin product UI (SQL + thin routes are enough)

---

## Post-Beta — Full inventory & platform (Green)

Cards stay primary. Beta already includes **quests + money**; grow item loadouts after that loop feels good.

### Inventory (when needed)

- [ ] Weapons / armour / trinkets
- [ ] Consumables (potions, scrolls, food)
- [ ] Relics (permanent passives)
- [ ] Shops / crafting beyond simple money spends

### Platform growth (beyond thin Beta API)

- [ ] NestJS modular monolith matured (auth, identity schemas)
- [ ] Cloud saves bound to real accounts (migrate guest ids)
- [ ] Auth + profiles
- [ ] Leaderboards / achievements / admin as product demands
- [ ] Advanced analytics warehouse if volume requires it

---

## Documentation (continuous)

- [ ] Game Vision
- [x] [Game Mechanics](./MECHANICS.md)
- [x] [Story](./STORY.md) — Hollowfort prison plot & slice beats
- [x] [Hollowfort design](./HOLLOWFORT.md) — NPCs, locations, enemies, factions
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

1. Start a new game from `/play` (optional guided tour, never a forced wall).
2. Understand core mechanics within **10–15 minutes** (tour covers map travel + first fight).
3. Escape Hollowfort in about **60–90 minutes**.
4. Experiment with class combinations and feel progression.
5. Track quests and use money at least once in a meaningful choice.
6. Defeat the prison boss and return to the world map.
7. Feel the prison escalate: early fights are fair teachers; bosses feel like different threats.
8. Finish without major bugs or disconnected systems.
9. Leave curious about the next region.

### Platform

1. Website and game coexist in one project.
2. Public pages are discoverable and SEO-ready.
3. Engine / machines / content packs remain usable without Next.js.
4. Marketing content can grow without gameplay changes.
5. Backend stays thin for Beta (saves, analytics, feedback) until the slice is fun; then grow auth and platform features.

---

## Anti-goals (Beta)

- Building full auth + profiles + leaderboards before the prison loop is fun
- Expanding **full item inventory** before card progression, quests, and money feel good
- Inflating to 40–60 cards before ~24–32 feel distinct
- Shipping Hollowfort with one shared enemy deck and flat difficulty (no early→late curve, no archetypes)
- Treating Exploration and Battle as separate demos
- Shipping without seeded RNG or versioned cloud saves
- Building a warehouse / ClickHouse stack for a handful of Beta events
- Skipping product analytics and feedback because “content first”
- Shipping Hollowfort without money mattering at least once (quests/escape path already ship)
