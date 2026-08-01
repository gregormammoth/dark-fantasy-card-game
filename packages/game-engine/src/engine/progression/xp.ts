import type { CardClass } from '@dark-fantasy/shared/types/card';
import type { PlayerProgression } from '@dark-fantasy/shared/types/progression';

const PLAYER_CLASSES: CardClass[] = ['fighter', 'rogue', 'wizard', 'survivor'];

export function createInitialProgression(): PlayerProgression {
  return {
    classes: {
      fighter: { xp: 0 },
      rogue: { xp: 0 },
      wizard: { xp: 0 },
      survivor: { xp: 0 },
    },
  };
}

export function awardCardXp(
  progression: PlayerProgression,
  classId: CardClass,
): PlayerProgression {
  const current = progression.classes[classId];
  if (!current) {
    return progression;
  }

  return {
    classes: {
      ...progression.classes,
      [classId]: {
        xp: current.xp + 1,
      },
    },
  };
}

export function getClassXp(progression: PlayerProgression, classId: CardClass): number {
  return progression.classes[classId]?.xp ?? 0;
}

export function getTotalXp(progression: PlayerProgression): number {
  return listPlayerClasses().reduce(
    (sum, classId) => sum + getClassXp(progression, classId),
    0,
  );
}

export function getXpGained(
  before: PlayerProgression,
  after: PlayerProgression,
): Record<CardClass, number> {
  const gained = {} as Record<CardClass, number>;
  for (const classId of listPlayerClasses()) {
    gained[classId] = Math.max(
      0,
      getClassXp(after, classId) - getClassXp(before, classId),
    );
  }
  return gained;
}

export function getTotalXpGained(
  before: PlayerProgression,
  after: PlayerProgression,
): number {
  return Object.values(getXpGained(before, after)).reduce((sum, value) => sum + value, 0);
}

export function listPlayerClasses(): readonly CardClass[] {
  return PLAYER_CLASSES;
}
