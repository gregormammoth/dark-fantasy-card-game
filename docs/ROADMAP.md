# Game Development Roadmap (Beta → Vertical Slice)

## Vision

The Beta is **not** the entire game.

It delivers **one complete, polished adventure** that demonstrates every core mechanic:

- Exploration
- Card-based interactions
- Deckbuilding
- Combat
- Character progression
- Rewards
- Story progression

The product is a **web platform**: a public marketing/content site plus the game at `/play`. The game engine, XState machines, and gameplay logic stay **framework-independent**; Next.js is the application shell (pages, SEO, auth, future online services).

After Hollowfort Prison ships, remaining work should be **mostly new content**, not system redesign.

---

## Target architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full target (DDD modular monolith, NestJS, Postgres schemas, engine vs backend domain).

```text
Presentation Layer (React + Next.js App Router)
        ↓
Application Layer (XState)
        ↓
Game Engine (Pure TypeScript)
        ↓
Content Layer (JSON / Markdown)
        ↓
Persistence Layer (local → NestJS API + PostgreSQL)
```

| Layer | Owns | Must not own |
|-------|------|----------------|
| Presentation | Website pages, `/play` client UI, SEO, animations | Combat / deck / progression math |
| Application (XState) | Screen & turn flow, exploration/battle orchestration | Damage formulas, loot rolls |
| Game Engine | Battle, exploration, deck, effects, RNG, progression | React, Next.js, NestJS, JSX |
| Content | Cards, regions, lore, blog, patch notes (SSG) | Runtime game rules |
| Persistence | Save/load, settings, future cloud profiles | Gameplay calculations |

---

## Architecture Principles

1. The game engine is framework-independent.
2. React renders the game but never implements game rules.
3. XState orchestrates gameplay but does not calculate mechanics.
4. All gameplay rules live in the Game Engine.
5. Content is data-driven and stored outside engine logic.
6. Every system should be independently testable.
7. Every feature should be deterministic when provided with the same RNG seed.
8. Save files must be versioned to support future content updates.
9. New regions should require minimal engine changes and primarily consist of new content.
10. Prefer incremental, testable refactoring over large architectural rewrites.

---

## Current status (snapshot)

Rough progress against this roadmap as of the current codebase:

| Area | Status |
|------|--------|
| pnpm + Turborepo monorepo | In place (`apps/web`, `packages/*`, `tests/e2e`) |
| Vite + React game client | In place under `apps/web` (pre–Next.js migration) |
| `packages/game-engine` + `shared` + `content` | Extracted from web app |
| World → Exploration → Battle navigation | In place (UI + XState machines) |
| Battle engine (turns, combo, shields, poison, intent) | Partial — playable core |
| Exploration map + actions | Partial — prison map, hand actions, encounters |
| JSON-driven content | Started (`prisonMap`, cards, encounters, world) |
| Public website / SEO / `/play` route | Not started |
| Save / load | Not started |
| Full status set, relics, inventory, class XP | Not started |
| Audio / polish | Started (SFX + screen music beds) |
| Automated tests | E2E smoke started (Playwright); unit tests not started |

Update this table as milestones land.

---

## Milestone 1 — Platform Architecture

**Goal:** Transform the standalone React game into a Next.js App Router web platform while preserving the existing game architecture.

Next.js becomes the application shell for website pages, SEO, authentication, and future online services. The game engine, XState machines, and gameplay logic remain framework-independent and reusable outside React.

### Adopt Next.js 15

- [ ] Create Next.js app with App Router
- [ ] Configure TypeScript
- [ ] Configure ESLint
- [ ] Configure Prettier
- [ ] Configure absolute imports
- [ ] Configure environment variables
- [ ] Configure production build

### Separate website and game

Public website pages:

- [ ] Home
- [ ] Play (entry to the client game)
- [ ] About
- [ ] Blog
- [ ] Roadmap
- [ ] Lore
- [ ] Regions
- [ ] Cards
- [ ] Classes
- [ ] Enemies
- [ ] Patch Notes
- [ ] Privacy Policy
- [ ] Terms of Service

Game client:

- [ ] Mount the existing game under **`/play`** as a client-side application
- [ ] Keep World → Exploration → Battle flows working inside `/play`

### Preserve existing game (framework-independent)

These modules must not depend on Next.js APIs:

- [ ] Game Engine
- [ ] Battle Engine
- [ ] Exploration Engine
- [ ] Deck Engine
- [ ] XState Machines
- [ ] Content (game JSON packs)
- [ ] Save System (when added)

### SEO

- [ ] Metadata API
- [ ] Sitemap
- [ ] `robots.txt`
- [ ] OpenGraph
- [ ] Twitter Cards
- [ ] Canonical URLs
- [ ] Structured Data (JSON-LD)
- [ ] Optimize every public page for search engines

