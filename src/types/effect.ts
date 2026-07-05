import type { Effect } from './card';
import type { BattleContext } from './battle';

export type EffectTarget = 'player' | 'enemy';

export interface ResolutionState {
  ignoreShield: boolean;
  pendingDamageBonus: number;
  pendingShieldBonus: number;
  temporaryShield: boolean;
}

export interface EffectContext {
  battle: BattleContext;
  source: EffectTarget;
  target: EffectTarget;
  cardType?: 'attack' | 'defense';
  resolution: ResolutionState;
}

export type EffectHandler = (effect: Effect, ctx: EffectContext) => BattleContext;
