/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { battleMachine } from '../machine/battleMachine';
import { expireEnemyBarrier, expireRoundEffects } from './poison';
import { createInitialBattle } from './battleSetup';
import { createInitialProgression } from './progression/xp';

describe('enemy barrier timing', () => {
  it('keeps enemy barrier through end of round', () => {
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      enemy: { ...battle.enemy, barrier: 2 },
      player: { ...battle.player, barrier: 1 },
    };
    battle = expireRoundEffects(battle);
    expect(battle.enemy.barrier).toBe(2);
    expect(battle.player.barrier).toBe(0);
  });

  it('expires enemy barrier after the player combo window', () => {
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      enemy: { ...battle.enemy, barrier: 2 },
    };
    battle = expireEnemyBarrier(battle);
    expect(battle.enemy.barrier).toBe(0);
  });

  it('lets enemy-gained barrier survive until the next player turn', () => {
    const actor = createActor(battleMachine).start();
    actor.send({
      type: 'START_BATTLE',
      progression: createInitialProgression(),
      enemy: {
        name: 'Test Sorcerer',
        portrait: '/characters/prisoner.glb',
        barrierPerTurn: 0,
        deckCardIds: Array.from({ length: 5 }, () => 'ritualist_ward'),
        startingShield: 0,
        maxShield: 0,
      },
      rng: { seed: 1, cursor: 0 },
    });

    expect(actor.getSnapshot().matches('playerTurn')).toBe(true);
    actor.send({ type: 'END_TURN' });

    let snap = actor.getSnapshot();
    while (
      snap.matches('animatingPlayerCard') ||
      snap.matches('resolvingPlayerCombo') ||
      snap.matches('enemyTurn') ||
      snap.matches('animatingEnemyCard') ||
      snap.matches('endOfRound') ||
      snap.matches('playerTurnStart')
    ) {
      if (snap.matches('animatingPlayerCard') || snap.matches('animatingEnemyCard')) {
        actor.send({ type: 'ANIMATION_COMPLETE' });
      }
      snap = actor.getSnapshot();
    }

    expect(snap.matches('playerTurn')).toBe(true);
    expect(snap.context.enemy.barrier).toBe(2);
  });
});
