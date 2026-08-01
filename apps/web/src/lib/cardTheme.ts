import type { CardClass, CardDefinition, CardType } from '@/types/card';

export interface ClassTheme {
  label: string;
  border: string;
  accent: string;
  badge: string;
  glow: string;
}

export const classThemes: Record<CardClass, ClassTheme> = {
  fighter: {
    label: 'FIGHTER',
    border: 'rgba(224,82,74,.5)',
    accent: '#e0524a',
    badge: 'rgba(224,82,74,.92)',
    glow: 'rgba(224,82,74,.7)',
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
      parts.push(`+${effect.damage ?? 0} if first attack`);
    }
    if (effect.type === 'restoreMaxShields') {
      parts.push('max shield if empty');
    }
    if (effect.type === 'ignoreShield') {
      parts.push('pierce');
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
