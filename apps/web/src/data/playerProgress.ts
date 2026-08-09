import type { CardClass, CardDefinition } from '@dark-fantasy/shared/types/card';
import type { PlayerLoadout, PlayerProgression } from '@dark-fantasy/shared/types/progression';
import {
  XP_PER_CLASS_LEVEL,
  IMPROVED_CARD_LEVEL_COST,
} from '@dark-fantasy/shared/types/progression';
import {
  DECK_CAP,
  availableLevelsForClass,
  canUnlockImprovedCard,
  createInitialLoadout,
  getCardsForClass as engineGetCardsForClass,
  listAllPlayerCards,
  listImprovedPlayerCards,
  spentLevelsForClass,
} from '@dark-fantasy/game-engine';

export { DECK_CAP, createInitialLoadout };
export const PLAYER_CLASSES: CardClass[] = ['warrior', 'rogue', 'wizard', 'survivor', 'seeker'];
export const LEVEL_COST = IMPROVED_CARD_LEVEL_COST;
export const XP_PER_LEVEL = XP_PER_CLASS_LEVEL;

export type CardStatus = 'unlocked' | 'available' | 'locked-xp';

export function getPlayerCardDefinitions(): CardDefinition[] {
  return listAllPlayerCards();
}

export function getCardsForClass(classId: CardClass): CardDefinition[] {
  return engineGetCardsForClass(classId);
}

export function getDefaultDeckIds(): string[] {
  return createInitialLoadout().deckCardIds;
}

export function cardStatusFor(
  card: CardDefinition,
  progression: PlayerProgression,
  loadout: PlayerLoadout,
): CardStatus {
  if (loadout.unlockedCardIds.includes(card.id)) {
    return 'unlocked';
  }
  if (!card.improved) {
    return 'locked-xp';
  }
  if (canUnlockImprovedCard(progression, loadout, card.id)) {
    return 'available';
  }
  return 'locked-xp';
}

export function classSpendableLevels(
  progression: PlayerProgression,
  loadout: PlayerLoadout,
  classId: CardClass,
): number {
  return availableLevelsForClass(progression, loadout, classId);
}

export function classSpentLevels(loadout: PlayerLoadout, classId: CardClass): number {
  return spentLevelsForClass(loadout, classId);
}

export function unclaimedCardChoices(
  progression: PlayerProgression,
  loadout: PlayerLoadout,
): number {
  const improved = listImprovedPlayerCards();
  return PLAYER_CLASSES.reduce((total, classId) => {
    const levels = availableLevelsForClass(progression, loadout, classId);
    if (levels < LEVEL_COST) {
      return total;
    }
    const stillLocked = improved.filter(
      (card) => card.class === classId && !loadout.unlockedCardIds.includes(card.id),
    ).length;
    return total + Math.min(Math.floor(levels / LEVEL_COST), stillLocked);
  }, 0);
}
