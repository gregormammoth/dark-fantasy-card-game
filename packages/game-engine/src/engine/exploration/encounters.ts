import encountersData from '@dark-fantasy/content/encounters.json';
import type {
  EncounterDefinition,
  EncounterResultCard,
  EncounterResults,
  ExplorationContext,
} from '@dark-fantasy/shared/types/exploration';
import type { CardInstance } from '@dark-fantasy/shared/types/card';
import type { RngState } from '@dark-fantasy/shared/types/rng';
import { shuffle } from '../deck';
import { appendExplorationLog } from './log';
import { resolveExplorationEffects } from './resolveEffects';

const encounterRegistry = new Map<string, EncounterDefinition>();

for (const encounter of encountersData as EncounterDefinition[]) {
  encounterRegistry.set(encounter.id, encounter);
}

export function buildEncounterDeck(rng: RngState): string[] {
  const ids: string[] = [];
  for (const encounter of encountersData as EncounterDefinition[]) {
    const weight = encounter.weight ?? 1;
    for (let i = 0; i < weight; i += 1) {
      ids.push(encounter.id);
    }
  }
  return shuffle(ids, rng);
}

export function getEncounterDefinition(id: string): EncounterDefinition | undefined {
  return encounterRegistry.get(id);
}

function drawEncounterId(context: ExplorationContext): string | null {
  if (context.encounterDeck.length === 0) {
    if (context.encounterDiscard.length === 0) {
      return null;
    }
    context.encounterDeck = shuffle(context.encounterDiscard, context.rng);
    context.encounterDiscard = [];
    appendExplorationLog(context, 'Encounter deck reshuffled.', 'encounter');
  }
  return context.encounterDeck.shift() ?? null;
}

function toResultCard(card: CardInstance): EncounterResultCard {
  return {
    instanceId: card.instanceId,
    cardId: card.definition.id,
    name: card.definition.name,
  };
}

function buildEncounterResults(
  before: ExplorationContext,
  after: ExplorationContext,
  definition: EncounterDefinition,
): EncounterResults {
  const beforeIds = new Set(
    [...before.hand, ...before.deck, ...before.discard].map((card) => card.instanceId),
  );
  const beforeDiscardIds = new Set(before.discard.map((card) => card.instanceId));
  const beforeHandIds = new Set(before.hand.map((card) => card.instanceId));
  const afterHandIds = new Set(after.hand.map((card) => card.instanceId));
  const afterDiscardIds = new Set(after.discard.map((card) => card.instanceId));

  const discarded = after.discard
    .filter((card) => beforeHandIds.has(card.instanceId) && afterDiscardIds.has(card.instanceId))
    .map(toResultCard);

  const recovered = after.hand
    .filter((card) => beforeDiscardIds.has(card.instanceId) && afterHandIds.has(card.instanceId))
    .map(toResultCard);

  const added = [...after.hand, ...after.deck, ...after.discard]
    .filter((card) => !beforeIds.has(card.instanceId))
    .map(toResultCard);

  const shuffleEffect = definition.effects.find((effect) => effect.type === 'shuffleCards');

  return {
    discarded,
    recovered,
    added,
    shuffled: shuffleEffect ? (shuffleEffect.pile ?? 'hand') : undefined,
    shieldBefore: before.shield,
    shieldAfter: after.shield,
    maxShieldBefore: before.maxShield,
    maxShieldAfter: after.maxShield,
  };
}

export function drawAndResolveEncounter(context: ExplorationContext): ExplorationContext {
  const next = structuredClone(context);

  if (next.flags.skipNextEncounter) {
    next.flags.skipNextEncounter = false;
    next.pendingEncounter = {
      id: 'skipped',
      title: 'Encounter Avoided',
      description: 'Your earlier caution pays off. Nothing finds you this time.',
      results: {
        discarded: [],
        recovered: [],
        added: [],
        shieldBefore: next.shield,
        shieldAfter: next.shield,
        maxShieldBefore: next.maxShield,
        maxShieldAfter: next.maxShield,
      },
    };
    appendExplorationLog(next, 'You avoid the encounter.', 'encounter');
    return next;
  }

  const encounterId = drawEncounterId(next);
  if (!encounterId) {
    next.pendingEncounter = {
      id: 'empty',
      title: 'Quiet Watch',
      description: 'The encounter deck is empty. The prison stays still.',
      results: {
        discarded: [],
        recovered: [],
        added: [],
        shieldBefore: next.shield,
        shieldAfter: next.shield,
        maxShieldBefore: next.maxShield,
        maxShieldAfter: next.maxShield,
      },
    };
    return next;
  }

  const definition = getEncounterDefinition(encounterId);
  if (!definition) {
    return next;
  }

  next.encounterDiscard.push(encounterId);
  const before = structuredClone(next);
  appendExplorationLog(next, `Encounter: ${definition.title}.`, 'encounter');
  const resolved = resolveExplorationEffects(next, definition.effects);
  resolved.pendingEncounter = {
    id: definition.id,
    title: definition.title,
    description: definition.description,
    results: buildEncounterResults(before, resolved, definition),
  };
  return resolved;
}

export function dismissEncounter(context: ExplorationContext): ExplorationContext {
  const next = structuredClone(context);
  next.pendingEncounter = null;
  return next;
}
