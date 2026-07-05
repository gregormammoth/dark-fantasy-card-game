import type { CardDefinition, CardInstance } from '@/types/card';

let instanceCounter = 0;

export function createCardInstance(definition: CardDefinition): CardInstance {
  instanceCounter += 1;
  return {
    instanceId: `${definition.id}_${instanceCounter}`,
    definition,
  };
}

export function resetInstanceCounter(): void {
  instanceCounter = 0;
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function drawCards(
  deck: CardInstance[],
  discard: CardInstance[],
  count: number,
): { deck: CardInstance[]; discard: CardInstance[]; drawn: CardInstance[] } {
  let currentDeck = [...deck];
  let currentDiscard = [...discard];
  const drawn: CardInstance[] = [];

  for (let i = 0; i < count; i += 1) {
    if (currentDeck.length === 0) {
      if (currentDiscard.length === 0) {
        break;
      }
      currentDeck = shuffle(currentDiscard);
      currentDiscard = [];
    }
    const card = currentDeck.shift();
    if (card) {
      drawn.push(card);
    }
  }

  return { deck: currentDeck, discard: currentDiscard, drawn };
}
