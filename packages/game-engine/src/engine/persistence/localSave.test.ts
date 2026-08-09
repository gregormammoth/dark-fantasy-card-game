/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import { createInitialExploration } from '../exploration/setup';
import { createInitialProgression } from '../progression/xp';
import { createInitialLoadout } from '../progression/loadout';
import {
  buildLocalSaveFile,
  hasResumableRun,
  parseLocalSave,
  serializeLocalSave,
} from './localSave';

describe('localSave', () => {
  it('round-trips a resumable exploration save', () => {
    const exploration = createInitialExploration(4242);
    const state = {
      progression: createInitialProgression(),
      loadout: createInitialLoadout(),
      exploration,
      explorationPhase: 'playerTurn' as const,
      screen: 'exploration' as const,
      playerReturnScreen: 'world' as const,
      runSeed: 4242,
      pendingLocationFight: null,
    };
    const parsed = parseLocalSave(serializeLocalSave(state));
    expect(parsed).not.toBeNull();
    expect(parsed?.state.runSeed).toBe(4242);
    expect(parsed?.state.loadout.deckCardIds.length).toBeGreaterThan(0);
    expect(parsed?.state.exploration?.rng.seed).toBe(4242);
    expect(hasResumableRun(parsed!.state)).toBe(true);
  });

  it('rejects incompatible schema versions', () => {
    const file = buildLocalSaveFile({
      progression: createInitialProgression(),
      loadout: createInitialLoadout(),
      exploration: null,
      explorationPhase: 'idle',
      screen: 'world',
      playerReturnScreen: 'world',
      runSeed: 1,
      pendingLocationFight: null,
    });
    const raw = JSON.stringify({ ...file, schemaVersion: 999 });
    expect(parseLocalSave(raw)).toBeNull();
  });

  it('fills default skills when loading progression without them', () => {
    const raw = JSON.stringify({
      schemaVersion: 2,
      savedAt: new Date().toISOString(),
      state: {
        progression: {
          classes: {
            warrior: { xp: 10 },
            rogue: { xp: 0 },
            wizard: { xp: 0 },
            survivor: { xp: 0 },
            seeker: { xp: 0 },
          },
        },
        loadout: createInitialLoadout(),
        exploration: null,
        explorationPhase: 'idle',
        screen: 'world',
        playerReturnScreen: 'world',
        runSeed: 7,
        pendingLocationFight: null,
      },
    });
    const parsed = parseLocalSave(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.state.progression.skills.maxShield).toBe(2);
    expect(parsed?.state.progression.skills.maxCombo).toBe(2);
  });
});
