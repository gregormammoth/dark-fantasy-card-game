export type TourStep = 'dialog' | 'move' | 'battle' | 'progression';

const STORAGE_KEY = 'dfcg-tour-v1';

interface TourStore {
  character?: boolean;
  players?: Record<string, Partial<Record<TourStep, boolean>>>;
}

function readStore(): TourStore {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) {
      return {};
    }
    return value as TourStore;
  } catch {
    return {};
  }
}

function writeStore(store: TourStore): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    return;
  }
}

export function isCharacterCoachSeen(): boolean {
  return readStore().character === true;
}

export function markCharacterCoachSeen(): void {
  const store = readStore();
  store.character = true;
  writeStore(store);
}

export function isStepSeen(playerId: string, step: TourStep): boolean {
  return readStore().players?.[playerId]?.[step] === true;
}

export function markStepSeen(playerId: string, step: TourStep): void {
  const store = readStore();
  const players = store.players ?? {};
  const player = players[playerId] ?? {};
  player[step] = true;
  players[playerId] = player;
  store.players = players;
  writeStore(store);
}

export function resetTour(playerId?: string): void {
  const store = readStore();
  if (playerId && store.players) {
    delete store.players[playerId];
  } else {
    writeStore({});
    return;
  }
  writeStore(store);
}
