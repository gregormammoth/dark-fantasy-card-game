'use client';

import { useCallback, useState } from 'react';
import { useActorRef } from '@xstate/react';
import { battleMachine } from '@dark-fantasy/game-engine/machine/battleMachine';
import { explorationMachine } from '@dark-fantasy/game-engine/machine/explorationMachine';
import { createInitialProgression } from '@dark-fantasy/game-engine';
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

function GameShell() {
  const [screen, setScreen] = useState<AppScreen>('world');
  const [playerReturnScreen, setPlayerReturnScreen] = useState<AppScreen>('world');
  const [progression, setProgression] = useState<PlayerProgression>(createInitialProgression);
  const [pendingLocationFight, setPendingLocationFight] = useState<PendingLocationFight | null>(
    null,
  );
  const explorationActor = useActorRef(explorationMachine);
  const battleActor = useActorRef(battleMachine);
  useScreenMusic(musicForScreen(screen));

  const handleProgressionChange = useCallback((next: PlayerProgression) => {
    setProgression(next);
  }, []);

  function leaveBattle() {
    if (!battleActor.getSnapshot().matches('idle')) {
      battleActor.send({ type: 'LEAVE_BATTLE' });
    }
  }

  function returnToExploration(result?: 'victory' | 'defeat' | 'abort') {
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
      explorationActor.send({ type: 'START_EXPLORATION' });
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
      leaveBattle();
      battleActor.send({ type: 'START_BATTLE', progression });
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
      },
    });
    setScreen('battle');
  }

  let content = (
    <WorldMapScreen onEnterLocation={enterLocation} onOpenPlayer={openPlayer} />
  );

  if (screen === 'battle') {
    content = (
      <div>
        <div className="fixed left-4 top-4 z-[60] flex gap-2">
          <button
            type="button"
            onClick={() => {
              const snap = battleActor.getSnapshot();
              returnToExploration(
                snap.matches('victory')
                  ? 'victory'
                  : snap.matches('defeat')
                    ? 'defeat'
                    : 'abort',
              );
            }}
            className="rounded-lg border border-[rgba(201,162,74,.35)] bg-[rgba(10,8,7,.85)] px-3 py-2 text-[11px] tracking-wider text-[#e0b552]"
          >
            ← PRISON MAP
          </button>
          <button
            type="button"
            onClick={() => {
              setPendingLocationFight(null);
              leaveBattle();
              setScreen('world');
            }}
            className="rounded-lg border border-[rgba(201,162,74,.28)] bg-[rgba(10,8,7,.7)] px-3 py-2 text-[11px] tracking-wider text-[#8a7f72] hover:text-[#c9a24a]"
          >
            THE REALM
          </button>
        </div>
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
      </div>
    );
  } else if (screen === 'exploration') {
    content = (
      <ExplorationScreen
        actor={explorationActor}
        onStartLocationBattle={startLocationBattle}
        onOpenPlayer={openPlayer}
        onBackToWorld={() => setScreen('world')}
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
      <SettingsMenu />
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
