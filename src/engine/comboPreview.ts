import type { BattleContext } from '@/types/battle';
import type { ComboPreview } from '@/types/comboPreview';
import { getEnemyHealth } from './health';
import { resolveCardEffects } from './combo';

export function previewCombo(battle: BattleContext): ComboPreview | null {
  if (battle.combo.length === 0) {
    return null;
  }

  const initialEnemyHealth = getEnemyHealth(battle);
  const initialShield = battle.player.shield;
  const initialBarrier = battle.player.barrier;
  const initialHandSize = battle.player.hand.length;
  const initialEnemyShield = battle.enemy.shield;

  let sim = structuredClone(battle);
  sim.log = [];
  sim.lastDamageResult = null;

  for (const card of battle.combo) {
    sim.resolvingCardInstanceId = card.instanceId;
    sim = resolveCardEffects(sim, card, 'player');
    sim.resolvingCardInstanceId = null;
  }

  const damageToEnemy = Math.max(0, initialEnemyHealth - getEnemyHealth(sim));
  const enemyShieldBlocked = Math.max(0, initialEnemyShield - sim.enemy.shield);

  const preview: ComboPreview = {
    damageToEnemy,
    totalDamageToEnemy: damageToEnemy + enemyShieldBlocked,
    enemyShieldBlocked,
    shieldGain: Math.max(0, sim.player.shield - initialShield),
    barrierGain: Math.max(0, sim.player.barrier - initialBarrier),
    cardsRecovered: Math.max(0, sim.player.hand.length - initialHandSize),
    ignoresShield: battle.combo.some((card) =>
      card.definition.effects.some((effect) => effect.type === 'ignoreShield'),
    ),
  };

  if (sim.enemyPoison) {
    preview.poison = {
      damagePerTurn: sim.enemyPoison.damagePerTurn,
      turns: sim.enemyPoison.remainingTurns,
    };
  }

  if (sim.damageReductionPercent !== battle.damageReductionPercent) {
    preview.damageReductionPercent = sim.damageReductionPercent;
  }

  return preview;
}
