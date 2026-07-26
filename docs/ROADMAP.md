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

After Hollowfort Prison ships, remaining work should be **mostly new content**, not system redesign.

---

## Current status (snapshot)

Rough progress against this roadmap as of the current codebase:

| Area | Status |
|------|--------|
| World → Exploration → Battle navigation | In place (UI + XState machines) |
| Battle engine (turns, combo, shields, poison, intent) | Partial — playable core |
| Exploration map + actions | Partial — prison map, hand actions, encounters |
| JSON-driven content | Started (`prisonMap`, cards, encounters, world) |
| Save / load | Not started |
| Full status set, relics, inventory, class XP | Not started |
| Audio / polish | Started (SFX + screen music beds) |
| Automated tests | Not started |

Update this table as milestones land.

---

## Milestone 1 — Core Game Foundation

**Goal:** Stable architecture that supports all future content.

### Tasks

- [ ] Finalize project architecture
- [x] Game state machines (XState) — battle + exploration present
- [x] Connect World → Exploration → Battle flows
- [ ] Save / load system
- [x] Configuration-driven data (JSON) — expand as systems grow
- [x] Core game types and interfaces
- [ ] Deterministic RNG (optional, recommended)

### Deliverable

Engine that can load regions, battles, and player progression.

---

## Milestone 2 — Battle System

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

## Milestone 3 — Exploration System

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

### Deliverable

A fully interactive Hollowfort Prison.

---

## Milestone 4 — Card System

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

## Milestone 5 — Progression

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

## Milestone 6 — Items & Inventory

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

## Milestone 7 — Story (Hollowfort Prison)

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

## Milestone 8 — World Building

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

### Deliverable

One handcrafted region ready for Beta.

---

## Milestone 9 — User Experience

**Goal:** Immersion and premium presentation.

### Animations

Card play, movement, combat, damage, rewards.

### Visual effects

Fog, smoke, sparks, torchlight, dust.

### Audio

Ambient beds, screen music, card / combat SFX (see [AUDIO.md](./AUDIO.md)).

### Deliverable

Polished feel for the prison vertical slice.

---

## Milestone 10 — Quality Assurance

**Goal:** Stability for Beta.

### Unit tests

Damage, card effects, XP, deck ops, status effects.

### Integration tests

Exploration flow, battle flow, rewards, progression.

### End-to-end (Playwright)

- New game  
- Complete prison  
- Win battle  
- Save / load  
- Level up  
- Receive reward  
- Defeat boss  

### Deliverable

Stable Beta build.

---

## Milestone 11 — Documentation

Keep docs lightweight and current.

| Document | Purpose |
|----------|---------|
| Game Vision | Audience, philosophy, Beta scope |
| [Game Mechanics](./MECHANICS.md) | Combat, exploration, progression rules |
| Story | Narrative, regions, quests |
| Architecture | Structure, XState, engine overview |
| Card Design Guide | Classes, effects, balance, naming |
| Content Pipeline | Adding locations, enemies, cards, events |
| Prompt Library | Cursor / design / asset prompts |
| [Audio](./AUDIO.md) | Sound ids, beds, unlock |
| Testing Guide | How to run and validate tests |
| **This roadmap** | Milestones and Beta definition |

---

## Milestone 12 — Beta Release

### Region

Hollowfort Prison only (world map as hub exit).

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

The Beta succeeds when a new player can:

1. Start a new game without guidance.  
2. Understand core mechanics within **10–15 minutes**.  
3. Escape Hollowfort in about **60–90 minutes**.  
4. Experiment with class combinations and feel progression.  
5. Defeat the prison boss and return to the world map.  
6. Finish without major bugs or confusing systems.  
7. Leave curious about the next region.

---

## Suggested build order

Work roughly in this dependency order (parallel where noted):

```text
M1 Foundation (save/load + RNG)
    ↓
M2 Battle completion  ↔  M3 Exploration depth
    ↓
M4 Card volume + M5 Progression + M6 Inventory
    ↓
M7 Story beats wired into prison content (M8)
    ↓
M9 Polish  →  M10 QA  →  M12 Beta
```

Documentation (M11) stays continuous, not a final gate.
