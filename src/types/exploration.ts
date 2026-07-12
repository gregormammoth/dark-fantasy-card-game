import type { CardClass, CardInstance } from './card';

export type LocationType =
  | 'start'
  | 'hub'
  | 'loot'
  | 'npc'
  | 'danger'
  | 'secret'
  | 'boss';

export type ExplorationActionType =
  | 'MOVE'
  | 'EXPLORE'
  | 'SEARCH'
  | 'OPEN'
  | 'ATTACK'
  | 'TALK'
  | 'REST';

export type LocationStatus = 'visited' | 'reachable' | 'distant';

export interface MapPosition {
  x: number;
  y: number;
}

export interface LocationEnemy {
  id: string;
  name: string;
  tier: string;
  defeated: boolean;
}

export interface LocationNpc {
  id: string;
  name: string;
  description: string;
  talked: boolean;
}

export interface LocationLoot {
  id: string;
  name: string;
  description: string;
  claimed: boolean;
}

export interface LocationInteraction {
  id: string;
  action: ExplorationActionType;
  label: string;
  targetId?: string;
  once?: boolean;
  completed?: boolean;
  requiresEmptyShield?: boolean;
  requiresEnemy?: boolean;
  requiresNpc?: boolean;
  requiresLoot?: boolean;
  locked?: boolean;
  unlocksLocationId?: string;
  requiresFlag?: string;
}

export interface LocationDefinition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  type: LocationType;
  position: MapPosition;
  connectedLocations: string[];
  secret?: boolean;
  enemies: LocationEnemy[];
  npcs: LocationNpc[];
  loot: LocationLoot[];
  interactions: LocationInteraction[];
  visited: boolean;
  discovered: boolean;
  image?: string;
}

export interface ExplorationLogEntry {
  id: number;
  message: string;
  kind: 'system' | 'action' | 'encounter' | 'move' | 'loot' | 'danger';
}

export interface PendingEncounter {
  id: string;
  title: string;
  description: string;
}

export interface ExplorationContext {
  mapId: string;
  mapName: string;
  locations: Record<string, LocationDefinition>;
  currentLocationId: string;
  selectedLocationId: string | null;
  selectedCardInstanceId: string | null;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  actionsRemaining: number;
  maxActions: number;
  handSize: number;
  turnCount: number;
  flags: Record<string, boolean>;
  encounterDeck: string[];
  encounterDiscard: string[];
  pendingEncounter: PendingEncounter | null;
  lastActionMessage: string | null;
  log: ExplorationLogEntry[];
}

export type ExplorationEvent =
  | { type: 'START_EXPLORATION' }
  | { type: 'SELECT_LOCATION'; locationId: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SELECT_CARD'; cardInstanceId: string }
  | { type: 'CLEAR_CARD' }
  | {
      type: 'PLAY_ACTION';
      action: ExplorationActionType;
      targetId?: string;
      interactionId?: string;
    }
  | { type: 'END_TURN' }
  | { type: 'DISMISS_ENCOUNTER' }
  | { type: 'RESTART' };

export interface ActionOutcomeDefinition {
  message: string;
  effects: ExplorationEffect[];
}

export interface ActionOutcomeTable {
  [action: string]: Partial<Record<CardClass | 'default', ActionOutcomeDefinition>>;
}

export type ExplorationEffectType =
  | 'log'
  | 'moveTo'
  | 'discoverConnected'
  | 'revealSecret'
  | 'claimLoot'
  | 'defeatEnemy'
  | 'talkNpc'
  | 'completeInteraction'
  | 'unlockInteraction'
  | 'setFlag'
  | 'recoverDiscard'
  | 'discardCards'
  | 'skipNextEncounter'
  | 'reshuffleEncounter'
  | 'nothing';

export interface ExplorationEffect {
  type: ExplorationEffectType;
  value?: number;
  count?: number;
  message?: string;
  locationId?: string;
  targetId?: string;
  flag?: string;
  flagValue?: boolean;
}

export interface EncounterDefinition {
  id: string;
  title: string;
  description: string;
  effects: ExplorationEffect[];
  weight?: number;
}
