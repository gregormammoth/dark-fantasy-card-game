import type {
  ExplorationContext,
  LocationDefinition,
  LocationEncounterItem,
  LocationEnemy,
  LocationNpc,
} from '@dark-fantasy/shared/types/exploration';
import { appendExplorationLog } from './log';

export function buildLocationEncounterQueue(
  context: ExplorationContext,
  locationId: string,
): LocationEncounterItem[] {
  const location = context.locations[locationId];
  if (!location) {
    return [];
  }
  const queue: LocationEncounterItem[] = [];
  const npc = location.npcs.find((item) => !item.talked);
  if (npc) {
    queue.push({ type: 'dialog', locationId, targetId: npc.id });
  }
  const enemy = location.enemies.find((item) => !item.defeated);
  if (enemy) {
    queue.push({ type: 'battle', locationId, targetId: enemy.id });
  }
  return queue;
}

export function setLocationEncounterQueue(
  context: ExplorationContext,
  locationId: string,
): ExplorationContext {
  context.locationEncounterQueue = buildLocationEncounterQueue(context, locationId);
  context.dialogLineIndex = 0;
  return context;
}

export function advanceLocationEncounterQueue(context: ExplorationContext): ExplorationContext {
  context.locationEncounterQueue = context.locationEncounterQueue.slice(1);
  context.dialogLineIndex = 0;
  return context;
}

export function queueDialog(
  context: ExplorationContext,
  locationId: string,
  npcId?: string,
): ExplorationContext {
  const location = context.locations[locationId];
  if (!location) {
    return context;
  }
  const npc =
    (npcId ? location.npcs.find((item) => item.id === npcId) : null) ?? location.npcs[0];
  if (!npc) {
    return context;
  }
  context.locationEncounterQueue = [
    { type: 'dialog', locationId, targetId: npc.id },
  ];
  context.dialogLineIndex = 0;
  return context;
}

export function queueBattle(
  context: ExplorationContext,
  locationId: string,
  enemyId?: string,
): ExplorationContext {
  const location = context.locations[locationId];
  if (!location) {
    return context;
  }
  const enemy =
    (enemyId ? location.enemies.find((item) => item.id === enemyId) : null) ??
    location.enemies.find((item) => !item.defeated);
  if (!enemy || enemy.defeated) {
    return context;
  }
  context.locationEncounterQueue = [
    { type: 'battle', locationId, targetId: enemy.id },
  ];
  context.dialogLineIndex = 0;
  return context;
}

export function getActiveLocationEncounter(
  context: ExplorationContext,
): LocationEncounterItem | null {
  return context.locationEncounterQueue[0] ?? null;
}

export function getDialogNpc(
  context: ExplorationContext,
  item: LocationEncounterItem,
): LocationNpc | null {
  const location = context.locations[item.locationId];
  if (!location) {
    return null;
  }
  return (
    location.npcs.find((npc) => npc.id === item.targetId) ?? location.npcs[0] ?? null
  );
}

export function getBattleEnemy(
  context: ExplorationContext,
  item: LocationEncounterItem,
): LocationEnemy | null {
  const location = context.locations[item.locationId];
  if (!location) {
    return null;
  }
  return (
    location.enemies.find((enemy) => enemy.id === item.targetId) ??
    location.enemies.find((enemy) => !enemy.defeated) ??
    null
  );
}

export function getDialogLines(npc: LocationNpc): string[] {
  if (npc.lines && npc.lines.length > 0) {
    return npc.lines;
  }
  return [npc.description];
}

export function advanceDialog(context: ExplorationContext): ExplorationContext {
  const encounter = getActiveLocationEncounter(context);
  if (!encounter || encounter.type !== 'dialog') {
    return context;
  }
  const npc = getDialogNpc(context, encounter);
  if (!npc) {
    return advanceLocationEncounterQueue(context);
  }
  const lines = getDialogLines(npc);
  if (context.dialogLineIndex + 1 >= lines.length) {
    npc.talked = true;
    appendExplorationLog(context, `Spoke with ${npc.name}.`, 'action');
    return advanceLocationEncounterQueue(context);
  }
  context.dialogLineIndex += 1;
  return context;
}

export function fleeLocationBattle(context: ExplorationContext): ExplorationContext {
  const encounter = getActiveLocationEncounter(context);
  if (!encounter || encounter.type !== 'battle') {
    return context;
  }
  const enemy = getBattleEnemy(context, encounter);
  appendExplorationLog(
    context,
    enemy ? `You slip away from ${enemy.name}.` : 'You slip away.',
    'danger',
  );
  return advanceLocationEncounterQueue(context);
}

export function resolveLocationBattle(
  context: ExplorationContext,
  won: boolean,
  locationId?: string,
  enemyId?: string,
): ExplorationContext {
  const encounter = getActiveLocationEncounter(context);
  const resolvedLocationId = locationId ?? encounter?.locationId;
  const resolvedEnemyId = enemyId ?? encounter?.targetId;
  if (won && resolvedLocationId) {
    const location = context.locations[resolvedLocationId];
    if (location) {
      const index = location.enemies.findIndex((item) =>
        resolvedEnemyId ? item.id === resolvedEnemyId : !item.defeated,
      );
      if (index >= 0) {
        const [enemy] = location.enemies.splice(index, 1);
        appendExplorationLog(context, `Defeated ${enemy.name}.`, 'danger');
        for (const interaction of location.interactions) {
          if (
            interaction.action === 'ATTACK' &&
            (interaction.targetId === enemy.id || !interaction.targetId)
          ) {
            interaction.completed = true;
          }
        }
      }
    }
  } else if (!won) {
    appendExplorationLog(context, 'The fight ends without a clear victory.', 'danger');
  }

  if (encounter?.type === 'battle') {
    return advanceLocationEncounterQueue(context);
  }
  context.locationEncounterQueue = context.locationEncounterQueue.filter(
    (item) =>
      !(
        item.type === 'battle' &&
        item.locationId === resolvedLocationId &&
        (!resolvedEnemyId || item.targetId === resolvedEnemyId)
      ),
  );
  return context;
}

export function getLocationForEncounter(
  context: ExplorationContext,
  item: LocationEncounterItem,
): LocationDefinition | null {
  return context.locations[item.locationId] ?? null;
}
