import type { CardClass } from './card';

export interface ClassProgress {
  xp: number;
}

export type PlayerProgression = {
  classes: Record<CardClass, ClassProgress>;
};
