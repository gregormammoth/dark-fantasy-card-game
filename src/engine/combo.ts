import type { CardInstance } from '@/types/card';
import type { BattleContext } from '@/types/battle';
import type { EffectContext, EffectTarget } from '@/types/effect';
import { effectHandlers } from './effects/registry';
import { createResolutionState } from './effects/resolutionState';
import { isBattleOver } from './health';
import { shuffle } from './deck';
import { appendLog } from './battleLog';
import { applyPoisonTick } from './poison';

export function addToCombo(battle: BattleContext, cardInstanceId: string): BattleContext {
  const cardIndex = battle.player.hand.findIndex((c) => c.instanceId === cardInstanceId);
  if (cardIndex === -1) {
    return battle;
  }

  const next = structuredClone(battle);
  const [card] = next.player.hand.splice(cardIndex, 1);
  next.combo.push(card);
  return next;
}

export function removeFromCombo(battle: BattleContext, cardInstanceId: string): BattleContext {
  const cardIndex = battle.combo.findIndex((c) => c.instanceId === cardInstanceId);
  if (cardIndex === -1) {
    return battle;
  }

  const next = structuredClone(battle);
  const [card] = next.combo.splice(cardIndex, 1);
  next.player.hand.push(card);
  return next;
}

export function resolveCombo(battle: BattleContext): BattleContext {
  let next = structuredClone(battle);

  if (next.combo.length === 0) {
    appendLog(next, 'You ended the turn without playing any cards.', 'combo');
    return next;
  }

  appendLog(
    next,
    `You played ${next.combo.length} card${next.combo.length === 1 ? '' : 's'}.`,
    'combo',
  );

  for (const card of next.combo) {
    appendLog(next, `You played ${card.definition.name}.`, 'play');
    next.resolvingCardInstanceId = card.instanceId;
    next = resolveCardEffects(next, card, 'player');
    next.resolvingCardInstanceId = null;

    next.player.discard.push(card);
    if (card.definition.type === 'attack') {
      next.combatStats.attackCardsPlayed += 1;
    } else if (card.definition.type === 'defense') {
      next.combatStats.defenseCardsPlayed += 1;
    }
  }

  next.combo = [];
  return next;
}

export function resolveCardEffects(
  battle: BattleContext,
  card: CardInstance,
  source: EffectTarget,
): BattleContext {
  const target: EffectTarget = source === 'player' ? 'enemy' : 'player';
  let next = battle;

  const ctx: EffectContext = {
    battle: next,
    source,
    target,
    cardType: card.definition.type,
    resolution: createResolutionState(),
  };

  for (const effect of card.definition.effects) {
    const handler = effectHandlers[effect.type];
    if (!handler) {
      console.warn(`No handler for effect type: ${effect.type}`);
      continue;
    }
    ctx.battle = next;
    next = handler(effect, ctx);
  }

  return next;
}

export function checkWinner(battle: BattleContext): 'victory' | 'defeat' | null {
  const loser = isBattleOver(battle);
  if (loser === 'enemy') {
    return 'victory';
  }
  if (loser === 'player') {
    return 'defeat';
  }
  return null;
}

export function playRandomEnemyCard(battle: BattleContext): BattleContext {
  if (battle.enemy.deck.length === 0) {
    if (battle.enemy.discard.length === 0) {
      return battle;
    }
    const next = structuredClone(battle);
    next.enemy.deck = shuffle(next.enemy.discard);
    next.enemy.discard = [];
    appendLog(next, `${next.enemy.name} reshuffled their discard pile.`, 'system');
    return playRandomEnemyCard(next);
  }

  let next = structuredClone(battle);
  const index = Math.floor(Math.random() * next.enemy.deck.length);
  const [card] = next.enemy.deck.splice(index, 1);

  appendLog(next, `${next.enemy.name} played ${card.definition.name}.`, 'play');

  const ctx: EffectContext = {
    battle: next,
    source: 'enemy',
    target: 'player',
    cardType: 'attack',
    resolution: createResolutionState(),
  };

  for (const effect of card.definition.effects) {
    const handler = effectHandlers[effect.type];
    if (!handler) {
      continue;
    }
    ctx.battle = next;
    next = handler(effect, ctx);
  }

  next.enemy.discard.push(card);
  return next;
}

export function startPlayerTurn(battle: BattleContext): BattleContext {
  return applyPoisonTick(battle, 'player');
}
