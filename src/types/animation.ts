import type { CardClass, CardType } from './card';

export interface AnimationCue {
  cardName: string;
  cardId: string;
  cardClass?: CardClass;
  cardType?: CardType;
  source: 'player' | 'enemy';
  incomingDamage?: number;
  damageReduced?: number;
  shieldBlocked?: number;
  barrierBlocked?: number;
  damageToPlayer?: number;
  damageToEnemy?: number;
  playerDeckCardsLost?: number;
  enemyDeckCardsLost?: number;
  shieldGained?: number;
  barrierGained?: number;
  poisonAppliedTo?: 'player' | 'enemy';
  ignoresShield?: boolean;
}

export interface ActivePlay {
  cardInstanceId: string;
  cue: AnimationCue;
}
