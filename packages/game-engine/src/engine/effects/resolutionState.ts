import type { EffectContext } from '@dark-fantasy/shared/types/effect';

export function createResolutionState(): EffectContext['resolution'] {
  return {
    ignoreShield: false,
    pendingDamageBonus: 0,
    pendingShieldBonus: 0,
    pendingBarrierBonus: 0,
  };
}
