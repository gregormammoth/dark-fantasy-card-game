export type CardClass = 'fighter' | 'rogue' | 'wizard' | 'survivor';

export type CardType = 'attack' | 'defense';

export type EffectType =
  | 'damage'
  | 'shield'
  | 'poison'
  | 'ignoreShield'
  | 'draw'
  | 'recoverDiscard'
  | 'bonusDamagePerAttackCard'
  | 'reduceDamagePercent'
  | 'temporary'
  | 'bonusShieldPerDefenseCard'
  | 'bonusIfLowerHp';

export interface Effect {
  type: EffectType;
  value?: number;
  damage?: number;
  count?: number;
  damagePerTurn?: number;
  duration?: number;
}

export interface CardDefinition {
  id: string;
  name: string;
  class?: CardClass;
  type?: CardType;
  description?: string;
  effects: Effect[];
}

export interface CardInstance {
  instanceId: string;
  definition: CardDefinition;
}
