# Hollowfort Prison — Location Design

First-region content design: **NPCs, locations, enemies, bosses, factions, and quests**.

Narrative premise and loyalty themes live in [STORY.md](./STORY.md). This document is the concrete cast and map for the fortress.

Related: [ROADMAP.md](./ROADMAP.md) (vertical slice), [MECHANICS.md](./MECHANICS.md) (combat).

---

## Faction overview

Three pull forces inside the uprising. The protagonist’s loyalty choice maps onto these.

### The Anarchists

| | |
|--|--|
| **Goal** | Destroy the prison system and free all prisoners |
| **Strength** | Numbers and determination |
| **Weakness** | Chaos and lack of control |
| **Face** | The Dead Anarchist |
| **Quest target** | Kill the Prison Warden |
| **Gate reward NPC** | Dead Anarchist (if Warden is dead) |

### The Guards (Order)

| | |
|--|--|
| **Goal** | Restore order and contain the uprising |
| **Strength** | Organization and equipment |
| **Weakness** | Corruption and hidden crimes |
| **Face** | The Guard Captain |
| **Quest target** | Kill the Undead / Resurrected Anarchist |
| **Gate reward NPC** | Guard Captain (if Resurrected Anarchist is dead) |

### The Sorcerer’s Followers

| | |
|--|--|
| **Goal** | Complete the mysterious ritual |
| **Strength** | Supernatural power |
| **Weakness** | Unknown motives and limited numbers |
| **Face** | The Sorcerer |
| **Quest target** | Kill the Inquisitor |
| **Gate reward NPC** | Sorcerer (if Inquisitor is dead) |

---

## Placement (Beta target)

Authoritative roster for who stands where. Implementation should match this table; rooms marked **add** are not yet on the live graph (or need to be restored).

| Location | NPC | Enemy | Notes |
|----------|-----|-------|-------|
| **Prison Cell** | Dead Anarchist | — | Intro dialog; grants Warden quest after talk |
| **Cell Block** | — | Prisoner | Thin / basic prisoner fight |
| **Ritual Room** | Sorcerer *(after Demon defeated)* | Demon | Sorcerer is **hidden until** the Demon is cleared; then grants Inquisitor quest after talk |
| **Infirmary** | — | Crazy Prisoner | |
| **Underground Tunnels** *(add)* | — | Giant Rat | Connect into the mid-prison graph |
| **Torture Chamber** | Executioner | — | Lore / key NPC |
| **Central Corridor** | — | — | Hub only — quest board / travel, no cast |
| **Armory** *(add)* | — | Knight | Guard-equipment fight |
| **Prison Kitchen** | — | Butcher | |
| **Dining Hall** *(add)* | — | Fat Prisoner | |
| **Guard Barracks** | — | Guard | |
| **Central Courtyard** | Guard Captain | — | Grants Resurrected Anarchist quest after talk; branching hub |
| **Chapel** | — | Inquisitor | Boss — Sorcerer quest target |
| **Warden’s Tower** | — | Prison Warden | Boss — Dead Anarchist quest target |
| **Political Wing** | — | Resurrected Anarchist | Boss — Guard Captain quest target |
| **Exit Gate** | Conditional (see below) | — | Escape point |

### Exit Gate — conditional NPCs

Only the NPC whose faction quest boss is dead appears at the gate (loyalty / escape beat):

| Condition | NPC at Gate |
|-----------|-------------|
| Prison Warden defeated | **Dead Anarchist** |
| Inquisitor defeated | **Sorcerer** |
| Resurrected Anarchist defeated | **Guard Captain** |

If multiple bosses are dead (should be rare once branch sealing is enforced), prefer the NPC for the **chosen final branch** boss.

---

## Faction quests

Quests are the Beta loyalty hooks. They unlock **only after dialog** with the granting NPC — not on map enter alone.