### Content platform (SSG)

Scalable content for marketing/docs pages (Markdown / MDX / CMS-friendly):

- [ ] Lore
- [ ] Regions
- [ ] Cards
- [ ] Enemies
- [ ] Classes
- [ ] Items
- [ ] Relics
- [ ] Blog
- [ ] Patch Notes
- [ ] Roadmap

New content pages must be addable **without** changing gameplay code.

### Future services (architecture only)

Prepare seams that do **not** touch the core engine:

- [ ] Authentication
- [ ] Player profiles
- [ ] Cloud saves
- [ ] Leaderboards
- [ ] Achievements
- [ ] Analytics
- [ ] Admin panel

### Deployment

- [ ] Vercel-ready production deploy
- [ ] Optimize static pages, images, fonts, metadata, code splitting

### Success criteria (platform)

- [ ] Website and game coexist in one project
- [ ] The game runs entirely inside `/play`
- [ ] Public pages are SEO optimized
- [ ] The game engine remains framework-independent
- [ ] New content pages can be added without modifying gameplay code
- [ ] Ready for future auth, cloud saves, and community features

### Deliverable

A Next.js shell with SEO public pages and the current game playable at `/play`, engine still pure TypeScript.

---

## Milestone 2 — Core Game Foundation

**Goal:** Stable game architecture that supports all future content.

### Tasks

- [ ] Finalize game package boundaries (engine / machines / content / persistence)
- [x] Game state machines (XState) — battle + exploration present
- [x] Connect World → Exploration → Battle flows
- [ ] Save / load system
- [x] Configuration-driven data (JSON) — expand as systems grow
- [x] Core game types and interfaces
- [ ] Deterministic RNG (optional, recommended)
- [ ] App-level orchestration machine (World ↔ Exploration ↔ Battle) outside `main` React state

### Deliverable

Engine that can load regions, battles, and player progression, independent of the Next.js shell.

---

## Milestone 3 — Battle System

**Goal:** Complete combat engine.

### Core combat

- [x] Turn system
- [x] Enemy intent / basic AI path
- [x] Card resolution
- [x] Combo resolution
- [x] Shields / barrier
- [x] Damage calculation (deck-as-health)
- [ ] Full status-effect suite

### Status effects

- [x] Poison
- [ ] Burn
- [ ] Bleeding
- [ ] Stun
- [ ] Weakness
- [ ] Protection

### Enemy system

- [ ] Enemy abilities (beyond current card deck)
- [x] Enemy intentions
- [ ] Multiple enemy types
- [ ] Elite enemies
- [ ] Boss behaviour

### Battle rewards

- [ ] Gold
- [ ] Cards
- [ ] Relics
- [ ] Experience
- [ ] Story rewards

### Deliverable

Fully playable tactical combat with rewards.

---

## Milestone 4 — Exploration System

**Goal:** Complete exploration experience.

### Region graph

- [x] Connected locations (Hollowfort graph)
- [x] Fog / distant locations
- [ ] Locked locations (keys / quests)
- [ ] Fast travel (future)

### Player actions

- [x] Move, search, open, talk, rest, loot, fight (action types present)
- [ ] Polish outcomes, locks, and once-flags per design

### World objects

- [ ] Chests, locked doors, keys, shrines, switches, hidden passages

### Encounter system

- [x] Encounter deck (basic)
- [ ] Environmental events, ambushes, richer NPC / story events
- [ ] Wire exploration fights into the battle machine when appropriate

### Deliverable

A fully interactive Hollowfort Prison.

---

## Milestone 5 — Card System

**Goal:** Complete card engine + content volume.

### Classes

- [x] Fighter, Rogue, Wizard (and related themes in data)
- [ ] Survivor as a first-class progression path

### Categories

- [x] Attack / defence effects
- [ ] Utility, event, equipment card categories

### Mechanics

- [x] Card effects + combos
- [ ] Synergies, upgrades, rarity, unlocks

### Deliverable

**40–60** balanced player cards.

---

## Milestone 6 — Progression

**Goal:** Long-term player progression.

### Class experience

Each played card grants XP to its class (Fighter / Rogue / Wizard / Survivor).

### Level system

Classes level independently and unlock:

- New cards
- Passive bonuses
- Advanced abilities

### Deck growth

- New cards
- Card removal
- Card upgrades

### Deliverable

Players specialise in one class or build hybrids.

---

## Milestone 7 — Items & Inventory

**Goal:** Meaningful rewards.

### Equipment

Weapons, armour, trinkets.

### Consumables

Potions, scrolls, food.

### Relics

Permanent passives (e.g. +1 shield, draw extra, heal after battle).

### Deliverable

A clear reward loop after exploration and combat.

---

## Milestone 8 — Story (Hollowfort Prison)

