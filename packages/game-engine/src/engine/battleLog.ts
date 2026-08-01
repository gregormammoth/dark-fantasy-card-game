import type { BattleContext } from '@dark-fantasy/shared/types/battle';
import type { BattleLogKind } from '@dark-fantasy/shared/types/log';
import type { EffectTarget } from '@dark-fantasy/shared/types/effect';

let logCounter = 0;

export function resetLogCounter(): void {
  logCounter = 0;
}

export function appendLog(
  battle: BattleContext,
  message: string,
  kind: BattleLogKind = 'system',
): void {
  logCounter += 1;
  battle.log.push({
    id: `log_${logCounter}`,
    message,
    kind,
  });
}

export function targetLabel(battle: BattleContext, target: EffectTarget): string {
  return target === 'player' ? 'You' : battle.enemy.name;
}

export function targetPossessive(battle: BattleContext, target: EffectTarget): string {
  return target === 'player' ? 'your' : `${battle.enemy.name}'s`;
}
