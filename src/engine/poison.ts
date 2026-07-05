import type { BattleContext } from '@/types/battle';
import { dealDamage, getHealth } from './health';
import { appendLog, targetLabel } from './battleLog';

export function applyPoisonTick(
  battle: BattleContext,
  target: 'player' | 'enemy',
): BattleContext {
  const poisonKey = target === 'player' ? 'playerPoison' : 'enemyPoison';
  const poison = battle[poisonKey];
  if (!poison || poison.remainingTurns <= 0) {
    return battle;
  }

  const healthBefore = getHealth(battle, target);
  let next = dealDamage(battle, target, poison.damagePerTurn, false, {
    silent: true,
    bypassDefenses: true,
  });
  const cardsLost = healthBefore - getHealth(next, target);
  appendLog(
    next,
    `${targetLabel(next, target)} took ${poison.damagePerTurn} poison damage${
      cardsLost > 0 ? ` (${cardsLost} card${cardsLost === 1 ? '' : 's'} lost)` : ''
    }.`,
    'poison',
  );

  const activePoison = next[poisonKey];
  if (activePoison) {
    activePoison.remainingTurns -= 1;
    if (activePoison.remainingTurns <= 0) {
      next[poisonKey] = null;
      appendLog(next, `${targetLabel(next, target)} poison wore off.`, 'poison');
    }
  }

  return next;
}

export function expireRoundEffects(battle: BattleContext): BattleContext {
  const next = structuredClone(battle);

  if (next.player.barrier > 0) {
    const unused = next.player.barrier;
    next.player.barrier = 0;
    appendLog(next, `Unused barrier expired (${unused}).`, 'barrier');
  }

  if (next.damageReductionPercent > 0) {
    appendLog(next, 'Damage reduction wore off.', 'shield');
  }

  next.damageReductionPercent = 0;
  return next;
}

export function logVictory(battle: BattleContext): BattleContext {
  const next = structuredClone(battle);
  appendLog(next, 'Victory! The enemy has no cards left.', 'victory');
  return next;
}

export function logDefeat(battle: BattleContext): BattleContext {
  const next = structuredClone(battle);
  appendLog(next, 'Defeat! You have no cards left.', 'defeat');
  return next;
}
