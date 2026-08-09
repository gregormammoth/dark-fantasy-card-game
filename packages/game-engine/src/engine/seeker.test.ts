/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import type { BattleContext } from '@dark-fantasy/shared/types/battle';
import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import { createInitialBattle } from './battleSetup';
import { addToCombo, beginPlayerResolution, resolveNextComboCard } from './combo';
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
      class: 'seeker',
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

describe('seeker effects', () => {
  it('marks the enemy and boosts weak-point strike', () => {
    const mark = makeCard('mark', {
      type: 'defense',
      effects: [{ type: 'markEnemy' }],
    });
    const strike = makeCard('strike', {
      type: 'attack',
      effects: [
        { type: 'ignoreShieldIfMarked' },
        { type: 'bonusIfMarked', damage: 2 },
        { type: 'damage', value: 2 },
      ],
    });
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      player: { ...battle.player, hand: [mark, strike] },
      enemy: {
        ...battle.enemy,
        shield: 2,
        deck: Array.from({ length: 20 }, (_, index) =>
          makeCard(`e_${index}`, { effects: [{ type: 'damage', value: 1 }] }),
        ),
      },
    };
    const before = getEnemyHealth(battle);
    battle = addToCombo(battle, mark.instanceId);
    battle = addToCombo(battle, strike.instanceId);
    battle = resolveCombo(battle);
    expect(battle.enemyMarked).toBe(true);
    expect(battle.enemy.shield).toBe(2);
    expect(getEnemyHealth(battle)).toBe(before - 4);
  });

  it('scales anatomy lesson with cards drawn this battle', () => {
    const lesson = makeCard('lesson', {
      type: 'attack',
      effects: [
        { type: 'bonusDamagePerCardDrawn', value: 1 },
        { type: 'damage', value: 2 },
      ],
    });
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      playerCardsDrawnThisBattle: 3,
      player: { ...battle.player, hand: [lesson] },
      enemy: {
        ...battle.enemy,
        shield: 0,
        deck: Array.from({ length: 20 }, (_, index) =>
          makeCard(`e_${index}`, { effects: [{ type: 'damage', value: 1 }] }),
        ),
      },
    };
    const before = getEnemyHealth(battle);
    battle = addToCombo(battle, lesson.instanceId);
    battle = resolveCombo(battle);
    expect(getEnemyHealth(battle)).toBe(before - 5);
  });

  it('plays draw cards instantly outside the combo', () => {
    const survey = makeCard('survey', {
      type: 'defense',
      effects: [{ type: 'draw', count: 2 }],
    });
    const filler = makeCard('filler_a', {
      type: 'attack',
      effects: [{ type: 'damage', value: 1 }],
    });
    const filler2 = makeCard('filler_b', {
      type: 'attack',
      effects: [{ type: 'damage', value: 1 }],
    });
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      player: {
        ...battle.player,
        hand: [survey],
        deck: [filler, filler2],
        discard: [],
      },
      combo: [
        makeCard('already_in_combo', {
          type: 'attack',
          effects: [{ type: 'damage', value: 1 }],
        }),
        makeCard('combo_full', {
          type: 'attack',
          effects: [{ type: 'damage', value: 1 }],
        }),
      ],
    };
    expect(battle.combo).toHaveLength(2);
    battle = addToCombo(battle, survey.instanceId);
    expect(battle.combo).toHaveLength(2);
    expect(battle.player.hand.map((card) => card.definition.id).sort()).toEqual([
      'filler_a',
      'filler_b',
    ]);
    expect(battle.player.discard.some((card) => card.definition.id === 'survey')).toBe(true);
    expect(battle.playerCardsDrawnThisBattle).toBe(2);
  });
});
