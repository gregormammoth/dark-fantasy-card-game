import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { battleMachine } from '@/machine/battleMachine';
import { getPlayerHealth, getEnemyHealth } from '@/engine/health';
import { previewCombo } from '@/engine/comboPreview';
import { getEnemyIntent } from '@/engine/enemyIntent';
import { Combo } from '@/components/Combo';
import { ComboPreviewPanel } from '@/components/ComboPreviewPanel';
import { BattlePlayAnimation } from '@/components/BattlePlayAnimation';
import { BattleResultModal } from '@/components/BattleResultModal';
import { TopBar } from '@/components/TopBar';
import { EnemyZone } from '@/components/EnemyZone';
import { PlayerZone } from '@/components/PlayerZone';
import { EndTurnButton } from '@/components/EndTurnButton';
import { buildSpendIndices, type StackSpendMode } from '@/components/CardStack';
import { PLAYER_PORTRAIT } from '@/data/portraits';

type BattleActor = ActorRefFrom<typeof battleMachine>;

interface BattleScreenProps {
  actor: BattleActor;
}

interface StackSpendState {
  indices: Set<number>;
  mode: StackSpendMode;
}

interface SpendState {
  enemy: StackSpendState | null;
  player: StackSpendState | null;
}

function formatTurnLabel(state: string): string {
  if (state === 'playerTurn') {
    return 'YOUR TURN';
  }
  if (state === 'animatingPlayerCard' || state === 'resolvingPlayerCombo') {
    return 'RESOLVING COMBO';
  }
  if (state === 'animatingEnemyCard' || state === 'enemyTurn') {
    return 'ENEMY TURN';
  }
  if (state === 'playerTurnStart') {
    return 'TURN START';
  }
  if (state === 'endOfRound') {
    return 'END OF ROUND';
  }
  if (state === 'victory') {
    return 'VICTORY';
  }
  if (state === 'defeat') {
    return 'DEFEAT';
  }
  return 'BATTLE';
}

