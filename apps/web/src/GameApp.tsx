'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useActorRef, useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import { battleMachine } from '@dark-fantasy/game-engine/machine/battleMachine';
import { explorationMachine } from '@dark-fantasy/game-engine/machine/explorationMachine';
import {
  applySkillsToExplorationCaps,
  createInitialLoadout,
  createRun,
  getAvailableSkillPoints,
  normalizeSeed,
  rebuildExplorationDeck,
  resolveEnemyBattleProfile,
  getEnemyDefinition,
} from '@dark-fantasy/game-engine';
import type { PlayerLoadout, PlayerProgression } from '@dark-fantasy/shared/types/progression';
import type { ExplorationContext } from '@dark-fantasy/shared/types/exploration';
import type { LocalRunState, SavedExplorationPhase } from '@dark-fantasy/shared/types/save';
import type { RunState } from '@dark-fantasy/shared/types/run';
import type { PlayerGender, PlayerProfile } from '@dark-fantasy/shared/types/player';
import { useScreenMusic } from '@/audio/useScreenMusic';
import { AudioProvider } from '@/components/AudioProvider';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { useTranslation } from '@/i18n/useTranslation';
import { SettingsMenu } from '@/components/SettingsMenu';
import { BattleScreen } from '@/screens/BattleScreen';
import { ExplorationScreen } from '@/screens/ExplorationScreen';
import { PlayerScreen } from '@/screens/PlayerScreen';
import { WorldMapScreen } from '@/screens/WorldMapScreen';
import { CharacterCreationScreen } from '@/screens/CharacterCreationScreen';
import type { AppScreen } from '@dark-fantasy/shared/types/world';
import worldMapData from '@dark-fantasy/content/worldMap.json';
import type { WorldMapDefinition } from '@dark-fantasy/shared/types/world';
import type { MusicScreen } from '@/audio/types';
import { DEFAULT_ENEMY_PORTRAIT } from '@dark-fantasy/content/portraits';
import { trackEvent } from '@/lib/analytics';
import { createPlayerProfile, loadPlayerProfile } from '@/lib/playerProfile';
import { unclaimedCardChoices } from '@/data/playerProgress';
import { clearCloudRun, loadCloudRun, saveCloudRun } from '@/lib/runSave';

const worldMap = worldMapData as WorldMapDefinition;
const SEED_STORAGE_KEY = 'dfcg-run-seed';
const SAVE_DEBOUNCE_MS = 600;

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

function buildPersistState(
  current: RunState,
  explorationActor: ActorRefFrom<typeof explorationMachine>,
): LocalRunState {
  const snap = explorationActor.getSnapshot();
  return {
    ...current,
    exploration: snap.matches('idle') ? null : structuredClone(snap.context),
    explorationPhase: phaseFromSnapshot(snap),
  };
}

