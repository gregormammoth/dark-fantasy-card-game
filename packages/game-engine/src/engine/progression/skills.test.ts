/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import { PLAYER_SKILL_BASE, PLAYER_SKILL_CEILING } from '@dark-fantasy/shared/types/progression';
import { createInitialProgression, normalizeProgression } from './xp';
import {
  applySkillsToExplorationCaps,
  canChooseSkill,
  chooseSkill,
  getAvailableSkillPoints,
  getPlayerLevel,
  getPlayerLevelProgress,
  getTotalClassLevels,
} from './skills';

describe('player level and skills', () => {
  it('derives player level from total class levels', () => {
    let progression = createInitialProgression();
    progression = {
      ...progression,
      classes: {
        ...progression.classes,
        warrior: { xp: 30 },
        rogue: { xp: 20 },
      },
    };
    expect(getTotalClassLevels(progression)).toBe(5);
    expect(getPlayerLevel(progression)).toBe(1);
    expect(getPlayerLevelProgress(progression)).toEqual({ current: 0, total: 5 });
    expect(getAvailableSkillPoints(progression)).toBe(1);
  });

  it('spends a skill point and raises the chosen skill', () => {
    let progression = createInitialProgression();
    progression = {
      ...progression,
      classes: {
        ...progression.classes,
        warrior: { xp: 50 },
      },
    };
    expect(getAvailableSkillPoints(progression)).toBe(1);
    const next = chooseSkill(progression, 'maxCombo');
    expect(next).not.toBeNull();
    expect(next!.skills.maxCombo).toBe(PLAYER_SKILL_BASE.maxCombo + 1);
    expect(getAvailableSkillPoints(next!)).toBe(0);
  });

  it('blocks picks at the soft ceiling and without points', () => {
    const progression = createInitialProgression();
    expect(canChooseSkill(progression, 'maxShield')).toBe(false);

    let capped = createInitialProgression();
    capped = {
      ...capped,
      classes: {
        ...capped.classes,
        warrior: { xp: 150 },
      },
      skills: {
        ...PLAYER_SKILL_BASE,
        maxShield: PLAYER_SKILL_CEILING.maxShield,
      },
    };
    expect(getAvailableSkillPoints(capped)).toBeGreaterThan(0);
    expect(canChooseSkill(capped, 'maxShield')).toBe(false);
    expect(canChooseSkill(capped, 'maxMana')).toBe(true);
  });

  it('normalizes missing skills on old saves', () => {
    const normalized = normalizeProgression({
      classes: {
        warrior: { xp: 0 },
        rogue: { xp: 0 },
        wizard: { xp: 0 },
        survivor: { xp: 0 },
        seeker: { xp: 0 },
      },
    });
    expect(normalized.skills).toEqual(PLAYER_SKILL_BASE);
  });

  it('keeps resources full when raising exploration caps', () => {
    const caps = applySkillsToExplorationCaps(2, 2, 2, 2, {
      ...PLAYER_SKILL_BASE,
      maxShield: 3,
      maxMana: 3,
    });
    expect(caps).toEqual({ maxShield: 3, shield: 3, maxMana: 3, mana: 3 });
  });
});
