import type { CardInstance } from './card';
import type { BattleLogEntry } from './log';
import type { ActivePlay } from './animation';

import type { EffectTarget } from './effect';
import type { PlayerGender } from './player';
import type { PlayerProgression } from './progression';
import type { RngState } from './rng';

export interface DamageResolution {
  target: EffectTarget;
  incoming: number;
  reduced: number;
  barrierBlocked: number;
  shieldBlocked: number;
  cardsLost: number;
  ignoredShield: boolean;
}

export interface PoisonState {
  damagePerTurn: number;
  remainingTurns: number;
}

export interface PlayerState {
  portrait: string;
  shield: number;
  maxShield: number;
  barrier: number;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
}

export interface EnemyState {
  name: string;
  portrait: string;
  shield: number;
  maxShield: number;
  barrier: number;
  deck: CardInstance[];
  discard: CardInstance[];
}

export interface CombatStats {
  attackCardsPlayed: number;
  defenseCardsPlayed: number;
}

export interface BattleStats {
  turnCount: number;
  cardsBurnedToEnemy: number;
  cardsLostByPlayer: number;
}

export interface BattleContext {
  player: PlayerState;
  enemy: EnemyState;
  combo: CardInstance[];
  playerMaxHealth: number;
  enemyMaxHealth: number;
  combatStats: CombatStats;
  battleStats: BattleStats;
  playerPoison: PoisonState | null;
  enemyPoison: PoisonState | null;
  damageReductionPercent: number;
  enemyBarrierPerTurn: number;
  resolvingCardInstanceId: string | null;
  resolutionQueue: CardInstance[];
  activePlay: ActivePlay | null;
  lastDamageResult: DamageResolution | null;
  isFirstPlayerTurn: boolean;
  lastPlayerDrawCount: number;
  comboStartPlayerHealth: number | null;
  comboStartAttackCardsPlayed: number | null;
  comboStartCards: CardInstance[] | null;
  log: BattleLogEntry[];
  progression: PlayerProgression;
  progressionAtBattleStart: PlayerProgression;
  rng: RngState;
}

export type BattleEnemyOverride = {
  name: string;
  portrait: string;
  deckSize?: number;
  barrierPerTurn?: number;
};

export type PlayerBattlePiles = {
  hand: CardInstance[];
  deck: CardInstance[];
  discard: CardInstance[];
};

export type BattleEvent =
  | {
      type: 'START_BATTLE';
      progression?: PlayerProgression;
      enemy?: BattleEnemyOverride;
      rng?: RngState;
      playerDeckIds?: string[];
      playerGender?: PlayerGender;
      playerPiles?: PlayerBattlePiles;
    }
  | { type: 'ADD_TO_COMBO'; cardInstanceId: string }
  | { type: 'REMOVE_FROM_COMBO'; cardInstanceId: string }
  | { type: 'END_TURN' }
  | { type: 'ANIMATION_COMPLETE' }
  | {
      type: 'RESTART';
      progression?: PlayerProgression;
      enemy?: BattleEnemyOverride;
      rng?: RngState;
      playerDeckIds?: string[];
      playerGender?: PlayerGender;
      playerPiles?: PlayerBattlePiles;
    }
  | { type: 'LEAVE_BATTLE' };
