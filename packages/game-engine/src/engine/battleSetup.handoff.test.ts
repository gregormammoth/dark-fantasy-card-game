/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import { createInitialBattle } from './battleSetup';
import { createInitialProgression } from './progression/xp';

function makeCard(id: string): CardInstance {
  const definition: CardDefinition = {
    id,
    name: id,
    class: 'fighter',
    type: 'attack',
    effects: [{ type: 'damage', value: 1 }],
  };
  return {
    instanceId: `${id}_1`,
    definition,
  };
}

describe('createInitialBattle exploration handoff', () => {
  it('keeps the exploration hand and shuffles remaining cards into the battle deck', () => {
    const hand = [makeCard('hand_a'), makeCard('hand_b')];
    const deck = [makeCard('deck_a')];
    const discard = [makeCard('discard_a'), makeCard('discard_b'), makeCard('discard_c')];

    const battle = createInitialBattle(
      createInitialProgression(),
      undefined,
      { seed: 7, cursor: 0 },
      ['fighter_attack_01'],
      'man',
      { hand, deck, discard },
    );

    expect(battle.player.hand.map((card) => card.instanceId).sort()).toEqual(
      ['hand_a_1', 'hand_b_1'].sort(),
    );
    expect(battle.player.discard).toEqual([]);
    expect(battle.player.deck).toHaveLength(4);
    expect(battle.player.deck.map((card) => card.instanceId).sort()).toEqual(
      ['deck_a_1', 'discard_a_1', 'discard_b_1', 'discard_c_1'].sort(),
    );
    expect(battle.playerMaxHealth).toBe(6);
  });
});
