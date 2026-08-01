import encountersData from '@/data/encounters.json';
import type { EncounterDefinition, ExplorationContext } from '@/types/exploration';
import { shuffle } from '@/engine/deck';
import { appendExplorationLog } from './log';
import { resolveExplorationEffects } from './resolveEffects';

const encounterRegistry = new Map<string, EncounterDefinition>();

for (const encounter of encountersData as EncounterDefinition[]) {
  encounterRegistry.set(encounter.id, encounter);
}

export function buildEncounterDeck(): string[] {
  const ids: string[] = [];
  for (const encounter of encountersData as EncounterDefinition[]) {
    const weight = encounter.weight ?? 1;
    for (let i = 0; i < weight; i += 1) {
      ids.push(encounter.id);
    }
  }
  return shuffle(ids);
}

export function getEncounterDefinition(id: string): EncounterDefinition | undefined {
  return encounterRegistry.get(id);
}

function drawEncounterId(context: ExplorationContext): string | null {
  if (context.encounterDeck.length === 0) {
    if (context.encounterDiscard.length === 0) {
      return null;
    }
    context.encounterDeck = shuffle(context.encounterDiscard);
    context.encounterDiscard = [];
    appendExplorationLog(context, 'Encounter deck reshuffled.', 'encounter');
  }
  return context.encounterDeck.shift() ?? null;
}

export function drawAndResolveEncounter(context: ExplorationContext): ExplorationContext {
  const next = structuredClone(context);

  if (next.flags.skipNextEncounter) {
    next.flags.skipNextEncounter = false;
    next.pendingEncounter = {
      id: 'skipped',
      title: 'Encounter Avoided',
      description: 'Your earlier caution pays off. Nothing finds you this time.',
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
    };
    return next;
  }

  const definition = getEncounterDefinition(encounterId);
  if (!definition) {
    return next;
  }

  next.encounterDiscard.push(encounterId);
  next.pendingEncounter = {
    id: definition.id,
    title: definition.title,
    description: definition.description,
  };
  appendExplorationLog(next, `Encounter: ${definition.title}.`, 'encounter');
  return resolveExplorationEffects(next, definition.effects);
}

export function dismissEncounter(context: ExplorationContext): ExplorationContext {
  const next = structuredClone(context);
  next.pendingEncounter = null;
  return next;
}
