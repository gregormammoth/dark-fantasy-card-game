/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { createInitialLoadout } from '../progression/loadout';
import { explorationMachine } from '../../machine/explorationMachine';
import { rebuildExplorationDeck } from './setup';

describe('rebuildExplorationDeck mid-run', () => {
  it('adds newly unlocked loadout cards into the draw pile', () => {
    const loadout = createInitialLoadout();
    const actor = createActor(explorationMachine).start();
    actor.send({
      type: 'START_EXPLORATION',
      seed: 7,
      deckCardIds: loadout.deckCardIds,
    });

    const before = actor.getSnapshot();
    expect(before.matches('playerTurn')).toBe(true);

    const nextIds = [...loadout.deckCardIds, 'improved_warrior_crushing_blow'];
    const rebuilt = rebuildExplorationDeck(before.context, nextIds);
    actor.send({
      type: 'HYDRATE',
      context: rebuilt,
      phase: 'playerTurn',
    });

    const after = actor.getSnapshot();
    expect(after.matches('playerTurn')).toBe(true);
    const allIds = [...after.context.hand, ...after.context.deck, ...after.context.discard].map(
      (card) => card.definition.id,
    );
    expect(allIds).toContain('improved_warrior_crushing_blow');
    expect(allIds.filter((id) => nextIds.includes(id)).sort()).toEqual([...nextIds].sort());
  });

  it('removes cards dropped from the loadout', () => {
    const loadout = createInitialLoadout();
    const actor = createActor(explorationMachine).start();
    actor.send({
      type: 'START_EXPLORATION',
      seed: 3,
      deckCardIds: loadout.deckCardIds,
    });

    const removedId = loadout.deckCardIds[0];
    const nextIds = loadout.deckCardIds.slice(1);
    const before = actor.getSnapshot();
    actor.send({
      type: 'HYDRATE',
      context: rebuildExplorationDeck(before.context, nextIds),
      phase: 'playerTurn',
    });

    const after = actor.getSnapshot();
    const allIds = [...after.context.hand, ...after.context.deck, ...after.context.discard].map(
      (card) => card.definition.id,
    );
    expect(allIds).not.toContain(removedId);
    expect(allIds).toHaveLength(nextIds.length);
  });
});
