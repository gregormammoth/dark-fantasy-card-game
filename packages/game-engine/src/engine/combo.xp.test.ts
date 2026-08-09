/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import type { BattleContext } from '@dark-fantasy/shared/types/battle';
import { createInitialProgression, getClassXp } from './progression/xp';
import {
  addToCombo,
  beginPlayerResolution,
  COMBO_CAP,
  resolveEnemyTurn,
  resolveNextComboCard,
} from './combo';

function makeCard(
  id: string,
  options: {
    class: CardDefinition['class'];
    type: NonNullable<CardDefinition['type']>;
    name?: string;
    effects?: CardDefinition['effects'];
    damage?: number;
  },
): CardInstance {
  return {
    instanceId: `${id}_instance`,
    definition: {
      id,
      name: options.name ?? id,
      class: options.class,
      type: options.type,
      effects:
        options.effects ??
        (options.type === 'defense'
          ? [{ type: 'shield', value: 1 }]
          : [{ type: 'damage', value: options.damage ?? 1 }]),
    },
  };
}

function makeEnemyCard(id: string): CardInstance {
  return {
    instanceId: `${id}_enemy`,
    definition: {
      id,
      name: id,
      type: 'attack',
      effects: [{ type: 'damage', value: 1 }],
    },
  };
}

function makeBattle(hand: CardInstance[], enemyDeck: CardInstance[] = []): BattleContext {
  return {
    player: {
      portrait: '/characters/player.png',
      shield: 0,
      maxShield: 2,
      barrier: 0,
      deck: [],
      hand,
      discard: [],
    },
    enemy: {
      name: 'Test Enemy',
      portrait: '/characters/prisoner.png',
      shield: 0,
      maxShield: 2,
      barrier: 0,
      deck: enemyDeck,
      discard: [],
    },
    combo: [],
    playerMaxHealth: 10,
    enemyMaxHealth: 10,
    combatStats: {
      attackCardsPlayed: 0,
      defenseCardsPlayed: 0,
    },
    battleStats: {
      turnCount: 0,
      cardsBurnedToEnemy: 0,
      cardsLostByPlayer: 0,
    },
    playerPoison: null,
    enemyPoison: null,
    damageReductionPercent: 0,
    enemyBarrierPerTurn: 0,
    resolvingCardInstanceId: null,
    resolutionQueue: [],
    activePlay: null,
    lastDamageResult: null,
    isFirstPlayerTurn: false,
    lastPlayerDrawCount: 0,
    comboStartPlayerHealth: null,
    comboStartAttackCardsPlayed: null,
    comboStartCards: null,
    log: [],
    progression: createInitialProgression(),
    progressionAtBattleStart: createInitialProgression(),
    rng: { seed: 1, cursor: 0 },
  };
}

function playThroughCombo(battle: BattleContext, cardIds: string[]): BattleContext {
  let next = battle;
  for (const id of cardIds) {
    next = addToCombo(next, id);
  }
  next = beginPlayerResolution(next);
  while (next.resolutionQueue.length > 0) {
    next = resolveNextComboCard(next);
    next = { ...next, activePlay: null };
  }
  return next;
}

