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
      class: options.class ?? 'warrior',
      type: options.type,
      effects: options.effects,
    },
  };
}

function makeBattle(hand: CardInstance[]): BattleContext {
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
      shield: 0,
      maxShield: 2,
      barrier: 0,
      deck: enemyDeck,
      discard: [],
    },
    combo: [],
    playerMaxHealth: hand.length,
    enemyMaxHealth: 20,
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

describe('bonusDamagePerAttackCard order', () => {
  it('deals the same Battle Momentum damage regardless of combo order with Poison Dagger', () => {
    const momentum = makeCard('momentum', {
      type: 'attack',
      effects: [
        { type: 'bonusDamagePerAttackCard', value: 1 },
        { type: 'damage', value: 2 },
      ],
    });
    const poison = makeCard('poison', {
      class: 'rogue',
      type: 'attack',
      effects: [{ type: 'poison', damagePerTurn: 1, duration: 3 }],
    });

    let momentumFirst = makeBattle([momentum, poison]);
    momentumFirst = addToCombo(momentumFirst, 'momentum_instance');
    momentumFirst = addToCombo(momentumFirst, 'poison_instance');

    let poisonFirst = makeBattle([
      makeCard('momentum', {
        type: 'attack',
        effects: [
          { type: 'bonusDamagePerAttackCard', value: 1 },
          { type: 'damage', value: 2 },
        ],
      }),
      makeCard('poison', {
        class: 'rogue',
        type: 'attack',
        effects: [{ type: 'poison', damagePerTurn: 1, duration: 3 }],
      }),
    ]);
    poisonFirst = addToCombo(poisonFirst, 'poison_instance');
    poisonFirst = addToCombo(poisonFirst, 'momentum_instance');

    const previewA = previewCombo(momentumFirst);
    const previewB = previewCombo(poisonFirst);
    const resolvedA = resolveCurrentCombo(momentumFirst);
    const resolvedB = resolveCurrentCombo(poisonFirst);

    expect(previewA?.totalDamageToEnemy).toBe(3);
    expect(previewB?.totalDamageToEnemy).toBe(3);
    expect(previewA?.totalDamageToEnemy).toBe(previewB?.totalDamageToEnemy);
    expect(getEnemyHealth(resolvedA)).toBe(getEnemyHealth(resolvedB));
    expect(20 - getEnemyHealth(resolvedA)).toBe(3);
    expect(resolvedA.enemyPoison).not.toBeNull();
    expect(resolvedB.enemyPoison).not.toBeNull();
  });

  it('deals base damage when Battle Momentum is alone in the combo', () => {
    const momentum = makeCard('momentum', {
      type: 'attack',
      effects: [
        { type: 'bonusDamagePerAttackCard', value: 1 },
        { type: 'damage', value: 2 },
      ],
    });

    let battle = makeBattle([momentum]);
    battle = addToCombo(battle, 'momentum_instance');

    const preview = previewCombo(battle);
    expect(preview?.totalDamageToEnemy).toBe(2);
    expect(preview?.damageToEnemy).toBe(2);

    let played = beginPlayerResolution(structuredClone(battle));
    played = resolveNextComboCard(played);
    expect(played.activePlay?.cue.incomingDamage).toBe(2);
    expect(played.activePlay?.cue.damageToEnemy).toBe(2);
    expect(20 - getEnemyHealth(played)).toBe(2);
  });

  it('counts shield-blocked Battle Momentum damage in combo preview', () => {
    const momentum = makeCard('momentum', {
      type: 'attack',
      effects: [
        { type: 'bonusDamagePerAttackCard', value: 1 },
        { type: 'damage', value: 2 },
      ],
    });

    let battle = makeBattle([momentum]);
    battle.enemy.shield = 2;
    battle = addToCombo(battle, 'momentum_instance');

    const preview = previewCombo(battle);
    expect(preview?.totalDamageToEnemy).toBe(2);
    expect(preview?.damageToEnemy).toBe(0);
    expect(preview?.enemyShieldBlocked).toBe(2);

    let played = beginPlayerResolution(structuredClone(battle));
    played = resolveNextComboCard(played);
    expect(played.activePlay?.cue.incomingDamage).toBe(2);
    expect(played.activePlay?.cue.shieldBlocked).toBe(2);
    expect(played.activePlay?.cue.damageToEnemy).toBeUndefined();
    expect(played.enemy.shield).toBe(0);
    expect(getEnemyHealth(played)).toBe(20);
  });
});
