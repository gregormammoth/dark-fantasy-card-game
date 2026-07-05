export type CardClass = 'fighter' | 'rogue' | 'wizard' | 'survivor';

export type CardType = 'attack' | 'defense';

export type EffectType =
  | 'damage'
  | 'shield'
  | 'barrier'
  | 'poison'
  | 'ignoreShield'
  | 'draw'
  | 'recoverDiscard'
  | 'bonusDamagePerAttackCard'
  | 'reduceDamagePercent'
  | 'bonusShieldPerDefenseCard'
  | 'bonusBarrierPerDefenseCard'
  | 'bonusIfLowerHp';

export interface Effect {
  type: EffectType;
  value?: number;
  damage?: number;
  count?: number;
  damagePerTurn?: number;
  duration?: number;
  thresholdPercent?: number;
}

export interface CardDefinition {
  id: string;
  name: string;
  class?: CardClass;
  type?: CardType;
  description?: string;
  image?: string;
  effects: Effect[];
}

export interface CardInstance {
  instanceId: string;
  definition: CardDefinition;
}
