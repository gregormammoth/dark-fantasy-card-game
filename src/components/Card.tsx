import { motion } from 'framer-motion';
import type { CardInstance } from '@/types/card';

const classColors: Record<string, string> = {
  fighter: 'border-red-900/60 bg-red-950/40',
  rogue: 'border-emerald-900/60 bg-emerald-950/40',
  wizard: 'border-violet-900/60 bg-violet-950/40',
  survivor: 'border-amber-900/60 bg-amber-950/40',
};

const typeIcons: Record<string, string> = {
  attack: '⚔',
  defense: '🛡',
};

interface CardProps {
  card: CardInstance;
  onClick?: () => void;
  disabled?: boolean;
  layoutId?: string;
}

export function Card({ card, onClick, disabled, layoutId }: CardProps) {
  const { definition } = card;
  const classKey = definition.class ?? 'fighter';
  const colorClass = classColors[classKey] ?? 'border-stone-700 bg-stone-900/40';

  return (
    <motion.button
      layoutId={layoutId}
      type="button"
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, y: -12 }}
      whileHover={disabled ? undefined : { y: -8, scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`flex w-36 flex-col rounded-lg border-2 p-3 text-left shadow-lg ${colorClass} ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-red-900/20'
      }`}
    >
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-stone-400">
        <span>{definition.class ?? 'enemy'}</span>
        <span>{typeIcons[definition.type ?? 'attack'] ?? '⚔'}</span>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-stone-100">{definition.name}</h3>
      {definition.description && (
        <p className="text-xs leading-snug text-stone-400">{definition.description}</p>
      )}
    </motion.button>
  );
}
