import type { ExplorationContext, RunQuest } from '@dark-fantasy/shared/types/exploration';
import type { MessageKey, TranslateFn } from '@/i18n/types';

export interface QuestStepView {
  id: string;
  label: string;
  done: boolean;
}

export interface QuestItemView {
  id: string;
  name: string;
  category: 'key' | 'ingredient';
  tag: string;
  obtained: boolean;
  location: string;
  questName: string;
  description: string;
  image: string;
}

const QUEST_LOCATION_KEYS = {
  kill_warden: 'questUi.locationKillWarden',
  gather_ritual_ingredients: 'questUi.locationGatherIngredients',
  find_dining_way: 'questUi.locationFindDining',
  kill_inquisitor: 'questUi.locationKillInquisitor',
  kill_resurrected_anarchist: 'questUi.locationKillAnarchist',
} as const;

export function questLocationLabel(quest: RunQuest, t: TranslateFn): string {
  const key = QUEST_LOCATION_KEYS[quest.id as keyof typeof QUEST_LOCATION_KEYS];
  if (key) {
    return t(key as MessageKey);
  }
  return quest.targetLocationId ?? t('common.hollowfort');
}

export function getQuestSteps(
  context: ExplorationContext | null,
  quest: RunQuest,
  t: TranslateFn,
): QuestStepView[] | null {
  const flags = context?.flags ?? {};
  if (quest.id === 'gather_ritual_ingredients') {
    const lavender = Boolean(flags.ingredient_lavender);
    const mushroom = Boolean(flags.ingredient_mushroom);
    return [
      { id: 'lavender', label: t('questUi.stepLavender'), done: lavender },
      { id: 'mushroom', label: t('questUi.stepMushroom'), done: mushroom },
      {
        id: 'return',
        label: t('questUi.stepReturnSorcerer'),
        done: quest.status === 'completed',
      },
    ];
  }
  if (quest.id === 'find_dining_way') {
    return [
      {
        id: 'keyring',
        label: t('questUi.stepKeyring'),
        done: Boolean(flags.has_dining_keyring),
      },
      {
        id: 'open',
        label: t('questUi.stepOpenDining'),
        done: Boolean(flags.dining_hall_path_open) || quest.status === 'completed',
      },
    ];
  }
  return null;
}

export function questStepsLabel(steps: QuestStepView[] | null, t: TranslateFn): string | null {
  if (!steps || steps.length === 0) {
    return null;
  }
  const done = steps.filter((step) => step.done).length;
  return t('common.steps', { done, total: steps.length });
}

function lootClaimed(context: ExplorationContext, lootId: string): boolean {
  return Object.values(context.locations).some((location) =>
    location.loot.some((item) => item.id === lootId && item.claimed),
  );
}

export function listQuestItems(context: ExplorationContext | null, t: TranslateFn): QuestItemView[] {
  const flags = context?.flags ?? {};
  const keyring =
    Boolean(flags.has_dining_keyring) ||
    (context ? lootClaimed(context, 'dining_keyring') : false);
  const lavender =
    Boolean(flags.ingredient_lavender) ||
    (context ? lootClaimed(context, 'dried_lavender') : false);
  const mushroom =
    Boolean(flags.ingredient_mushroom) ||
    (context ? lootClaimed(context, 'lowcap_mushroom') : false);

  return [
    {
      id: 'dining_keyring',
      name: t('questUi.itemKeyringName'),
      category: 'key',
      tag: t('questUi.itemKeyringTag'),
      obtained: keyring,
      location: keyring ? t('questUi.itemKeyringFound') : t('questUi.itemKeyringNotFound'),
      questName: t('questUi.itemKeyringQuest'),
      description: t('questUi.itemKeyringDesc'),
      image: '/items/dining_keyring.png',
    },
    {
      id: 'dried_lavender',
      name: t('questUi.itemLavenderName'),
      category: 'ingredient',
      tag: t('questUi.itemLavenderTag'),
      obtained: lavender,
      location: lavender ? t('questUi.itemLavenderFound') : t('questUi.itemLavenderNotFound'),
      questName: t('questUi.itemLavenderQuest'),
      description: t('questUi.itemLavenderDesc'),
      image: '/items/dried_lavender.png',
    },
    {
      id: 'lowcap_mushroom',
      name: t('questUi.itemMushroomName'),
      category: 'ingredient',
      tag: t('questUi.itemMushroomTag'),
      obtained: mushroom,
      location: mushroom ? t('questUi.itemMushroomFound') : t('questUi.itemMushroomNotFound'),
      questName: t('questUi.itemMushroomQuest'),
      description: t('questUi.itemMushroomDesc'),
      image: '/items/lowcap_mushroom.png',
    },
  ];
}
