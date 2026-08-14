import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import type { CombatSoundId } from './types';

export function getCombatSoundForCard(definition: CardDefinition): CombatSoundId {
  const effectTypes = definition.effects.map((effect) => effect.type);

  if (effectTypes.includes('recoverDiscard') || effectTypes.includes('draw')) {
    return 'combat_heal';
  }
  if (effectTypes.includes('gainMana')) {
    return 'combat_mana';
  }
  if (effectTypes.includes('poison')) {
    return 'combat_poison';
  }
  if (effectTypes.includes('reduceDamagePercent')) {
    return 'combat_dodge';
  }
  if (
    effectTypes.includes('barrier') ||
    effectTypes.includes('bonusBarrierPerDefenseCard') ||
    effectTypes.includes('bonusBarrierPerMana')
  ) {
    return 'combat_barrier';
  }
  if (
    effectTypes.includes('shield') ||
    effectTypes.includes('restoreMaxShields') ||
    effectTypes.includes('bonusShieldPerDefenseCard')
  ) {
    return 'combat_shield';
  }

  const isAttack =
    effectTypes.includes('damage') ||
    effectTypes.includes('bonusDamagePerAttackCard') ||
    effectTypes.includes('bonusIfLowerHp') ||
    effectTypes.includes('bonusIfFirstAttack') ||
    effectTypes.includes('bonusIfMarked') ||
    effectTypes.includes('bonusDamagePerCardDrawn') ||
    effectTypes.includes('ignoreShield') ||
    effectTypes.includes('ignoreShieldIfMarked') ||
    effectTypes.includes('bonusDamagePerMana') ||
    definition.type === 'attack';

  if (isAttack && definition.class === 'wizard') {
    return 'combat_magic';
  }

  return 'combat_sword';
}
