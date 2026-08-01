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

const worldMap = worldMapData as WorldMapDefinition;

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

  function returnToExploration() {
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
      startBattle();
    }
  }

  function openPlayer() {
    setPlayerReturnScreen(screen === 'player' ? 'world' : screen);
    setScreen('player');
  }

  function startBattle() {
    leaveBattle();
    battleActor.send({ type: 'START_BATTLE', progression });
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
            onClick={returnToExploration}
            className="rounded-lg border border-[rgba(201,162,74,.35)] bg-[rgba(10,8,7,.85)] px-3 py-2 text-[11px] tracking-wider text-[#e0b552]"
          >
            ← PRISON MAP
          </button>
          <button
            type="button"
            onClick={() => {
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
          onReturnToExploration={returnToExploration}
        />
      </div>
    );
  } else if (screen === 'exploration') {
    content = (
      <ExplorationScreen
        actor={explorationActor}
        onOpenBattle={startBattle}
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
