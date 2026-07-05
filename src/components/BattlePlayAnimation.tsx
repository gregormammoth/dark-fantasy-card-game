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

interface BattlePlayAnimationProps {
  cue: AnimationCue;
  onImpact: (target: 'player' | 'enemy') => void;
  onComplete: () => void;
}

type Phase = 'play' | 'impact' | 'done';

export function BattlePlayAnimation({ cue, onImpact, onComplete }: BattlePlayAnimationProps) {
  const [phase, setPhase] = useState<Phase>('play');
  const onImpactRef = useRef(onImpact);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onImpactRef.current = onImpact;
    onCompleteRef.current = onComplete;
  }, [onImpact, onComplete]);

  const isPlayerAttack = cue.source === 'player' && cue.cardType === 'attack';
  const isEnemyAttack = cue.source === 'enemy' && cue.cardType === 'attack';
  const isDefense = cue.cardType === 'defense';
  const imageSrc = cue.cardClass ? `/cards/${cue.cardId}.png` : undefined;
  const colorClass = classColors[cue.cardClass ?? ''] ?? 'border-stone-600 bg-stone-900/90 shadow-stone-900/40';

  useEffect(() => {
    setPhase('play');
    const impactTimer = window.setTimeout(() => {
      setPhase('impact');
      if (isPlayerAttack && cue.damageToEnemy) {
        onImpactRef.current('enemy');
      } else if (isEnemyAttack && cue.damageToPlayer) {
        onImpactRef.current('player');
      } else if (isDefense && cue.source === 'player') {
        onImpactRef.current('player');
      }
    }, 550);

    const doneTimer = window.setTimeout(() => {
      setPhase('done');
      onCompleteRef.current();
    }, 1300);

    return () => {
      window.clearTimeout(impactTimer);
      window.clearTimeout(doneTimer);
    };
  }, [cue.cardId, cue.cardName, isPlayerAttack, isEnemyAttack, isDefense, cue.damageToEnemy, cue.damageToPlayer, cue.source]);

  const cardX = cue.source === 'player' ? -120 : 120;
  const strikeX = cue.source === 'player' ? 180 : -180;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'done' ? 0 : 0.55 }}
        transition={{ duration: 0.25 }}
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
        {imageSrc && (
          <div className="h-36 w-full shrink-0 bg-stone-950/60">
            <img src={imageSrc} alt="" className="h-full w-full object-contain object-center" />
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
            transition={{ duration: 0.22 }}
          />
        )}
        {phase === 'impact' && isEnemyAttack && (
          <motion.div
            className="absolute right-1/2 top-1/2 z-20 h-1 w-48 -translate-y-1/2 origin-right rounded-full bg-gradient-to-l from-red-600 via-red-400 to-transparent shadow-[0_0_24px_rgba(220,38,38,0.8)]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        )}
        {phase === 'impact' && isDefense && cue.shieldGained && (
          <motion.div
            className="absolute left-8 top-1/3 z-20 rounded-full border-2 border-blue-400/80 bg-blue-500/20 px-4 py-3 text-2xl shadow-[0_0_30px_rgba(59,130,246,0.6)]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.3, 1], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
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
            transition={{ duration: 0.35 }}
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
            transition={{ duration: 0.35 }}
          >
            ☠ Poison
          </motion.div>
        )}
        {phase === 'impact' && cue.damageToEnemy !== undefined && cue.damageToEnemy > 0 && (
          <motion.p
            className="absolute right-8 top-1/4 z-20 text-4xl font-black text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]"
            initial={{ opacity: 0, y: 16, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
          >
            -{cue.damageToEnemy}
          </motion.p>
        )}
        {phase === 'impact' && cue.damageToPlayer !== undefined && cue.damageToPlayer > 0 && (
          <motion.p
            className="absolute left-8 top-1/4 z-20 text-4xl font-black text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]"
            initial={{ opacity: 0, y: 16, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
          >
            -{cue.damageToPlayer}
          </motion.p>
        )}
        {phase === 'impact' && cue.ignoresShield && isPlayerAttack && (
          <motion.p
            className="absolute right-12 top-2/5 z-20 text-xs font-semibold uppercase tracking-widest text-violet-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Ignores shield
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
