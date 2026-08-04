import type { CardDefinition, CardInstance } from '@dark-fantasy/shared/types/card';
import type { RngState } from '@dark-fantasy/shared/types/rng';
import { shuffle as shuffleWithRng } from './rng';

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

export function shuffle<T>(array: T[], rng: RngState): T[] {
  return shuffleWithRng(array, rng);
}

export function drawCards(
  deck: CardInstance[],
  discard: CardInstance[],
  count: number,
): { deck: CardInstance[]; discard: CardInstance[]; drawn: CardInstance[] } {
  const currentDeck = [...deck];
  const drawn: CardInstance[] = [];

  for (let i = 0; i < count; i += 1) {
    if (currentDeck.length === 0) {
      break;
    }
    const card = currentDeck.shift();
    if (card) {
      drawn.push(card);
    }
  }

  return { deck: currentDeck, discard, drawn };
}
