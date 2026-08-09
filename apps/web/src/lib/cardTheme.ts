import type { CardClass, CardDefinition, CardType } from '@dark-fantasy/shared/types/card';
import type { TranslateFn, MessageKey } from '@/i18n/types';

export interface ClassTheme {
  label: string;
  border: string;
  accent: string;
  badge: string;
  glow: string;
}

export const classThemes: Record<CardClass, ClassTheme> = {
  warrior: {
    label: 'WARRIOR',
    border: 'rgba(91,134,196,.5)',
    accent: '#5b86c4',
    badge: 'rgba(91,134,196,.92)',
    glow: 'rgba(91,134,196,.65)',
  },
  rogue: {
    label: 'ROGUE',
    border: 'rgba(111,174,90,.5)',
    accent: '#6fae5a',
    badge: 'rgba(74,150,94,.92)',
    glow: 'rgba(111,174,90,.55)',
  },
  wizard: {
    label: 'WIZARD',
    border: 'rgba(154,122,224,.5)',
    accent: '#9a7ae0',
    badge: 'rgba(154,122,224,.92)',
    glow: 'rgba(154,122,224,.6)',
  },
  survivor: {
    label: 'SURVIVOR',
    border: 'rgba(224,82,74,.5)',
    accent: '#e0524a',
    badge: 'rgba(224,82,74,.92)',
    glow: 'rgba(224,82,74,.7)',
  },
  seeker: {
    label: 'SEEKER',
    border: 'rgba(201,162,74,.5)',
    accent: '#c9a24a',
    badge: 'rgba(201,162,74,.92)',
    glow: 'rgba(201,162,74,.55)',
  },
};

export const enemyTheme: ClassTheme = {
  label: 'ENEMY',
  border: 'rgba(214,68,58,.45)',
  accent: '#d6443a',
  badge: 'rgba(190,50,45,.92)',
  glow: 'rgba(214,68,58,.6)',
};

export function getClassLabel(classId: CardClass, t: TranslateFn): string {
  return t(`classes.${classId}` as MessageKey).toUpperCase();
}

export function getCardTheme(definition: CardDefinition): ClassTheme {
  if (definition.class) {
    return classThemes[definition.class];
  }
  return enemyTheme;
}

export function getCardEffectSummary(definition: CardDefinition): string {
  const parts: string[] = [];

  for (const effect of definition.effects) {
    if (effect.type === 'damage') {
      parts.push(`${effect.value ?? 0} damage`);
    }
    if (effect.type === 'shield') {
      parts.push(`+${effect.value ?? 0} shield`);
    }
    if (effect.type === 'barrier') {
      parts.push(`+${effect.value ?? 0} barrier`);
    }
    if (effect.type === 'poison') {
      parts.push(`poison ${effect.damagePerTurn ?? 1}×${effect.duration ?? 1}`);
    }
    if (effect.type === 'reduceDamagePercent') {
      parts.push(`−${effect.value ?? 0}% damage`);
    }
    if (effect.type === 'draw') {
      parts.push(`draw ${effect.count ?? 1}`);
    }
    if (effect.type === 'recoverDiscard') {
      parts.push(`+${effect.count ?? 1} cards`);
    }
    if (effect.type === 'bonusDamagePerAttackCard') {
      parts.push(`+${effect.value ?? 0} per attack`);
    }
    if (effect.type === 'bonusBarrierPerDefenseCard') {
      parts.push(`+${effect.value ?? 0} per defense`);
    }
    if (effect.type === 'bonusIfLowerHp') {
      parts.push(`+${effect.damage ?? 0} if low HP`);
    }
    if (effect.type === 'bonusIfFirstAttack') {
      parts.push(`+${effect.damage ?? 0} if first attack combo`);
    }
    if (effect.type === 'restoreMaxShields') {
      parts.push('max shield if empty');
    }
    if (effect.type === 'ignoreShield') {
      parts.push('pierce');
    }
    if (effect.type === 'gainMana') {
      parts.push(`+${effect.value ?? 0} mana`);
    }
    if (effect.type === 'bonusDamagePerMana') {
      parts.push(`+${effect.value ?? 0} dmg/mana`);
    }
    if (effect.type === 'bonusBarrierPerMana') {
      parts.push(`+${effect.value ?? 0} barrier/mana`);
    }
    if (effect.type === 'markEnemy') {
      parts.push('mark enemy');
    }
    if (effect.type === 'bonusIfMarked') {
      parts.push(`+${effect.damage ?? 0} if marked`);
    }
    if (effect.type === 'ignoreShieldIfMarked') {
      parts.push('pierce if marked');
    }
    if (effect.type === 'bonusDamagePerCardDrawn') {
      parts.push(`+${effect.value ?? 0} per card drawn`);
    }
  }

  if (parts.length === 0 && definition.description) {
    return definition.description;
  }

  return parts.join(' · ');
}

export function getCardType(definition: CardDefinition): CardType {
  return definition.type ?? 'attack';
}

export type CardEffectIconType =
  | 'attack'
  | 'shield'
  | 'barrier'
  | 'poison'
  | 'pierce'
  | 'recover';

export const cardLayout = {
  width: 152,
  imageHeight: 116,
  footerHeight: 68,
} as const;

export function getCardHeight(): number {
  return cardLayout.imageHeight + cardLayout.footerHeight;
}

export function getCardEffectIconType(definition: CardDefinition): CardEffectIconType {
  const effectTypes = definition.effects.map((effect) => effect.type);

  if (
    effectTypes.includes('ignoreShield') ||
    effectTypes.includes('ignoreShieldIfMarked') ||
    effectTypes.includes('bonusDamagePerMana')
  ) {
    return 'pierce';
  }
  if (effectTypes.includes('poison')) {
    return 'poison';
  }
  if (
    effectTypes.includes('damage') ||
    effectTypes.includes('bonusDamagePerAttackCard') ||
    effectTypes.includes('bonusIfLowerHp') ||
    effectTypes.includes('bonusIfFirstAttack') ||
    effectTypes.includes('bonusIfMarked') ||
    effectTypes.includes('bonusDamagePerCardDrawn')
  ) {
    return 'attack';
  }
  if (
    effectTypes.includes('barrier') ||
    effectTypes.includes('bonusBarrierPerDefenseCard') ||
    effectTypes.includes('bonusBarrierPerMana') ||
    effectTypes.includes('gainMana')
  ) {
    return 'barrier';
  }
  if (
    effectTypes.includes('shield') ||
    effectTypes.includes('restoreMaxShields') ||
    effectTypes.includes('bonusShieldPerDefenseCard') ||
    effectTypes.includes('reduceDamagePercent')
  ) {
    return 'shield';
  }
  if (effectTypes.includes('recoverDiscard') || effectTypes.includes('draw') || effectTypes.includes('markEnemy')) {
    return 'recover';
  }
  return getCardType(definition) === 'attack' ? 'attack' : 'shield';
}

export function getCardEffectTextColor(iconType: CardEffectIconType): string {
  switch (iconType) {
    case 'attack':
      return '#eaa';
    case 'pierce':
      return '#ecd9b0';
    case 'poison':
      return '#b8dca8';
    case 'shield':
      return '#a8c4e8';
    case 'barrier':
      return '#c4b0e8';
    case 'recover':
      return '#d4b872';
    default:
      return '#a99c8d';
  }
}
