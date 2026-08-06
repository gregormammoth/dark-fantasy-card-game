/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import { createInitialBattle } from './battleSetup';
import { createInitialProgression } from './progression/xp';
import { createInitialLoadout } from './progression/loadout';

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
    const deckIds = ['hand_a', 'hand_b', 'deck_a', 'discard_a', 'discard_b', 'discard_c'];

    const battle = createInitialBattle(
      createInitialProgression(),
      undefined,
      { seed: 7, cursor: 0 },
      deckIds,
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

  it('injects loadout cards missing from exploration piles into the battle deck', () => {
    const loadout = createInitialLoadout();
    const baseIds = loadout.deckCardIds;
    const hand = [makeCard(baseIds[0]), makeCard(baseIds[1])];
    const deck = baseIds.slice(2, 8).map((id) => makeCard(id));
    const discard = baseIds.slice(8).map((id) => makeCard(id));
    const withImproved = [...baseIds, 'improved_fighter_crushing_blow', 'improved_rogue_assassinate'];

    const battle = createInitialBattle(
      createInitialProgression(),
      undefined,
      { seed: 11, cursor: 0 },
      withImproved,
      'man',
      { hand, deck, discard },
    );

    const allIds = [...battle.player.hand, ...battle.player.deck, ...battle.player.discard].map(
      (card) => card.definition.id,
    );
    expect(allIds).toContain('improved_fighter_crushing_blow');
    expect(allIds).toContain('improved_rogue_assassinate');
    expect(allIds).toHaveLength(withImproved.length);
    expect(battle.player.hand.map((card) => card.definition.id).sort()).toEqual(
      [baseIds[0], baseIds[1]].sort(),
    );
    expect(battle.playerMaxHealth).toBe(withImproved.length);
  });
});
