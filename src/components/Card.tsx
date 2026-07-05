import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { CardInstance } from '@/types/card';
import { getCardEffectSummary, getCardTheme, getCardType } from '@/lib/cardTheme';
import { AttackIcon, BarrierIcon, ShieldIcon } from './EffectIcons';

interface CardProps {
  card: CardInstance;
  onClick?: () => void;
  disabled?: boolean;
  layoutId?: string;
  variant?: 'combo' | 'hand';
  handIndex?: number;
  handTotal?: number;
}

function getHandStyle(index: number, total: number): CSSProperties {
  if (total <= 1) {
    return {
      transform: 'rotate(0deg) translateY(2px)',
      transformOrigin: 'bottom center',
      marginRight: total === 1 ? 0 : -24,
    };
  }

  const maxRot = 7;
  const t = index / (total - 1);
  const rot = -maxRot + t * 2 * maxRot;
  const y = (Math.abs(rot) / maxRot) * 12 + (Math.abs(rot) < 0.1 ? 2 : 0);

  return {
    transform: `rotate(${rot}deg) translateY(${y}px)`,
    transformOrigin: 'bottom center',
    marginRight: index < total - 1 ? -24 : 0,
  };
}

export function Card({
  card,
  onClick,
  disabled,
  layoutId,
  variant = 'combo',
  handIndex = 0,
  handTotal = 1,
}: CardProps) {
  const { definition } = card;
  const theme = getCardTheme(definition);
  const cardType = getCardType(definition);
  const summary = getCardEffectSummary(definition);
  const imageSrc = definition.image ?? (definition.class ? `/cards/${definition.id}.png` : undefined);
  const isHand = variant === 'hand';
  const width = isHand ? 152 : 150;
  const imageHeight = isHand ? 116 : 96;

  return (
    <motion.button
      layoutId={layoutId}
      type="button"
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, y: -12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`ember-card group flex shrink-0 flex-col overflow-hidden rounded-[11px] bg-[#12100f] text-left transition-[transform,box-shadow] duration-[180ms] ease-out ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${isHand ? 'hover:z-20' : ''}`}
      style={{
        width,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 0 22px -10px ${theme.glow}`,
        ['--card-glow' as string]: theme.glow,
        ...(isHand ? getHandStyle(handIndex, handTotal) : {}),
      }}
    >
      <div className="relative shrink-0 overflow-hidden bg-[#0c0908]" style={{ height: imageHeight }}>
        {imageSrc ? (
          <img src={imageSrc} alt="" className="h-full w-full object-cover object-center" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1412] to-[#0c0908]">
            <div
              className="opacity-40"
              style={{
                width: 36,
                height: 36,
                border: `1px solid ${theme.accent}88`,
                transform: 'rotate(45deg)',
              }}
            />
          </div>
        )}
        {definition.class && (
          <span
            className="absolute top-[7px] left-[7px] rounded-[3px] px-1.5 py-0.5 text-[8px] tracking-[.12em] text-white"
            style={{ background: theme.badge }}
          >
            {theme.label}
          </span>
        )}
        <span className="absolute top-[7px] right-[7px]">
          {cardType === 'attack' ? (
            <AttackIcon className="inline-block h-[14px] w-3" />
          ) : (
            <ShieldIcon className="inline-block h-[14px] w-3" />
          )}
        </span>
      </div>
      <div className="px-2.5 py-2" style={{ borderTop: `2px solid ${theme.accent}` }}>
        <div className="font-cinzel text-[13px] text-[#f0dfcb]">{definition.name}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#eaa]">
          {cardType === 'attack' ? (
            <AttackIcon className="inline-block h-2.5 w-2" />
          ) : definition.effects.some((effect) => effect.type === 'barrier') ? (
            <BarrierIcon className="inline-block h-2.5 w-2.5" />
          ) : (
            <ShieldIcon className="inline-block h-2.5 w-2.5" />
          )}
          <span className="leading-tight">{summary}</span>
        </div>
      </div>
    </motion.button>
  );
}
