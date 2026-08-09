import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { battleMachine } from '@dark-fantasy/game-engine/machine/battleMachine';
import type { BattleContext } from '@dark-fantasy/shared/types/battle';
import type { PlayerProgression } from '@dark-fantasy/shared/types/progression';
import { getPlayerHealth, getEnemyHealth } from '@dark-fantasy/game-engine/engine/health';
import { previewCombo } from '@dark-fantasy/game-engine/engine/comboPreview';
import { COMBO_CAP, getTotalXpGained, getXpGained } from '@dark-fantasy/game-engine';
import { useAudio } from '@/audio/useAudio';
import { useGameAudio } from '@/audio/useGameAudio';
import { useGameOverAudio } from '@/audio/useGameOverAudio';
import { Combo } from '@/components/Combo';
import { ComboPreviewPanel } from '@/components/ComboPreviewPanel';
import { BattlePlayAnimation } from '@/components/BattlePlayAnimation';
import { BattleResultModal } from '@/components/BattleResultModal';
import { TopBar } from '@/components/TopBar';
import { EnemyZone } from '@/components/EnemyZone';
import { PlayerZone } from '@/components/PlayerZone';
import { EndTurnButton } from '@/components/EndTurnButton';
import { buildSpendIndices, type StackSpendMode } from '@/components/CardStack';
import { CoachMark } from '@/components/tour/CoachMark';
import { useCoachStep } from '@/components/tour/useCoachStep';
import { useTranslation } from '@/i18n/useTranslation';
import type { TranslateFn } from '@/i18n/types';
type BattleActor = ActorRefFrom<typeof battleMachine>;

interface BattleScreenProps {
  actor: BattleActor;
  playerId: string;
  progression: PlayerProgression;
  onProgressionChange: (progression: PlayerProgression) => void;
  onReturnToExploration: () => void;
  onDefeatResume?: () => void;
  onDefeatRestart?: () => void;
  canResumeFromSave?: boolean;
}

interface StackSpendState {
  indices: Set<number>;
  mode: StackSpendMode;
}

interface SpendState {
  enemy: StackSpendState | null;
  player: StackSpendState | null;
}

type EnemyCardTypeTone = 'damage' | 'shield' | 'poison' | 'pierce';

function getEnemyCardTypes(battle: BattleContext, t: TranslateFn): Array<{ label: string; tone: EnemyCardTypeTone }> {
  const seen = new Set<EnemyCardTypeTone>();
  const items: Array<{ label: string; tone: EnemyCardTypeTone }> = [];
  const cards = [...battle.enemy.deck, ...battle.enemy.discard];

  for (const card of cards) {
    for (const effect of card.definition.effects) {
      let tone: EnemyCardTypeTone | null = null;
      if (effect.type === 'damage') {
        tone = 'damage';
      } else if (effect.type === 'shield' || effect.type === 'barrier') {
        tone = 'shield';
      } else if (effect.type === 'poison') {
        tone = 'poison';
      } else if (effect.type === 'ignoreShield') {
        tone = 'pierce';
      }

      if (!tone || seen.has(tone)) {
        continue;
      }

      seen.add(tone);
      items.push({
        tone,
        label:
          tone === 'damage'
            ? t('battle.intentAttack')
            : tone === 'shield'
              ? t('battle.intentDefend')
              : tone === 'poison'
                ? t('battle.intentPoison')
                : t('battle.ignoresShield'),
      });
    }
  }

  return items;
}

function formatTurnLabel(state: string, t: TranslateFn): string {
  if (state === 'playerTurn') {
    return t('battle.yourTurn');
  }
  if (state === 'animatingPlayerCard' || state === 'resolvingPlayerCombo') {
    return t('battle.resolvingCombo');
  }
  if (state === 'animatingEnemyCard' || state === 'enemyTurn') {
    return t('battle.enemyTurn');
  }
  if (state === 'playerTurnStart') {
    return t('battle.turnStart');
  }
  if (state === 'endOfRound') {
    return t('battle.endOfRound');
  }
  if (state === 'victory') {
    return t('battle.victory');
  }
  if (state === 'defeat') {
    return t('battle.defeat');
  }
  return t('battle.battle');
}

