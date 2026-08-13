/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import {
  awardCardXp,
  createInitialProgression,
  getAvailableClassLevels,
  getClassLevel,
  getClassXp,
  getXpIntoLevel,
} from './xp';
import {
  canUnlockImprovedCard,
  createInitialLoadout,
  DECK_CAP,
  getCardsForClass,
  getDominantDeckClass,
  getPlayerPortraitForDeck,
  listImprovedPlayerCards,
  replaceDeckCard,
  spentLevelsForClass,
  toggleDeckCard,
  unlockImprovedCard,
} from './loadout';

describe('class levels', () => {
  it('uses 10 xp per level', () => {
    expect(getClassLevel(0)).toBe(0);
    expect(getClassLevel(9)).toBe(0);
    expect(getClassLevel(10)).toBe(1);
    expect(getClassLevel(25)).toBe(2);
    expect(getXpIntoLevel(25)).toBe(5);
  });

  it('tracks available levels after spending', () => {
    expect(getAvailableClassLevels(30, 1)).toBe(2);
  });
});

describe('improved card unlocks', () => {
  it('exposes fifteen improved cards', () => {
    expect(listImprovedPlayerCards()).toHaveLength(15);
  });

  it('requires a free class level to unlock', () => {
    let progression = createInitialProgression();
    const loadout = createInitialLoadout();
    const cardId = 'improved_warrior_crushing_blow';

    expect(canUnlockImprovedCard(progression, loadout, cardId)).toBe(false);

    for (let i = 0; i < 10; i += 1) {
      progression = awardCardXp(progression, 'warrior');
    }
    expect(getClassXp(progression, 'warrior')).toBe(10);
    expect(canUnlockImprovedCard(progression, loadout, cardId)).toBe(true);

    const replaceId = loadout.deckCardIds[0];
    expect(unlockImprovedCard(progression, loadout, cardId)).toBeNull();

    const next = unlockImprovedCard(progression, loadout, cardId, replaceId);
    expect(next).not.toBeNull();
    expect(next?.unlockedCardIds).toContain(cardId);
    expect(next?.deckCardIds).toContain(cardId);
    expect(next?.deckCardIds).not.toContain(replaceId);
    expect(next?.deckCardIds).toHaveLength(DECK_CAP);
    expect(spentLevelsForClass(next!, 'warrior')).toBe(1);
    expect(canUnlockImprovedCard(progression, next!, cardId)).toBe(false);
  });
});

describe('deck size', () => {
  it('does not remove a card when the deck is at the cap', () => {
    const loadout = createInitialLoadout();
    const cardId = loadout.deckCardIds[0];
    const next = toggleDeckCard(loadout, cardId);
    expect(next.deckCardIds).toEqual(loadout.deckCardIds);
  });

  it('swaps a deck card for an unlocked card that is not in the deck', () => {
    const loadout = createInitialLoadout();
    const removeId = loadout.deckCardIds[0];
    const addId = 'improved_warrior_crushing_blow';
    const unlocked = {
      ...loadout,
      unlockedCardIds: [...loadout.unlockedCardIds, addId],
    };
    const next = replaceDeckCard(unlocked, addId, removeId);
    expect(next?.deckCardIds).toContain(addId);
    expect(next?.deckCardIds).not.toContain(removeId);
    expect(next?.deckCardIds).toHaveLength(DECK_CAP);
  });
});

describe('deck-driven player portrait', () => {
  it('picks the class with the most cards in the deck', () => {
    const wizardIds = getCardsForClass('wizard').map((card) => card.id);
    const rogueIds = getCardsForClass('rogue').map((card) => card.id);
    const deck = [...wizardIds, ...rogueIds.slice(0, 1)];

    expect(getDominantDeckClass(deck)).toBe('wizard');
    expect(getPlayerPortraitForDeck(deck)).toBe('/characters/player_wizard.png');
  });

  it('falls back to warrior for an empty deck', () => {
    expect(getDominantDeckClass([])).toBe('warrior');
    expect(getPlayerPortraitForDeck([])).toBe('/characters/player_fighter.png');
  });

  it('includes seeker cards in the starter deck', () => {
    const loadout = createInitialLoadout();
    expect(loadout.unlockedCardIds.some((id) => id.startsWith('seeker_'))).toBe(true);
    expect(loadout.deckCardIds).toEqual(
      expect.arrayContaining([
        'seeker_defense_01',
        'seeker_defense_02',
        'seeker_attack_01',
      ]),
    );
    expect(loadout.deckCardIds).toHaveLength(15);
    expect(loadout.deckCardIds.length).toBeLessThanOrEqual(DECK_CAP);
  });
});
