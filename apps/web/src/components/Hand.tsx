import { AnimatePresence } from 'framer-motion';
import type { CardInstance } from '@dark-fantasy/shared/types/card';
import { Card } from './Card';

interface HandProps {
  cards: CardInstance[];
  onAddToCombo: (instanceId: string) => void;
  disabled?: boolean;
}

export function Hand({ cards, onAddToCombo, disabled }: HandProps) {
  return (
    <div className='flex flex-1 items-end justify-center overflow-visible pb-1' style={{ height: 200 }}>
      <div className='flex items-end overflow-visible'>
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <Card
              key={card.instanceId}
              card={card}
              layoutId={card.instanceId}
              variant="hand"
              handIndex={index}
              handTotal={cards.length}
              disabled={disabled}
              onClick={() => onAddToCombo(card.instanceId)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
