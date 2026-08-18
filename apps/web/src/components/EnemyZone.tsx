import { motion } from 'framer-motion';
import type { PoisonState } from '@dark-fantasy/shared/types/battle';
import { useTranslation } from '@/i18n/useTranslation';
import { CharacterPortrait } from './CharacterPortrait';
import { CardStack } from './CardStack';
import { PoisonIcon, ShieldIcon } from './EffectIcons';

interface EnemyCardTypeChip {
  label: string;
  tone: 'damage' | 'shield' | 'poison' | 'pierce';
}

interface EnemyZoneProps {
  name: string;
  portrait: string;
  deckCount: number;
  health: number;
  shield: number;
  barrier?: number;
  poison: PoisonState | null;
  cardTypes?: EnemyCardTypeChip[];
  spendingIndices?: Set<number>;
  spendMode?: 'burn' | 'draw';
  isHit?: boolean;
  marked?: boolean;
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
  barrier = 0,
  poison,
  cardTypes = [],
  spendingIndices,
  spendMode = 'burn',
  isHit = false,
  marked = false,
}: EnemyZoneProps) {
  const { t } = useTranslation();
  const spendCount = spendingIndices?.size ?? 0;
  const displayHealth = health + (spendMode === 'burn' ? spendCount : 0);
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
      <div className="relative">
        <div className="relative h-[308px] w-[236px] overflow-hidden rounded-[14px] bg-[#120908]">
          <CharacterPortrait src={portrait} className="h-full w-full" />
        </div>
        <div
          className="animate-breathe pointer-events-none absolute inset-[-2px] rounded-[16px] border border-[rgba(214,68,58,.4)]"
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
          <span className="text-xs tracking-[.24em] text-[#c56a5f]">{t('battle.dreadborne')}</span>
        </div>

        {cardTypes.length > 0 && (
          <div className="flex max-w-[600px] flex-col gap-2.5">
            <span className="text-[9px] tracking-[.2em] text-[#8a7f72]">
              {t('battle.deckTypes')}
            </span>
            <div className="flex flex-wrap gap-2.5">
              {cardTypes.map((item) => {
                const styles = {
                  damage: {
                    bg: 'rgba(224,82,74,.12)',
                    border: 'rgba(224,82,74,.4)',
                    color: '#f0dfcb',
                  },
                  shield: {
                    bg: 'rgba(91,134,196,.1)',
                    border: 'rgba(91,134,196,.35)',
                    color: '#dce8fa',
                  },
                  poison: {
                    bg: 'rgba(111,174,90,.1)',
                    border: 'rgba(111,174,90,.35)',
                    color: '#d9f1cf',
                  },
                  pierce: {
                    bg: 'rgba(201,162,74,.1)',
                    border: 'rgba(201,162,74,.35)',
                    color: '#f0dfcb',
                  },
                }[item.tone];

                return (
                  <span
                    key={`${item.tone}-${item.label}`}
                    className="rounded-[6px] border px-3 py-2 text-[10px] tracking-[.14em]"
                    style={{
                      background: styles.bg,
                      borderColor: styles.border,
                      color: styles.color,
                    }}
                  >
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-[13px] text-[#b7ab9c]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldIcon className="inline-block h-[17px] w-[15px]" />
            {t('battle.shieldLabel')}{' '}
            <b className="font-cinzel text-[#dbe6f5]">{shield}</b>
          </span>
          {marked && (
            <span className="inline-flex items-center gap-1.5 text-[#c9a24a]">
              {t('battle.markedLabel')}
            </span>
          )}
          {barrier > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[#c4b0ef]">
              ✦ {t('battle.barrierLabel')} <b className="font-cinzel text-[#ddd0f5]">{barrier}</b>
            </span>
          )}
          {poison && (
            <span className="inline-flex items-center gap-1.5 text-[#8fce7a]">
              <PoisonIcon className="inline-block h-[15px] w-[13px]" />
              {t('battle.poisonedLabel')}{' '}
              <b className="font-cinzel text-[#c0e8b0]">
                {poison.damagePerTurn}×{poison.remainingTurns}
              </b>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <CardStack
          count={deckCount}
          side="enemy"
          spendingIndices={spendingIndices}
          spendMode={spendMode}
        />
        <div className="flex flex-col items-center leading-none">
          <span
            className="font-cinzel text-[40px] text-[#f0b3aa] transition-all duration-300"
            style={{ textShadow: '0 0 20px rgba(214,68,58,.5)' }}
          >
            {displayHealth}
          </span>
          <span className="mt-1 text-[10px] tracking-[.22em] text-[#8a7f72]">{t('battle.cardsHealth')}</span>
        </div>
      </div>
    </motion.section>
  );
}
