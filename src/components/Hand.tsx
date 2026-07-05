import { AnimatePresence } from 'framer-motion';
import type { CardInstance } from '@/types/card';
import { Card } from './Card';

interface HandProps {
  cards: CardInstance[];
  onAddToCombo: (instanceId: string) => void;
  disabled?: boolean;
}

export function Hand({ cards, onAddToCombo, disabled }: HandProps) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-stone-500">Hand</span>
      <div className="flex min-h-[22rem] flex-wrap items-end justify-center gap-3">
        <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <Card
              key={card.instanceId}
              card={card}
              layoutId={card.instanceId}
              disabled={disabled}
              onClick={() => onAddToCombo(card.instanceId)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
