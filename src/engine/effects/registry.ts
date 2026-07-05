import type { EffectType } from '@/types/card';
import type { EffectHandler } from '@/types/effect';
import { damageHandler } from './damage';
import { shieldHandler } from './shield';
import { barrierHandler } from './barrier';
import { poisonHandler } from './poison';
import { ignoreShieldHandler } from './ignoreShield';
import { drawHandler } from './draw';
import { recoverDiscardHandler } from './recoverDiscard';
import { bonusDamagePerAttackCardHandler } from './bonusDamagePerAttackCard';
import { reduceDamagePercentHandler } from './reduceDamagePercent';
import { bonusShieldPerDefenseCardHandler } from './bonusShieldPerDefenseCard';
import { bonusBarrierPerDefenseCardHandler } from './bonusBarrierPerDefenseCard';
import { bonusIfLowerHpHandler } from './bonusIfLowerHp';

export const effectHandlers: Record<EffectType, EffectHandler> = {
  damage: damageHandler,
  shield: shieldHandler,
  barrier: barrierHandler,
  poison: poisonHandler,
  ignoreShield: ignoreShieldHandler,
  draw: drawHandler,
  recoverDiscard: recoverDiscardHandler,
  bonusDamagePerAttackCard: bonusDamagePerAttackCardHandler,
  reduceDamagePercent: reduceDamagePercentHandler,
  bonusShieldPerDefenseCard: bonusShieldPerDefenseCardHandler,
  bonusBarrierPerDefenseCard: bonusBarrierPerDefenseCardHandler,
  bonusIfLowerHp: bonusIfLowerHpHandler,
};
