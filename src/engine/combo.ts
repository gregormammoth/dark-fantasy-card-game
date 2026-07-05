import type { CardInstance } from '@/types/card';
import type { BattleContext } from '@/types/battle';
import type { EffectContext, EffectTarget } from '@/types/effect';
import { effectHandlers } from './effects/registry';
import { createResolutionState } from './effects/resolutionState';
import { isBattleOver } from './health';
import { shuffle } from './deck';
import { appendLog } from './battleLog';
import { applyPoisonTick } from './poison';
import { buildAnimationCue, captureBattleSnapshot } from './animationCue';

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

export function beginPlayerResolution(battle: BattleContext): BattleContext {
  const next = structuredClone(battle);

  if (next.combo.length === 0) {
    appendLog(next, 'You ended the turn without playing any cards.', 'combo');
    next.resolutionQueue = [];
    next.activePlay = null;
    return next;
  }

  appendLog(
    next,
    `You played ${next.combo.length} card${next.combo.length === 1 ? '' : 's'}.`,
    'combo',
  );
  next.resolutionQueue = [...next.combo];
  next.activePlay = null;
  return next;
}

export function resolveNextComboCard(battle: BattleContext): BattleContext {
  if (battle.resolutionQueue.length === 0) {
    return battle;
  }

  const next = structuredClone(battle);
  const [card] = next.resolutionQueue.splice(0, 1);
  const comboIndex = next.combo.findIndex((entry) => entry.instanceId === card.instanceId);
  if (comboIndex !== -1) {
    next.combo.splice(comboIndex, 1);
  }

  appendLog(next, `You played ${card.definition.name}.`, 'play');

  const before = captureBattleSnapshot(next);
  next.resolvingCardInstanceId = card.instanceId;
  let resolved = resolveCardEffects(next, card, 'player');
  next.resolvingCardInstanceId = null;

  const cue = buildAnimationCue(before, resolved, card, 'player');
  resolved.player.discard.push(card);
  if (card.definition.type === 'attack') {
    resolved.combatStats.attackCardsPlayed += 1;
  } else if (card.definition.type === 'defense') {
    resolved.combatStats.defenseCardsPlayed += 1;
  }

  resolved.resolutionQueue = next.resolutionQueue;
  resolved.activePlay = {
    cardInstanceId: card.instanceId,
    cue,
  };
  return resolved;
}

export function finishPlayerResolution(battle: BattleContext): BattleContext {
  const next = structuredClone(battle);
  next.combo = [];
  next.resolutionQueue = [];
  next.activePlay = null;
  return next;
}

export function resolveCombo(battle: BattleContext): BattleContext {
  return beginPlayerResolution(battle);
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

export function resolveEnemyTurn(battle: BattleContext): BattleContext {
  if (battle.enemy.deck.length === 0) {
    if (battle.enemy.discard.length === 0) {
      return battle;
    }
    const reshuffled = structuredClone(battle);
    reshuffled.enemy.deck = shuffle(reshuffled.enemy.discard);
    reshuffled.enemy.discard = [];
    appendLog(reshuffled, `${reshuffled.enemy.name} reshuffled their discard pile.`, 'system');
    return resolveEnemyTurn(reshuffled);
  }

  const next = structuredClone(battle);
  const index = Math.floor(Math.random() * next.enemy.deck.length);
  const [card] = next.enemy.deck.splice(index, 1);

  appendLog(next, `${next.enemy.name} played ${card.definition.name}.`, 'play');

  const before = captureBattleSnapshot(next);
  let resolved = resolveCardEffects(next, card, 'enemy');
  const cue = buildAnimationCue(before, resolved, card, 'enemy');
  resolved.enemy.discard.push(card);
  resolved.activePlay = {
    cardInstanceId: card.instanceId,
    cue,
  };
  return resolved;
}

export function playRandomEnemyCard(battle: BattleContext): BattleContext {
  return resolveEnemyTurn(battle);
}

export function startPlayerTurn(battle: BattleContext): BattleContext {
  let next = applyPoisonTick(battle, 'player');
  next = applyPoisonTick(next, 'enemy');
  return next;
}
