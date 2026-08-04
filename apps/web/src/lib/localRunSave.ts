import {
  hasResumableRun,
  parseLocalSave,
  serializeLocalSave,
} from '@dark-fantasy/game-engine';
import type { LocalRunState, LocalSaveFile } from '@dark-fantasy/shared/types/save';

export const LOCAL_RUN_STORAGE_KEY = 'dfcg-local-run-v1';

export function loadLocalRun(): LocalSaveFile | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_RUN_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return parseLocalSave(raw);
  } catch {
    return null;
  }
}

export function saveLocalRun(state: LocalRunState): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (!hasResumableRun(state) && state.screen === 'world') {
      window.localStorage.removeItem(LOCAL_RUN_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(LOCAL_RUN_STORAGE_KEY, serializeLocalSave(state));
  } catch {
    return;
  }
}

export function clearLocalRun(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(LOCAL_RUN_STORAGE_KEY);
  } catch {
    return;
  }
}