**Goal:** One complete adventure (~60–90 minutes).

### Story flow

1. Wake in prison cell  
2. Escape first cell  
3. Explore prison  
4. Discover monster invasion  
5. Rescue survivor (optional)  
6. Find equipment  
7. Reach courtyard  
8. Defeat prison boss  
9. Escape Hollowfort  
10. Reach world map  

### Deliverable

A finished narrative vertical slice of the prison.

---

## Milestone 9 — World Building

**Goal:** Believable, handcrafted locations.

### Hollowfort Prison rooms

Prison Cell · Main Corridor · Storage · Kitchen · Armory · Chapel · Courtyard · Guard Tower · Warden Office · Secret Tunnel · Main Gate

Each location should include:

- Artwork
- Description
- Enemies
- Loot
- Interactions
- Story events

Public **Regions / Lore** site pages may mirror this content via the SSG content platform (Milestone 1) without embedding engine code.

### Deliverable

One handcrafted region ready for Beta.

---

## Milestone 10 — User Experience

**Goal:** Immersion and premium presentation (inside `/play` and site chrome).

### Animations

Card play, movement, combat, damage, rewards.

### Visual effects

Fog, smoke, sparks, torchlight, dust.

### Audio

Ambient beds, screen music, card / combat SFX (see [AUDIO.md](./AUDIO.md)).

### Deliverable

Polished feel for the prison vertical slice.

---

## Milestone 11 — Quality Assurance

**Goal:** Ensure stability.

### Unit tests

Damage, card effects, XP, deck ops, status effects.

### Integration tests

Exploration flow, battle flow, rewards, progression.

### End-to-end (Playwright)

- New game (from `/play`)
- Complete prison
- Win battle
- Save / load
- Level up
- Receive reward
- Defeat boss
- Public pages render (smoke + key SEO meta)

### Deliverable

Stable Beta build on Vercel.

---

## Milestone 12 — Documentation

Keep docs lightweight and current.

| Document | Purpose |
|----------|---------|
| Game Vision | Audience, philosophy, Beta scope |
| [Game Mechanics](./MECHANICS.md) | Combat, exploration, progression rules |
| Story | Narrative, regions, quests |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) — DDD modular monolith, engine vs API, NestJS/Postgres |
| Platform / Website | App Router structure, `/play`, SEO, content SSG |
| Card Design Guide | Classes, effects, balance, naming |
| Content Pipeline | Adding locations, enemies, cards, events, site MDX |
| Prompt Library | Cursor / design / asset prompts |
| [Audio](./AUDIO.md) | Sound ids, beds, unlock |
| Testing Guide | How to run and validate tests |
| **This roadmap** | Milestones and Beta definition |

---

## Milestone 13 — Beta Release

### Region

Hollowfort Prison only (world map as hub exit).

### Platform

- Public site live (core pages + SEO)
- Game playable at `/play`
- Deployed on Vercel

### Content targets

| Content | Target |
|---------|--------|
| Locations | 10–12 |
| Player cards | 40–60 |
| Enemy types | 15–20 |
| Bosses | 1 memorable |
| Encounter cards | 20–30 |
| Relics / equipment | Several |

### Systems required

Exploration · Combat · Deckbuilding · Class XP · Inventory · Rewards · Save/Load · Story progression

### Polish required

Sound · Music · Animations · VFX · Settings · Basic accessibility

---

## Success criteria

### Game vertical slice

The Beta game succeeds when a new player can:

1. Start a new game from `/play` without guidance.  
2. Understand core mechanics within **10–15 minutes**.  
3. Escape Hollowfort in about **60–90 minutes**.  
4. Experiment with class combinations and feel progression.  
5. Defeat the prison boss and return to the world map.  
6. Finish without major bugs or confusing systems.  
7. Leave curious about the next region.

### Platform

1. Website and game coexist in one project.  
2. Public pages are discoverable and SEO-ready.  
3. Engine / machines / content packs remain usable without Next.js.  
4. Marketing content can grow without gameplay changes.

---

## Suggested build order

Work roughly in this dependency order (parallel where noted):

```text
M1 Platform Architecture (Next.js shell + /play + SEO + SSG content)
    ↓
M2 Foundation (save/load + RNG + app orchestration)
    ↓
M3 Battle completion  ↔  M4 Exploration depth
    ↓
M5 Card volume + M6 Progression + M7 Inventory
    ↓
M8 Story beats wired into prison content (M9)
    ↓
M10 Polish  →  M11 QA  →  M13 Beta
```

Documentation (M12) stays continuous, not a final gate.

**Note:** Platform (M1) can start in parallel with late M2 hygiene (RNG, guards) if the Vite game keeps running until `/play` cutover. Prefer extracting a framework-free `game/` package **before** or **during** the Next.js migration so the engine never imports `next/*`.
