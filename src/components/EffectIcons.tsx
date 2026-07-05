import type { CSSProperties } from 'react';

interface IconProps {
  className?: string;
  style?: CSSProperties;
}

export function AttackIcon({ className, style }: IconProps) {
  return (
    <span
      className={className}
      style={{
        background: 'linear-gradient(#f0705f,#c1362c)',
        clipPath: 'polygon(50% 0,100% 32%,72% 100%,28% 100%,0 32%)',
        boxShadow: '0 0 16px -3px #e0524a',
        ...style,
      }}
    />
  );
}

export function ShieldIcon({ className, style }: IconProps) {
  return (
    <span
      className={className}
      style={{
        background: '#5b86c4',
        clipPath: 'polygon(50% 0,100% 22%,100% 62%,50% 100%,0 62%,0 22%)',
        boxShadow: '0 0 10px -3px #5b86c4',
        ...style,
      }}
    />
  );
}

export function BarrierIcon({ className, style }: IconProps) {
  return (
    <span
      className={className}
      style={{
        background: '#9a7ae0',
        clipPath: 'polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)',
        boxShadow: '0 0 10px -3px #9a7ae0',
        ...style,
      }}
    />
  );
}

export function PoisonIcon({ className, style }: IconProps) {
  return (
    <span
      className={className}
      style={{
        background: '#6fae5a',
        borderRadius: '0 50% 50% 50%',
        transform: 'rotate(45deg)',
        boxShadow: '0 0 9px -2px #6fae5a',
        ...style,
      }}
    />
  );
}

export function PierceIcon({ className, style }: IconProps) {
  return (
    <span
      className={className}
      style={{
        border: '2px solid #c9a24a',
        transform: 'rotate(45deg)',
        ...style,
      }}
    />
  );
}
