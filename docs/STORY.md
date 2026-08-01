# Hollowfort Prison — Story

Narrative bible for the Beta vertical slice. Gameplay systems live elsewhere; this document owns **plot, tone, and player-facing story beats**.

Related: [HOLLOWFORT.md](./HOLLOWFORT.md) (NPCs, locations, enemies, factions), [ROADMAP.md](./ROADMAP.md) (slice journey), [MECHANICS.md](./MECHANICS.md) (rules), marketing lore under `apps/web/content/lore/`.

---

## Premise

The protagonist is imprisoned inside **Hollowfort** — an ancient fortress-prison raised on ground soaked by executions. Decades ago, dozens of anarchists and other political prisoners were put to death within its walls. Their bodies were buried beneath the prison. Their souls were left to wander in torment.

One night a mysterious sorcerer infiltrates the fortress and performs a **forbidden ritual**. The souls of the executed return to their bodies. The dead rise.

The resurrected launch a brutal uprising: guards are slaughtered, every cell is broken open, and the prison’s inmates are unleashed. Order collapses into chaos in moments.

Caught in the massacre, the protagonist must **survive**, **escape the fortress**, and ultimately **decide where their loyalties truly lie**.

---

## Setting

### Hollowfort

A stone labyrinth built to contain enemies of the crown. Publicly a prison; privately a killing ground and a mass grave.

| Truth | Implication |
|-------|-------------|
| Built on a site of countless executions | The walls remember violence |
| Political prisoners executed and buried beneath | The dead have a claim on this place |
| Souls left unrested | The ritual has fuel waiting underfoot |
| Wards and locks define the fortress | When they fail, the whole hierarchy fails |

### Atmosphere

Torchlight, fog between corridors, distant bells that stop mid-ring. The prison should feel **ancient, unjust, and suddenly awake** — not a generic dungeon crawl.

---

## Backstory (before the night)

1. The crown used Hollowfort to disappear anarchists and other political enemies.
2. Mass executions were carried out inside the fortress.
3. Bodies were interred beneath the prison; rites for the dead were denied or perverted.
4. For decades the living kept order above, while the dead waited below.

The player does not need a full history dump on minute one — but designers and writers should treat this as established fact.

---

## Inciting incident

A **mysterious sorcerer** enters Hollowfort and completes a forbidden ritual.

- Souls of the executed return to their buried bodies.
- The dead rise as a force with memory, grievance, and purpose.
- Their first act is uprising: kill the wardens of the old order, open the cells, flood the halls with chaos.

The sorcerer’s identity, motive, and fate are **open design questions** for later acts (ally, manipulator, or vanished catalyst). For the Beta slice, the ritual is the spark; the uprising is what the player lives through.

---

## The uprising

What the player experiences as “the night Hollowfort fell”:

1. Guards die or flee.
2. Cell doors fail or are forced open — including the protagonist’s.
3. Inmates pour into corridors; not all are friends.
4. Resurrected anarchists fight with ideology and fury, not only hunger.
5. The prison’s hierarchy (warden, towers, gates) becomes contested ground.

**Tone:** massacre and opportunity at once. Freedom arrives soaked in blood.

---

## Protagonist

### Position

- Imprisoned in Hollowfort at the moment of the ritual.
- Not the architect of the uprising; a survivor inside it.
- Forced into action by open doors and collapsing order.

### Arc (Beta)

```text
Survive the night
        ↓
Escape the fortress
        ↓
Choose a loyalty
```

The central dramatic question:

> When every chain is broken, who do you stand with — the dead who were wronged, the living who still hold keys to the outside world, or only yourself?

### Loyalties (design space)

Three factions pull the protagonist (full cast and bosses in [HOLLOWFORT.md](./HOLLOWFORT.md)):

| Path | Faction | Rough meaning | Route boss if opposed / tasked |
|------|---------|---------------|--------------------------------|
| The risen | Anarchists | Aid the resurrected; justice over order | Prison Warden |
| Order | Guards | Restore control; earn pardon | Dead Anarchist |
| The ritual | Sorcerer’s followers | Serve or use the mage’s plan | Inquisitor |
| The escapee | None | Use all sides; get out; answer later | Any gate confrontation |

Beta can ship a single clear escape beat with one loyalty fork first, then expand the full three-route bosses.

---

## Vertical slice story flow

Maps to the playable Hollowfort journey. Concrete rooms, NPCs, and enemies: [HOLLOWFORT.md](./HOLLOWFORT.md).

| Beat | Story | Play |
|------|--------|------|
| 1 | Wake in a cell that should not open | Prison Cell — Dead Anarchist; tutorial combat |
| 2 | First corridor of massacre | Cell Block → Central Prison Corridor |
| 3 | Explore while factions clash | Hub corridors; Anarchists vs Guards |
| 4 | Discover the invasion’s nature | Old Prisoner / Executioner / Sorcerer glimpse |
| 5 | Optional: rescue a survivor | Wounded Prisoner |
| 6 | Arms and cards | Armory / Guard Barracks — Prison Guard ally option |
| 7 | Courtyard / yard confrontation | Prison Yard — execution platform |
| 8 | Route boss | Warden, Dead Anarchist, or Inquisitor (by loyalty) |
| 9 | Escape Hollowfort | Main Gate — loyalty choice can live here |
| 10 | World map | The realm beyond; Beta ends; next region teases |

---

## Themes

- **Unquiet justice** — the executed were buried to silence politics; silence fails.
- **Freedom’s cost** — open doors do not mean safety.
- **Loyalty under fire** — identity is proven when the old map of “prisoner / guard / dead” breaks.
- **Cards as stolen power** — decks are the currency of the dark below (aligns with game fantasy).

---

## Open questions (do not block Beta)

Track these so content stays consistent when answered:

1. Who is the sorcerer, and why Hollowfort?
2. Are the risen fully themselves, thralls, or something in between?
3. Was the protagonist political, criminal, or wrongly held?
4. Does any guard deserve mercy?
5. What waits outside the Main Gate once the prison empties into the world?

---

## Writing guidelines

- Prefer **shown chaos** (corpses, open cells, conflicting shouts) over exposition dumps.
- Name factions clearly when the player meets them: risen anarchists, surviving guards, opportunistic inmates.
- Keep the protagonist’s past light until a loyalty beat needs weight.
- Public site lore pages may paraphrase this bible; they must not contradict it.

---

## Status

| Item | State |
|------|--------|
| Core plot | Drafted (this doc) |
| NPCs / locations / enemies | Drafted in [HOLLOWFORT.md](./HOLLOWFORT.md); wired into `prisonMap.json` |
| Loyalty endings | Three faction routes designed; not fully branched in play yet |
| Sorcerer identity | Unspecified (NPC draft only) |
| Wired into exploration content | Locations / NPCs / enemies placed; story flags & route bosses partial |
