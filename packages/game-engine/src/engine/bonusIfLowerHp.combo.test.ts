/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import type { BattleContext } from '@dark-fantasy/shared/types/battle';
import { createInitialProgression } from './progression/xp';
import {
  addToCombo,
  beginPlayerResolution,
  finishPlayerResolution,
  resolveNextComboCard,
} from './combo';
import { previewCombo } from './comboPreview';
import { getEnemyHealth } from './health';

function makeCard(
  id: string,
  options: {
    class?: CardDefinition['class'];
    type: NonNullable<CardDefinition['type']>;
    effects: CardDefinition['effects'];
  },
): CardInstance {
  return {
    instanceId: `${id}_instance`,
    definition: {
      id,
      name: id,
      class: options.class ?? 'survivor',
      type: options.type,
      effects: options.effects,
    },
  };
}

function makeBattle(options: {
  hand: CardInstance[];
  deck?: CardInstance[];
  playerMaxHealth: number;
  enemyDeckSize: number;
}): BattleContext {
  const enemyDeck = Array.from({ length: options.enemyDeckSize }, (_, index) =>
    makeCard(`enemy_${index}`, {
      type: 'attack',
      effects: [{ type: 'damage', value: 1 }],
    }),
  );

  return {
    player: {
      portrait: '/characters/player.png',
      shield: 0,
      maxShield: 2,
      barrier: 0,
      deck: options.deck ?? [],
      hand: options.hand,
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
    playerMaxHealth: options.playerMaxHealth,
    enemyMaxHealth: options.enemyDeckSize,
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
    playerMana: 0,
    playerMaxMana: 2,
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

function resolveComboOrder(battle: BattleContext, order: string[]): BattleContext {
  let next = battle;
  for (const id of order) {
    next = addToCombo(next, id);
  }
  next = beginPlayerResolution(next);
  while (next.resolutionQueue.length > 0) {
    next = resolveNextComboCard(next);
    next = { ...next, activePlay: null };
  }
  return finishPlayerResolution(next);
}

describe('bonusIfLowerHp combo order', () => {
  it('applies the same damage regardless of Last Stand position in the combo', () => {
    const fillerA = makeCard('filler_a', {
      type: 'attack',
      effects: [{ type: 'damage', value: 1 }],
    });
    const lastStand = makeCard('last_stand', {
      type: 'attack',
      effects: [
        { type: 'bonusIfLowerHp', damage: 2, thresholdPercent: 50 },
        { type: 'damage', value: 2 },
      ],
    });

    const base = makeBattle({
      hand: [fillerA, lastStand],
      deck: Array.from({ length: 1 }, (_, index) =>
        makeCard(`deck_${index}`, {
          type: 'defense',
          effects: [{ type: 'shield', value: 1 }],
        }),
      ),
      playerMaxHealth: 10,
      enemyDeckSize: 20,
    });

    const lastStandFirst = resolveComboOrder(structuredClone(base), [
      'last_stand_instance',
      'filler_a_instance',
    ]);
    const lastStandLast = resolveComboOrder(structuredClone(base), [
      'filler_a_instance',
      'last_stand_instance',
    ]);

    expect(getEnemyHealth(lastStandFirst)).toBe(getEnemyHealth(lastStandLast));
    expect(20 - getEnemyHealth(lastStandFirst)).toBe(5);
  });

  it('matches preview damage to resolved damage for Last Stand combos', () => {
    const filler = makeCard('filler', {
      type: 'attack',
      effects: [{ type: 'damage', value: 1 }],
    });
    const lastStand = makeCard('last_stand', {
      type: 'attack',
      effects: [
        { type: 'bonusIfLowerHp', damage: 2, thresholdPercent: 50 },
        { type: 'damage', value: 2 },
      ],
    });

    let battle = makeBattle({
      hand: [filler, lastStand],
      deck: Array.from({ length: 1 }, (_, index) =>
        makeCard(`deck_${index}`, {
          type: 'defense',
          effects: [{ type: 'shield', value: 1 }],
        }),
      ),
      playerMaxHealth: 10,
      enemyDeckSize: 20,
    });

    battle = addToCombo(battle, 'filler_instance');
    battle = addToCombo(battle, 'last_stand_instance');

    const preview = previewCombo(battle);
    let played = beginPlayerResolution(structuredClone(battle));
    while (played.resolutionQueue.length > 0) {
      played = resolveNextComboCard(played);
      played = { ...played, activePlay: null };
    }
    played = finishPlayerResolution(played);

    expect(preview?.totalDamageToEnemy).toBe(20 - getEnemyHealth(played));
  });
});