export function BattleScreen({ actor }: BattleScreenProps) {
  const snapshot = useSelector(actor, (s) => s);
  const { context: battle, value } = snapshot;
  const [hitTarget, setHitTarget] = useState<'player' | 'enemy' | null>(null);
  const [spendState, setSpendState] = useState<SpendState>({
    enemy: null,
    player: null,
  });
  const spendTimerRef = useRef<number | null>(null);
  const battleRef = useRef(battle);
  const drawTokenRef = useRef('');

  battleRef.current = battle;

  const state = typeof value === 'string' ? value : Object.keys(value)[0];
  const isPlayerTurn = state === 'playerTurn';
  const isIdle = state === 'idle';
  const isVictory = state === 'victory';
  const isDefeat = state === 'defeat';
  const isAnimating = state === 'animatingPlayerCard' || state === 'animatingEnemyCard';
  const isResolving = isAnimating || state === 'resolvingPlayerCombo';

  const playerHealth = getPlayerHealth(battle);
  const enemyHealth = getEnemyHealth(battle);
  const comboPreview = useMemo(
    () => (isPlayerTurn ? previewCombo(battle) : null),
    [battle, isPlayerTurn],
  );
  const enemyIntent = useMemo(
    () => (isPlayerTurn ? getEnemyIntent(battle) : null),
    [battle, isPlayerTurn],
  );

  const clearSpendTimer = useCallback(() => {
    if (spendTimerRef.current !== null) {
      window.clearTimeout(spendTimerRef.current);
      spendTimerRef.current = null;
    }
  }, []);

  const triggerStackSpend = useCallback(
    (
      target: 'player' | 'enemy',
      deckCount: number,
      count: number,
      mode: StackSpendMode = 'burn',
    ) => {
      if (count <= 0) {
        return;
      }

      clearSpendTimer();
      const indices = buildSpendIndices(deckCount, count);
      const duration = mode === 'draw' ? 700 : 820;

      setSpendState((prev) => ({
        ...prev,
        [target === 'enemy' ? 'enemy' : 'player']: { indices, mode },
      }));

      spendTimerRef.current = window.setTimeout(() => {
        setSpendState({ enemy: null, player: null });
        spendTimerRef.current = null;
      }, duration);
    },
    [clearSpendTimer],
  );

  const handleAnimationComplete = useCallback(() => {
    setHitTarget(null);
    actor.send({ type: 'ANIMATION_COMPLETE' });
  }, [actor]);

  const handleImpact = useCallback(
    (target: 'player' | 'enemy', cardsSpent: number) => {
      setHitTarget(target);
      if (cardsSpent <= 0) {
        return;
      }

      const b = battleRef.current;
      const deckCount =
        target === 'enemy' ? b.enemy.deck.length : b.player.deck.length;
      triggerStackSpend(target, deckCount, cardsSpent, 'burn');
    },
    [triggerStackSpend],
  );

  useEffect(() => {
    return () => clearSpendTimer();
  }, [clearSpendTimer]);

  useEffect(() => {
    if (state !== 'playerTurn' || battle.lastPlayerDrawCount <= 0) {
      return;
    }

    const token = `${battle.battleStats.turnCount}:${battle.lastPlayerDrawCount}:${battle.player.deck.length}`;
    if (drawTokenRef.current === token) {
      return;
    }

    drawTokenRef.current = token;
    triggerStackSpend('player', battle.player.deck.length, battle.lastPlayerDrawCount, 'draw');
  }, [
    state,
    battle.lastPlayerDrawCount,
    battle.player.deck.length,
    battle.battleStats.turnCount,
    triggerStackSpend,
  ]);

  useEffect(() => {
    if (state === 'animatingEnemyCard' && !battle.activePlay) {
      actor.send({ type: 'ANIMATION_COMPLETE' });
    }
  }, [state, battle.activePlay, actor]);

  if (isIdle) {
    return (
      <div className="flex min-h-screen items-center justify-center px-7 py-10 font-spectral text-[#e8ddcf]">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="relative">
            <div className="h-40 w-[118px] overflow-hidden rounded-[11px] border border-[rgba(201,162,74,.5)] bg-[#151009]">
              <img
                src={PLAYER_PORTRAIT}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
          <div>
            <h1 className="font-cinzel text-2xl tracking-[.36em] text-[#b8917f]">
              DARK FANTASY DUEL
            </h1>
            <p className="mt-3 text-sm text-[#6f6659]">A card battle against the Shadow Beast</p>
          </div>
          <EndTurnButton
            onClick={() => actor.send({ type: 'START_BATTLE' })}
            line1="START"
            line2="BATTLE"
          />
          <span className="text-[11px] tracking-[.14em] text-[#5a5147]">Face the Shadow Beast</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-visible px-7 py-6 font-spectral text-[#e8ddcf]">
      <div className="relative z-0 mx-auto flex w-full max-w-[1240px] flex-col gap-4">
        <TopBar turnLabel={formatTurnLabel(state)} logEntries={battle.log} />

        {battle.activePlay && isAnimating && (
          <BattlePlayAnimation
            key={battle.activePlay.cardInstanceId}
            cue={battle.activePlay.cue}
            onImpact={handleImpact}
            onComplete={handleAnimationComplete}
          />
        )}

        <EnemyZone
          name={battle.enemy.name}
          portrait={battle.enemy.portrait}
          deckCount={battle.enemy.deck.length}
          health={enemyHealth}
          shield={battle.enemy.shield}
          poison={battle.enemyPoison}
          intent={enemyIntent}
          spendingIndices={spendState.enemy?.indices}
          spendMode={spendState.enemy?.mode}
          isHit={hitTarget === 'enemy'}
        />

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_356px]">
          <Combo
            cards={battle.combo}
            disabled={!isPlayerTurn || isResolving}
            onRemoveCard={(id) => actor.send({ type: 'REMOVE_FROM_COMBO', cardInstanceId: id })}
          />
          <ComboPreviewPanel
            preview={comboPreview}
            comboSize={battle.combo.length}
            enemyHealth={enemyHealth}
            playerShield={battle.player.shield}
            playerMaxShield={battle.player.maxShield}
          />
        </div>

        <PlayerZone
          portrait={battle.player.portrait}
          health={playerHealth}
          deckCount={battle.player.deck.length}
          shield={battle.player.shield}
          barrier={battle.player.barrier}
          poison={battle.playerPoison}
          hand={battle.player.hand}
          handDisabled={!isPlayerTurn || isResolving}
          endTurnDisabled={isResolving}
          showEndTurn={isPlayerTurn}
          spendingIndices={spendState.player?.indices}
          spendMode={spendState.player?.mode}
          onAddToCombo={(id) => actor.send({ type: 'ADD_TO_COMBO', cardInstanceId: id })}
          onEndTurn={() => actor.send({ type: 'END_TURN' })}
          isHit={hitTarget === 'player'}
        />
      </div>

      {(isVictory || isDefeat) && (
        <BattleResultModal
          victory={isVictory}
          enemyName={battle.enemy.name}
          stats={battle.battleStats}
          logEntries={battle.log}
          onFightAgain={() => actor.send({ type: 'RESTART' })}
        />
      )}
    </div>
  );
}
