import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AnimationCue } from '@/types/animation';
import { classThemes, enemyTheme } from '@/lib/cardTheme';
import type { CardClass } from '@/types/card';
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

function EffectRow({
  icon,
  title,
  detail,
  tone,
}: {
  icon: ReactNode;
  title: ReactNode;
  detail?: string;
  tone: 'damage' | 'pierce' | 'poison' | 'shield' | 'barrier' | 'reduced' | 'blocked';
}) {
  const styles = {
    damage: { bg: 'rgba(224,82,74,.12)', border: '#e0524a', title: '#ffd9d2', detail: '#a98' },
    pierce: { bg: 'rgba(201,162,74,.1)', border: '#c9a24a', title: '#ecd9b0', detail: '#8a7f72' },
    poison: { bg: 'rgba(111,174,90,.12)', border: '#6fae5a', title: '#c8ecb8', detail: '#7a8a6a' },
    shield: { bg: 'rgba(91,134,196,.12)', border: '#5b86c4', title: '#cfe0f5', detail: '#7f92ac' },
    barrier: { bg: 'rgba(154,122,224,.12)', border: '#9a7ae0', title: '#ddd0f5', detail: '#8a7f9a' },
    reduced: { bg: 'rgba(111,174,90,.1)', border: '#6fae5a', title: '#c8ecb8', detail: '#7a8a6a' },
    blocked: { bg: 'rgba(201,162,74,.08)', border: '#c9a24a', title: '#ecd9b0', detail: '#8a7f72' },
  }[tone];

  return (
    <motion.div
      className="flex min-w-[220px] items-center gap-3 rounded-[9px] px-2.5 py-2 backdrop-blur-sm"
      style={{ background: styles.bg, borderLeft: `3px solid ${styles.border}` }}
      initial={{ opacity: 0, x: tone === 'damage' ? 12 : -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration }}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <div className="text-sm" style={{ color: styles.title }}>
          {title}
        </div>
        {detail && (
          <div className="text-[10px]" style={{ color: styles.detail }}>
            {detail}
          </div>
        )}
      </div>
    </motion.div>
  );
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
        left: fromPlayer ? '42%' : '12%',
        top: fromPlayer ? '62%' : '14%',
        rotate: fromPlayer ? -8 : 8,
      }}
      animate={{
        opacity: phase === 'done' ? 0 : 1,
        scale: phase === 'impact' ? 1.06 : 1,
        left: phase === 'play' ? (fromPlayer ? '42%' : '12%') : fromPlayer ? '58%' : '42%',
        top: phase === 'play' ? (fromPlayer ? '62%' : '14%') : fromPlayer ? '18%' : '58%',
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

function DamageBreakdown({
  cue,
  side,
}: {
  cue: AnimationCue;
  side: 'player' | 'enemy';
}) {
  const isPlayerHit = side === 'player';
  const cardsLost = isPlayerHit ? cue.damageToPlayer : cue.damageToEnemy;
  const fullyBlocked =
    (cue.incomingDamage ?? 0) > 0 &&
    !cardsLost &&
    ((cue.shieldBlocked ?? 0) > 0 || (cue.barrierBlocked ?? 0) > 0);

  return (
    <motion.div
      className={`absolute z-30 flex flex-col gap-2 ${isPlayerHit ? 'bottom-[22%] left-[4%]' : 'top-[16%] right-[4%]'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {cue.incomingDamage !== undefined && cue.incomingDamage > 0 && (
        <EffectRow
          tone="damage"
          icon={<AttackIcon className="inline-block h-[22px] w-5 shrink-0" />}
          title={
            <>
              <b className="font-cinzel text-[17px]">{cue.incomingDamage}</b> incoming
            </>
          }
        />
      )}
      {isPlayerHit && cue.barrierBlocked !== undefined && cue.barrierBlocked > 0 && (
        <EffectRow
          tone="barrier"
          icon={<BarrierIcon className="inline-block h-[13px] w-3.5 shrink-0" />}
          title={
            <>
              <b className="font-cinzel">{cue.barrierBlocked}</b> blocked by barrier
            </>
          }
        />
      )}
      {cue.shieldBlocked !== undefined && cue.shieldBlocked > 0 && (
        <EffectRow
          tone="shield"
          icon={<ShieldIcon className="inline-block h-5 w-[18px] shrink-0" />}
          title={
            <>
              <b className="font-cinzel">{cue.shieldBlocked}</b> blocked by shield
            </>
          }
        />
      )}
      {isPlayerHit && cue.damageReduced !== undefined && cue.damageReduced > 0 && (
        <EffectRow
          tone="reduced"
          icon={<ShieldIcon className="inline-block h-5 w-[18px] shrink-0" style={{ background: '#6fae5a' }} />}
          title={
            <>
              <b className="font-cinzel">{cue.damageReduced}</b> reduced
            </>
          }
        />
      )}
      {cue.ignoresShield && !isPlayerHit && (
        <EffectRow
          tone="pierce"
          icon={<PierceIcon className="inline-block h-4 w-4 shrink-0" />}
          title="Ignores shield"
          detail="Attack pierces armor"
        />
      )}
      {fullyBlocked && (
        <EffectRow
          tone="blocked"
          icon={<ShieldIcon className="inline-block h-5 w-[18px] shrink-0" />}
          title="Fully blocked"
        />
      )}
      {cardsLost !== undefined && cardsLost > 0 && (
        <motion.p
          className="font-cinzel text-[36px] leading-none text-[#f0b3aa]"
          style={{ textShadow: '0 0 24px rgba(214,68,58,.65)' }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration, delay: 0.08 }}
        >
          −{cardsLost} {cardsLost === 1 ? 'card' : 'cards'}
        </motion.p>
      )}
    </motion.div>
  );
}

export function BattlePlayAnimation({ cue, onImpact, onComplete }: BattlePlayAnimationProps) {
  const [phase, setPhase] = useState<Phase>('play');
  const onImpactRef = useRef(onImpact);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onImpactRef.current = onImpact;
    onCompleteRef.current = onComplete;
  }, [onImpact, onComplete]);

  const isAttack = cue.cardType === 'attack';
  const isPlayerAttack = cue.source === 'player' && isAttack;
  const isEnemyAttack = cue.source === 'enemy' && isAttack;
  const isDefense = cue.cardType === 'defense';
  const hasHitEffects =
    (cue.incomingDamage ?? 0) > 0 ||
    (cue.damageToPlayer ?? 0) > 0 ||
    (cue.damageToEnemy ?? 0) > 0 ||
    (cue.shieldBlocked ?? 0) > 0 ||
    (cue.barrierBlocked ?? 0) > 0;

  useEffect(() => {
    setPhase('play');
    const impactTimer = window.setTimeout(() => {
      setPhase('impact');
      const cardsLost =
        isPlayerAttack && hasHitEffects
          ? (cue.damageToEnemy ?? 0)
          : isEnemyAttack && hasHitEffects
            ? (cue.damageToPlayer ?? 0)
            : 0;

      if (isPlayerAttack && hasHitEffects) {
        onImpactRef.current('enemy', cardsLost);
      } else if (isEnemyAttack && hasHitEffects) {
        onImpactRef.current('player', cardsLost);
      } else if (isDefense && cue.source === 'player') {
        onImpactRef.current('player', 0);
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
  }, [cue.cardId, cue.cardName, isPlayerAttack, isEnemyAttack, isDefense, hasHitEffects, cue.source]);

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
          {phase === 'impact' && isPlayerAttack && (
            <motion.div
              className="absolute top-[24%] left-[38%] z-10 h-[3px] w-52 origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg, #e0524a, #f0902a 55%, transparent)',
                boxShadow: '0 0 28px rgba(224,82,74,.85)',
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          )}
          {phase === 'impact' && isEnemyAttack && (
            <motion.div
              className="absolute bottom-[30%] left-[38%] z-10 h-[3px] w-52 origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #c1362c 45%, #e0524a)',
                boxShadow: '0 0 28px rgba(224,82,74,.85)',
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {phase === 'impact' && isDefense && cue.shieldGained && (
            <div className="absolute bottom-[24%] left-[4%] z-30">
              <EffectRow
                tone="shield"
                icon={<ShieldIcon className="inline-block h-5 w-[18px] shrink-0" />}
                title={
                  <>
                    Gain <b className="font-cinzel">+{cue.shieldGained}</b> shield
                  </>
                }
              />
            </div>
          )}

          {phase === 'impact' && isDefense && cue.barrierGained && (
            <div className="absolute bottom-[24%] left-[4%] z-30">
              <EffectRow
                tone="barrier"
                icon={<BarrierIcon className="inline-block h-[13px] w-3.5 shrink-0" />}
                title={
                  <>
                    Gain <b className="font-cinzel">+{cue.barrierGained}</b> barrier
                  </>
                }
                detail="until end of round"
              />
            </div>
          )}

          {phase === 'impact' && cue.poisonAppliedTo && (
            <div
              className={`absolute z-30 ${cue.poisonAppliedTo === 'enemy' ? 'top-[16%] right-[4%]' : 'bottom-[22%] left-[4%]'}`}
            >
              <EffectRow
                tone="poison"
                icon={<PoisonIcon className="inline-block h-5 w-[18px] shrink-0" />}
                title="Poison applied"
                detail="bypasses shield & barrier"
              />
            </div>
          )}

          {phase === 'impact' && isPlayerAttack && hasHitEffects && (
            <DamageBreakdown cue={cue} side="enemy" />
          )}
          {phase === 'impact' && isEnemyAttack && hasHitEffects && (
            <DamageBreakdown cue={cue} side="player" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
