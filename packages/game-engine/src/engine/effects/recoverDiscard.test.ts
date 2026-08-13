/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import { createInitialBattle } from '../battleSetup';
import { addToCombo, beginPlayerResolution, resolveNextComboCard, resolveEnemyTurn } from '../combo';
import { createInitialProgression } from '../progression/xp';

function makeCard(
  id: string,
  definition: Partial<CardDefinition> & Pick<CardDefinition, 'effects'>,
): CardInstance {
  return {
    instanceId: `${id}_instance`,
    definition: {
      id,
      name: id,
      type: 'defense',
      ...definition,
    },
  };
}

describe('recoverDiscard', () => {
  it('returns discarded cards to the player hand', () => {
    const discarded = makeCard('old', { effects: [{ type: 'damage', value: 1 }] });
    const recover = makeCard('second_chance', {
      effects: [{ type: 'recoverDiscard', count: 1 }],
    });
    let battle = createInitialBattle(createInitialProgression());
    battle = {
      ...battle,
      player: {
        ...battle.player,
        hand: [recover],
        discard: [discarded],
      },
    };
    battle = addToCombo(battle, recover.instanceId);
    battle = beginPlayerResolution(battle);
    battle = resolveNextComboCard(battle);

    expect(battle.player.hand.map((card) => card.instanceId)).toContain(discarded.instanceId);
    expect(battle.player.discard.map((card) => card.instanceId)).not.toContain(discarded.instanceId);
  });

  it('returns discarded cards to the enemy deck instead of the player hand', () => {
    const discarded = [
      makeCard('bone_1', { effects: [{ type: 'shield', value: 1 }] }),
      makeCard('bone_2', { effects: [{ type: 'shield', value: 1 }] }),
      makeCard('bone_3', { effects: [{ type: 'shield', value: 1 }] }),
    ];
    const rise = makeCard('undead_rise_again', {
      name: 'Rise Again',
      effects: [{ type: 'recoverDiscard', count: 3 }],
    });
    let battle = createInitialBattle(createInitialProgression());
    const playerHandSize = battle.player.hand.length;
    const recoveredIds = discarded.map((card) => card.instanceId);
    battle = {
      ...battle,
      enemy: {
        ...battle.enemy,
        deck: [rise],
        discard: discarded,
      },
    };
    battle = resolveEnemyTurn(battle);

    expect(battle.player.hand).toHaveLength(playerHandSize);
    expect(battle.enemy.discard.map((card) => card.instanceId)).not.toEqual(
      expect.arrayContaining(recoveredIds),
    );
    expect(battle.enemy.deck.map((card) => card.instanceId)).toEqual(
      expect.arrayContaining(recoveredIds),
    );
  });
});
