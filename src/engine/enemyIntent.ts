import type { CardInstance } from '@/types/card';
import type { BattleContext } from '@/types/battle';

export interface EnemyIntent {
  cardName: string;
  damage: number;
  cardsBurned: number;
}

function getCardDamage(card: CardInstance): number {
  return card.definition.effects.reduce(
    (sum, effect) => (effect.type === 'damage' ? sum + (effect.value ?? 0) : sum),
    0,
  );
}

export function getEnemyIntent(battle: BattleContext): EnemyIntent | null {
  if (battle.enemy.deck.length === 0) {
    return null;
  }

  let best = battle.enemy.deck[0];
  let bestDamage = getCardDamage(best);

  for (const card of battle.enemy.deck) {
    const damage = getCardDamage(card);
    if (damage > bestDamage) {
      best = card;
      bestDamage = damage;
    }
  }

  let remaining = bestDamage;
  if (battle.player.barrier > 0) {
    remaining = Math.max(0, remaining - battle.player.barrier);
  }
  if (battle.player.shield > 0) {
    remaining = Math.max(0, remaining - battle.player.shield);
  }
  if (battle.damageReductionPercent > 0 && remaining > 0) {
    const reduced = Math.ceil(remaining * (battle.damageReductionPercent / 100));
    remaining = Math.max(0, remaining - reduced);
  }

  return {
    cardName: best.definition.name,
    damage: bestDamage,
    cardsBurned: remaining,
  };
}
