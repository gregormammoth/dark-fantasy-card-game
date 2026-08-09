import type { BattleContext } from '@dark-fantasy/shared/types/battle';
import type { ComboPreview } from '@dark-fantasy/shared/types/comboPreview';
import { getEnemyHealth, getPlayerHealth } from './health';
import { resolveCardEffects } from './combo';

export function previewCombo(battle: BattleContext): ComboPreview | null {
  if (battle.combo.length === 0) {
    return null;
  }

  const initialEnemyHealth = getEnemyHealth(battle);
  const initialShield = battle.player.shield;
  const initialBarrier = battle.player.barrier;
  const initialMana = battle.playerMana;
  const initialHandSize = battle.player.hand.length;
  const initialEnemyShield = battle.enemy.shield;
  const initialEnemyBarrier = battle.enemy.barrier;

  let sim = structuredClone(battle);
  sim.log = [];
  sim.lastDamageResult = null;
  sim.comboStartPlayerHealth = getPlayerHealth(sim);
  sim.comboStartAttackCardsPlayed = sim.combatStats.attackCardsPlayed;
  sim.comboStartCards = structuredClone(sim.combo);

  const queue = [...sim.combo];
  for (const card of queue) {
    const comboIndex = sim.combo.findIndex((entry) => entry.instanceId === card.instanceId);
    if (comboIndex !== -1) {
      sim.combo.splice(comboIndex, 1);
    }

    sim.resolvingCardInstanceId = card.instanceId;
    sim = resolveCardEffects(sim, card, 'player');
    sim.resolvingCardInstanceId = null;
    sim.player.discard.push(card);

    if (card.definition.type === 'attack') {
      sim.combatStats.attackCardsPlayed += 1;
    } else if (card.definition.type === 'defense') {
      sim.combatStats.defenseCardsPlayed += 1;
    }
  }

  sim.comboStartPlayerHealth = null;
  sim.comboStartAttackCardsPlayed = null;
  sim.comboStartCards = null;

  const damageToEnemy = Math.max(0, initialEnemyHealth - getEnemyHealth(sim));
  const enemyShieldBlocked = Math.max(0, initialEnemyShield - sim.enemy.shield);
  const enemyBarrierBlocked = Math.max(0, initialEnemyBarrier - sim.enemy.barrier);

  const preview: ComboPreview = {
    damageToEnemy,
    totalDamageToEnemy: damageToEnemy + enemyShieldBlocked + enemyBarrierBlocked,
    enemyShieldBlocked,
    shieldGain: Math.max(0, sim.player.shield - initialShield),
    barrierGain: Math.max(0, sim.player.barrier - initialBarrier),
    manaDelta: sim.playerMana - initialMana,
    cardsRecovered: Math.max(0, sim.player.hand.length - initialHandSize),
    ignoresShield: (() => {
      const marked =
        battle.enemyMarked ||
        battle.combo.some((card) =>
          card.definition.effects.some((effect) => effect.type === 'markEnemy'),
        );
      return battle.combo.some((card) =>
        card.definition.effects.some(
          (effect) =>
            effect.type === 'ignoreShield' ||
            (effect.type === 'ignoreShieldIfMarked' && marked),
        ),
      );
    })(),
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
