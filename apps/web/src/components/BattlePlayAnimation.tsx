import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AnimationCue } from '@dark-fantasy/shared/types/animation';
import { getCardDefinition } from '@dark-fantasy/game-engine/engine/battleSetup';
import { classThemes, enemyTheme } from '@/lib/cardTheme';
import { getCardEffectSummary } from '@/lib/cardTheme';
import type { CardClass } from '@dark-fantasy/shared/types/card';
import { useAudio } from '@/audio/useAudio';
import { AttackIcon, BarrierIcon, PierceIcon, PoisonIcon, ShieldIcon } from './EffectIcons';

const duration = 0.45;

interface BattlePlayAnimationProps {
  cue: AnimationCue;
  onImpact: (target: 'player' | 'enemy', cardsLost: number) => void;
  onComplete: () => void;
}

type Phase = 'play' | 'impact' | 'done';

function getTheme(cue: AnimationCue) {
  if (cue.cardClass) {
    return classThemes[cue.cardClass as CardClass];
  }
  return cue.source === 'enemy' ? enemyTheme : classThemes.fighter;
}

function Pill({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone: 'damage' | 'pierce' | 'poison' | 'shield' | 'barrier' | 'reduced' | 'power';
}) {
  const styles = {
    damage: { bg: 'rgba(88,21,22,.62)', border: 'rgba(214,68,58,.34)', text: '#ffd9d2' },
    pierce: { bg: 'rgba(82,58,18,.56)', border: 'rgba(201,162,74,.34)', text: '#ecd9b0' },
    poison: { bg: 'rgba(29,62,27,.62)', border: 'rgba(111,174,90,.34)', text: '#c8ecb8' },
    shield: { bg: 'rgba(24,41,76,.62)', border: 'rgba(91,134,196,.34)', text: '#cfe0f5' },
    barrier: { bg: 'rgba(53,32,90,.62)', border: 'rgba(154,122,224,.34)', text: '#ddd0f5' },
    reduced: { bg: 'rgba(29,62,27,.62)', border: 'rgba(111,174,90,.34)', text: '#c8ecb8' },
    power: { bg: 'rgba(82,58,18,.56)', border: 'rgba(201,162,74,.34)', text: '#ecd9b0' },
  }[tone];

  return (
    <motion.div
      className="flex min-w-[132px] items-center gap-2 rounded-[7px] border px-3 py-1.5 backdrop-blur-sm"
      style={{ background: styles.bg, borderColor: styles.border }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-[11px] tracking-[.04em]" style={{ color: styles.text }}>
        {label}
      </span>
    </motion.div>
  );
}

function Outcome({
  label,
  tone,
}: {
  label: string;
  tone: 'damage' | 'blocked';
}) {
  return (
    <motion.div
      className="absolute top-1/2 left-[56%] z-30 -translate-y-1/2"
      initial={{ opacity: 0, x: -16, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.35 }}
    >
      <span
        className="font-cinzel text-[62px] leading-none tracking-[.03em]"
        style={{
          color: tone === 'blocked' ? '#d8c8bb' : '#f3c7c1',
          textShadow:
            tone === 'blocked'
              ? '0 0 20px rgba(216,200,187,.35)'
              : '0 0 22px rgba(224,82,74,.35)',
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

function buildPills(cue: AnimationCue): Array<{
  label: string;
  tone: 'damage' | 'pierce' | 'poison' | 'shield' | 'barrier' | 'reduced' | 'power';
  icon: ReactNode;
}> {
  const definition = getCardDefinition(cue.cardId);
  const pills: Array<{
    label: string;
    tone: 'damage' | 'pierce' | 'poison' | 'shield' | 'barrier' | 'reduced' | 'power';
    icon: ReactNode;
  }> = [];

  if (cue.source === 'player' && cue.cardType === 'attack' && cue.damageToEnemy !== undefined) {
    pills.push({
      label: `-${cue.damageToEnemy} INCOMING`,
      tone: 'damage',
      icon: <AttackIcon className="inline-block h-3.5 w-3 shrink-0" />,
    });
  }

  if (cue.source === 'enemy' && cue.cardType === 'attack' && cue.incomingDamage !== undefined) {
    pills.push({
      label: `${cue.incomingDamage} INCOMING`,
      tone: 'damage',
      icon: <AttackIcon className="inline-block h-3.5 w-3 shrink-0" />,
    });
  }

  const reducedTotal =
    (cue.damageReduced ?? 0) +
    (cue.shieldBlocked ?? 0) +
    (cue.barrierBlocked ?? 0);

  if (cue.source === 'enemy' && reducedTotal > 0) {
    pills.push({
      label: `${reducedTotal} REDUCED`,
      tone: 'reduced',
      icon: <ShieldIcon className="inline-block h-[14px] w-3 shrink-0" />,
    });
  }

  if (cue.shieldGained) {
    pills.push({
      label: `+${cue.shieldGained} SHIELD GAINED`,
      tone: 'shield',
      icon: <ShieldIcon className="inline-block h-[14px] w-3 shrink-0" />,
    });
  }

  if (cue.barrierGained) {
    pills.push({
      label: `+${cue.barrierGained} BARRIER GAINED`,
      tone: 'barrier',
      icon: <BarrierIcon className="inline-block h-[13px] w-3.5 shrink-0" />,
    });
  }

  if (cue.poisonAppliedTo) {
    pills.push({
      label: 'POISON APPLIED',
      tone: 'poison',
      icon: <PoisonIcon className="inline-block h-[14px] w-[14px] shrink-0" />,
    });
  }

  if (cue.ignoresShield) {
    pills.push({
      label: 'PIERCE',
      tone: 'pierce',
      icon: <PierceIcon className="inline-block h-3.5 w-3.5 shrink-0" />,
    });
  }

  if (definition) {
    for (const effect of definition.effects) {
      if (effect.type === 'bonusDamagePerAttackCard') {
        pills.push({
          label: `+${effect.value ?? 0} ATTACK POWER`,
          tone: 'power',
          icon: <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#e0b552] shadow-[0_0_8px_#e0b552]" />,
        });
      }
      if (effect.type === 'reduceDamagePercent') {
        pills.push({
          label: `${effect.value ?? 0}% DAMAGE REDUCED`,
          tone: 'reduced',
          icon: <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#6fae5a] shadow-[0_0_8px_#6fae5a]" />,
        });
      }
    }
  } else {
    const summary = getCardEffectSummary({
      id: cue.cardId,
      name: cue.cardName,
      effects: [],
    } as never);
    if (summary) {
      pills.push({
        label: summary.toUpperCase(),
        tone: 'power',
        icon: <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#e0b552] shadow-[0_0_8px_#e0b552]" />,
      });
    }
  }

  return pills.slice(0, 3);
}

function PlayCard({ cue, phase }: { cue: AnimationCue; phase: Phase }) {
  const theme = getTheme(cue);
  const isAttack = cue.cardType === 'attack';
  const imageSrc = cue.cardClass ? `/cards/${cue.cardId}.png` : undefined;
  const fromPlayer = cue.source === 'player';

  return (
    <motion.div
      className="absolute z-20 flex w-[150px] flex-col overflow-hidden rounded-[11px] bg-[#12100f] shadow-2xl"
      style={{
        border: `1px solid ${theme.border}`,
        boxShadow: `0 0 32px -8px ${theme.glow}`,
      }}
      initial={{
        opacity: 0,
        scale: 0.82,
        left: fromPlayer ? '40%' : '44%',
        top: fromPlayer ? '60%' : '20%',
        rotate: fromPlayer ? -8 : 8,
      }}
      animate={{
        opacity: phase === 'done' ? 0 : 1,
        scale: phase === 'impact' ? 1.04 : 1,
        left: phase === 'play' ? (fromPlayer ? '40%' : '44%') : '47%',
        top: phase === 'play' ? (fromPlayer ? '60%' : '20%') : '39%',
        rotate: phase === 'impact' ? 0 : fromPlayer ? -4 : 4,
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
      <div className="relative h-24 shrink-0 overflow-hidden bg-[#0c0908]">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="h-full w-full object-cover object-center" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2b1311] to-[#120908]">
            <AttackIcon className="inline-block h-8 w-7 opacity-80" />
          </div>
        )}
        {cue.cardClass && (
          <span
            className="absolute top-[7px] left-[7px] rounded-[3px] px-1.5 py-0.5 text-[8px] tracking-[.12em] text-white"
            style={{ background: theme.badge }}
          >
            {theme.label}
          </span>
        )}
        <span className="absolute top-[7px] right-[7px]">
          {isAttack ? (
            <AttackIcon className="inline-block h-[14px] w-3" />
          ) : (
            <ShieldIcon className="inline-block h-[14px] w-3" />
          )}
        </span>
      </div>
      <div className="px-2.5 py-2" style={{ borderTop: `2px solid ${theme.accent}` }}>
        <p className="text-[8px] tracking-[.18em] text-[#8a7f72] uppercase">
          {fromPlayer ? 'You play' : 'Enemy plays'}
        </p>
        <p className="font-cinzel text-[13px] text-[#f0dfcb]">{cue.cardName}</p>
      </div>
    </motion.div>
  );
}

export function BattlePlayAnimation({ cue, onImpact, onComplete }: BattlePlayAnimationProps) {
  const [phase, setPhase] = useState<Phase>('play');
  const onImpactRef = useRef(onImpact);
  const onCompleteRef = useRef(onComplete);
  const { play } = useAudio();

  useEffect(() => {
    onImpactRef.current = onImpact;
    onCompleteRef.current = onComplete;
  }, [onImpact, onComplete]);

  const isAttack = cue.cardType === 'attack';
  const isPlayerAttack = cue.source === 'player' && isAttack;
  const isEnemyAttack = cue.source === 'enemy' && isAttack;
  const isDefense = cue.cardType === 'defense';
  const pills = buildPills(cue);
  const cardsLost =
    cue.source === 'player'
      ? cue.enemyDeckCardsLost ?? cue.damageToEnemy ?? 0
      : cue.playerDeckCardsLost ?? cue.damageToPlayer ?? 0;

  useEffect(() => {
    setPhase('play');
    const impactTimer = window.setTimeout(() => {
      setPhase('impact');
      const stackSpend =
        isPlayerAttack
          ? (cue.enemyDeckCardsLost ?? cue.damageToEnemy ?? 0)
          : isEnemyAttack
            ? (cue.playerDeckCardsLost ?? cue.damageToPlayer ?? 0)
            : 0;

      if (isPlayerAttack) {
        onImpactRef.current('enemy', stackSpend);
        if ((cue.shieldBlocked ?? 0) > 0 || (cue.barrierBlocked ?? 0) > 0) {
          play('block_reveal');
        }
      } else if (isEnemyAttack) {
        onImpactRef.current('player', stackSpend);
        if ((cue.shieldBlocked ?? 0) > 0 || (cue.barrierBlocked ?? 0) > 0) {
          play('block_reveal');
        }
      } else if (isDefense && cue.source === 'player') {
        onImpactRef.current('player', 0);
        if ((cue.shieldGained ?? 0) > 0 || (cue.barrierGained ?? 0) > 0) {
          play('shield_gain');
        }
      }
    }, 520);

    const doneTimer = window.setTimeout(() => {
      setPhase('done');
      onCompleteRef.current();
    }, 1450);

    return () => {
      window.clearTimeout(impactTimer);
      window.clearTimeout(doneTimer);
    };
  }, [
    cue.cardId,
    cue.cardName,
    isPlayerAttack,
    isEnemyAttack,
    isDefense,
    cue.source,
    cue.enemyDeckCardsLost,
    cue.damageToEnemy,
    cue.playerDeckCardsLost,
    cue.damageToPlayer,
    cue.shieldBlocked,
    cue.barrierBlocked,
    cue.shieldGained,
    cue.barrierGained,
    play,
  ]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 600px at 50% 40%, rgba(36,21,18,.72), rgba(11,8,7,.88))',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'done' ? 0 : 1 }}
        transition={{ duration }}
      />

      <div className="relative mx-auto h-full w-full max-w-[1240px]">
        <PlayCard cue={cue} phase={phase} />

        <AnimatePresence>
          {phase === 'impact' && pills.length > 0 && (
            <motion.div
              key="pills"
              className="absolute top-1/2 left-[31%] z-30 flex -translate-y-1/2 flex-col gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {pills.map((pill) => (
                <Pill key={`${pill.tone}-${pill.label}`} icon={pill.icon} label={pill.label} tone={pill.tone} />
              ))}
            </motion.div>
          )}

          {phase === 'impact' && isAttack && (
            <Outcome
              label={`-${cardsLost} CARDS`}
              tone={cardsLost === 0 ? 'blocked' : 'damage'}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