describe('battle card play awards class xp', () => {
  it('awards +1 fighter xp for a successful fighter card play', () => {
    const fighter = makeCard('fighter_attack', {
      class: 'fighter',
      type: 'attack',
      damage: 1,
    });
    const result = playThroughCombo(makeBattle([fighter]), [fighter.instanceId]);

    expect(getClassXp(result.progression, 'fighter')).toBe(1);
  });

  it('awards +1 wizard xp for a successful wizard card play', () => {
    const wizard = makeCard('wizard_attack', {
      class: 'wizard',
      type: 'attack',
      damage: 5,
    });
    const result = playThroughCombo(makeBattle([wizard]), [wizard.instanceId]);

    expect(getClassXp(result.progression, 'wizard')).toBe(1);
  });

  it('awards +1 rogue xp for a successful rogue card play', () => {
    const rogue = makeCard('rogue_attack', {
      class: 'rogue',
      type: 'attack',
      damage: 2,
    });
    const result = playThroughCombo(makeBattle([rogue]), [rogue.instanceId]);

    expect(getClassXp(result.progression, 'rogue')).toBe(1);
  });

  it('awards +1 survivor xp for a successful survivor card play', () => {
    const survivor = makeCard('survivor_defense', {
      class: 'survivor',
      type: 'defense',
      effects: [{ type: 'shield', value: 1 }],
    });
    const result = playThroughCombo(makeBattle([survivor]), [survivor.instanceId]);

    expect(getClassXp(result.progression, 'survivor')).toBe(1);
  });

  it('accumulates xp across multiple successful plays and classes', () => {
    const fighterA = makeCard('fighter_a', { class: 'fighter', type: 'attack', damage: 1 });
    const fighterB = makeCard('fighter_b', { class: 'fighter', type: 'attack', damage: 5 });
    const wizard = makeCard('wizard_a', { class: 'wizard', type: 'attack', damage: 2 });

    let battle = makeBattle([fighterA, fighterB, wizard]);
    battle = playThroughCombo(battle, [fighterA.instanceId, fighterB.instanceId]);
    const result = playThroughCombo(battle, [wizard.instanceId]);

    expect(getClassXp(result.progression, 'fighter')).toBe(2);
    expect(getClassXp(result.progression, 'wizard')).toBe(1);
    expect(getClassXp(result.progression, 'rogue')).toBe(0);
  });

  it('does not award xp when combo is empty', () => {
    const battle = makeBattle([]);
    const afterBegin = beginPlayerResolution(battle);
    const afterResolve = resolveNextComboCard(afterBegin);

    expect(getClassXp(afterResolve.progression, 'fighter')).toBe(0);
    expect(afterResolve).toBe(afterBegin);
  });

  it('does not award xp for invalid combo adds', () => {
    const fighter = makeCard('fighter_attack', {
      class: 'fighter',
      type: 'attack',
      damage: 1,
    });
    const battle = makeBattle([fighter]);
    const unchanged = addToCombo(battle, 'missing_instance');

    expect(unchanged).toBe(battle);
    expect(getClassXp(unchanged.progression, 'fighter')).toBe(0);
  });

  it('does not award player xp for enemy card plays', () => {
    const enemyCard = makeEnemyCard('enemy_strike');
    const battle = makeBattle([], [enemyCard]);
    const result = resolveEnemyTurn(battle);

    expect(getClassXp(result.progression, 'fighter')).toBe(0);
    expect(getClassXp(result.progression, 'rogue')).toBe(0);
    expect(getClassXp(result.progression, 'wizard')).toBe(0);
    expect(getClassXp(result.progression, 'survivor')).toBe(0);
  });

  it('awards xp once per successful resolve even if animation state is cleared', () => {
    const fighter = makeCard('fighter_attack', {
      class: 'fighter',
      type: 'attack',
      damage: 3,
    });
    let battle = addToCombo(makeBattle([fighter]), fighter.instanceId);
    battle = beginPlayerResolution(battle);
    battle = resolveNextComboCard(battle);
    const afterFirst = getClassXp(battle.progression, 'fighter');
    battle = { ...battle, activePlay: null };
    battle = resolveNextComboCard(battle);

    expect(afterFirst).toBe(1);
    expect(getClassXp(battle.progression, 'fighter')).toBe(1);
  });

  it('refuses a third card when the combo is at cap', () => {
    const a = makeCard('a', { class: 'fighter', type: 'attack', damage: 1 });
    const b = makeCard('b', { class: 'fighter', type: 'attack', damage: 1 });
    const c = makeCard('c', { class: 'fighter', type: 'attack', damage: 1 });
    let battle = makeBattle([a, b, c]);
    battle = addToCombo(battle, a.instanceId);
    battle = addToCombo(battle, b.instanceId);
    const blocked = addToCombo(battle, c.instanceId);
    expect(COMBO_CAP).toBe(2);
    expect(blocked.combo).toHaveLength(2);
    expect(blocked.player.hand.map((card) => card.instanceId)).toContain(c.instanceId);
  });
});