| Quest id (suggested) | Granted by | When | Objective | Complete when |
|----------------------|------------|------|-----------|---------------|
| `kill_warden` | Dead Anarchist | After talk in Prison Cell | Defeat the Prison Warden in Warden’s Tower | Warden defeated |
| `kill_inquisitor` | Sorcerer | After talk in Ritual Room (post-Demon) | Defeat the Inquisitor in the Chapel | Inquisitor defeated |
| `kill_resurrected_anarchist` | Guard Captain | After talk in Central Courtyard | Defeat the Resurrected Anarchist in the Political Wing | Resurrected Anarchist defeated |

### Quest rules

1. **Dialog gate:** quest enters the run quest log only after the player finishes / advances the granting NPC’s talk interaction.
2. **One path, one boss:** existing `finalBranchId` sealing still applies — the player commits to Chapel, Warden’s Tower, or Political Wing.
3. **Gate payoff:** completing the matching boss is what enables that faction’s NPC at Exit Gate.
4. **UI:** quest log shows title, grantor, objective, and complete/failed state (see ROADMAP Milestone 6b).

### Suggested quest copy

| Quest | Title | Description |
|-------|-------|-------------|
| Kill Warden | Break the Keys | The Dead Anarchist asks you to end the Warden — the man who kept the cages locked. |
| Kill Inquisitor | Snuff the Holy Fire | The Sorcerer asks you to destroy the Inquisitor before the chapel seals the ritual away. |
| Kill Resurrected Anarchist | Cut the Rising | The Guard Captain asks you to put down the Resurrected Anarchist before the political wing empties into the yard. |

---

## NPCs

### The Dead Anarchist

| Field | Detail |
|-------|--------|
| **Role** | Main story NPC / Anarchist faction representative |
| **Locations** | Prison Cell (start); Exit Gate (if Warden defeated) |
| **Description** | A resurrected political prisoner who awakens after the necromantic ritual. Mistakes the protagonist for someone he came to free. Searches the prison for other political prisoners and tries to continue the revolution he died for. |

**Interactions**

- Opens / frames the protagonist’s escape from the cell.
- After dialog → grants **kill Warden** quest.
- Appears at Exit Gate when the Warden is dead.

---

### The Guard Captain

| Field | Detail |
|-------|--------|
| **Role** | Order faction representative |
| **Locations** | Central Courtyard; Exit Gate (if Resurrected Anarchist defeated) |
| **Description** | A surviving commander who offers a path through the chaos in exchange for putting down the risen political leadership. |

**Interactions**

- Holds the courtyard as the last clear Order voice.
- After dialog → grants **kill Resurrected Anarchist** quest.
- Appears at Exit Gate when the Resurrected Anarchist is dead.

---

### The Sorcerer

| Field | Detail |
|-------|--------|
| **Role** | Mysterious antagonist / ritual faction face |
| **Locations** | Ritual Room (**only after Demon is defeated**); Exit Gate (if Inquisitor defeated) |
| **Description** | The mage responsible for the resurrection ritual. Watches from the circle’s aftermath before asking the protagonist to remove the Inquisitor. |

**Interactions**

- Does **not** appear while the Demon still holds the Ritual Room.
- After dialog → grants **kill Inquisitor** quest.
- Appears at Exit Gate when the Inquisitor is dead.

---

### The Executioner

| Field | Detail |
|-------|--------|
| **Role** | Neutral tragic NPC |
| **Location** | Torture Chamber |
| **Description** | Former executioner of the prison. A broken man haunted by executing his own fiancée under orders. |

**Interactions**

- Tells his tragic story.
- Provides information about the prison’s past.
- Gives a key, weapon, or secret passage.
- Embodies the theme that not every monster is evil.

---

## Bosses (route)

| Boss | Location | Faction quest that targets them |
|------|----------|----------------------------------|
| **Inquisitor** | Chapel | Sorcerer → kill Inquisitor |
| **Prison Warden** | Warden’s Tower | Dead Anarchist → kill Warden |
| **Resurrected Anarchist** | Political Wing | Guard Captain → kill Resurrected Anarchist |