function GameShell() {
  const { t } = useTranslation();
  const [run, setRun] = useState<RunState>(() => createRun(Date.now() >>> 0));
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [battleCheckpoint, setBattleCheckpoint] = useState<BattleCheckpoint | null>(null);
  const [ready, setReady] = useState(false);
  const explorationActor = useActorRef(explorationMachine);
  const battleActor = useActorRef(battleMachine);
  const hasActiveRun = useSelector(explorationActor, (state) => !state.matches('idle'));
  const explorationContext = useSelector(explorationActor, (state) =>
    state.matches('idle') ? null : state.context,
  );
  const {
    progression,
    loadout,
    screen,
    playerReturnScreen,
    runSeed,
    pendingLocationFight,
  } = run;
  useScreenMusic(musicForScreen(screen));

  const persistRef = useRef(run);
  persistRef.current = run;
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const saveTimerRef = useRef<number | null>(null);
  const sessionTrackedRef = useRef(false);

  const flushSave = useCallback(async (state: LocalRunState) => {
    const currentProfile = profileRef.current;
    if (!currentProfile) {
      return;
    }
    try {
      await saveCloudRun(currentProfile.playerId, state);
    } catch {
      return;
    }
  }, []);

  const persistRun = useCallback(
    (options?: { immediate?: boolean }) => {
      if (!ready || !profileRef.current) {
        return;
      }
      const state = buildPersistState(persistRef.current, explorationActor);
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (options?.immediate) {
        void flushSave(state);
        return;
      }
      saveTimerRef.current = window.setTimeout(() => {
        saveTimerRef.current = null;
        void flushSave(state);
      }, SAVE_DEBOUNCE_MS);
    },
    [explorationActor, flushSave, ready],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const existing = loadPlayerProfile();
      setProfile(existing);
      if (!existing) {
        const next = readClientSeed();
        setRun((current) => ({ ...current, runSeed: next }));
        window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
        if (!cancelled) {
          setReady(true);
        }
        return;
      }

      try {
        const saved = await loadCloudRun(existing.playerId);
        if (cancelled) {
          return;
        }
        if (saved?.state.exploration && saved.state.explorationPhase !== 'idle') {
          const phase =
            saved.state.explorationPhase === 'encounter' ? 'encounter' : 'playerTurn';
          explorationActor.send({
            type: 'HYDRATE',
            context: saved.state.exploration,
            phase,
          });
          window.sessionStorage.setItem(SEED_STORAGE_KEY, String(saved.state.runSeed));
          const nextScreen =
            saved.state.screen === 'battle'
              ? 'exploration'
              : saved.state.screen === 'player'
                ? 'player'
                : 'exploration';
          setRun({
            ...saved.state,
            loadout: saved.state.loadout ?? createInitialLoadout(),
            screen: nextScreen,
            playerReturnScreen:
              saved.state.playerReturnScreen === 'battle'
                ? 'exploration'
                : saved.state.playerReturnScreen,
            pendingLocationFight: saved.state.pendingLocationFight,
          });
        } else if (saved?.state) {
          window.sessionStorage.setItem(SEED_STORAGE_KEY, String(saved.state.runSeed));
          setRun({
            ...saved.state,
            loadout: saved.state.loadout ?? createInitialLoadout(),
            screen: saved.state.screen === 'battle' ? 'world' : saved.state.screen,
            playerReturnScreen:
              saved.state.playerReturnScreen === 'battle'
                ? 'world'
                : saved.state.playerReturnScreen,
            pendingLocationFight: null,
          });
        } else {
          const next = readClientSeed();
          setRun((current) => ({ ...current, runSeed: next }));
          window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
        }
      } catch {
        if (cancelled) {
          return;
        }
        const next = readClientSeed();
        setRun((current) => ({ ...current, runSeed: next }));
        window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [explorationActor]);

  useEffect(() => {
    if (!ready || !profile || sessionTrackedRef.current) {
      return;
    }
    sessionTrackedRef.current = true;
    trackEvent('session_started', profile.playerId, {
      screen,
      hasActiveRun,
    });
  }, [ready, profile, screen, hasActiveRun]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    persistRun();
  }, [ready, run, persistRun]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const subscription = explorationActor.subscribe((snapshot) => {
      setRun((current) => ({
        ...current,
        exploration: snapshot.matches('idle') ? null : snapshot.context,
        explorationPhase: phaseFromSnapshot(snapshot),
      }));
    });
    return () => subscription.unsubscribe();
  }, [explorationActor, ready]);

  const handleProgressionChange = useCallback(
    (next: PlayerProgression) => {
      const snap = explorationActor.getSnapshot();
      if (!snap.matches('idle')) {
        const caps = applySkillsToExplorationCaps(
          snap.context.maxShield,
          snap.context.shield,
          snap.context.maxMana,
          snap.context.mana,
          next.skills,
        );
        explorationActor.send({
          type: 'SYNC_PLAYER_CARDS',
          hand: snap.context.hand,
          deck: snap.context.deck,
          discard: snap.context.discard,
          shield: caps.shield,
          maxShield: caps.maxShield,
          mana: caps.mana,
          maxMana: caps.maxMana,
        });
      }
      setRun((current) => ({ ...current, progression: next }));
    },
    [explorationActor],
  );

  const handleLoadoutChange = useCallback(
    (next: PlayerLoadout) => {
      const previous = new Set(persistRef.current.loadout.unlockedCardIds);
      const unlocked = next.unlockedCardIds.filter((id) => !previous.has(id));
      if (unlocked.length > 0 && profileRef.current) {
        for (const cardId of unlocked) {
          trackEvent('card_unlocked', profileRef.current.playerId, { cardId });
        }
      }
      const snap = explorationActor.getSnapshot();
      if (!snap.matches('idle')) {
        const phase = snap.matches('encounter') ? 'encounter' : 'playerTurn';
        const rebuilt = rebuildExplorationDeck(snap.context, next.deckCardIds);
        explorationActor.send({
          type: 'HYDRATE',
          context: rebuilt,
          phase,
        });
        setRun((current) => ({
          ...current,
          loadout: next,
          exploration: rebuilt,
        }));
        return;
      }
      setRun((current) => ({ ...current, loadout: next }));
    },
    [explorationActor],
  );

  const handleRunSeedChange = useCallback((seed: number) => {
    const next = normalizeSeed(seed);
    setRun((current) => ({ ...current, runSeed: next }));
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
  }, []);

  const handleAbandonRun = useCallback(() => {
    const currentProfile = profileRef.current;
    const next = readClientSeed();
    if (currentProfile) {
      trackEvent('run_abandoned', currentProfile.playerId, {
        screen: persistRef.current.screen,
        runSeed: persistRef.current.runSeed,
      });
      void clearCloudRun(currentProfile.playerId, next);
    }
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    explorationActor.send({ type: 'RESET' });
    if (!battleActor.getSnapshot().matches('idle')) {
      battleActor.send({ type: 'LEAVE_BATTLE' });
    }
    setBattleCheckpoint(null);
    setRun(createRun(next));
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(next));
  }, [battleActor, explorationActor]);

  function resolveRunSeed(): number {
    const next = readClientSeed();
    if (next !== runSeed) {
      setRun((current) => ({ ...current, runSeed: next }));
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
    if (pendingLocationFight && profile) {
      trackEvent('battle_finished', profile.playerId, {
        result: result ?? 'abort',
        locationId: pendingLocationFight.locationId,
        enemyId: pendingLocationFight.enemyId,
      });
    }
    if (pendingLocationFight && !battleSnap.matches('idle')) {
      explorationActor.send({ type: 'SYNC_RNG', rng: battleSnap.context.rng });
      if (result === 'victory') {
        explorationActor.send({
          type: 'SYNC_PLAYER_CARDS',
          hand: battleSnap.context.player.hand,
          deck: battleSnap.context.player.deck,
          discard: [
            ...battleSnap.context.player.discard,
            ...battleSnap.context.combo,
          ],
          shield: battleSnap.context.player.maxShield,
          maxShield: battleSnap.context.player.maxShield,
          mana: battleSnap.context.playerMaxMana,
          maxMana: battleSnap.context.playerMaxMana,
        });
      }
    }
    if (pendingLocationFight) {
      const won = result === 'victory';
      explorationActor.send({
        type: 'RESOLVE_LOCATION_BATTLE',
        won,
        locationId: pendingLocationFight.locationId,
        enemyId: pendingLocationFight.enemyId,
      });
    }
    setBattleCheckpoint(null);
    if (explorationActor.getSnapshot().matches('idle')) {
      explorationActor.send({
        type: 'START_EXPLORATION',
        seed: resolveRunSeed(),
        deckCardIds: loadout.deckCardIds,
        skills: progression.skills,
      });
    }
    setRun((current) => ({
      ...current,
      screen: 'exploration',
      pendingLocationFight: null,
    }));
    leaveBattle();
  }

  function resumeFromBattleCheckpoint() {
    const saved = battleCheckpoint;
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
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(saved.runSeed));
    setBattleCheckpoint(null);
    leaveBattle();
    setRun((current) => ({
      ...current,
      progression: structuredClone(saved.progression),
      loadout: structuredClone(saved.loadout),
      screen: 'exploration',
      runSeed: saved.runSeed,
      pendingLocationFight: null,
    }));
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
      if (profile) {
        trackEvent('battle_started', profile.playerId, { locationId, source: 'world' });
      }
      leaveBattle();
      battleActor.send({
        type: 'START_BATTLE',
        progression,
        playerDeckIds: loadout.deckCardIds,
        playerGender: profile?.gender,
        rng: { seed, cursor: 0 },
      });
      setRun((current) => ({ ...current, screen: 'battle' }));
    }
  }

  function openPlayer() {
    setRun((current) => ({
      ...current,
      playerReturnScreen: current.screen === 'player' ? 'world' : current.screen,
      screen: 'player',
    }));
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
    const checkpointState: LocalRunState = {
      progression: checkpoint.progression,
      loadout: checkpoint.loadout,
      exploration: checkpoint.exploration,
      explorationPhase: checkpoint.explorationPhase,
      screen: 'exploration',
      playerReturnScreen: 'exploration',
      runSeed: checkpoint.runSeed,
      pendingLocationFight: null,
    };
    if (profile) {
      trackEvent('battle_started', profile.playerId, {
        locationId,
        enemyId,
        source: 'exploration',
      });
      void saveCloudRun(profile.playerId, checkpointState);
    }
    setRun((current) => ({
      ...current,
      pendingLocationFight: { locationId, enemyId },
      screen: 'battle',
    }));
    leaveBattle();
    const live = explorationActor.getSnapshot().context;
    battleActor.send({
      type: 'START_BATTLE',
      progression,
      playerDeckIds: loadout.deckCardIds,
      playerGender: profile?.gender,
      enemy: {
        id: enemy.id,
        name: enemy.name,
        portrait: enemy.image ?? DEFAULT_ENEMY_PORTRAIT,
        band: enemy.band,
        group: enemy.group,
        ...resolveEnemyBattleProfile(enemy),
      },
      rng: live.rng,
      playerPiles: {
        hand: live.hand,
        deck: live.deck,
        discard: live.discard,
        shield: live.shield,
        maxShield: live.maxShield,
        mana: live.mana,
        maxMana: live.maxMana,
      },
    });
  }

  if (!ready) {
    return null;
  }

  if (!profile) {
    return (
      <CharacterCreationScreen
        onCreate={async (name: string, gender: PlayerGender) => {
          const next = await createPlayerProfile(name, gender);
          trackEvent('player_created', next.playerId, { gender });
          setProfile(next);
          return next;
        }}
      />
    );
  }

  const unclaimedCardCount = unclaimedCardChoices(progression, loadout);
  const unclaimedSkillCount = getAvailableSkillPoints(progression);

  let content = (
    <WorldMapScreen
      onEnterLocation={enterLocation}
      onOpenPlayer={openPlayer}
      unclaimedCardCount={unclaimedCardCount}
      unclaimedSkillCount={unclaimedSkillCount}
    />
  );

  if (screen === 'battle') {
    const battleCrownsEarned =
      pendingLocationFight && battleActor.getSnapshot().matches('victory')
        ? getEnemyDefinition(pendingLocationFight.enemyId)?.rewardMoney ?? 0
        : 0;
    content = (
      <BattleScreen
        actor={battleActor}
        playerId={profile.playerId}
        progression={progression}
        loadout={loadout}
        onProgressionChange={handleProgressionChange}
        crownsEarned={battleCrownsEarned}
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
        playerId={profile.playerId}
        onStartLocationBattle={startLocationBattle}
        onOpenPlayer={openPlayer}
        onEscapeToWorld={() => {
          trackEvent('escape_to_world', profile.playerId, { runSeed });
          setRun((current) => ({ ...current, screen: 'world' }));
        }}
        runSeed={runSeed}
        deckCardIds={loadout.deckCardIds}
        playerGender={profile.gender}
        playerName={profile.name}
        unclaimedCardCount={unclaimedCardCount}
        unclaimedSkillCount={unclaimedSkillCount}
      />
    );
  } else if (screen === 'player') {
    content = (
      <PlayerScreen
        progression={progression}
        loadout={loadout}
        profile={profile}
        onLoadoutChange={handleLoadoutChange}
        onProgressionChange={handleProgressionChange}
        exploration={explorationContext}
        onBack={() => setRun((current) => ({ ...current, screen: playerReturnScreen }))}
        backLabel={
          playerReturnScreen === 'exploration' ? t('player.backPrison') : t('player.backWorld')
        }
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
    <LocaleProvider>
      <AudioProvider>
        <GameShell />
      </AudioProvider>
    </LocaleProvider>
  );
}
