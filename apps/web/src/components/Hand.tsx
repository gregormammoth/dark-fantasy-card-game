import { AnimatePresence } from 'framer-motion';
import type { CardInstance } from '@dark-fantasy/shared/types/card';
import { isInstantPlayCard } from '@dark-fantasy/game-engine';
import { getCardHeight } from '@/lib/cardTheme';
import { Card } from './Card';

interface HandProps {
  cards: CardInstance[];
  onAddToCombo: (instanceId: string) => void;
  disabled?: boolean;
  comboAtCap?: boolean;
}

export function Hand({ cards, onAddToCombo, disabled, comboAtCap = false }: HandProps) {
  const handHeight = getCardHeight() + 16;

  return (
    <div
      className="flex flex-1 items-end justify-center overflow-visible pb-1"
      style={{ height: handHeight }}
    >
      <div className="flex items-end overflow-visible">
        <AnimatePresence>
          {cards.map((card, index) => {
            const instant = isInstantPlayCard(card);
            const cardDisabled = disabled || (!instant && comboAtCap);
            return (
              <Card
                key={card.instanceId}
                card={card}
                layoutId={card.instanceId}
                variant="hand"
                handIndex={index}
                handTotal={cards.length}
                disabled={cardDisabled}
                onClick={() => onAddToCombo(card.instanceId)}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
