import type { EffectContext } from '@/types/effect';

export function createResolutionState(): EffectContext['resolution'] {
  return {
    ignoreShield: false,
    pendingDamageBonus: 0,
    pendingShieldBonus: 0,
    temporaryShield: false,
  };
}
