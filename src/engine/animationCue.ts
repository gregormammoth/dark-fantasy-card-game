import type { BattleContext } from '@/types/battle';
import type { CardInstance } from '@/types/card';
import type { AnimationCue } from '@/types/animation';
import type { CardType } from '@/types/card';
import type { EffectTarget } from '@/types/effect';
import { getEnemyHealth, getPlayerHealth } from './health';

interface BattleSnapshot {
  playerHealth: number;
  enemyHealth: number;
  playerShield: number;
  enemyShield: number;
  playerBarrier: number;
  playerPoison: boolean;
  enemyPoison: boolean;
}

function snapshot(battle: BattleContext): BattleSnapshot {
  return {
    playerHealth: getPlayerHealth(battle),
    enemyHealth: getEnemyHealth(battle),
    playerShield: battle.player.shield,
    enemyShield: battle.enemy.shield,
    playerBarrier: battle.player.barrier,
    playerPoison: battle.playerPoison !== null,
    enemyPoison: battle.enemyPoison !== null,
  };
}

function inferCardType(card: CardInstance): CardType {
  if (card.definition.type) {
    return card.definition.type;
  }
  const hasDamage = card.definition.effects.some(
    (effect) => effect.type === 'damage' || effect.type === 'poison',
  );
  return hasDamage ? 'attack' : 'defense';
}

export function buildAnimationCue(
  before: BattleSnapshot,
  after: BattleContext,
  card: CardInstance,
  source: EffectTarget,
): AnimationCue {
  const afterSnapshot = snapshot(after);
  const damageToPlayer = Math.max(0, before.playerHealth - afterSnapshot.playerHealth);
  const damageToEnemy = Math.max(0, before.enemyHealth - afterSnapshot.enemyHealth);
  const shieldGained =
    source === 'player'
      ? Math.max(0, afterSnapshot.playerShield - before.playerShield)
      : Math.max(0, afterSnapshot.enemyShield - before.enemyShield);
  const barrierGained = Math.max(0, afterSnapshot.playerBarrier - before.playerBarrier);

  let poisonAppliedTo: 'player' | 'enemy' | undefined;
  if (!before.enemyPoison && afterSnapshot.enemyPoison) {
    poisonAppliedTo = 'enemy';
  } else if (!before.playerPoison && afterSnapshot.playerPoison) {
    poisonAppliedTo = 'player';
  }

  const dmg = after.lastDamageResult;
  const cue: AnimationCue = {
    cardName: card.definition.name,
    cardId: card.definition.id,
    cardClass: card.definition.class,
    cardType: inferCardType(card),
    source,
    damageToPlayer: damageToPlayer > 0 ? damageToPlayer : undefined,
    damageToEnemy: damageToEnemy > 0 ? damageToEnemy : undefined,
    shieldGained: shieldGained > 0 ? shieldGained : undefined,
    barrierGained: barrierGained > 0 ? barrierGained : undefined,
    poisonAppliedTo,
    ignoresShield: card.definition.effects.some((effect) => effect.type === 'ignoreShield'),
  };

  if (dmg) {
    cue.incomingDamage = dmg.incoming;
    if (dmg.reduced > 0) {
      cue.damageReduced = dmg.reduced;
    }
    if (dmg.shieldBlocked > 0) {
      cue.shieldBlocked = dmg.shieldBlocked;
    }
    if (dmg.barrierBlocked > 0) {
      cue.barrierBlocked = dmg.barrierBlocked;
    }
    if (dmg.ignoredShield) {
      cue.ignoresShield = true;
    }
    if (dmg.target === 'player' && dmg.cardsLost > 0) {
      cue.damageToPlayer = dmg.cardsLost;
    }
    if (dmg.target === 'enemy' && dmg.cardsLost > 0) {
      cue.damageToEnemy = dmg.cardsLost;
    }
  }

  return cue;
}

export function captureBattleSnapshot(battle: BattleContext): BattleSnapshot {
  return snapshot(battle);
}

export function clearDamageResult(battle: BattleContext): BattleContext {
  const next = structuredClone(battle);
  next.lastDamageResult = null;
  return next;
}
