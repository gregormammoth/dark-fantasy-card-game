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
