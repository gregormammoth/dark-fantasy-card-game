import playerCardsData from '@dark-fantasy/content/playerCards.json';
import improvedCardsData from '@dark-fantasy/content/improvedCards.json';
import { PLAYER_GENDER_PORTRAITS } from '@dark-fantasy/content/portraits';
import type { CardClass, CardDefinition } from '@dark-fantasy/shared/types/card';
import type { PlayerGender } from '@dark-fantasy/shared/types/player';
import type { PlayerLoadout } from '@dark-fantasy/shared/types/progression';
import {
  getAvailableClassLevels,
  getClassXp,
  getImprovedUnlockCost,
} from './xp';
import { getDeckCap } from './skills';
import type { PlayerProgression } from '@dark-fantasy/shared/types/progression';
import { PLAYER_SKILL_BASE } from '@dark-fantasy/shared/types/progression';

const baseCards = (playerCardsData as CardDefinition[]).map((card) => ({
  ...card,
  improved: false,
}));

const improvedCards = (improvedCardsData as CardDefinition[]).map((card) => ({
  ...card,
  improved: true,
}));

const allCards: CardDefinition[] = [...baseCards, ...improvedCards];
const cardById = new Map(allCards.map((card) => [card.id, card]));

export const DECK_CAP = PLAYER_SKILL_BASE.maxDeck;

export function listAllPlayerCards(): CardDefinition[] {
  return allCards;
}

export function listBasePlayerCards(): CardDefinition[] {
  return baseCards;
}

export function listImprovedPlayerCards(): CardDefinition[] {
  return improvedCards;
}

export function getPlayerCardById(cardId: string): CardDefinition | undefined {
  return cardById.get(cardId);
}

export function getCardsForClass(classId: CardClass): CardDefinition[] {
  return allCards.filter((card) => card.class === classId);
}

export function createInitialLoadout(): PlayerLoadout {
  const unlockedCardIds = baseCards.map((card) => card.id);
  return {
    unlockedCardIds,
    deckCardIds: [...unlockedCardIds],
  };
}

export function isCardUnlocked(loadout: PlayerLoadout, cardId: string): boolean {
  return loadout.unlockedCardIds.includes(cardId);
}

export function spentLevelsForClass(loadout: PlayerLoadout, classId: CardClass): number {
  return improvedCards.filter(
    (card) => card.class === classId && loadout.unlockedCardIds.includes(card.id),
  ).length;
}

export function availableLevelsForClass(
  progression: PlayerProgression,
  loadout: PlayerLoadout,
  classId: CardClass,
): number {
  return getAvailableClassLevels(
    getClassXp(progression, classId),
    spentLevelsForClass(loadout, classId),
  );
}

export function canUnlockImprovedCard(
  progression: PlayerProgression,
  loadout: PlayerLoadout,
  cardId: string,
): boolean {
  const card = cardById.get(cardId);
  if (!card?.class || !card.improved) {
    return false;
  }
  if (loadout.unlockedCardIds.includes(cardId)) {
    return false;
  }
  return availableLevelsForClass(progression, loadout, card.class) >= getImprovedUnlockCost();
}

export function replaceDeckCard(
  loadout: PlayerLoadout,
  addCardId: string,
  removeCardId: string,
): PlayerLoadout | null {
  if (addCardId === removeCardId) {
    return null;
  }
  if (!loadout.unlockedCardIds.includes(addCardId)) {
    return null;
  }
  if (loadout.deckCardIds.includes(addCardId)) {
    return null;
  }
  if (!loadout.deckCardIds.includes(removeCardId)) {
    return null;
  }
  return {
    ...loadout,
    deckCardIds: loadout.deckCardIds.map((id) => (id === removeCardId ? addCardId : id)),
  };
}

export function unlockImprovedCard(
  progression: PlayerProgression,
  loadout: PlayerLoadout,
  cardId: string,
  replaceCardId?: string,
): PlayerLoadout | null {
  if (!canUnlockImprovedCard(progression, loadout, cardId)) {
    return null;
  }
  const deckCap = getDeckCap(progression);
  const unlockedCardIds = [...loadout.unlockedCardIds, cardId];
  if (loadout.deckCardIds.length < deckCap) {
    return {
      unlockedCardIds,
      deckCardIds: [...loadout.deckCardIds, cardId],
    };
  }
  const swapped = replaceDeckCard(
    { unlockedCardIds, deckCardIds: loadout.deckCardIds },
    cardId,
    replaceCardId ?? '',
  );
  return swapped;
}

export function toggleDeckCard(
  loadout: PlayerLoadout,
  cardId: string,
  progression?: PlayerProgression,
): PlayerLoadout {
  if (!loadout.unlockedCardIds.includes(cardId)) {
    return loadout;
  }
  if (loadout.deckCardIds.includes(cardId)) {
    return loadout;
  }
  const deckCap = progression ? getDeckCap(progression) : DECK_CAP;
  if (loadout.deckCardIds.length >= deckCap) {
    return loadout;
  }
  return {
    ...loadout,
    deckCardIds: [...loadout.deckCardIds, cardId],
  };
}

const CLASS_ORDER: CardClass[] = ['warrior', 'rogue', 'wizard', 'survivor', 'seeker'];

export function countDeckClasses(deckCardIds: string[]): Record<CardClass, number> {
  const counts: Record<CardClass, number> = {
    warrior: 0,
    rogue: 0,
    wizard: 0,
    survivor: 0,
    seeker: 0,
  };
  for (const id of deckCardIds) {
    const classId = cardById.get(id)?.class;
    if (classId) {
      counts[classId] += 1;
    }
  }
  return counts;
}

export function getDominantDeckClass(deckCardIds: string[]): CardClass {
  const counts = countDeckClasses(deckCardIds);
  let dominant = CLASS_ORDER[0];
  for (const classId of CLASS_ORDER) {
    if (counts[classId] > counts[dominant]) {
      dominant = classId;
    }
  }
  return dominant;
}

export function getPlayerPortraitForDeck(
  deckCardIds: string[],
  gender: PlayerGender = 'man',
): string {
  return PLAYER_GENDER_PORTRAITS[gender][getDominantDeckClass(deckCardIds)];
}

export function resolveLoadoutDeckDefinitions(loadout: PlayerLoadout): CardDefinition[] {
  return loadout.deckCardIds
    .map((id) => cardById.get(id))
    .filter((card): card is CardDefinition => Boolean(card));
}
