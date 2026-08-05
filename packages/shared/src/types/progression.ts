import type { CardClass } from './card';

export const XP_PER_CLASS_LEVEL = 10;
export const IMPROVED_CARD_LEVEL_COST = 1;

export interface ClassProgress {
  xp: number;
}

export type PlayerProgression = {
  classes: Record<CardClass, ClassProgress>;
};

export interface PlayerLoadout {
  unlockedCardIds: string[];
  deckCardIds: string[];
};
