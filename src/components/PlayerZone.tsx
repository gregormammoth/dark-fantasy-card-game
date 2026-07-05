import { motion } from 'framer-motion';
import type { CardInstance } from '@/types/card';
import type { PoisonState } from '@/types/battle';
import { CardStack } from './CardStack';
import { Hand } from './Hand';
import { EndTurnButton } from './EndTurnButton';
import { BarrierIcon, PoisonIcon, ShieldIcon } from './EffectIcons';

interface PlayerZoneProps {
  portrait: string;
  health: number;
  deckCount: number;
  shield: number;
  barrier: number;
  poison: PoisonState | null;
  hand: CardInstance[];
  onAddToCombo: (instanceId: string) => void;
  onEndTurn: () => void;
  spendingIndices?: Set<number>;
  spendMode?: 'burn' | 'draw';
  handDisabled?: boolean;
  endTurnDisabled?: boolean;
  showEndTurn?: boolean;
  isHit?: boolean;
}

export function PlayerZone({
  portrait,
  health,
  deckCount,
  shield,
  barrier,
  poison,
  hand,
  onAddToCombo,
  onEndTurn,
  spendingIndices,
  spendMode = 'burn',
  handDisabled,
  endTurnDisabled,
  showEndTurn = true,
  isHit = false,
}: PlayerZoneProps) {
  const spendCount = spendingIndices?.size ?? 0;
  const displayHealth =
    health + (spendMode === 'burn' ? spendCount : 0);
  const displayDeckCount =
    spendMode === 'draw' ? deckCount + spendCount : deckCount;

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
      className="flex items-end gap-5 border-t border-[rgba(201,162,74,.12)] pt-3.5"
    >
      <div className="flex shrink-0 items-end gap-4">
        <div className="relative">
          <div className="h-[126px] w-24 overflow-hidden rounded-[11px] bg-[#151009]">
            <img
              src={portrait}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 rounded-[11px] border border-[rgba(201,162,74,.5)]"
            style={{ boxShadow: 'inset 0 0 22px -8px rgba(201,162,74,.6)' }}
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <CardStack
            count={displayDeckCount}
            side="player"
            spendingIndices={spendingIndices}
            spendMode={spendMode}
          />
          <div className="flex items-baseline gap-2 leading-none">
            <span
              className="font-cinzel text-[30px] text-[#e0b552] transition-all duration-300"
              style={{ textShadow: '0 0 16px rgba(224,181,82,.5)' }}
            >
              {displayHealth}
            </span>
            <span className="text-[9px] tracking-[.2em] text-[#8a7f72]">CARDS</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#b7ab9c]">
            <span className="inline-flex items-center gap-1">
              <ShieldIcon className="inline-block h-[15px] w-[13px]" />
              {shield}
            </span>
            <span className="inline-flex items-center gap-1 text-[#a58fe0]">
              <BarrierIcon className="inline-block h-[13px] w-3.5" />
              {barrier}
            </span>
            {poison && (
              <span className="inline-flex items-center gap-1 text-[#8fce7a]">
                <PoisonIcon className="inline-block h-[13px] w-[13px]" />
                {poison.damagePerTurn}×{poison.remainingTurns}
              </span>
            )}
          </div>
        </div>
      </div>

      <Hand cards={hand} disabled={handDisabled} onAddToCombo={onAddToCombo} />

      <div className="flex shrink-0 flex-col items-center gap-3">
        {showEndTurn && <EndTurnButton onClick={onEndTurn} disabled={endTurnDisabled} />}
      </div>
    </motion.section>
  );
}
