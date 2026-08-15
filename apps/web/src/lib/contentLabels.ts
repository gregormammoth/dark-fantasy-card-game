import type { MessageKey, TranslateFn } from '@/i18n/types';

function contentKey(path: string): MessageKey {
  return `content.${path}` as MessageKey;
}

function contentText(t: TranslateFn, path: string, fallback?: string): string {
  const translated = t(contentKey(path));
  if (translated === contentKey(path)) {
    return fallback ?? path;
  }
  return translated;
}

export function getCardName(cardId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `cards.${cardId}.name`, fallback ?? cardId);
}

export function getCardDescription(cardId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `cards.${cardId}.description`, fallback ?? '');
}

export function getEnemyCardName(cardId: string, t: TranslateFn, fallback?: string): string {
  const fromEnemyCards = t(contentKey(`enemyCards.${cardId}.name`));
  if (fromEnemyCards !== contentKey(`enemyCards.${cardId}.name`)) {
    return fromEnemyCards;
  }
  return getCardName(cardId, t, fallback);
}

export function getEnemyCardDescription(
  cardId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  const fromEnemyCards = t(contentKey(`enemyCards.${cardId}.description`));
  if (fromEnemyCards !== contentKey(`enemyCards.${cardId}.description`)) {
    return fromEnemyCards;
  }
  return getCardDescription(cardId, t, fallback);
}

export function getAnyCardName(cardId: string, t: TranslateFn, fallback?: string): string {
  const player = t(contentKey(`cards.${cardId}.name`));
  if (player !== contentKey(`cards.${cardId}.name`)) {
    return player;
  }
  return getEnemyCardName(cardId, t, fallback);
}

export function getAnyCardDescription(
  cardId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  const player = t(contentKey(`cards.${cardId}.description`));
  if (player !== contentKey(`cards.${cardId}.description`)) {
    return player;
  }
  return getEnemyCardDescription(cardId, t, fallback);
}

export function getEnemyName(enemyId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `enemies.${enemyId}.name`, fallback ?? enemyId);
}

export function getEnemyDescription(
  enemyId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `enemies.${enemyId}.description`, fallback ?? '');
}

export function getEnemyTier(enemyId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `enemies.${enemyId}.tier`, fallback ?? '');
}

export function getLocationName(locationId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `locations.${locationId}.name`, fallback ?? locationId);
}

export function getLocationSubtitle(
  locationId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `locations.${locationId}.subtitle`, fallback ?? '');
}

export function getLocationDescription(
  locationId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `locations.${locationId}.description`, fallback ?? '');
}

export function getEncounterTitle(encounterId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `encounters.${encounterId}.title`, fallback ?? encounterId);
}

export function getEncounterDescription(
  encounterId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `encounters.${encounterId}.description`, fallback ?? '');
}

export function getNpcName(npcId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `npcs.${npcId}.name`, fallback ?? npcId);
}

export function getNpcTag(npcId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `npcs.${npcId}.tag`, fallback ?? '');
}

export function getNpcDescription(npcId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `npcs.${npcId}.description`, fallback ?? '');
}

export function getNpcLine(
  npcId: string,
  index: number,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `npcs.${npcId}.line${index}`, fallback ?? '');
}

export function getNpcFollowUpLine(
  npcId: string,
  index: number,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `npcs.${npcId}.followUp${index}`, fallback ?? '');
}

export function getNpcLines(
  npcId: string,
  lines: string[] | undefined,
  t: TranslateFn,
  followUp = false,
): string[] {
  if (!lines || lines.length === 0) {
    return [];
  }
  return lines.map((fallback, index) =>
    followUp
      ? getNpcFollowUpLine(npcId, index, t, fallback)
      : getNpcLine(npcId, index, t, fallback),
  );
}

export function getQuestName(questId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `quests.${questId}.name`, fallback ?? questId);
}

export function getQuestDescription(
  questId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `quests.${questId}.description`, fallback ?? '');
}

export function getWorldLocationName(
  locationId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `worldLocations.${locationId}.name`, fallback ?? locationId);
}

export function getWorldThreatName(
  locationId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `worldLocations.${locationId}.threatName`, fallback ?? '');
}

export function getWorldThreatTier(
  locationId: string,
  t: TranslateFn,
  fallback?: string,
): string {
  return contentText(t, `worldLocations.${locationId}.threatTier`, fallback ?? '');
}

export function getLootName(lootId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `loot.${lootId}.name`, fallback ?? lootId);
}

export function getLootDescription(lootId: string, t: TranslateFn, fallback?: string): string {
  return contentText(t, `loot.${lootId}.description`, fallback ?? '');
}
