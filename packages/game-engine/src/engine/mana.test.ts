/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import type { BattleContext } from '@dark-fantasy/shared/types/battle';
import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import { createInitialBattle } from './battleSetup';
import { addToCombo, beginPlayerResolution, resolveNextComboCard } from './combo';
import { previewCombo } from './comboPreview';
import { getEnemyHealth } from './health';
import { createInitialProgression } from './progression/xp';

function makeCard(
  id: string,
  definition: Partial<CardDefinition> & Pick<CardDefinition, 'effects'>,
): CardInstance {
  return {
    instanceId: `${id}_instance`,
    definition: {
      id,
      name: id,
      type: 'attack',
      ...definition,
    },
  };
}

function resolveCombo(battle: BattleContext): BattleContext {
  let next = beginPlayerResolution(battle);
  while (next.resolutionQueue.length > 0) {
    next = resolveNextComboCard(next);
    next = { ...next, activePlay: null };
  }
  return next;
}

describe('mana', () => {
  it('starts battles at 2 / 2 mana', () => {
    const battle = createInitialBattle(createInitialProgression());
    expect(battle.playerMana).toBe(2);
    expect(battle.playerMaxMana).toBe(2);
  });

  it('gains mana up to the cap', () => {
    const focus = makeCard('focus', {
      type: 'defense',
      effects: [{ type: 'gainMana', value: 1 }],
    });
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      playerMana: 0,
      player: { ...battle.player, hand: [focus, focus] },
    };
    battle = addToCombo(battle, focus.instanceId);
    battle = resolveCombo(battle);
    expect(battle.playerMana).toBe(1);

    const focus2: CardInstance = {
      instanceId: 'focus_2',
      definition: focus.definition,
    };
    battle = {
      ...battle,
      player: { ...battle.player, hand: [focus2] },
      combo: [],
      resolutionQueue: [],
    };
    battle = addToCombo(battle, focus2.instanceId);
    battle = resolveCombo(battle);
    expect(battle.playerMana).toBe(2);

    const focus3: CardInstance = {
      instanceId: 'focus_3',
      definition: { ...focus.definition, effects: [{ type: 'gainMana', value: 2 }] },
    };
    battle = {
      ...battle,
      player: { ...battle.player, hand: [focus3] },
      combo: [],
      resolutionQueue: [],
    };
    battle = addToCombo(battle, focus3.instanceId);
    battle = resolveCombo(battle);
    expect(battle.playerMana).toBe(2);
  });

  it('spends mana to boost pierce damage', () => {
    const bolt = makeCard('bolt', {
      type: 'attack',
      effects: [
        { type: 'ignoreShield' },
        { type: 'bonusDamagePerMana', value: 1 },
        { type: 'damage', value: 2 },
      ],
    });
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      playerMana: 2,
      player: { ...battle.player, hand: [bolt] },
      enemy: {
        ...battle.enemy,
        shield: 0,
        deck: Array.from({ length: 20 }, (_, index) =>
          makeCard(`e_${index}`, { effects: [{ type: 'damage', value: 1 }] }),
        ),
      },
    };
    const before = getEnemyHealth(battle);
    battle = addToCombo(battle, bolt.instanceId);
    battle = resolveCombo(battle);
    expect(before - getEnemyHealth(battle)).toBe(4);
    expect(battle.playerMana).toBe(0);
  });

  it('spends mana to boost barrier', () => {
    const ward = makeCard('ward', {
      type: 'defense',
      effects: [
        { type: 'bonusBarrierPerMana', value: 1 },
        { type: 'barrier', value: 2 },
      ],
    });
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      playerMana: 2,
      player: { ...battle.player, hand: [ward], barrier: 0 },
    };
    battle = addToCombo(battle, ward.instanceId);
    battle = resolveCombo(battle);
    expect(battle.player.barrier).toBe(4);
    expect(battle.playerMana).toBe(0);
  });

  it('previews focus into bolt mana spend in one combo', () => {
    const focus = makeCard('focus', {
      type: 'defense',
      effects: [{ type: 'gainMana', value: 1 }],
    });
    const bolt = makeCard('bolt', {
      type: 'attack',
      effects: [
        { type: 'ignoreShield' },
        { type: 'bonusDamagePerMana', value: 1 },
        { type: 'damage', value: 2 },
      ],
    });
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      playerMana: 0,
      player: { ...battle.player, hand: [focus, bolt] },
      enemy: {
        ...battle.enemy,
        shield: 0,
        deck: Array.from({ length: 20 }, (_, index) =>
          makeCard(`e_${index}`, { effects: [{ type: 'damage', value: 1 }] }),
        ),
      },
    };
    battle = addToCombo(battle, focus.instanceId);
    battle = addToCombo(battle, bolt.instanceId);
    const preview = previewCombo(battle);
    expect(preview?.totalDamageToEnemy).toBe(3);
    expect(preview?.manaDelta).toBe(0);
  });
});
