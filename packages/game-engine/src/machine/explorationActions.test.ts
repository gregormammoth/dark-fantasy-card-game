/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import type { ExplorationContext } from '@dark-fantasy/shared/types/exploration';
import { createInitialLoadout } from '../engine/progression/loadout';
import { canMoveTo } from '../engine/exploration/map';
import { explorationMachine } from './explorationMachine';

function startExploration(seed: number) {
  const loadout = createInitialLoadout();
  const actor = createActor(explorationMachine).start();
  actor.send({
    type: 'START_EXPLORATION',
    seed,
    deckCardIds: loadout.deckCardIds,
  });
  return actor;
}

function firstReachableId(context: ExplorationContext): string | undefined {
  return Object.keys(context.locations).find(
    (id) => id !== context.currentLocationId && canMoveTo(context, id),
  );
}

describe('exploration actions spend an explicit card', () => {
  it('plays an action with a card passed in the event, without pre-selecting it', () => {
    const actor = startExploration(21);
    const before = actor.getSnapshot().context;
    const target = firstReachableId(before);
    expect(target).toBeTruthy();
    expect(before.selectedCardInstanceId).toBeNull();

    const card = before.hand[0]!;
    actor.send({
      type: 'PLAY_ACTION',
      action: 'MOVE',
      targetId: target,
      cardInstanceId: card.instanceId,
    });

    const after = actor.getSnapshot().context;
    expect(after.currentLocationId).toBe(target);
    expect(after.actionsRemaining).toBe(before.actionsRemaining - 1);
    expect(after.hand.some((item) => item.instanceId === card.instanceId)).toBe(false);
    expect(after.discard.some((item) => item.instanceId === card.instanceId)).toBe(true);
  });

  it('spends the card the player named, not the first in hand', () => {
    const actor = startExploration(33);
    const before = actor.getSnapshot().context;
    const target = firstReachableId(before);
    const chosen = before.hand[2] ?? before.hand[before.hand.length - 1]!;

    actor.send({
      type: 'PLAY_ACTION',
      action: 'MOVE',
      targetId: target,
      cardInstanceId: chosen.instanceId,
    });

    const after = actor.getSnapshot().context;
    expect(after.discard.some((item) => item.instanceId === chosen.instanceId)).toBe(true);
    expect(after.hand).toHaveLength(before.hand.length - 1);
  });

  it('still refuses an action when no card is selected or named', () => {
    const actor = startExploration(21);
    const before = actor.getSnapshot().context;
    const target = firstReachableId(before);

    actor.send({ type: 'PLAY_ACTION', action: 'MOVE', targetId: target });

    const after = actor.getSnapshot().context;
    expect(after.currentLocationId).toBe(before.currentLocationId);
    expect(after.actionsRemaining).toBe(before.actionsRemaining);
    expect(after.hand).toHaveLength(before.hand.length);
  });

  it('ignores a card that is not in hand', () => {
    const actor = startExploration(21);
    const before = actor.getSnapshot().context;
    const target = firstReachableId(before);

    actor.send({
      type: 'PLAY_ACTION',
      action: 'MOVE',
      targetId: target,
      cardInstanceId: 'not-a-real-instance',
    });

    const after = actor.getSnapshot().context;
    expect(after.currentLocationId).toBe(before.currentLocationId);
    expect(after.hand).toHaveLength(before.hand.length);
  });

  it('prefers the named card over an existing selection', () => {
    const actor = startExploration(45);
    const before = actor.getSnapshot().context;
    const target = firstReachableId(before);
    const selected = before.hand[0]!;
    const named = before.hand[1]!;

    actor.send({ type: 'SELECT_CARD', cardInstanceId: selected.instanceId });
    actor.send({
      type: 'PLAY_ACTION',
      action: 'MOVE',
      targetId: target,
      cardInstanceId: named.instanceId,
    });

    const after = actor.getSnapshot().context;
    expect(after.discard.some((item) => item.instanceId === named.instanceId)).toBe(true);
    expect(after.hand.some((item) => item.instanceId === selected.instanceId)).toBe(true);
  });
});
