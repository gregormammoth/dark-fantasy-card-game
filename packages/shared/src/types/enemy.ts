export type EnemyBand = 'intro' | 'common' | 'elite' | 'boss';

export type EnemyGroup =
  | 'warrior'
  | 'cutthroat'
  | 'ritualist'
  | 'beast'
  | 'undead'
  | 'brute';

export interface EnemyBandProfile {
  deckSize: number;
  startingShield: number;
  maxShield: number;
  barrierPerTurn: number;
}

export interface EnemyBattleProfile {
  deckCardIds: string[];
  deckSize: number;
  startingShield: number;
  maxShield: number;
  barrierPerTurn: number;
}
