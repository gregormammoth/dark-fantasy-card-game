import type { CardClass } from '@dark-fantasy/shared/types/card';
import type {
  PlayerProgression,
  PlayerSkillId,
  PlayerSkills,
} from '@dark-fantasy/shared/types/progression';
import {
  CLASS_LEVELS_PER_PLAYER_LEVEL,
  PLAYER_SKILL_BASE,
  PLAYER_SKILL_CEILING,
  PLAYER_SKILL_IDS,
  XP_PER_CLASS_LEVEL,
} from '@dark-fantasy/shared/types/progression';

const PLAYER_CLASSES: CardClass[] = ['warrior', 'rogue', 'wizard', 'survivor', 'seeker'];

export function createInitialSkills(): PlayerSkills {
  return { ...PLAYER_SKILL_BASE };
}

export function normalizeSkills(raw: Partial<PlayerSkills> | undefined): PlayerSkills {
  const next = { ...PLAYER_SKILL_BASE };
  if (!raw) {
    return next;
  }
  for (const skillId of PLAYER_SKILL_IDS) {
    const value = raw[skillId];
    if (typeof value === 'number' && Number.isFinite(value)) {
      next[skillId] = Math.max(
        PLAYER_SKILL_BASE[skillId],
        Math.min(PLAYER_SKILL_CEILING[skillId], Math.floor(value)),
      );
    }
  }
  return next;
}

function classLevelFromXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_CLASS_LEVEL);
}

export function getTotalClassLevels(progression: PlayerProgression): number {
  return PLAYER_CLASSES.reduce(
    (sum, classId) => sum + classLevelFromXp(progression.classes[classId]?.xp ?? 0),
    0,
  );
}

export function getPlayerLevel(progression: PlayerProgression): number {
  return Math.floor(getTotalClassLevels(progression) / CLASS_LEVELS_PER_PLAYER_LEVEL);
}

export function getPlayerLevelProgress(progression: PlayerProgression): {
  current: number;
  total: number;
} {
  return {
    current: getTotalClassLevels(progression) % CLASS_LEVELS_PER_PLAYER_LEVEL,
    total: CLASS_LEVELS_PER_PLAYER_LEVEL,
  };
}

export function getSpentSkillPoints(progression: PlayerProgression): number {
  const skills = progression.skills ?? PLAYER_SKILL_BASE;
  return PLAYER_SKILL_IDS.reduce(
    (sum, skillId) => sum + Math.max(0, skills[skillId] - PLAYER_SKILL_BASE[skillId]),
    0,
  );
}

export function getAvailableSkillPoints(progression: PlayerProgression): number {
  return Math.max(0, getPlayerLevel(progression) - getSpentSkillPoints(progression));
}

export function canChooseSkill(
  progression: PlayerProgression,
  skillId: PlayerSkillId,
): boolean {
  if (getAvailableSkillPoints(progression) <= 0) {
    return false;
  }
  const skills = progression.skills ?? PLAYER_SKILL_BASE;
  return skills[skillId] < PLAYER_SKILL_CEILING[skillId];
}

export function chooseSkill(
  progression: PlayerProgression,
  skillId: PlayerSkillId,
): PlayerProgression | null {
  if (!canChooseSkill(progression, skillId)) {
    return null;
  }
  const skills = { ...(progression.skills ?? PLAYER_SKILL_BASE) };
  skills[skillId] += 1;
  return {
    ...progression,
    skills,
  };
}

export function getDeckCap(progression: PlayerProgression): number {
  return progression.skills?.maxDeck ?? PLAYER_SKILL_BASE.maxDeck;
}

export function getComboCap(progression: PlayerProgression): number {
  return progression.skills?.maxCombo ?? PLAYER_SKILL_BASE.maxCombo;
}

export function getDrawPerTurn(progression: PlayerProgression): number {
  return progression.skills?.drawPerTurn ?? PLAYER_SKILL_BASE.drawPerTurn;
}

export function applySkillsToExplorationCaps(
  maxShield: number,
  shield: number,
  maxMana: number,
  mana: number,
  skills: PlayerSkills,
): { maxShield: number; shield: number; maxMana: number; mana: number } {
  const nextMaxShield = skills.maxShield;
  const nextMaxMana = skills.maxMana;
  const shieldWasFull = shield >= maxShield;
  const manaWasFull = mana >= maxMana;
  return {
    maxShield: nextMaxShield,
    shield: shieldWasFull
      ? nextMaxShield
      : Math.max(0, Math.min(nextMaxShield, shield)),
    maxMana: nextMaxMana,
    mana: manaWasFull ? nextMaxMana : Math.max(0, Math.min(nextMaxMana, mana)),
  };
}
