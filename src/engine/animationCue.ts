import type { BattleContext } from '@/types/battle';
import type { CardInstance } from '@/types/card';
import type { AnimationCue } from '@/types/animation';
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

  return {
    cardName: card.definition.name,
    cardId: card.definition.id,
    cardClass: card.definition.class,
    cardType: card.definition.type,
    source,
    damageToPlayer: damageToPlayer > 0 ? damageToPlayer : undefined,
    damageToEnemy: damageToEnemy > 0 ? damageToEnemy : undefined,
    shieldGained: shieldGained > 0 ? shieldGained : undefined,
    barrierGained: barrierGained > 0 ? barrierGained : undefined,
    poisonAppliedTo,
    ignoresShield: card.definition.effects.some((effect) => effect.type === 'ignoreShield'),
  };
}

export function captureBattleSnapshot(battle: BattleContext): BattleSnapshot {
  return snapshot(battle);
}
