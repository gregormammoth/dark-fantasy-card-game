import type {
  ExplorationContext,
  LocationDefinition,
  LocationEncounterItem,
  LocationEnemy,
  LocationNpc,
} from '@dark-fantasy/shared/types/exploration';
import { appendExplorationLog } from './log';
import {
  completeQuestForEnemy,
  giveDiningKeyring,
  grantQuest,
  isNpcAvailable,
  listAvailableNpcs,
  openCorridorByForce,
} from './quests';

const BOSS_FLAGS: Record<string, string> = {
  prison_warden_boss: 'boss_warden_defeated',
  inquisitor_boss: 'boss_inquisitor_defeated',
  corrupted_anarchist: 'boss_anarchist_defeated',
};

export function isEnemyAvailable(context: ExplorationContext, enemy: LocationEnemy): boolean {
  if (enemy.defeated) {
    return false;
  }
  if (enemy.requiresFlag && !context.flags[enemy.requiresFlag]) {
    return false;
  }
  return true;
}

export function listAvailableEnemies(
  context: ExplorationContext,
  locationId: string,
): LocationEnemy[] {
  const location = context.locations[locationId];
  if (!location) {
    return [];
  }
  return location.enemies.filter((enemy) => isEnemyAvailable(context, enemy));
}

export function buildLocationEncounterQueue(
  context: ExplorationContext,
  locationId: string,
): LocationEncounterItem[] {
  const location = context.locations[locationId];
  if (!location) {
    return [];
  }
  const queue: LocationEncounterItem[] = [];
  const availableNpcs = listAvailableNpcs(context, locationId);
  const npc = availableNpcs.find((item) => !item.talked);
  const enemy = listAvailableEnemies(context, locationId).find(
    (item) => !item.skipAutoEncounter,
  );
  if (npc) {
    queue.push({ type: 'dialog', locationId, targetId: npc.id });
  }
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
  const available = listAvailableNpcs(context, locationId);
  const npc =
    (npcId ? available.find((item) => item.id === npcId) : null) ??
    available.find((item) => !item.talked) ??
    available[0];
  if (!npc) {
    return context;
  }
  context.locationEncounterQueue = [{ type: 'dialog', locationId, targetId: npc.id }];
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
    (enemyId
      ? listAvailableEnemies(context, locationId).find((item) => item.id === enemyId)
      : null) ?? listAvailableEnemies(context, locationId).find((item) => !item.skipAutoEncounter);
  if (!enemy || enemy.defeated) {
    return context;
  }
  context.locationEncounterQueue = [{ type: 'battle', locationId, targetId: enemy.id }];
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
  const npc =
    location.npcs.find((entry) => entry.id === item.targetId) ?? location.npcs[0] ?? null;
  if (!npc || !isNpcAvailable(context, npc)) {
    return null;
  }
  return npc;
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
    listAvailableEnemies(context, item.locationId).find((enemy) => enemy.id === item.targetId) ??
    listAvailableEnemies(context, item.locationId).find((enemy) => !enemy.skipAutoEncounter) ??
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
    if (npc.grantsQuestId) {
      grantQuest(context, npc.grantsQuestId);
    }
    if (npc.id === 'executioner') {
      giveDiningKeyring(context);
    }
    if (encounter.locationId === 'exit_gate') {
      context.flags.escaped_hollowfort = true;
      appendExplorationLog(context, 'You leave Hollowfort behind.', 'loot');
    }
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
  let defeatedEnemyId: string | null = null;

  if (won) {
    context.shield = context.maxShield;
    context.mana = context.maxMana;
  }

  if (won && resolvedLocationId) {
    const location = context.locations[resolvedLocationId];
    if (location) {
      const index = location.enemies.findIndex((item) =>
        resolvedEnemyId ? item.id === resolvedEnemyId : !item.defeated,
      );
      if (index >= 0) {
        const [enemy] = location.enemies.splice(index, 1);
        defeatedEnemyId = enemy.id;
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

  if (defeatedEnemyId) {
    completeQuestForEnemy(context, defeatedEnemyId);
    const bossFlag = BOSS_FLAGS[defeatedEnemyId];
    if (bossFlag) {
      context.flags[bossFlag] = true;
    }
    if (defeatedEnemyId === 'sorcerer_enemy') {
      openCorridorByForce(context);
    }
    if (defeatedEnemyId === 'demon' && resolvedLocationId === 'ritual_room') {
      context.flags.ritual_demon_cleared = true;
      const sorcerer = context.locations.ritual_room?.npcs.find((npc) => npc.id === 'sorcerer');
      if (sorcerer && !sorcerer.talked) {
        context.locationEncounterQueue = [
          { type: 'dialog', locationId: 'ritual_room', targetId: 'sorcerer' },
        ];
        context.dialogLineIndex = 0;
        return context;
      }
    }
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
