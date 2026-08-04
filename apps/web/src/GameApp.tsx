'use client';

import { useCallback, useEffect, useState } from 'react';
import { useActorRef } from '@xstate/react';
import { battleMachine } from '@dark-fantasy/game-engine/machine/battleMachine';
import { explorationMachine } from '@dark-fantasy/game-engine/machine/explorationMachine';
import { createInitialProgression, normalizeSeed } from '@dark-fantasy/game-engine';
import type { PlayerProgression } from '@dark-fantasy/shared/types/progression';
import { useScreenMusic } from '@/audio/useScreenMusic';
import { AudioProvider } from '@/components/AudioProvider';
import { SettingsMenu } from '@/components/SettingsMenu';
import { BattleScreen } from '@/screens/BattleScreen';
import { ExplorationScreen } from '@/screens/ExplorationScreen';
import { PlayerScreen } from '@/screens/PlayerScreen';
import { WorldMapScreen } from '@/screens/WorldMapScreen';
import type { AppScreen } from '@dark-fantasy/shared/types/world';
import worldMapData from '@dark-fantasy/content/worldMap.json';
import type { WorldMapDefinition } from '@dark-fantasy/shared/types/world';
import type { MusicScreen } from '@/audio/types';
import { DEFAULT_ENEMY_PORTRAIT } from '@dark-fantasy/content/portraits';

const worldMap = worldMapData as WorldMapDefinition;
const SEED_STORAGE_KEY = 'dfcg-run-seed';

interface PendingLocationFight {
  locationId: string;
  enemyId: string;
}

function musicForScreen(screen: AppScreen): MusicScreen {
  if (screen === 'player') {
    return 'world';
  }
  return screen;
}

function readClientSeed(): number {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('seed');
  if (fromUrl && /^\d+$/.test(fromUrl)) {
    return normalizeSeed(Number(fromUrl));
  }
  const stored = window.sessionStorage.getItem(SEED_STORAGE_KEY);
  if (stored && /^\d+$/.test(stored)) {
    return normalizeSeed(Number(stored));
  }
  return Date.now() >>> 0;
}

function GameShell() {
  const [screen, setScreen] = useState<AppScreen>('world');
  const [playerReturnScreen, setPlayerReturnScreen] = useState<AppScreen>('world');
  const [progression, setProgression] = useState<PlayerProgression>(createInitialProgression);
  const [pendingLocationFight, setPendingLocationFight] = useState<PendingLocationFight | null>(
    null,
  );
  const [runSeed, setRunSeed] = useState(() => Date.now() >>> 0);
  const explorationActor = useActorRef(explorationMachine);
  const battleActor = useActorRef(battleMachine);
  useScreenMusic(musicForScreen(screen));

  useEffect(() => {
    const next = readClientSeed();
    setRunSeed(next);
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
  }, []);

  const handleProgressionChange = useCallback((next: PlayerProgression) => {
    setProgression(next);
  }, []);

  const handleRunSeedChange = useCallback((seed: number) => {
    const next = normalizeSeed(seed);
    setRunSeed(next);
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
  }, []);

  function resolveRunSeed(): number {
    const next = readClientSeed();
    if (next !== runSeed) {
      setRunSeed(next);
      window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
    }
    return next;
  }

  function leaveBattle() {
    if (!battleActor.getSnapshot().matches('idle')) {
      battleActor.send({ type: 'LEAVE_BATTLE' });
    }
  }

  function returnToExploration(result?: 'victory' | 'defeat' | 'abort') {
    const battleSnap = battleActor.getSnapshot();
    if (pendingLocationFight && !battleSnap.matches('idle')) {
      explorationActor.send({ type: 'SYNC_RNG', rng: battleSnap.context.rng });
    }
    if (pendingLocationFight) {
      const won = result === 'victory';
      explorationActor.send({
        type: 'RESOLVE_LOCATION_BATTLE',
        won,
        locationId: pendingLocationFight.locationId,
        enemyId: pendingLocationFight.enemyId,
      });
      setPendingLocationFight(null);
    }
    if (explorationActor.getSnapshot().matches('idle')) {
      explorationActor.send({ type: 'START_EXPLORATION', seed: resolveRunSeed() });
    }
    setScreen('exploration');
    leaveBattle();
  }

  function enterLocation(locationId: string) {
    const location = worldMap.locations.find((item) => item.id === locationId);
    if (!location?.enabled) {
      return;
    }
    if (location.targetScreen === 'exploration' || locationId === 'prison') {
      returnToExploration();
      return;
    }
    if (location.targetScreen === 'battle') {
      const seed = resolveRunSeed();
      leaveBattle();
      battleActor.send({ type: 'START_BATTLE', progression, rng: { seed, cursor: 0 } });
      setScreen('battle');
    }
  }

  function openPlayer() {
    setPlayerReturnScreen(screen === 'player' ? 'world' : screen);
    setScreen('player');
  }

  function startLocationBattle(locationId: string, enemyId: string) {
    const exploration = explorationActor.getSnapshot().context;
    const location = exploration.locations[locationId];
    const enemy = location?.enemies.find((item) => item.id === enemyId);
    if (!enemy) {
      return;
    }
    setPendingLocationFight({ locationId, enemyId });
    leaveBattle();
    battleActor.send({
      type: 'START_BATTLE',
      progression,
      enemy: {
        name: enemy.name,
        portrait: enemy.image ?? DEFAULT_ENEMY_PORTRAIT,
        deckSize: enemy.deckSize,
        barrierPerTurn: enemy.barrierPerTurn,
      },
      rng: exploration.rng,
    });
    setScreen('battle');
  }

  let content = (
    <WorldMapScreen onEnterLocation={enterLocation} onOpenPlayer={openPlayer} />
  );

  if (screen === 'battle') {
    content = (
      <BattleScreen
        actor={battleActor}
        progression={progression}
        onProgressionChange={handleProgressionChange}
        onReturnToExploration={() => {
          const snap = battleActor.getSnapshot();
          returnToExploration(
            snap.matches('victory')
              ? 'victory'
              : snap.matches('defeat')
                ? 'defeat'
                : 'abort',
          );
        }}
      />
    );
  } else if (screen === 'exploration') {
    content = (
      <ExplorationScreen
        actor={explorationActor}
        onStartLocationBattle={startLocationBattle}
        onOpenPlayer={openPlayer}
        onEscapeToWorld={() => setScreen('world')}
        runSeed={runSeed}
      />
    );
  } else if (screen === 'player') {
    content = (
      <PlayerScreen
        progression={progression}
        onBack={() => setScreen(playerReturnScreen)}
        backLabel={playerReturnScreen === 'exploration' ? '← Prison Map' : '← World Map'}
      />
    );
  }

  return (
    <>
      <SettingsMenu runSeed={runSeed} onRunSeedChange={handleRunSeedChange} />
      {content}
    </>
  );
}

export function GameApp() {
  return (
    <AudioProvider>
      <GameShell />
    </AudioProvider>
  );
}
