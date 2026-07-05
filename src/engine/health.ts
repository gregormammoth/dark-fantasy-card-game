import type { BattleContext } from '@/types/battle';
import type { CardInstance } from '@/types/card';
import type { EffectTarget } from '@/types/effect';
import { appendLog, targetLabel } from './battleLog';

export function getPlayerHealth(battle: BattleContext): number {
  return battle.player.deck.length + battle.player.hand.length + battle.combo.length;
}

export function getEnemyHealth(battle: BattleContext): number {
  return battle.enemy.deck.length;
}

export function getHealth(battle: BattleContext, target: EffectTarget): number {
  return target === 'player' ? getPlayerHealth(battle) : getEnemyHealth(battle);
}

function discardFromPlayer(next: BattleContext, count: number): number {
  let remaining = count;
  let discarded = 0;

  while (remaining > 0) {
    if (next.player.deck.length > 0) {
      const [card] = next.player.deck.splice(0, 1);
      next.player.discard.push(card);
      remaining -= 1;
      discarded += 1;
    } else if (next.player.hand.length > 0) {
      const [card] = next.player.hand.splice(0, 1);
      next.player.discard.push(card);
      remaining -= 1;
      discarded += 1;
    } else if (next.combo.length > 0) {
      const [card] = next.combo.splice(0, 1);
      next.player.discard.push(card);
      remaining -= 1;
      discarded += 1;
    } else {
      break;
    }
  }

  return discarded;
}

function discardFromEnemy(next: BattleContext, count: number): number {
  let remaining = count;
  let discarded = 0;

  while (remaining > 0 && next.enemy.deck.length > 0) {
    const index = Math.floor(Math.random() * next.enemy.deck.length);
    const [card] = next.enemy.deck.splice(index, 1);
    next.enemy.discard.push(card);
    remaining -= 1;
    discarded += 1;
  }

  return discarded;
}

export function discardCards(
  battle: BattleContext,
  target: EffectTarget,
  count: number,
): BattleContext {
  if (count <= 0) {
    return battle;
  }

  const next = structuredClone(battle);
  const lost =
    target === 'player'
      ? discardFromPlayer(next, count)
      : discardFromEnemy(next, count);

  if (lost > 0) {
    appendLog(
      next,
      `${targetLabel(next, target)} lost ${lost} card${lost === 1 ? '' : 's'}.`,
      'damage',
    );
  }

  return next;
}

export function dealDamage(
  battle: BattleContext,
  target: EffectTarget,
  amount: number,
  ignoreShield = false,
  options?: { silent?: boolean },
): BattleContext {
  if (amount <= 0) {
    return battle;
  }

  const next = structuredClone(battle);
  const combatant = target === 'player' ? next.player : next.enemy;
  let damage = amount;
  let absorbed = 0;

  if (target === 'player' && next.damageReductionPercent > 0) {
    const reduced = damage - Math.floor(damage * (1 - next.damageReductionPercent / 100));
    if (reduced > 0) {
      appendLog(
        next,
        `Incoming damage reduced by ${next.damageReductionPercent}% (${reduced} less).`,
        'shield',
      );
    }
    damage = Math.floor(damage * (1 - next.damageReductionPercent / 100));
  }

  if (!ignoreShield && combatant.shield > 0) {
    absorbed = Math.min(combatant.shield, damage);
    combatant.shield -= absorbed;
    damage -= absorbed;
  }

  let cardsLost = 0;
  if (damage > 0) {
    cardsLost =
      target === 'player'
        ? discardFromPlayer(next, damage)
        : discardFromEnemy(next, damage);
  }

  if (absorbed > 0 || cardsLost > 0) {
    if (!options?.silent) {
      const parts: string[] = [];
      if (ignoreShield) {
        parts.push('ignoring shield');
      }
      if (absorbed > 0) {
        parts.push(`${absorbed} blocked by shield`);
      }
      if (cardsLost > 0) {
        parts.push(`${cardsLost} card${cardsLost === 1 ? '' : 's'} lost`);
      }
      appendLog(
        next,
        `${targetLabel(next, target)} took ${amount} damage (${parts.join(', ')}).`,
        'damage',
      );
    }
  } else if (absorbed > 0 && !options?.silent) {
    appendLog(
      next,
      `${targetLabel(next, target)} blocked ${absorbed} damage with shield.`,
      'shield',
    );
  }

  return next;
}

export function addShield(
  battle: BattleContext,
  target: EffectTarget,
  amount: number,
): BattleContext {
  if (amount <= 0) {
    return battle;
  }

  const next = structuredClone(battle);
  const combatant = target === 'player' ? next.player : next.enemy;
  combatant.shield += amount;
  appendLog(
    next,
    `${targetLabel(next, target)} gained ${amount} shield.`,
    'shield',
  );
  return next;
}

export function isBattleOver(battle: BattleContext): 'player' | 'enemy' | null {
  if (getPlayerHealth(battle) <= 0) {
    return 'player';
  }
  if (getEnemyHealth(battle) <= 0) {
    return 'enemy';
  }
  return null;
}

export function countInitialPlayerHealth(deck: CardInstance[]): number {
  return deck.length;
}

export function countInitialEnemyHealth(deck: CardInstance[]): number {
  return deck.length;
}
