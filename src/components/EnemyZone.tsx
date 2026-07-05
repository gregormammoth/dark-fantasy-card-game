import { motion } from 'framer-motion';
import type { PoisonState } from '@/types/battle';
import type { EnemyIntent } from '@/engine/enemyIntent';
import { CardStack } from './CardStack';
import { AttackIcon, PoisonIcon, ShieldIcon } from './EffectIcons';

interface EnemyZoneProps {
  name: string;
  portrait: string;
  deckCount: number;
  health: number;
  shield: number;
  poison: PoisonState | null;
  intent: EnemyIntent | null;
  burningTopCount?: number;
  isHit?: boolean;
}

function EmberParticle({ left, size, color, delay, duration }: {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}) {
  return (
    <div
      className="animate-ember absolute bottom-3 rounded-full"
      style={{
        left,
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size + 4}px ${color}`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function EnemyZone({
  name,
  portrait,
  deckCount,
  health,
  shield,
  poison,
  intent,
  burningTopCount = 0,
  isHit = false,
}: EnemyZoneProps) {
  return (
    <motion.section
      animate={
        isHit
          ? {
              x: [0, -10, 10, -6, 6, 0],
              filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1)'],
            }
          : { x: 0, filter: 'brightness(1)' }
      }
      transition={{ duration: 0.4 }}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-7 border-b border-[rgba(201,162,74,.12)] px-1.5 pt-3 pb-4"
    >
      <div className="animate-breathe relative">
        <div className="relative h-[308px] w-[236px] overflow-hidden rounded-[14px] bg-[#120908]">
          <img
            src={portrait}
            alt=""
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-[-2px] rounded-[16px] border border-[rgba(214,68,58,.4)]"
          style={{ boxShadow: 'inset 0 0 46px -10px rgba(190,50,45,.7)' }}
        />
        <EmberParticle left={26} size={5} color="#f0a24a" delay={0.3} duration={4.2} />
        <EmberParticle left={96} size={4} color="#f0c24a" delay={1.4} duration={5.1} />
        <EmberParticle left={168} size={6} color="#e0662a" delay={2.3} duration={4.6} />
        <EmberParticle left={206} size={4} color="#f0a24a" delay={0.9} duration={5.4} />
      </div>

      <div className="flex min-w-0 flex-col gap-3.5">
        <div className="flex items-baseline gap-3.5">
          <span
            className="font-cinzel text-[34px] text-[#f0dfcb]"
            style={{ textShadow: '0 0 26px rgba(214,68,58,.35)' }}
          >
            {name}
          </span>
          <span className="text-xs tracking-[.24em] text-[#c56a5f]">DREADBORNE</span>
        </div>

        {intent && (
          <div
            className="animate-intentpulse flex max-w-[560px] items-center gap-4 rounded-[14px] px-5 py-4"
            style={{
              background: 'linear-gradient(180deg,rgba(80,20,17,.55),rgba(30,12,11,.4))',
            }}
          >
            <div className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center">
              <AttackIcon className="inline-block h-[34px] w-[30px]" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[10px] tracking-[.28em] text-[#e8a49b]">INCOMING ATTACK</span>
              <div className="flex items-baseline gap-2.5">
                <span className="font-cinzel text-[30px] leading-none text-[#ffd9d2]">
                  {intent.damage}
                </span>
                <span className="font-cinzel text-lg text-[#f0c0b8]">{intent.cardName}</span>
              </div>
            </div>
            <span className="max-w-[150px] text-right text-xs leading-snug text-[#c99]">
              burns <b className="text-[#ffd9d2]">{intent.cardsBurned}</b> of your cards after
              shield
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 text-[13px] text-[#b7ab9c]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldIcon className="inline-block h-[17px] w-[15px]" />
            Shield{' '}
            <b className="font-cinzel text-[#dbe6f5]">{shield}</b>
          </span>
          {poison && (
            <span className="inline-flex items-center gap-1.5 text-[#8fce7a]">
              <PoisonIcon className="inline-block h-[15px] w-[13px]" />
              Poisoned{' '}
              <b className="font-cinzel text-[#c0e8b0]">
                {poison.damagePerTurn}×{poison.remainingTurns}
              </b>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <CardStack count={deckCount} side="enemy" burningTopCount={burningTopCount} />
        <div className="flex flex-col items-center leading-none">
          <span
            className="font-cinzel text-[40px] text-[#f0b3aa]"
            style={{ textShadow: '0 0 20px rgba(214,68,58,.5)' }}
          >
            {health}
          </span>
          <span className="mt-1 text-[10px] tracking-[.22em] text-[#8a7f72]">CARDS · HEALTH</span>
        </div>
      </div>
    </motion.section>
  );
}
