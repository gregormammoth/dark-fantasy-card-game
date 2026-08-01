# Hollowfort Prison — Location Design

First-region content design: **NPCs, locations, enemies, bosses, and factions**.

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
| **Boss if opposed** | The Dead Anarchist (Guard route) |

### The Guards (Order)

| | |
|--|--|
| **Goal** | Restore order and contain the uprising |
| **Strength** | Organization and equipment |
| **Weakness** | Corruption and hidden crimes |
| **Face** | The Prison Guard (survivor ally) |
| **Boss if opposed** | The Prison Warden (Anarchist route) |

### The Sorcerer’s Followers

| | |
|--|--|
| **Goal** | Complete the mysterious ritual |
| **Strength** | Supernatural power |
| **Weakness** | Unknown motives and limited numbers |
| **Face** | The Sorcerer |
| **Boss if allied / tasked** | The Inquisitor (Sorcerer route) |

---

## NPCs

### The Dead Anarchist

| Field | Detail |
|-------|--------|
| **Role** | Main story NPC / Anarchist faction representative |
| **Description** | A resurrected political prisoner who awakens after the necromantic ritual. Mistakes the protagonist for someone he came to free. Searches the prison for other political prisoners and tries to continue the revolution he died for. |

**Possible interactions**

- Opens the protagonist’s cell.
- Offers help against the guards.
- Becomes faction leader for the Anarchist path.
- May become a boss if the player sides with the Guards.

---

### The Prison Guard

| Field | Detail |
|-------|--------|
| **Role** | Temporary ally / Order faction representative |
| **Description** | A surviving guard who offers protection and a possible pardon in exchange for helping restore order inside the prison. |

**Possible interactions**

- Provides weapons and information.
- Opens restricted areas.
- Represents the Order (Guards) faction.
- May betray the protagonist later.

---

### The Sorcerer

| Field | Detail |
|-------|--------|
| **Role** | Mysterious antagonist / hidden faction leader |
| **Description** | The mage responsible for the resurrection ritual. Appears briefly inside the prison, observing the chaos he created before disappearing. |

**Possible interactions**

- Gives cryptic hints.
- Requests the destruction of the Inquisitor.
- Reveals parts of the true purpose of the ritual.

**First appearance (design):** Central Prison Corridor.

---

### The Executioner

| Field | Detail |
|-------|--------|
| **Role** | Neutral tragic NPC |
| **Location** | Torture Chamber |
| **Description** | Former executioner of the prison. A broken man haunted by executing his own fiancée under orders. |

**Possible interactions**

- Tells his tragic story.
- Provides information about the prison’s past.
- Gives a key, weapon, or secret passage.
- Embodies the theme that not every monster is evil.

---

### The Prison Warden

| Field | Detail |
|-------|--------|
| **Role** | Authority figure / boss candidate |
| **Description** | Former ruler of the prison. Maintained order and hid the crimes committed inside the fortress. |

**Possible interactions**

- Main target of the Anarchist faction.
- Represents the old system.
- Can reveal secrets about the prisoners.

**Boss arena (Anarchist route):** Administrative Tower.

---

### The Inquisitor

| Field | Detail |
|-------|--------|
| **Role** | Religious hunter / boss candidate |
| **Description** | A powerful investigator sent to contain the supernatural outbreak. Believes the entire prison must be destroyed to stop the curse. |

**Possible interactions**

- Target requested by the Sorcerer.
- May have his own justification for his actions.
- Knows the truth about forbidden magic.

**Boss arena (Sorcerer route):** Prison Chapel / Ritual Chamber.

---

### The Wounded Prisoner

| Field | Detail |
|-------|--------|
| **Role** | Minor NPC |
| **Description** | A survivor trapped during the uprising. |

**Possible interactions**

- Requests rescue.
- Gives information about different factions.
- Can reveal hidden routes.

---

### The Old Prisoner

| Field | Detail |
|-------|--------|
| **Role** | Lore NPC |
| **Description** | Imprisoned veteran who remembers the prison before the uprising. |

**Possible interactions**

- Explains the history of executions.
- Provides rumors about the Sorcerer.

---

### The Torturer

| Field | Detail |
|-------|--------|
| **Role** | Dark lore NPC (living) / also an enemy archetype when corrupted |
| **Description** | Former prison interrogator who survived the uprising. |

**Possible interactions**

- Knows secrets about prisoners.
- May seek redemption or continue his cruelty.

---

## Locations

Design map for the first fortress. Names here are the **content target**; implementation may alias existing art/ids until the full graph is wired.

