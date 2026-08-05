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
  listImprovedPlayerCards,
  spentLevelsForClass,
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
  it('exposes twelve improved cards', () => {
    expect(listImprovedPlayerCards()).toHaveLength(12);
  });

  it('requires a free class level to unlock', () => {
    let progression = createInitialProgression();
    const loadout = createInitialLoadout();
    const cardId = 'improved_fighter_crushing_blow';

    expect(canUnlockImprovedCard(progression, loadout, cardId)).toBe(false);

    for (let i = 0; i < 10; i += 1) {
      progression = awardCardXp(progression, 'fighter');
    }
    expect(getClassXp(progression, 'fighter')).toBe(10);
    expect(canUnlockImprovedCard(progression, loadout, cardId)).toBe(true);

    const next = unlockImprovedCard(progression, loadout, cardId);
    expect(next).not.toBeNull();
    expect(next?.unlockedCardIds).toContain(cardId);
    expect(next?.deckCardIds).toContain(cardId);
    expect(spentLevelsForClass(next!, 'fighter')).toBe(1);
    expect(canUnlockImprovedCard(progression, next!, cardId)).toBe(false);
  });
});
