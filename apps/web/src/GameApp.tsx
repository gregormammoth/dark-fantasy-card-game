'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useActorRef, useSelector } from '@xstate/react';
import { battleMachine } from '@dark-fantasy/game-engine/machine/battleMachine';
import { explorationMachine } from '@dark-fantasy/game-engine/machine/explorationMachine';
import {
  createInitialLoadout,
  createInitialProgression,
  normalizeSeed,
  rebuildExplorationDeck,
} from '@dark-fantasy/game-engine';
import type { PlayerLoadout, PlayerProgression } from '@dark-fantasy/shared/types/progression';
import type { ExplorationContext } from '@dark-fantasy/shared/types/exploration';
import type { LocalRunState, SavedExplorationPhase } from '@dark-fantasy/shared/types/save';
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
import { clearLocalRun, loadLocalRun, saveLocalRun } from '@/lib/localRunSave';

const worldMap = worldMapData as WorldMapDefinition;
const SEED_STORAGE_KEY = 'dfcg-run-seed';

interface PendingLocationFight {
  locationId: string;
  enemyId: string;
}

interface BattleCheckpoint {
  exploration: ExplorationContext;
  explorationPhase: SavedExplorationPhase;
  progression: PlayerProgression;
  loadout: PlayerLoadout;
  runSeed: number;
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

function phaseFromSnapshot(snapshot: {
  matches: (state: 'idle' | 'encounter' | 'playerTurn' | 'playerTurnStart' | 'resolvingEncounter') => boolean;
}): SavedExplorationPhase {
  if (snapshot.matches('idle')) {
    return 'idle';
  }
  if (snapshot.matches('encounter')) {
    return 'encounter';
  }
  return 'playerTurn';
}

function GameShell() {
  const [screen, setScreen] = useState<AppScreen>('world');
  const [playerReturnScreen, setPlayerReturnScreen] = useState<AppScreen>('world');
  const [progression, setProgression] = useState<PlayerProgression>(createInitialProgression);
  const [loadout, setLoadout] = useState<PlayerLoadout>(createInitialLoadout);
  const [pendingLocationFight, setPendingLocationFight] = useState<PendingLocationFight | null>(
    null,
  );
  const [battleCheckpoint, setBattleCheckpoint] = useState<BattleCheckpoint | null>(null);
  const [runSeed, setRunSeed] = useState(() => Date.now() >>> 0);
  const [ready, setReady] = useState(false);
  const explorationActor = useActorRef(explorationMachine);
  const battleActor = useActorRef(battleMachine);
  const hasActiveRun = useSelector(explorationActor, (state) => !state.matches('idle'));
  const explorationContext = useSelector(explorationActor, (state) =>
    state.matches('idle') ? null : state.context,
  );
  useScreenMusic(musicForScreen(screen));

  const persistRef = useRef({
    progression,
    loadout,
    screen,
    playerReturnScreen,
    runSeed,
    pendingLocationFight,
  });
  persistRef.current = {
    progression,
    loadout,
    screen,
    playerReturnScreen,
    runSeed,
    pendingLocationFight,
  };

  const persistRun = useCallback(() => {
    if (!ready) {
      return;
    }
    const current = persistRef.current;
    const snap = explorationActor.getSnapshot();
    const state: LocalRunState = {
      progression: current.progression,
      loadout: current.loadout,
      exploration: snap.matches('idle') ? null : structuredClone(snap.context),
      explorationPhase: phaseFromSnapshot(snap),
      screen: current.screen,
      playerReturnScreen: current.playerReturnScreen,
      runSeed: current.runSeed,
      pendingLocationFight: current.pendingLocationFight,
    };
    saveLocalRun(state);
  }, [explorationActor, ready]);

  useEffect(() => {
    const saved = loadLocalRun();
    if (saved?.state.exploration && saved.state.explorationPhase !== 'idle') {
      const phase =
        saved.state.explorationPhase === 'encounter' ? 'encounter' : 'playerTurn';
      explorationActor.send({
        type: 'HYDRATE',
        context: saved.state.exploration,
        phase,
      });
      setProgression(saved.state.progression);
      setLoadout(saved.state.loadout ?? createInitialLoadout());
      setRunSeed(saved.state.runSeed);
      window.sessionStorage.setItem(SEED_STORAGE_KEY, String(saved.state.runSeed));
      setPendingLocationFight(saved.state.pendingLocationFight);
      setPlayerReturnScreen(
        saved.state.playerReturnScreen === 'battle' ? 'exploration' : saved.state.playerReturnScreen,
      );
      const nextScreen =
        saved.state.screen === 'battle'
          ? 'exploration'
          : saved.state.screen === 'player'
            ? 'player'
            : 'exploration';
      setScreen(nextScreen);
    } else {
      const next = readClientSeed();
      setRunSeed(next);
      window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
    }
    setReady(true);
  }, [explorationActor]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    persistRun();
  }, [ready, progression, loadout, screen, playerReturnScreen, runSeed, pendingLocationFight, persistRun]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const subscription = explorationActor.subscribe(() => {
      persistRun();
    });
    return () => subscription.unsubscribe();
  }, [explorationActor, persistRun, ready]);

  const handleProgressionChange = useCallback((next: PlayerProgression) => {
    setProgression(next);
  }, []);

  const handleLoadoutChange = useCallback(
    (next: PlayerLoadout) => {
      setLoadout(next);
      const snap = explorationActor.getSnapshot();
      if (!snap.matches('idle')) {
        const phase = snap.matches('encounter') ? 'encounter' : 'playerTurn';
        explorationActor.send({
          type: 'HYDRATE',
          context: rebuildExplorationDeck(snap.context, next.deckCardIds),
          phase,
        });
      }
    },
    [explorationActor],
  );

  const handleRunSeedChange = useCallback((seed: number) => {
    const next = normalizeSeed(seed);
    setRunSeed(next);
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
  }, []);

  const handleAbandonRun = useCallback(() => {
    clearLocalRun();
    explorationActor.send({ type: 'RESET' });
    if (!battleActor.getSnapshot().matches('idle')) {
      battleActor.send({ type: 'LEAVE_BATTLE' });
    }
    setPendingLocationFight(null);
    setBattleCheckpoint(null);
    setProgression(createInitialProgression());
    setLoadout(createInitialLoadout());
    setPlayerReturnScreen('world');
    setScreen('world');
    const next = readClientSeed();
    setRunSeed(next);
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
  }, [battleActor, explorationActor]);

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
    setBattleCheckpoint(null);
    if (explorationActor.getSnapshot().matches('idle')) {
      explorationActor.send({
        type: 'START_EXPLORATION',
        seed: resolveRunSeed(),
        deckCardIds: loadout.deckCardIds,
      });
    }
    setScreen('exploration');
    leaveBattle();
  }

  function resumeFromBattleCheckpoint() {
    const saved = battleCheckpoint ?? (() => {
      const file = loadLocalRun();
      if (!file?.state.exploration || file.state.explorationPhase === 'idle') {
        return null;
      }
      return {
        exploration: file.state.exploration,
        explorationPhase: file.state.explorationPhase,
        progression: file.state.progression,
        loadout: file.state.loadout ?? createInitialLoadout(),
        runSeed: file.state.runSeed,
      } satisfies BattleCheckpoint;
    })();

    if (!saved) {
      returnToExploration('abort');
      return;
    }

    explorationActor.send({ type: 'RESET' });
    explorationActor.send({
      type: 'HYDRATE',
      context: structuredClone(saved.exploration),
      phase: saved.explorationPhase === 'encounter' ? 'encounter' : 'playerTurn',
    });
    setProgression(structuredClone(saved.progression));
    setLoadout(structuredClone(saved.loadout));
    setRunSeed(saved.runSeed);
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(saved.runSeed));
    setPendingLocationFight(null);
    setBattleCheckpoint(null);
    leaveBattle();
    setScreen('exploration');
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
      battleActor.send({
        type: 'START_BATTLE',
        progression,
        playerDeckIds: loadout.deckCardIds,
        rng: { seed, cursor: 0 },
      });
      setScreen('battle');
    }
  }

  function openPlayer() {
    setPlayerReturnScreen(screen === 'player' ? 'world' : screen);
    setScreen('player');
  }

  function startLocationBattle(locationId: string, enemyId: string) {
    const snap = explorationActor.getSnapshot();
    const exploration = snap.context;
    const location = exploration.locations[locationId];
    const enemy = location?.enemies.find((item) => item.id === enemyId);
    if (!enemy) {
      return;
    }
    const checkpoint: BattleCheckpoint = {
      exploration: structuredClone(exploration),
      explorationPhase: phaseFromSnapshot(snap),
      progression: structuredClone(progression),
      loadout: structuredClone(loadout),
      runSeed,
    };
    setBattleCheckpoint(checkpoint);
    saveLocalRun({
      progression: checkpoint.progression,
      loadout: checkpoint.loadout,
      exploration: checkpoint.exploration,
      explorationPhase: checkpoint.explorationPhase,
      screen: 'exploration',
      playerReturnScreen: 'exploration',
      runSeed: checkpoint.runSeed,
      pendingLocationFight: null,
    });
    setPendingLocationFight({ locationId, enemyId });
    leaveBattle();
    battleActor.send({
      type: 'START_BATTLE',
      progression,
      playerDeckIds: loadout.deckCardIds,
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

  if (!ready) {
    return null;
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
        onDefeatResume={resumeFromBattleCheckpoint}
        onDefeatRestart={handleAbandonRun}
        canResumeFromSave={battleCheckpoint !== null}
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
        deckCardIds={loadout.deckCardIds}
      />
    );
  } else if (screen === 'player') {
    content = (
      <PlayerScreen
        progression={progression}
        loadout={loadout}
        onLoadoutChange={handleLoadoutChange}
        exploration={explorationContext}
        onBack={() => setScreen(playerReturnScreen)}
        backLabel={playerReturnScreen === 'exploration' ? '← Prison Map' : '← World Map'}
      />
    );
  }

  return (
    <>
      <SettingsMenu
        runSeed={runSeed}
        onRunSeedChange={handleRunSeedChange}
        onAbandonRun={handleAbandonRun}
        hasActiveRun={hasActiveRun}
      />
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