Only one final branch needs to be cleared to open Exit Gate (existing seal rules).

---

## Locations

Design map for the first fortress. Names here are the **content target**.

| Location | Purpose | Cast (from placement table) |
|----------|---------|------------------------------|
| **Prison Cell** | Start | Dead Anarchist (NPC) |
| **Cell Block** | Early combat | Prisoner (enemy) |
| **Ritual Room** | Ritual beat | Demon (enemy) → Sorcerer (NPC) |
| **Central Corridor** | Hub | Nobody — quests / travel only |
| **Torture Chamber** | Lore | Executioner (NPC) |
| **Prison Kitchen** | Survival fight | Butcher (enemy) |
| **Dining Hall** *(add)* | Mess fight | Fat Prisoner (enemy) |
| **Infirmary** | Mad fight | Crazy Prisoner (enemy) |
| **Guard Barracks** | Guard fight | Guard (enemy) |
| **Armory** *(add)* | Equipment fight | Knight (enemy) |
| **Underground Tunnels** *(add)* | Deep / sewer | Giant Rat (enemy) |
| **Central Courtyard** | Branch choice | Guard Captain (NPC) |
| **Chapel** | Final branch | Inquisitor (enemy) |
| **Warden’s Tower** | Final branch | Prison Warden (enemy) |
| **Political Wing** | Final branch | Resurrected Anarchist (enemy) |
| **Exit Gate** | Escape | Conditional faction NPC |

### Suggested flow (Beta)

```text
Prison Cell (Dead Anarchist → quest: kill Warden)
  → Cell Block (Prisoner)
  → Ritual Room (Demon → then Sorcerer → quest: kill Inquisitor)
  → Central Corridor  ←── empty hub
       ├── Kitchen (Butcher) → Dining Hall (Fat Prisoner)   [add dining]
       ├── Infirmary (Crazy Prisoner)
       ├── Torture Chamber (Executioner)
       ├── Barracks (Guard) → Armory (Knight)               [add armory]
       ├── Underground Tunnels (Giant Rat)                  [add tunnels]
       └── Central Courtyard (Guard Captain → quest: kill Resurrected Anarchist)
              ├── Chapel (Inquisitor)
              ├── Warden’s Tower (Warden)
              └── Political Wing (Resurrected Anarchist)
                     └── Exit Gate (conditional NPC) → World Map
```

---

## Enemy types (combat roster)

| Enemy | Primary location |
|-------|------------------|
| Prisoner | Cell Block |
| Demon | Ritual Room |
| Crazy Prisoner | Infirmary |
| Giant Rat | Underground Tunnels |
| Butcher | Prison Kitchen |
| Fat Prisoner | Dining Hall |
| Guard | Guard Barracks |
| Knight | Armory |
| Inquisitor | Chapel |
| Prison Warden | Warden’s Tower |
| Resurrected Anarchist | Political Wing |

---

## Content priority (implementation)

1. [x] Align `prisonMap.json` to the **Placement** table
2. [x] Ritual Room: Demon fight → reveal Sorcerer NPC + Inquisitor quest after dialog
3. [x] Quest grants after Dead Anarchist / Sorcerer / Guard Captain dialog; quest log UI
4. [x] Exit Gate conditional NPCs from boss flags
5. [x] Add Dining Hall, Armory, Underground Tunnels
6. [ ] Polish escape → world map wiring

---

## Status

| Item | State |
|------|--------|
| Placement + quest rules | Documented (this page) |
| Live `prisonMap.json` | **Aligned** to placement table (16 locations incl. dining / armory / tunnels) |
| Quest system | Grant after dialog + complete on boss kill + quest log UI |
| Gate conditional NPCs | Wired via boss defeat flags |
| Route bosses | Three branches designed; art wired |
