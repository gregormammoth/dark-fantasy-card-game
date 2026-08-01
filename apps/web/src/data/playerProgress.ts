import type { CardClass, CardDefinition } from '@dark-fantasy/shared/types/card';
import playerCardsData from '@dark-fantasy/content/playerCards.json';

export const PLAYER_CLASSES: CardClass[] = ['fighter', 'rogue', 'wizard', 'survivor'];

export const DECK_CAP = 30;

export interface ClassProgressSeed {
  level: number;
  xp: number;
  xpNext: number;
}

export const classProgressSeed: Record<CardClass, ClassProgressSeed> = {
  fighter: { level: 4, xp: 1240, xpNext: 1500 },
  rogue: { level: 3, xp: 820, xpNext: 1000 },
  wizard: { level: 2, xp: 430, xpNext: 700 },
  survivor: { level: 1, xp: 120, xpNext: 400 },
};

export interface CardProgressMeta {
  cost: number;
  requirement: string | null;
  unlocked: boolean;
}

const playerCards = playerCardsData as CardDefinition[];

function buildCardMeta(): Record<string, CardProgressMeta> {
  const byClass: Record<CardClass, CardDefinition[]> = {
    fighter: [],
    rogue: [],
    wizard: [],
    survivor: [],
  };

  for (const card of playerCards) {
    if (card.class) {
      byClass[card.class].push(card);
    }
  }

  const meta: Record<string, CardProgressMeta> = {};
  const baseCosts = [0, 0, 150, 220, 300, 400, 520, 650];

  for (const classId of PLAYER_CLASSES) {
    byClass[classId].forEach((card, index) => {
      const unlocked = index < 2;
      const cost = baseCosts[Math.min(index, baseCosts.length - 1)] ?? 650;
      const requirement =
        index >= 5
          ? `${classId.charAt(0).toUpperCase()}${classId.slice(1)} Level ${Math.max(3, index - 1)}`
          : null;
      meta[card.id] = {
        cost: unlocked ? 0 : cost,
        requirement,
        unlocked,
      };
    });
  }

  return meta;
}

export const cardProgressMeta = buildCardMeta();

export function getPlayerCardDefinitions(): CardDefinition[] {
  return playerCards.filter((card) => Boolean(card.class));
}

export function getCardsForClass(classId: CardClass): CardDefinition[] {
  return getPlayerCardDefinitions().filter((card) => card.class === classId);
}

export function getDefaultDeckIds(): string[] {
  return getPlayerCardDefinitions()
    .filter((card) => cardProgressMeta[card.id]?.unlocked)
    .map((card) => card.id);
}
