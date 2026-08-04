import type { ExplorationContext, RunQuest } from '@dark-fantasy/shared/types/exploration';

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

const QUEST_LOCATION_LABEL: Record<string, string> = {
  kill_warden: 'Prison Cell',
  gather_ritual_ingredients: 'Ritual Room',
  find_dining_way: 'Central Corridor',
  kill_inquisitor: 'Ritual Room',
  kill_resurrected_anarchist: 'Central Courtyard',
};

export function questLocationLabel(quest: RunQuest): string {
  return QUEST_LOCATION_LABEL[quest.id] ?? quest.targetLocationId ?? 'Hollowfort';
}

export function getQuestSteps(
  context: ExplorationContext | null,
  quest: RunQuest,
): QuestStepView[] | null {
  const flags = context?.flags ?? {};
  if (quest.id === 'gather_ritual_ingredients') {
    const lavender = Boolean(flags.ingredient_lavender);
    const mushroom = Boolean(flags.ingredient_mushroom);
    return [
      { id: 'lavender', label: 'Find dried lavender — Infirmary', done: lavender },
      {
        id: 'mushroom',
        label: 'Find a lowcap mushroom — Underground Tunnels',
        done: mushroom,
      },
      {
        id: 'return',
        label: 'Return to the Sorcerer in the Ritual Room',
        done: quest.status === 'completed',
      },
    ];
  }
  if (quest.id === 'find_dining_way') {
    return [
      {
        id: 'keyring',
        label: "Find the Executioner's Keyring — Torture Chamber",
        done: Boolean(flags.has_dining_keyring),
      },
      {
        id: 'open',
        label: 'Open the Dining Hall path',
        done: Boolean(flags.dining_hall_path_open) || quest.status === 'completed',
      },
    ];
  }
  return null;
}

export function questStepsLabel(steps: QuestStepView[] | null): string | null {
  if (!steps || steps.length === 0) {
    return null;
  }
  const done = steps.filter((step) => step.done).length;
  return `${done} / ${steps.length} STEPS`;
}

function lootClaimed(context: ExplorationContext, lootId: string): boolean {
  return Object.values(context.locations).some((location) =>
    location.loot.some((item) => item.id === lootId && item.claimed),
  );
}

export function listQuestItems(context: ExplorationContext | null): QuestItemView[] {
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
      name: "Executioner's Keyring",
      category: 'key',
      tag: 'KEY ITEM',
      obtained: keyring,
      location: keyring ? 'FOUND · TORTURE CHAMBER' : 'NOT YET FOUND · TORTURE CHAMBER',
      questName: 'The Locked Mess',
      description:
        "Taken from the Executioner's belt. Fits the door between the Central Corridor and the Dining Hall.",
      image: '/items/dining_keyring.png',
    },
    {
      id: 'dried_lavender',
      name: 'Dried Lavender',
      category: 'ingredient',
      tag: 'INGREDIENT',
      obtained: lavender,
      location: lavender ? 'FOUND · INFIRMARY' : 'NOT YET FOUND · INFIRMARY',
      questName: 'Ingredients for the Circle',
      description: 'A ritual ingredient the Sorcerer needs to steady the wards beneath Hollowfort.',
      image: '/items/dried_lavender.png',
    },
    {
      id: 'lowcap_mushroom',
      name: 'Lowcap Mushroom',
      category: 'ingredient',
      tag: 'INGREDIENT',
      obtained: mushroom,
      location: mushroom
        ? 'FOUND · UNDERGROUND TUNNELS'
        : 'NOT YET FOUND · UNDERGROUND TUNNELS',
      questName: 'Ingredients for the Circle',
      description: "Glows faintly blue. The Sorcerer wants it to bind the wards he's repairing.",
      image: '/items/lowcap_mushroom.png',
    },
  ];
}
