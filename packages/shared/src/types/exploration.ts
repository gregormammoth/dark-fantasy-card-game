import type { CardClass, CardInstance } from './card';
import type { EnemyBand, EnemyGroup } from './enemy';
import type { PlayerSkills } from './progression';
import type { RngState } from './rng';

export type LocationType =
  | 'start'
  | 'hub'
  | 'loot'
  | 'npc'
  | 'danger'
  | 'secret'
  | 'boss'
  | 'gate';

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
  description?: string;
  image?: string;
  defeated: boolean;
  requiresFlag?: string;
  skipAutoEncounter?: boolean;
  band?: EnemyBand;
  group?: EnemyGroup;
  signatureCardIds?: string[];
  deckSize?: number;
  startingShield?: number;
  maxShield?: number;
  barrierPerTurn?: number;
}

export interface LocationEnemyPlacement {
  id: string;
  requiresFlag?: string;
  skipAutoEncounter?: boolean;
}

export interface LocationNpc {
  id: string;
  name: string;
  description: string;
  tag?: string;
  lines?: string[];
  followUpLines?: string[];
  image?: string;
  talked: boolean;
  grantsQuestId?: string;
  requiresFlag?: string;
}

export interface LocationQuest {
  name: string;
  description: string;
}

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  targetEnemyId?: string;
  targetLocationId?: string;
  branchId?: string;
  requiredLocationIds?: string[];
  completeOnReturnTo?: string;
  grantsQuestIdOnComplete?: string;
  setFlagOnComplete?: string;
}

export type RunQuestStatus = 'active' | 'completed';

export interface RunQuest {
  id: string;
  name: string;
  description: string;
  status: RunQuestStatus;
  targetEnemyId?: string;
  targetLocationId?: string;
  branchId?: string;
}

export type LocationEncounterKind = 'dialog' | 'battle';

export interface LocationEncounterItem {
  type: LocationEncounterKind;
  locationId: string;
  targetId?: string;
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
  quest?: LocationQuest;
  interactions: LocationInteraction[];
  visited: boolean;
  discovered: boolean;
  image?: string;
}

export type LocationSourceDefinition = Omit<LocationDefinition, 'enemies'> & {
  enemies: LocationEnemyPlacement[];
};

export interface ExplorationLogEntry {
  id: number;
  message: string;
  kind: 'system' | 'action' | 'encounter' | 'move' | 'loot' | 'danger';
}

export type ExplorationCardPile = 'hand' | 'deck' | 'discard' | 'all';

export interface EncounterResultCard {
  instanceId: string;
  cardId: string;
  name: string;
}

export interface EncounterResults {
  discarded: EncounterResultCard[];
  recovered: EncounterResultCard[];
  added: EncounterResultCard[];
  shuffled?: Exclude<ExplorationCardPile, 'all'> | 'all';
  shieldBefore: number;
  shieldAfter: number;
  maxShieldBefore: number;
  maxShieldAfter: number;
  manaBefore: number;
  manaAfter: number;
  maxManaBefore: number;
  maxManaAfter: number;
}

export interface PendingEncounter {
  id: string;
  title: string;
  description: string;
  results?: EncounterResults;
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
  shield: number;
  maxShield: number;
  mana: number;
  maxMana: number;
  actionsRemaining: number;
  maxActions: number;
  handSize: number;
  turnCount: number;
  flags: Record<string, boolean>;
  encounterDeck: string[];
  encounterDiscard: string[];
  pendingEncounter: PendingEncounter | null;
  locationEncounterQueue: LocationEncounterItem[];
  dialogLineIndex: number;
  finalBranchId: string | null;
  quests: RunQuest[];
  lastActionMessage: string | null;
  log: ExplorationLogEntry[];
  rng: RngState;
}

export type ExplorationEvent =
  | {
      type: 'START_EXPLORATION';
      seed?: number;
      deckCardIds?: string[];
      skills?: PlayerSkills;
    }
  | { type: 'SELECT_LOCATION'; locationId: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SELECT_CARD'; cardInstanceId: string }
  | { type: 'CLEAR_CARD' }
  | {
      type: 'PLAY_ACTION';
      action: ExplorationActionType;
      targetId?: string;
      interactionId?: string;
      cardInstanceId?: string;
    }
  | { type: 'END_TURN' }
  | { type: 'DISMISS_ENCOUNTER' }
  | { type: 'ADVANCE_DIALOG' }
  | { type: 'QUEUE_DIALOG'; locationId: string; npcId?: string }
  | { type: 'QUEUE_BATTLE'; locationId: string; enemyId?: string }
  | { type: 'FLEE_LOCATION_BATTLE' }
  | {
      type: 'RESOLVE_LOCATION_BATTLE';
      won: boolean;
      locationId?: string;
      enemyId?: string;
    }
  | { type: 'ACK_ESCAPE' }
  | { type: 'SYNC_RNG'; rng: RngState }
  | {
      type: 'SYNC_PLAYER_CARDS';
      hand: CardInstance[];
      deck: CardInstance[];
      discard: CardInstance[];
      shield?: number;
      maxShield?: number;
      mana?: number;
      maxMana?: number;
    }
  | {
      type: 'HYDRATE';
      context: ExplorationContext;
      phase: 'playerTurn' | 'encounter';
    }
  | { type: 'RESET' }
  | {
      type: 'RESTART';
      seed?: number;
      deckCardIds?: string[];
      skills?: PlayerSkills;
    };

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
  | 'queueBattle'
  | 'completeInteraction'
  | 'unlockInteraction'
  | 'setFlag'
  | 'recoverDiscard'
  | 'discardCards'
  | 'shuffleCards'
  | 'addCards'
  | 'modifyShield'
  | 'modifyMana'
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
  pile?: ExplorationCardPile;
  cardIds?: string[];
}

export interface EncounterDefinition {
  id: string;
  title: string;
  description: string;
  effects: ExplorationEffect[];
  weight?: number;
}
