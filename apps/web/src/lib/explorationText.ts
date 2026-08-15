import type { ExplorationLogEntry } from '@dark-fantasy/shared/types/exploration';
import type { MessageKey, TranslateFn } from '@/i18n/types';
import { getQuestDescription, getQuestName } from '@/lib/contentLabels';
import type { QuestMarkHintKey } from '@dark-fantasy/game-engine/engine/exploration/quests';

const QUEST_MARK_KEYS: Record<QuestMarkHintKey, MessageKey> = {
  findLavender: 'questMark.findLavender',
  findMushroom: 'questMark.findMushroom',
  returnIngredients: 'questMark.returnIngredients',
  sorcererWaits: 'questMark.sorcererWaits',
  findKeyring: 'questMark.findKeyring',
  kitchenPath: 'questMark.kitchenPath',
  diningBarred: 'questMark.diningBarred',
  openDining: 'questMark.openDining',
  questDescription: 'questMark.questDescription',
};

export function translateQuestMarkHint(
  hintKey: QuestMarkHintKey,
  questId: string,
  t: TranslateFn,
  fallback: string,
): string {
  if (hintKey === 'questDescription') {
    return getQuestDescription(questId, t, fallback);
  }
  const key = QUEST_MARK_KEYS[hintKey];
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function translateExplorationLogEntry(
  entry: ExplorationLogEntry,
  t: TranslateFn,
): string {
  if (!entry.messageKey) {
    return entry.message;
  }
  const params = entry.params ?? {};
  const questId = typeof params.questId === 'string' ? params.questId : undefined;
  const interpolated = {
    ...params,
    ...(questId
      ? { name: getQuestName(questId, t, typeof params.name === 'string' ? params.name : questId) }
      : {}),
  };
  const translated = t(entry.messageKey as MessageKey, interpolated);
  if (translated === entry.messageKey) {
    return entry.message;
  }
  return translated;
}
