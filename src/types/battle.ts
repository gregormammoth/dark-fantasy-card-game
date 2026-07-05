import type { CardInstance } from './card';
import type { BattleLogEntry } from './log';

export interface PoisonState {
  damagePerTurn: number;
  remainingTurns: number;
}

export interface PlayerState {
  shield: number;
  barrier: number;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
}

export interface EnemyState {
  name: string;
  shield: number;
  deck: CardInstance[];
  discard: CardInstance[];
}

export interface CombatStats {
  attackCardsPlayed: number;
  defenseCardsPlayed: number;
}

export interface BattleContext {
  player: PlayerState;
  enemy: EnemyState;
  combo: CardInstance[];
  playerMaxHealth: number;
  enemyMaxHealth: number;
  combatStats: CombatStats;
  playerPoison: PoisonState | null;
  enemyPoison: PoisonState | null;
  damageReductionPercent: number;
  resolvingCardInstanceId: string | null;
  isFirstPlayerTurn: boolean;
  log: BattleLogEntry[];
}

export type BattleEvent =
  | { type: 'START_BATTLE' }
  | { type: 'ADD_TO_COMBO'; cardInstanceId: string }
  | { type: 'REMOVE_FROM_COMBO'; cardInstanceId: string }
  | { type: 'END_TURN' }
  | { type: 'RESTART' };
