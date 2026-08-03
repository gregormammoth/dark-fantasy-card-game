import type {
  ExplorationContext,
  LocationNpc,
  QuestDefinition,
  RunQuest,
} from '@dark-fantasy/shared/types/exploration';
import prisonMapData from '@dark-fantasy/content/prisonMap.json';
import { appendExplorationLog } from './log';

interface PrisonMapQuestsFile {
  questDefinitions?: QuestDefinition[];
}

const questDefinitions: QuestDefinition[] =
  ((prisonMapData as PrisonMapQuestsFile).questDefinitions ?? []) as QuestDefinition[];

const INGREDIENT_FLAGS: Record<string, string> = {
  infirmary: 'ingredient_lavender',
  underground_tunnels: 'ingredient_mushroom',
};

export function isNpcAvailable(context: ExplorationContext, npc: LocationNpc): boolean {
  if (npc.requiresFlag && !context.flags[npc.requiresFlag]) {
    return false;
  }
  return true;
}

const GATE_NPC_BY_BRANCH: Record<string, string> = {
  warden_tower: 'gate_dead_anarchist',
  chapel: 'gate_sorcerer',
  political_wing: 'gate_guard_captain',
};

export function listAvailableNpcs(
  context: ExplorationContext,
  locationId: string,
): LocationNpc[] {
  const location = context.locations[locationId];
  if (!location) {
    return [];
  }
  const available = location.npcs.filter((npc) => isNpcAvailable(context, npc));
  if (locationId === 'exit_gate' && context.finalBranchId) {
    const preferred = GATE_NPC_BY_BRANCH[context.finalBranchId];
    if (preferred) {
      available.sort((a, b) => {
        if (a.id === preferred) {
          return -1;
        }
        if (b.id === preferred) {
          return 1;
        }
        return 0;
      });
    }
  }
  return available;
}

export function getQuestDefinition(questId: string): QuestDefinition | null {
  return questDefinitions.find((item) => item.id === questId) ?? null;
}

export function grantQuest(context: ExplorationContext, questId: string): ExplorationContext {
  if (context.quests.some((item) => item.id === questId)) {
    return context;
  }
  const definition = getQuestDefinition(questId);
  if (!definition) {
    return context;
  }
  const quest: RunQuest = {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    status: 'active',
    targetEnemyId: definition.targetEnemyId,
    targetLocationId: definition.targetLocationId,
    branchId: definition.branchId,
  };
  context.quests = [...context.quests, quest];
  appendExplorationLog(context, `Quest started: ${quest.name}.`, 'action');
  return context;
}

export function completeQuestById(
  context: ExplorationContext,
  questId: string,
): ExplorationContext {
  const quest = context.quests.find((item) => item.id === questId && item.status === 'active');
  if (!quest) {
    return context;
  }
  quest.status = 'completed';
  appendExplorationLog(context, `Quest complete: ${quest.name}.`, 'action');
  return context;
}

export function completeQuestForEnemy(
  context: ExplorationContext,
  enemyId: string,
): ExplorationContext {
  let changed = false;
  context.quests = context.quests.map((quest) => {
    if (quest.status === 'active' && quest.targetEnemyId === enemyId) {
      changed = true;
      return { ...quest, status: 'completed' };
    }
    return quest;
  });
  if (changed) {
    const quest = context.quests.find(
      (item) => item.targetEnemyId === enemyId && item.status === 'completed',
    );
    if (quest) {
      appendExplorationLog(context, `Quest complete: ${quest.name}.`, 'action');
    }
  }
  return context;
}

export function listActiveQuests(context: ExplorationContext): RunQuest[] {
  return context.quests.filter((quest) => quest.status === 'active');
}

export function trackIngredientVisit(
  context: ExplorationContext,
  locationId: string,
): ExplorationContext {
  const gatherQuest = context.quests.find(
    (quest) => quest.id === 'gather_ritual_ingredients' && quest.status === 'active',
  );
  if (!gatherQuest) {
    return context;
  }
  const flag = INGREDIENT_FLAGS[locationId];
  if (!flag || context.flags[flag]) {
    return context;
  }
  context.flags[flag] = true;
  if (locationId === 'infirmary') {
    appendExplorationLog(context, 'You find dried lavender among the Infirmary shelves.', 'loot');
  } else if (locationId === 'underground_tunnels') {
    appendExplorationLog(context, 'You pluck a lowcap mushroom from the tunnel damp.', 'loot');
  }
  return context;
}

export function tryCompleteGatherIngredientsQuest(
  context: ExplorationContext,
  locationId: string,
): ExplorationContext {
  const definition = getQuestDefinition('gather_ritual_ingredients');
  if (!definition || definition.completeOnReturnTo !== locationId) {
    return context;
  }
  const quest = context.quests.find(
    (item) => item.id === 'gather_ritual_ingredients' && item.status === 'active',
  );
  if (!quest) {
    return context;
  }
  if (!context.flags.ingredient_lavender || !context.flags.ingredient_mushroom) {
    return context;
  }

  completeQuestById(context, 'gather_ritual_ingredients');
  if (definition.setFlagOnComplete) {
    context.flags[definition.setFlagOnComplete] = true;
  }

  const sorcerer = context.locations.ritual_room?.npcs.find((npc) => npc.id === 'sorcerer');
  if (sorcerer) {
    sorcerer.talked = false;
    if (sorcerer.followUpLines && sorcerer.followUpLines.length > 0) {
      sorcerer.lines = [...sorcerer.followUpLines];
    }
    if (definition.grantsQuestIdOnComplete) {
      sorcerer.grantsQuestId = definition.grantsQuestIdOnComplete;
    }
  }

  appendExplorationLog(
    context,
    'The Sorcerer accepts the ingredients. The corridor beyond stirs open.',
    'action',
  );
  return context;
}

export function openCorridorByForce(context: ExplorationContext): ExplorationContext {
  context.flags.ritual_corridor_open = true;
  completeQuestById(context, 'gather_ritual_ingredients');
  const sorcerer = context.locations.ritual_room?.npcs.find((npc) => npc.id === 'sorcerer');
  if (sorcerer) {
    sorcerer.talked = true;
  }
  appendExplorationLog(context, 'The Sorcerer falls. The corridor no longer bars your way.', 'danger');
  return context;
}
