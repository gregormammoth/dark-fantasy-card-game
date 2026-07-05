import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AnimationCue } from '@/types/animation';

const classColors: Record<string, string> = {
  fighter: 'border-red-700/80 bg-red-950/80 shadow-red-900/40',
  rogue: 'border-emerald-700/80 bg-emerald-950/80 shadow-emerald-900/40',
  wizard: 'border-violet-700/80 bg-violet-950/80 shadow-violet-900/40',
  survivor: 'border-amber-700/80 bg-amber-950/80 shadow-amber-900/40',
};

const typeIcons: Record<string, string> = {
  attack: '⚔',
  defense: '🛡',
};

const duration = 0.5;

interface BattlePlayAnimationProps {
  cue: AnimationCue;
  onImpact: (target: 'player' | 'enemy') => void;
  onComplete: () => void;
}

type Phase = 'play' | 'impact' | 'done';

function ImpactBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'damage' | 'shield' | 'barrier' | 'reduced' | 'incoming' | 'blocked';
}) {
  const tones: Record<typeof tone, string> = {
    incoming: 'border-orange-500/60 bg-orange-950/80 text-orange-200',
    damage: 'border-red-500/60 bg-red-950/80 text-red-300',
    shield: 'border-blue-500/60 bg-blue-950/80 text-blue-200',
    barrier: 'border-violet-500/60 bg-violet-950/80 text-violet-200',
    reduced: 'border-emerald-500/60 bg-emerald-950/80 text-emerald-200',
    blocked: 'border-stone-500/60 bg-stone-900/80 text-stone-200',
  };

  return (
    <motion.span
      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold shadow-lg ${tones[tone]}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration }}
    >
      {children}
    </motion.span>
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
      className={`absolute top-1/4 z-20 flex flex-col gap-2 ${isPlayerHit ? 'left-6 items-start' : 'right-6 items-end'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {cue.incomingDamage !== undefined && cue.incomingDamage > 0 && (
        <ImpactBadge tone="incoming">⚔ {cue.incomingDamage} incoming</ImpactBadge>
      )}
      {isPlayerHit && cue.barrierBlocked !== undefined && cue.barrierBlocked > 0 && (
        <ImpactBadge tone="barrier">✦ {cue.barrierBlocked} blocked by barrier</ImpactBadge>
      )}
      {cue.shieldBlocked !== undefined && cue.shieldBlocked > 0 && (
        <ImpactBadge tone="shield">
          🛡 {cue.shieldBlocked} blocked by shield
        </ImpactBadge>
      )}
      {isPlayerHit && cue.damageReduced !== undefined && cue.damageReduced > 0 && (
        <ImpactBadge tone="reduced">↓ {cue.damageReduced} reduced</ImpactBadge>
      )}
      {cue.ignoresShield && !isPlayerHit && (
        <ImpactBadge tone="incoming">Ignores shield</ImpactBadge>
      )}
      {fullyBlocked && <ImpactBadge tone="blocked">Fully blocked!</ImpactBadge>}
      {cardsLost !== undefined && cardsLost > 0 && (
        <motion.span
          className="text-4xl font-black text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration, delay: 0.1 }}
        >
          -{cardsLost} {cardsLost === 1 ? 'card' : 'cards'}
        </motion.span>
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

  const imageSrc = cue.cardClass ? `/cards/${cue.cardId}.png` : undefined;
  const colorClass =
    cue.source === 'enemy'
      ? 'border-red-800/80 bg-red-950/90 shadow-red-900/50'
      : classColors[cue.cardClass ?? ''] ?? 'border-stone-600 bg-stone-900/90 shadow-stone-900/40';

  useEffect(() => {
    setPhase('play');
    const impactTimer = window.setTimeout(() => {
      setPhase('impact');
      if (isPlayerAttack && hasHitEffects) {
        onImpactRef.current('enemy');
      } else if (isEnemyAttack && hasHitEffects) {
        onImpactRef.current('player');
      } else if (isDefense && cue.source === 'player') {
        onImpactRef.current('player');
      }
    }, 550);

    const doneTimer = window.setTimeout(() => {
      setPhase('done');
      onCompleteRef.current();
    }, 1500);

    return () => {
      window.clearTimeout(impactTimer);
      window.clearTimeout(doneTimer);
    };
  }, [cue.cardId, cue.cardName, isPlayerAttack, isEnemyAttack, isDefense, hasHitEffects, cue.source]);

  const cardX = cue.source === 'player' ? -120 : 120;
  const strikeX = cue.source === 'player' ? 180 : -180;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'done' ? 0 : 0.55 }}
        transition={{ duration }}
      />

      <motion.div
        key={cue.cardId + cue.cardName}
        className={`relative z-10 flex w-32 flex-col rounded-xl border-2 shadow-2xl ${colorClass}`}
        initial={{ opacity: 0, x: cardX, y: 48, scale: 0.8, rotate: cue.source === 'player' ? -6 : 6 }}
        animate={{
          opacity: phase === 'done' ? 0 : 1,
          x: phase === 'play' ? 0 : strikeX * 0.25,
          y: phase === 'play' ? 0 : -12,
          scale: phase === 'impact' ? 1.05 : 1,
          rotate: 0,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      >
        {imageSrc ? (
          <div className="h-36 w-full shrink-0 bg-stone-950/60">
            <img src={imageSrc} alt="" className="h-full w-full object-contain object-center" />
          </div>
        ) : (
          <div className="flex h-36 w-full shrink-0 items-center justify-center bg-red-950/70 text-5xl">
            {typeIcons[cue.cardType ?? 'attack'] ?? '⚔'}
          </div>
        )}
        <div className="p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-stone-400">
            {cue.source === 'player' ? 'You play' : 'Enemy plays'}
          </p>
          <p className="text-sm font-bold text-stone-100">{cue.cardName}</p>
          <p className="mt-1 text-lg">{typeIcons[cue.cardType ?? 'attack'] ?? '⚔'}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {phase === 'impact' && isPlayerAttack && (
          <motion.div
            className="absolute left-1/2 top-1/2 z-20 h-1 w-48 -translate-y-1/2 origin-left rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-transparent shadow-[0_0_24px_rgba(239,68,68,0.8)]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          />
        )}
        {phase === 'impact' && isEnemyAttack && (
          <motion.div
            className="absolute right-1/2 top-1/2 z-20 h-1 w-48 -translate-y-1/2 origin-right rounded-full bg-gradient-to-l from-red-600 via-red-400 to-transparent shadow-[0_0_24px_rgba(220,38,38,0.8)]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          />
        )}
        {phase === 'impact' && isDefense && cue.shieldGained && (
          <motion.div
            className="absolute left-8 top-1/3 z-20 rounded-full border-2 border-blue-400/80 bg-blue-500/20 px-4 py-3 text-2xl shadow-[0_0_30px_rgba(59,130,246,0.6)]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.3, 1], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          >
            🛡 +{cue.shieldGained}
          </motion.div>
        )}
        {phase === 'impact' && isDefense && cue.barrierGained && (
          <motion.div
            className="absolute left-8 top-1/3 z-20 rounded-full border-2 border-violet-400/80 bg-violet-500/20 px-4 py-3 text-2xl shadow-[0_0_30px_rgba(139,92,246,0.6)]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.3, 1], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          >
            ✦ +{cue.barrierGained}
          </motion.div>
        )}
        {phase === 'impact' && cue.poisonAppliedTo && (
          <motion.div
            className={`absolute top-1/3 z-20 rounded-full border-2 border-green-400/80 bg-green-500/20 px-4 py-3 text-2xl shadow-[0_0_30px_rgba(34,197,94,0.6)] ${
              cue.poisonAppliedTo === 'enemy' ? 'right-8' : 'left-8'
            }`}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.2, 1], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          >
            ☠ Poison
          </motion.div>
        )}
        {phase === 'impact' && isPlayerAttack && hasHitEffects && (
          <DamageBreakdown cue={cue} side="enemy" />
        )}
        {phase === 'impact' && isEnemyAttack && hasHitEffects && (
          <DamageBreakdown cue={cue} side="player" />
        )}
      </AnimatePresence>
    </div>
  );
}
