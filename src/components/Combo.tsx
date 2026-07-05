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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">YOUR COMBO</span>
        <span className="text-[11px] text-[#6f6659]">resolves left → right</span>
      </div>
      <div className="flex min-h-[180px] flex-wrap gap-3.5">
        <AnimatePresence mode="popLayout">
          {cards.length === 0 ? (
            <p className="self-center text-sm text-[#5a5147]">Add cards from your hand</p>
          ) : (
            cards.map((card) => (
              <Card
                key={card.instanceId}
                card={card}
                layoutId={card.instanceId}
                variant="combo"
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
