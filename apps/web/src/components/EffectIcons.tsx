import type { CSSProperties, ReactNode } from 'react';
import { Diamond, Droplets, Hexagon, RotateCcw, Shield, Sparkles, Sword } from 'lucide-react';
import type { CardEffectIconType } from '@/lib/cardTheme';

interface IconProps {
  className?: string;
  style?: CSSProperties;
}

function iconStyle(color: string, style?: CSSProperties): CSSProperties {
  return {
    color,
    filter: `drop-shadow(0 0 6px ${color}66)`,
    ...style,
  };
}

export function AttackIcon({ className, style }: IconProps) {
  return <Sword className={className} style={iconStyle('#e0524a', style)} strokeWidth={2.2} />;
}

export function ShieldIcon({ className, style }: IconProps) {
  return <Shield className={className} style={iconStyle('#5b86c4', style)} strokeWidth={2.1} />;
}

export function BarrierIcon({ className, style }: IconProps) {
  return <Hexagon className={className} style={iconStyle('#9a7ae0', style)} strokeWidth={2.1} />;
}

export function ManaIcon({ className, style }: IconProps) {
  return <Sparkles className={className} style={iconStyle('#6ec8e0', style)} strokeWidth={2.1} />;
}

export function PoisonIcon({ className, style }: IconProps) {
  return <Droplets className={className} style={iconStyle('#6fae5a', style)} strokeWidth={2.1} />;
}

export function PierceIcon({ className, style }: IconProps) {
  return <Diamond className={className} style={iconStyle('#c9a24a', style)} strokeWidth={2.1} />;
}

export function RecoverIcon({ className, style }: IconProps) {
  return <RotateCcw className={className} style={iconStyle('#c9a24a', style)} strokeWidth={2.1} />;
}

const effectIconSizes = {
  corner: {
    attack: 'inline-block h-[14px] w-3',
    shield: 'inline-block h-[14px] w-3',
    barrier: 'inline-block h-[14px] w-3.5',
    poison: 'inline-block h-[14px] w-3',
    pierce: 'inline-block h-3.5 w-3.5',
    recover: 'inline-block text-[13px]',
  },
  footer: {
    attack: 'inline-block h-2.5 w-2 shrink-0',
    shield: 'inline-block h-2.5 w-2.5 shrink-0',
    barrier: 'inline-block h-2.5 w-2.5 shrink-0',
    poison: 'inline-block h-2.5 w-2.5 shrink-0',
    pierce: 'inline-block h-2.5 w-2.5 shrink-0',
    recover: 'inline-block shrink-0 text-[11px]',
  },
} as const;

function renderEffectIcon(type: CardEffectIconType, size: 'corner' | 'footer'): ReactNode {
  const className = effectIconSizes[size][type];

  switch (type) {
    case 'attack':
      return <AttackIcon className={className} />;
    case 'shield':
      return <ShieldIcon className={className} />;
    case 'barrier':
      return <BarrierIcon className={className} />;
    case 'poison':
      return <PoisonIcon className={className} />;
    case 'pierce':
      return <PierceIcon className={className} />;
    case 'recover':
      return <RecoverIcon className={className} />;
    default:
      return <AttackIcon className={className} />;
  }
}

export function CardEffectIcon({
  type,
  size = 'footer',
}: {
  type: CardEffectIconType;
  size?: 'corner' | 'footer';
}) {
  return renderEffectIcon(type, size);
}
