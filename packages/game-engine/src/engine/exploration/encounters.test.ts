/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { createInitialLoadout } from '../progression/loadout';
import { explorationMachine } from '../../machine/explorationMachine';
import { drawAndResolveEncounter, getEncounterDefinition } from './encounters';
import {
  addCardsToPile,
  discardFromHand,
  modifyExplorationMana,
  modifyExplorationShield,
  shufflePlayerCards,
} from './hand';
import { createInitialExploration } from './setup';
import { resolveLocationBattle } from './locationEncounters';

describe('exploration encounter pressure', () => {
  it('discards random cards from hand', () => {
    let exploration = createInitialExploration(42);
    exploration = {
      ...exploration,
      hand: exploration.deck.splice(0, 4),
    };
    const before = exploration.hand.length;
    exploration = discardFromHand(exploration, 2);
    expect(exploration.hand).toHaveLength(before - 2);
    expect(exploration.discard).toHaveLength(2);
  });

  it('shuffles all piles and keeps hand size', () => {
    let exploration = createInitialExploration(9);
    exploration = {
      ...exploration,
      hand: exploration.deck.splice(0, 4),
      discard: exploration.deck.splice(0, 2),
    };
    const total =
      exploration.hand.length + exploration.deck.length + exploration.discard.length;
    exploration = shufflePlayerCards(exploration, 'all');
    expect(exploration.hand).toHaveLength(4);
    expect(exploration.discard).toHaveLength(0);
    expect(
      exploration.hand.length + exploration.deck.length + exploration.discard.length,
    ).toBe(total);
  });

  it('adds cards into the deck', () => {
    let exploration = createInitialExploration(3);
    const before = exploration.deck.length;
    exploration = addCardsToPile(exploration, ['warrior_attack_01'], 'deck');
    expect(exploration.deck.length).toBe(before + 1);
    expect(exploration.deck.some((card) => card.definition.id === 'warrior_attack_01')).toBe(
      true,
    );
  });

  it('raises and lowers current shield within max', () => {
    let exploration = createInitialExploration(1);
    expect(exploration.shield).toBe(2);
    expect(exploration.maxShield).toBe(2);
    exploration = modifyExplorationShield(exploration, -1);
    expect(exploration.shield).toBe(1);
    expect(exploration.maxShield).toBe(2);
    exploration = modifyExplorationShield(exploration, 2);
    expect(exploration.shield).toBe(2);
    expect(exploration.maxShield).toBe(2);
  });

  it('raises and lowers current mana within max', () => {
    let exploration = createInitialExploration(1);
    expect(exploration.mana).toBe(2);
    expect(exploration.maxMana).toBe(2);
    exploration = modifyExplorationMana(exploration, -1);
    expect(exploration.mana).toBe(1);
    expect(exploration.maxMana).toBe(2);
    exploration = modifyExplorationMana(exploration, 2);
    expect(exploration.mana).toBe(2);
    expect(exploration.maxMana).toBe(2);
  });

  it('records encounter results for discard and shield beats', () => {
    const definition = getEncounterDefinition('hanging_ambush');
    expect(definition).toBeTruthy();

    let exploration = createInitialExploration(77);
    exploration = {
      ...exploration,
      hand: exploration.deck.splice(0, 4),
      encounterDeck: ['hanging_ambush'],
      encounterDiscard: [],
    };
    const resolved = drawAndResolveEncounter(exploration);
    expect(resolved.pendingEncounter?.id).toBe('hanging_ambush');
    expect(resolved.pendingEncounter?.results?.discarded.length).toBe(2);
    expect(resolved.pendingEncounter?.results?.shieldAfter).toBe(
      resolved.pendingEncounter!.results!.shieldBefore - 1,
    );
    expect(resolved.pendingEncounter?.results?.manaAfter).toBe(
      resolved.pendingEncounter!.results!.manaBefore - 1,
    );
  });

  it('fires an encounter after the next-turn refill, not before', () => {
    const loadout = createInitialLoadout();
    const actor = createActor(explorationMachine).start();
    actor.send({
      type: 'START_EXPLORATION',
      seed: 5,
      deckCardIds: loadout.deckCardIds,
    });
    expect(actor.getSnapshot().matches('playerTurn')).toBe(true);
    expect(actor.getSnapshot().context.hand).toHaveLength(4);
    expect(actor.getSnapshot().context.pendingEncounter).toBeNull();

    actor.send({ type: 'END_TURN' });
    const snap = actor.getSnapshot();
    expect(snap.matches('encounter')).toBe(true);
    expect(snap.context.pendingEncounter).not.toBeNull();
    expect(snap.context.hand.length + (snap.context.pendingEncounter?.results?.discarded.length ?? 0)).toBeGreaterThanOrEqual(4);
  });

  it('keeps post-encounter hand after dismiss instead of redrawing to 4', () => {
    const loadout = createInitialLoadout();
    const actor = createActor(explorationMachine).start();
    actor.send({
      type: 'START_EXPLORATION',
      seed: 11,
      deckCardIds: loadout.deckCardIds,
    });

    const beforeEnd = actor.getSnapshot().context;
    actor.send({
      type: 'HYDRATE',
      context: {
        ...beforeEnd,
        encounterDeck: ['hanging_ambush'],
        encounterDiscard: [],
      },
      phase: 'playerTurn',
    });
    actor.send({ type: 'END_TURN' });

    let snap = actor.getSnapshot();
    expect(snap.matches('encounter')).toBe(true);
    expect(snap.context.pendingEncounter?.id).toBe('hanging_ambush');
    expect(snap.context.hand).toHaveLength(2);

    actor.send({ type: 'DISMISS_ENCOUNTER' });
    snap = actor.getSnapshot();
    expect(snap.matches('playerTurn')).toBe(true);
    expect(snap.context.hand).toHaveLength(2);
  });

  it('restores shield to max after a won location battle', () => {
    let exploration = createInitialExploration(4);
    exploration = modifyExplorationShield(exploration, -1);
    expect(exploration.shield).toBe(1);
    exploration = resolveLocationBattle(exploration, true);
    expect(exploration.shield).toBe(exploration.maxShield);
  });

  it('restores mana to max after a won location battle', () => {
    let exploration = createInitialExploration(4);
    exploration = modifyExplorationMana(exploration, -1);
    expect(exploration.mana).toBe(1);
    exploration = resolveLocationBattle(exploration, true);
    expect(exploration.mana).toBe(exploration.maxMana);
  });

  it('does not restore shield after a lost location battle', () => {
    let exploration = createInitialExploration(4);
    exploration = modifyExplorationShield(exploration, -1);
    exploration = resolveLocationBattle(exploration, false);
    expect(exploration.shield).toBe(1);
  });

  it('does not restore mana after a lost location battle', () => {
    let exploration = createInitialExploration(4);
    exploration = modifyExplorationMana(exploration, -1);
    exploration = resolveLocationBattle(exploration, false);
    expect(exploration.mana).toBe(1);
  });
});
