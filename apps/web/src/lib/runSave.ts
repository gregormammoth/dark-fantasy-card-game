import {
  buildLocalSaveFile,
  createRun,
  parseLocalSave,
} from '@dark-fantasy/game-engine';
import type { LocalRunState, LocalSaveFile } from '@dark-fantasy/shared/types/save';
import { ApiError, apiFetch } from '@/lib/api';

interface CloudSaveResponse {
  playerId: string;
  schemaVersion: number;
  savedAt: string;
  state: unknown;
}

export async function loadCloudRun(playerId: string): Promise<LocalSaveFile | null> {
  try {
    const response = await apiFetch<CloudSaveResponse>(`/saves/${playerId}`);
    return parseLocalSave(
      JSON.stringify({
        schemaVersion: response.schemaVersion,
        savedAt: response.savedAt,
        state: response.state,
      }),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function saveCloudRun(
  playerId: string,
  state: LocalRunState,
): Promise<void> {
  const body = buildLocalSaveFile(state);
  await apiFetch(`/saves/${playerId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function clearCloudRun(
  playerId: string,
  runSeed: number,
): Promise<void> {
  await saveCloudRun(playerId, createRun(runSeed));
}
