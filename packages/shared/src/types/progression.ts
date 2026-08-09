import type { CardClass } from './card';

export const XP_PER_CLASS_LEVEL = 10;
export const IMPROVED_CARD_LEVEL_COST = 1;
export const CLASS_LEVELS_PER_PLAYER_LEVEL = 5;

export type PlayerSkillId =
  | 'maxShield'
  | 'maxCombo'
  | 'maxMana'
  | 'maxDeck'
  | 'drawPerTurn';

export type PlayerSkills = {
  maxShield: number;
  maxCombo: number;
  maxMana: number;
  maxDeck: number;
  drawPerTurn: number;
};

export const PLAYER_SKILL_BASE: PlayerSkills = {
  maxShield: 2,
  maxCombo: 2,
  maxMana: 2,
  maxDeck: 15,
  drawPerTurn: 1,
};

export const PLAYER_SKILL_CEILING: PlayerSkills = {
  maxShield: 4,
  maxCombo: 5,
  maxMana: 5,
  maxDeck: 18,
  drawPerTurn: 3,
};

export const PLAYER_SKILL_IDS: readonly PlayerSkillId[] = [
  'maxShield',
  'maxCombo',
  'maxMana',
  'maxDeck',
  'drawPerTurn',
];

export interface ClassProgress {
  xp: number;
}

export type PlayerProgression = {
  classes: Record<CardClass, ClassProgress>;
  skills: PlayerSkills;
};

export interface PlayerLoadout {
  unlockedCardIds: string[];
  deckCardIds: string[];
};