| Location | Purpose | Features |
|----------|---------|----------|
| **Prison Cell** | Starting area | Player introduction; first meeting with the Dead Anarchist; tutorial combat |
| **Cell Block** | Main exploration | Prisoners’ cells; political prisoner section; hidden passages; first undead encounters |
| **Central Prison Corridor** | Main hub connection | Links most locations; first Sorcerer appearance; large faction battles |
| **Torture Chamber** | Lore | Execution equipment; the Executioner NPC; dark history of the fortress |
| **Prison Kitchen** | Survival | Food storage; improvised weapons; fighting between prisoners and guards |
| **Dining Hall** | Large combat arena | Mass uprising; prisoner battles; possible faction events |
| **Guard Barracks** | Guard faction area | Weapons; armor; guard survivors; secret documents |
| **Armory** | Equipment | Better weapons; locked storage; guard defenses |
| **Prison Yard** | Main conflict | Large-scale battles; execution platform; major confrontation space |
| **Administrative Tower** | Authority | Warden’s office; prison records; government secrets; Warden boss (Anarchist route) |
| **Underground Tunnels** | Deep exploration | Old foundations; ritual chambers; hidden escape routes |
| **Main Gate** | Exit | Final escape point; final boss / loyalty arena |

### Suggested flow (Beta)

```text
Prison Cell
  → Cell Block
  → Central Prison Corridor  ←── hub
       ├── Torture Chamber
       ├── Kitchen → Dining Hall
       ├── Guard Barracks → Armory
       ├── Prison Yard
       ├── Administrative Tower
       ├── Underground Tunnels (ritual / chapel access)
       └── Main Gate → World Map
```

---

## Enemy types

### Undead Prisoner

Basic resurrected inmates.

- Slow attacks
- Group attacks
- Improvised weapons

### Resurrected Anarchist

Former revolutionaries brought back by magic.

- Faster movement
- Aggressive combat
- Chain weapons

### Bound Corpse

Dead prisoners still wearing chains.

- Defensive stance
- Uses chains as weapons

### Hanging Corpse

Executed prisoners returned from the gallows.

- Ambush attacks
- Ceiling / overhead movement

### Undead Guard

Former prison guards revived during the ritual.

- Armor
- Shields
- Organized attacks

### Guard Captain

Elite prison soldier.

- Commands other guards
- Heavy weapons

### Torturer (enemy)

Former interrogators corrupted by chaos.

- Bleeding attacks
- Traps
- Torture tools

### Sorcerer’s Minions

Supernatural servants created or summoned by the Sorcerer.

- Magic attacks
- Teleportation
- Ritual abilities

### Ritual Cultist

Followers helping complete the Sorcerer’s plan.

- Dark magic
- Summoning

---

## Route bosses

Boss choice depends on faction path. Only one needs to ship for the first Beta pass; the others are designed forks.

### The Inquisitor

| Field | Detail |
|-------|--------|
| **Faction path** | Sorcerer route |
| **Location** | Prison Chapel / Ritual Chamber |
| **Concept** | Holy warrior sent to destroy the supernatural outbreak |
| **Theme** | Order versus forbidden magic |

**Abilities**

- Holy fire
- Anti-undead abilities
- Sealing magic
- Divine weapons

---

### The Prison Warden

| Field | Detail |
|-------|--------|
| **Faction path** | Anarchist route |
| **Location** | Administrative Tower |
| **Concept** | Symbol of the prison system; maintained its cruel order |
| **Theme** | Oppression versus revolution |

**Abilities**

- Heavy armor
- Prison weapons
- Calls surviving guards
- Uses prison mechanisms

---

### The Dead Anarchist

| Field | Detail |
|-------|--------|
| **Faction path** | Guard route |
| **Location** | Political Prisoner Block (Cell Block) |
| **Concept** | Revolutionary who became a symbol after death |
| **Theme** | Freedom versus control |

**Abilities**

- Summons undead prisoners
- Chain weapons
- Breaks prison structures
- Inspires other undead

---

## Content priority (implementation)

Ship order for the vertical slice — not every NPC/enemy on day one:

1. **Prison Cell** + Dead Anarchist intro + tutorial fight
2. **Cell Block** / **Central Corridor** + Undead Prisoner / Resurrected Anarchist
3. **Armory** or **Barracks** + Guard ally touchpoint
4. **Torture Chamber** + Executioner (lore payoff)
5. **Prison Yard** or **Main Gate** + one route boss
6. Expand: Kitchen, Dining Hall, Tunnels, remaining enemy roster, full three-route bosses

---

## Status

| Item | State |
|------|--------|
| NPC roster | Drafted + placed in `prisonMap.json` |
| Location list | Drafted + wired (12 locations) |
| Enemy roster | Drafted + placed on map |
| Route bosses | Warden at Main Gate for Beta; other routes designed |
| Wired into `prisonMap` / encounters JSON | Yes (content pass) |
