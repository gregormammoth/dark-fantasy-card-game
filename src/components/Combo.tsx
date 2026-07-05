import { AnimatePresence } from 'framer-motion';
import type { CardInstance } from '@/types/card';
import { Card } from './Card';

interface ComboProps {
  cards: CardInstance[];
  onRemoveCard: (instanceId: string) => void;
  disabled?: boolean;
}

export function Combo({ cards, onRemoveCard, disabled }: ComboProps) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-amber-400/80">Combo</span>
      <div className="flex min-h-[22rem] min-w-full flex-wrap items-end justify-center gap-3 rounded-xl border border-dashed border-amber-900/40 bg-amber-950/10 p-4">
        <AnimatePresence mode="popLayout">
          {cards.length === 0 ? (
            <p className="text-sm text-stone-600">Add cards from your hand</p>
          ) : (
            cards.map((card) => (
              <Card
                key={card.instanceId}
                card={card}
                layoutId={card.instanceId}
                disabled={disabled}
                onClick={() => onRemoveCard(card.instanceId)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