export function BattleScreen({
  actor,
  playerId,
  progression,
  onProgressionChange,
  onReturnToExploration,
  onDefeatResume,
  onDefeatRestart,
  canResumeFromSave = false,
}: BattleScreenProps) {
  const { t } = useTranslation();
  const snapshot = useSelector(actor, (s) => s);
  const { context: battle, value } = snapshot;
  const { play, unlock } = useAudio();
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
  const battleCoach = useCoachStep(playerId, 'battle', isPlayerTurn);

  useEffect(() => {
    if (state === 'idle') {
      return;
    }
    onProgressionChange(battle.progression);
  }, [state, battle.progression, onProgressionChange]);

  const xpGained = useMemo(
    () => getXpGained(battle.progressionAtBattleStart, battle.progression),
    [battle.progression, battle.progressionAtBattleStart],
  );
  const totalXpGained = useMemo(
    () => getTotalXpGained(battle.progressionAtBattleStart, battle.progression),
    [battle.progression, battle.progressionAtBattleStart],
  );

  const playerHealth = getPlayerHealth(battle);
  const enemyHealth = getEnemyHealth(battle);
  const comboPreview = useMemo(
    () => (isPlayerTurn ? previewCombo(battle) : null),
    [battle, isPlayerTurn],
  );
  const enemyCardTypes = useMemo(() => getEnemyCardTypes(battle, t), [battle, t]);

  const audioPhase = isVictory
    ? 'victory'
    : isDefeat
      ? 'defeat'
      : isIdle
        ? 'world'
        : 'battle';

  useGameAudio(
    isIdle
      ? null
      : {
          phase: audioPhase,
          playerHp: playerHealth,
          playerMaxHp: battle.playerMaxHealth,
          enemyHp: enemyHealth,
          enemyMaxHp: battle.enemyMaxHealth,
          playerPoison: battle.playerPoison?.remainingTurns ?? 0,
          lastPlayerDrawCount: battle.lastPlayerDrawCount,
          turnCount: battle.battleStats.turnCount,
        },
  );
  useGameOverAudio(isVictory ? 'victory' : isDefeat ? 'defeat' : null);

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
                src={battle.player.portrait}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
          <div>
            <h1 className="font-cinzel text-2xl tracking-[.36em] text-[#b8917f]">
              {t('battle.duelTitle')}
            </h1>
            <p className="mt-3 text-sm text-[#6f6659]">{t('battle.duelSubtitle')}</p>
          </div>
          <EndTurnButton
            onClick={() => {
              void unlock();
              actor.send({ type: 'START_BATTLE', progression });
            }}
            line1={t('battle.startLine1')}
            line2={t('battle.startLine2')}
          />
          <span className="text-[11px] tracking-[.14em] text-[#5a5147]">{t('battle.startHint')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-visible px-7 py-6 font-spectral text-[#e8ddcf]">
      {battleCoach.show && (
        <CoachMark
          title={t('tour.battleTitle')}
          body={t('tour.battleBody')}
          placement="top"
          onDismiss={battleCoach.dismiss}
        />
      )}
      <div className="relative z-0 mx-auto flex w-full max-w-[1240px] flex-col gap-4">
        <TopBar
          turnLabel={formatTurnLabel(state, t)}
          logEntries={battle.log}
          emptyLogLabel={t('battle.battleBegins')}
          roundCount={battle.battleStats.turnCount}
        />

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
          barrier={battle.enemy.barrier}
          poison={battle.enemyPoison}
          cardTypes={enemyCardTypes}
          spendingIndices={spendState.enemy?.indices}
          spendMode={spendState.enemy?.mode}
          isHit={hitTarget === 'enemy'}
        />

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_356px]">
          <Combo
            cards={battle.combo}
            comboCap={COMBO_CAP}
            disabled={!isPlayerTurn || isResolving}
            onRemoveCard={(id) => actor.send({ type: 'REMOVE_FROM_COMBO', cardInstanceId: id })}
          />
          <ComboPreviewPanel
            preview={comboPreview}
            comboSize={battle.combo.length}
            comboCap={COMBO_CAP}
            enemyHealth={enemyHealth}
            playerShield={battle.player.shield}
            playerMaxShield={battle.player.maxShield}
            playerMana={battle.playerMana}
          />
        </div>

        <PlayerZone
          portrait={battle.player.portrait}
          health={playerHealth}
          deckCount={battle.player.deck.length}
          shield={battle.player.shield}
          barrier={battle.player.barrier}
          mana={battle.playerMana}
          maxMana={battle.playerMaxMana}
          poison={battle.playerPoison}
          hand={battle.player.hand}
          handDisabled={!isPlayerTurn || isResolving || battle.combo.length >= COMBO_CAP}
          endTurnDisabled={isResolving}
          showEndTurn={isPlayerTurn}
          comboSize={battle.combo.length}
          spendingIndices={spendState.player?.indices}
          spendMode={spendState.player?.mode}
          onAddToCombo={(id) => actor.send({ type: 'ADD_TO_COMBO', cardInstanceId: id })}
          onEndTurn={() => {
            play('end_turn');
            actor.send({ type: 'END_TURN' });
          }}
          isHit={hitTarget === 'player'}
        />
      </div>

      {(isVictory || isDefeat) && (
        <BattleResultModal
          victory={isVictory}
          enemyName={battle.enemy.name}
          stats={battle.battleStats}
          logEntries={battle.log}
          xpGained={xpGained}
          totalXpGained={totalXpGained}
          onReturnToExploration={onReturnToExploration}
          onResumeFromSave={onDefeatResume}
          onStartOver={onDefeatRestart}
          canResumeFromSave={canResumeFromSave}
        />
      )}
    </div>
  );
}
