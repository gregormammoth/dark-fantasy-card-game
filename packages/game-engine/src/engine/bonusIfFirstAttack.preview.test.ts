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
      class: options.class ?? 'rogue',
      type: options.type,
      effects: options.effects,
    },
  };
}

function makeBattle(
  hand: CardInstance[],
  options?: { enemyShield?: number; attackCardsPlayed?: number },
): BattleContext {
  const enemyDeck = Array.from({ length: 20 }, (_, index) =>
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
      deck: [],
      hand,
      discard: [],
    },
    enemy: {
      name: 'Test Enemy',
      portrait: '/characters/prisoner.png',
      shield: options?.enemyShield ?? 0,
      maxShield: 2,
      barrier: 0,
      deck: enemyDeck,
      discard: [],
    },
    combo: [],
    playerMaxHealth: hand.length,
    enemyMaxHealth: 20,
    combatStats: {
      attackCardsPlayed: options?.attackCardsPlayed ?? 0,
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
    enemyMarked: false,
    playerCardsDrawnThisBattle: 0,
    comboStartPlayerHealth: null,
    comboStartAttackCardsPlayed: null,
    comboStartCards: null,
    log: [],
    progression: createInitialProgression(),
    progressionAtBattleStart: createInitialProgression(),
    rng: { seed: 1, cursor: 0 },
  };
}

function resolveCurrentCombo(battle: BattleContext): BattleContext {
  let played = beginPlayerResolution(structuredClone(battle));
  while (played.resolutionQueue.length > 0) {
    played = resolveNextComboCard(played);
    played = { ...played, activePlay: null };
  }
  return finishPlayerResolution(played);
}

describe('bonusIfFirstAttack', () => {
  it('keeps Backstab bonus when another attack is earlier in the first combo', () => {
    const strike = makeCard('strike', {
      type: 'attack',
      effects: [{ type: 'damage', value: 2 }],
    });
    const backstab = makeCard('backstab', {
      type: 'attack',
      effects: [
        { type: 'bonusIfFirstAttack', damage: 2 },
        { type: 'damage', value: 2 },
      ],
    });

    let battle = makeBattle([strike, backstab], { enemyShield: 2 });
    battle = addToCombo(battle, 'strike_instance');
    battle = addToCombo(battle, 'backstab_instance');

    const preview = previewCombo(battle);
    const resolved = resolveCurrentCombo(battle);

    expect(preview?.totalDamageToEnemy).toBe(6);
    expect(preview?.damageToEnemy).toBe(20 - getEnemyHealth(resolved));
    expect(preview?.totalDamageToEnemy).toBe(
      20 - getEnemyHealth(resolved) + (preview?.enemyShieldBlocked ?? 0),
    );
  });

  it('does not grant Backstab bonus after an attack was already played this battle', () => {
    const backstab = makeCard('backstab', {
      type: 'attack',
      effects: [
        { type: 'bonusIfFirstAttack', damage: 2 },
        { type: 'damage', value: 2 },
      ],
    });

    let battle = makeBattle([backstab], { attackCardsPlayed: 1 });
    battle = addToCombo(battle, 'backstab_instance');

    const preview = previewCombo(battle);
    const resolved = resolveCurrentCombo(battle);

    expect(preview?.totalDamageToEnemy).toBe(2);
    expect(20 - getEnemyHealth(resolved)).toBe(2);
  });
});
