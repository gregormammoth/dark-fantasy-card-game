/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import {
  awardCardXp,
  createInitialProgression,
  getClassXp,
  listPlayerClasses,
} from './xp';

describe('progression xp', () => {
  it('starts every class at zero xp', () => {
    const progression = createInitialProgression();

    for (const classId of listPlayerClasses()) {
      expect(getClassXp(progression, classId)).toBe(0);
    }
  });

  it('awards +1 fighter xp', () => {
    const next = awardCardXp(createInitialProgression(), 'warrior');
    expect(getClassXp(next, 'warrior')).toBe(1);
  });

  it('awards +1 wizard xp', () => {
    const next = awardCardXp(createInitialProgression(), 'wizard');
    expect(getClassXp(next, 'wizard')).toBe(1);
  });

  it('awards +1 rogue xp', () => {
    const next = awardCardXp(createInitialProgression(), 'rogue');
    expect(getClassXp(next, 'rogue')).toBe(1);
  });

  it('awards +1 survivor xp', () => {
    const next = awardCardXp(createInitialProgression(), 'survivor');
    expect(getClassXp(next, 'survivor')).toBe(1);
  });

  it('awards +1 seeker xp', () => {
    const next = awardCardXp(createInitialProgression(), 'seeker');
    expect(getClassXp(next, 'seeker')).toBe(1);
  });

  it('accumulates xp for repeated awards', () => {
    let progression = createInitialProgression();
    progression = awardCardXp(progression, 'warrior');
    progression = awardCardXp(progression, 'warrior');
    expect(getClassXp(progression, 'warrior')).toBe(2);
  });

  it('only updates the awarded class', () => {
    let progression = createInitialProgression();
    progression = awardCardXp(progression, 'warrior');
    progression = awardCardXp(progression, 'warrior');
    progression = awardCardXp(progression, 'wizard');

    expect(getClassXp(progression, 'warrior')).toBe(2);
    expect(getClassXp(progression, 'wizard')).toBe(1);
    expect(getClassXp(progression, 'rogue')).toBe(0);
    expect(getClassXp(progression, 'survivor')).toBe(0);
  });

  it('does not mutate the previous progression object', () => {
    const initial = createInitialProgression();
    const next = awardCardXp(initial, 'rogue');

    expect(getClassXp(initial, 'rogue')).toBe(0);
    expect(getClassXp(next, 'rogue')).toBe(1);
    expect(next).not.toBe(initial);
    expect(next.classes).not.toBe(initial.classes);
  });

  it('preserves skills when awarding class xp', () => {
    const initial = createInitialProgression();
    initial.skills.maxCombo = 3;
    const next = awardCardXp(initial, 'wizard');
    expect(next.skills.maxCombo).toBe(3);
  });
});
