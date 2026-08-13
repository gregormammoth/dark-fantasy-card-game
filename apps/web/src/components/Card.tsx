import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import type { CardInstance } from '@dark-fantasy/shared/types/card';
import {
  cardLayout,
  getCardEffectIconType,
  getCardEffectSummary,
  getCardEffectTextColor,
  getCardHeight,
  getCardTheme,
} from '@/lib/cardTheme';
import { useAudio } from '@/audio/useAudio';
import { useHoverSound } from '@/audio/useHoverSound';
import { CardEffectIcon } from './EffectIcons';

interface CardProps {
  card: CardInstance;
  onClick?: () => void;
  disabled?: boolean;
  layoutId?: string;
  variant?: 'combo' | 'hand' | 'collection';
  handIndex?: number;
  handTotal?: number;
  locked?: boolean;
  inDeck?: boolean;
  statusLabel?: string;
  statusColor?: string;
  footer?: ReactNode;
}

function getHandOverlap(total: number): number {
  if (total <= 3) {
    return -12;
  }
  if (total <= 5) {
    return -16;
  }
  return -20;
}

function getHandStyle(index: number, total: number): CSSProperties {
  const overlap = getHandOverlap(total);

  if (total <= 1) {
    return {
      transform: 'rotate(0deg) translateY(2px)',
      transformOrigin: 'bottom center',
      marginRight: 0,
      zIndex: 1,
      position: 'relative',
    };
  }

  const maxRot = 7;
  const t = index / (total - 1);
  const rot = -maxRot + t * 2 * maxRot;
  const y = (Math.abs(rot) / maxRot) * 12 + (Math.abs(rot) < 0.1 ? 2 : 0);

  return {
    transform: `rotate(${rot}deg) translateY(${y}px)`,
    transformOrigin: 'bottom center',
    marginRight: index < total - 1 ? overlap : 0,
    zIndex: index + 1,
    position: 'relative',
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
  locked = false,
  inDeck = false,
  statusLabel,
  statusColor,
  footer,
}: CardProps) {
  const { definition } = card;
  const theme = getCardTheme(definition);
  const effectIconType = getCardEffectIconType(definition);
  const effectColor = getCardEffectTextColor(effectIconType);
  const summary = getCardEffectSummary(definition);
  const imageSrc = definition.image ?? (definition.class ? `/cards/${definition.id}.png` : undefined);
  const isHand = variant === 'hand';
  const cardHeight = getCardHeight();
  const { play } = useAudio();
  const hover = useHoverSound('card_hover', 0.2);
  const sharedLayout = Boolean(layoutId);

  return (
    <motion.button
      layoutId={layoutId}
      type="button"
      onClick={() => {
        if (disabled || locked) return;
        play('card_play');
        onClick?.();
      }}
      onPointerEnter={hover.onPointerEnter}
      onPointerLeave={hover.onPointerLeave}
      disabled={disabled || locked}
      initial={sharedLayout || variant === 'collection' ? false : { opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: locked ? 0.55 : 1, y: 0, scale: 1 }}
      exit={sharedLayout ? undefined : { opacity: 0, scale: 0.85, y: -12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`ember-card group flex shrink-0 flex-col overflow-hidden rounded-[11px] bg-[#12100f] text-left transition-[transform,box-shadow] duration-[180ms] ease-out ${
        disabled || locked ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${isHand ? 'hover:z-30' : ''} ${variant === 'collection' && !locked ? 'hover:-translate-y-1' : ''}`}
      style={{
        width: cardLayout.width,
        height: cardHeight,
        border: `1px solid ${
          inDeck ? theme.accent : locked ? 'rgba(201,162,74,.1)' : theme.border
        }`,
        boxShadow: `0 0 22px -10px ${theme.glow}`,
        ['--card-glow' as string]: theme.glow,
        ...(isHand ? getHandStyle(handIndex, handTotal) : {}),
      }}
    >
      <div
        className="relative shrink-0 overflow-hidden bg-[#0c0908]"
        style={{ height: cardLayout.imageHeight }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover object-center"
            style={{ filter: locked ? 'grayscale(1) brightness(.6)' : undefined }}
          />
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
        {!locked && !inDeck && (
          <span className="absolute top-[7px] right-[7px]">
            <CardEffectIcon type={effectIconType} size="corner" />
          </span>
        )}
        {locked && (
          <>
            <span className="absolute inset-0 bg-[rgba(6,5,4,.55)]" />
            <span className="absolute top-[6px] right-[6px] flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[rgba(201,162,74,.4)] bg-[#1a1512] text-[9px] text-[#8a7f72]">
              🔒
            </span>
          </>
        )}
        {!locked && inDeck && (
          <span className="absolute top-[6px] right-[6px] rounded-[5px] bg-[#e0b552] px-1.5 py-0.5 font-cinzel text-[9px] text-[#1a1208]">
            IN DECK
          </span>
        )}
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col px-2.5 py-2"
        style={{ borderTop: `2px solid ${theme.accent}`, height: cardLayout.footerHeight }}
      >
        <div className="line-clamp-2 font-cinzel text-[13px] leading-tight text-[#f0dfcb]">
          {definition.name}
        </div>
        <div className="mt-1 flex min-h-0 flex-1 items-start gap-1.5 text-[11px]" style={{ color: effectColor }}>
          <CardEffectIcon type={effectIconType} size="footer" />
          <span className="line-clamp-2 min-w-0 leading-tight">{summary}</span>
        </div>
        {(statusLabel || footer) && (
          <div
            className="mt-auto truncate text-[11px] tracking-[.04em]"
            style={{ color: statusColor ?? '#8a7f72' }}
          >
            {footer ?? statusLabel}
          </div>
        )}
      </div>
    </motion.button>
  );
}
